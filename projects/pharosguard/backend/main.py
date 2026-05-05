"""
PharosGuard — Wallet Risk Analysis API
FastAPI backend for the Pharos ecosystem risk analysis dApp.
Serves both the API and frontend static files.
"""
import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

# Ensure the backend package is importable
sys.path.insert(0, str(Path(__file__).parent))

from analyzer import analyze_wallet

app = FastAPI(
    title="PharosGuard API",
    description="Wallet risk analysis for the Pharos ecosystem (chainID 1672)",
    version="1.0.0",
)

# CORS — allow frontend from any origin (Netlify, localhost, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files at root level
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"


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
    """API health check."""
    return {
        "service": "PharosGuard",
        "version": "1.0.0",
        "chain": "Pharos",
        "chain_id": 1672,
        "rpc": "https://rpc.pharos.xyz",
        "endpoints": {
            "analyze": "/analyze/{wallet_address}",
            "health": "/api",
        },
    }


@app.get("/analyze/{wallet_address}")
async def analyze(wallet_address: str):
    """
    Analyze a wallet address and return risk score, metrics, and flags.
    
    Parameters:
    - wallet_address: EVM-compatible address (0x...)
    
    Returns JSON with:
    - risk_score (0-100)
    - risk_level (low/medium/high)
    - metrics (transaction count, diversity, age, balance, etc.)
    - flags (suspicious patterns detected)
    - summary (human-readable text)
    """
    result = await analyze_wallet(wallet_address)
    
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@app.get("/analyze/")
async def analyze_no_address():
    """Return an error when no wallet address is provided."""
    raise HTTPException(
        status_code=400,
        detail="Please provide a wallet address. Usage: /analyze/{wallet_address}",
    )
