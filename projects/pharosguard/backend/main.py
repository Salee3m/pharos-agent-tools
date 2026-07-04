"""
PharosGuard API

MVP includes:
- Legacy Pharos wallet risk endpoint: GET /analyze/{wallet_address}
- Website security intelligence MVP: POST /api/scans, GET /api/scans/{scan_id}, POST /api/leads, GET /api/reports/{scan_id}
- OKX Agent Payments Protocol challenge support for paid A2MCP wallet-risk calls
"""
import base64
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, field_validator

sys.path.insert(0, str(Path(__file__).parent))

from analyzer import analyze_wallet
from website_security.ai_report import DISCLAIMER
from website_security.domain_validation import DomainValidationError, normalize_domain
from website_security.scan_runner import run_passive_scan

APP_VERSION = "0.2.1"
DEFAULT_PAYMENT_RECEIVER = "0x33aD3000126D3257110fa8B4Db038059cF684614"
DEFAULT_PAYMENT_ASSET = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"

app = FastAPI(
    title="PharosGuard API",
    description="AI-powered website security intelligence and Pharos ecosystem wallet risk analysis.",
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
SCANS: Dict[str, Dict[str, Any]] = {}
LEADS: list[dict] = []


def _truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def _payment_amount_atomic() -> str:
    """Return fee in atomic units; default is 0.25 USDC-style 6-decimal units."""
    return os.getenv("PHAROSGUARD_OKX_PAYMENT_AMOUNT_ATOMIC", "250000")


def _payment_challenge_payload(request: Request, wallet_address: str) -> dict[str, Any]:
    resource_url = str(request.url)
    amount_atomic = _payment_amount_atomic()
    receiver = os.getenv("PHAROSGUARD_OKX_PAYMENT_RECEIVER", DEFAULT_PAYMENT_RECEIVER)
    network = os.getenv("PHAROSGUARD_OKX_PAYMENT_NETWORK", "xlayer")
    asset = os.getenv("PHAROSGUARD_OKX_PAYMENT_ASSET", DEFAULT_PAYMENT_ASSET)

    accepts = [
        {
            "scheme": "exact",
            "network": network,
            "asset": asset,
            "payTo": receiver,
            "maxAmountRequired": amount_atomic,
            "resource": resource_url,
            "description": f"PharosGuard wallet risk scan for {wallet_address}",
            "mimeType": "application/json",
            "maxTimeoutSeconds": 300,
            "extra": {
                "name": "PharosGuard",
                "version": "1",
                "currency": os.getenv("PHAROSGUARD_OKX_PAYMENT_CURRENCY", "USDC"),
                "decimals": int(os.getenv("PHAROSGUARD_OKX_PAYMENT_DECIMALS", "6")),
                "serviceType": "A2MCP",
            },
        }
    ]
    return {
        "x402Version": 2,
        "resource": {
            "url": resource_url,
            "method": request.method,
            "name": "PharosGuard Wallet Risk Scan",
        },
        "accepts": accepts,
        "error": "payment_required",
        "message": "Payment is required through OKX Agent Payments Protocol before this A2MCP wallet-risk scan can be served.",
    }


def _payment_required_response(request: Request, wallet_address: str) -> JSONResponse:
    payload = _payment_challenge_payload(request, wallet_address)
    encoded_payload = base64.urlsafe_b64encode(
        json.dumps(payload, separators=(",", ":")).encode("utf-8")
    ).decode("ascii")
    return JSONResponse(
        status_code=402,
        content=payload,
        headers={
            "PAYMENT-REQUIRED": encoded_payload,
            "Access-Control-Expose-Headers": "PAYMENT-REQUIRED",
            "Cache-Control": "no-store",
        },
    )


def _has_payment_signature(request: Request) -> bool:
    return bool(request.headers.get("PAYMENT-SIGNATURE") or request.headers.get("X-Payment"))


def _okx_payments_enabled() -> bool:
    return _truthy(os.getenv("PHAROSGUARD_OKX_PAYMENTS_ENABLED", "true"))


class ScanCreateRequest(BaseModel):
    domain: str = Field(..., min_length=1, max_length=253)


class LeadCreateRequest(BaseModel):
    scan_id: str
    email: str
    role: Optional[str] = None
    marketing_consent: bool = False

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address.")
        return value


@app.get("/")
async def serve_frontend():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.get("/style.css")
async def serve_css():
    return FileResponse(str(FRONTEND_DIR / "style.css"))


@app.get("/app.js")
async def serve_js():
    return FileResponse(str(FRONTEND_DIR / "app.js"))


@app.get("/api")
async def api_root():
    return await health()


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "pharosguard",
        "version": APP_VERSION,
        "features": [
            "website-security-mvp",
            "wallet-risk-legacy",
            "okx-agent-payments-protocol-a2mcp",
        ],
        "okx_agent_payments_protocol": {
            "enabled": _okx_payments_enabled(),
            "challenge_header": "PAYMENT-REQUIRED",
            "retry_header": "PAYMENT-SIGNATURE",
            "service_type": "A2MCP",
        },
        "disclaimer": DISCLAIMER,
    }


@app.post("/api/scans")
async def create_scan(payload: ScanCreateRequest):
    try:
        domain = normalize_domain(payload.domain)
    except DomainValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    scan_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    scan = {
        "scan_id": scan_id,
        "domain": domain,
        "status": "running",
        "progress": 10,
        "locked": True,
        "created_at": created_at,
    }
    SCANS[scan_id] = scan

    try:
        result = run_passive_scan(domain)
        scan.update({
            "status": "completed",
            "progress": 100,
            "score": result["score"]["overall_score"],
            "score_band": result["score"]["score_band"],
            "category_scores": result["score"]["category_scores"],
            "top_findings": result["findings"][:5],
            "findings": result["findings"],
            "summary_preview": result["report"]["executive_summary"],
            "scanner_results": result["scanner_results"],
            "report": result["report"],
            "disclaimer": DISCLAIMER,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as exc:
        scan.update({"status": "failed", "progress": 100, "error_message": f"Unable to complete passive scan: {exc}"})

    return _public_scan_response(scan)


@app.get("/api/scans/{scan_id}")
async def get_scan(scan_id: str):
    scan = SCANS.get(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return _public_scan_response(scan)


@app.post("/api/leads")
async def create_lead(payload: LeadCreateRequest):
    scan = SCANS.get(payload.scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    lead = payload.model_dump()
    lead["created_at"] = datetime.now(timezone.utc).isoformat()
    LEADS.append(lead)
    scan["locked"] = False
    return {"unlocked": True, "report_url": f"/reports/{payload.scan_id}"}


@app.get("/api/reports/{scan_id}")
async def get_report(scan_id: str):
    scan = SCANS.get(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Report not found.")
    if scan.get("locked", True):
        return {
            "locked": True,
            "scan_id": scan_id,
            "domain": scan["domain"],
            "score": scan.get("score"),
            "score_band": scan.get("score_band"),
            "summary_preview": scan.get("summary_preview"),
            "top_findings": scan.get("top_findings", [])[:3],
            "disclaimer": DISCLAIMER,
        }
    return {
        "locked": False,
        "scan_id": scan_id,
        "domain": scan["domain"],
        "score": scan.get("score"),
        "score_band": scan.get("score_band"),
        "category_scores": scan.get("category_scores"),
        "findings": scan.get("findings", []),
        "report": scan.get("report"),
        "scanner_results": scan.get("scanner_results"),
        "disclaimer": DISCLAIMER,
    }


@app.get("/analyze/{wallet_address}")
async def analyze(wallet_address: str, request: Request):
    if _okx_payments_enabled() and not _has_payment_signature(request):
        return _payment_required_response(request, wallet_address)

    result = await analyze_wallet(wallet_address)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["message"])
    if _okx_payments_enabled():
        result["payment"] = {
            "protocol": "OKX Agent Payments Protocol",
            "status": "payment_signature_received",
            "service_type": "A2MCP",
        }
    return result


@app.get("/analyze/")
async def analyze_no_address():
    raise HTTPException(status_code=400, detail="Please provide a wallet address. Usage: /analyze/{wallet_address}")


def _public_scan_response(scan: Dict[str, Any]) -> Dict[str, Any]:
    base = {
        "scan_id": scan["scan_id"],
        "domain": scan["domain"],
        "status": scan["status"],
        "progress": scan.get("progress", 0),
        "locked": scan.get("locked", True),
    }
    if scan["status"] == "completed":
        base.update({
            "score": scan.get("score"),
            "score_band": scan.get("score_band"),
            "category_scores": scan.get("category_scores"),
            "top_findings": scan.get("top_findings", [])[:5],
            "summary_preview": scan.get("summary_preview"),
            "disclaimer": DISCLAIMER,
        })
    if scan["status"] == "failed":
        base["error_message"] = scan.get("error_message", "Scan failed.")
    return base
