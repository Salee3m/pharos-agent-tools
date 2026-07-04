import base64
import json

from fastapi.testclient import TestClient

from main import app


def test_create_scan_rejects_private_target():
    client = TestClient(app)
    response = client.post("/api/scans", json={"domain": "127.0.0.1"})
    assert response.status_code == 400
    assert "valid public domain" in response.json()["detail"]


def test_create_scan_completes_for_example_dot_com():
    client = TestClient(app)
    response = client.post("/api/scans", json={"domain": "example.com"})
    assert response.status_code == 200
    body = response.json()
    assert body["domain"] == "example.com"
    assert body["status"] in {"completed", "running", "queued"}
    assert "scan_id" in body

    status = client.get(f"/api/scans/{body['scan_id']}")
    assert status.status_code == 200
    scan = status.json()
    assert scan["domain"] == "example.com"
    assert "locked" in scan


def test_okx_agent_payment_challenge_when_enabled(monkeypatch):
    monkeypatch.setenv("PHAROSGUARD_OKX_PAYMENTS_ENABLED", "true")
    client = TestClient(app)
    wallet = "0x33aD3000126D3257110fa8B4Db038059cF684614"

    response = client.get(f"/analyze/{wallet}")

    assert response.status_code == 402
    assert "PAYMENT-REQUIRED" in response.headers
    body = response.json()
    assert body["x402Version"] == 2
    assert body["accepts"][0]["scheme"] == "exact"
    assert body["accepts"][0]["resource"].endswith(f"/analyze/{wallet}")
    decoded = json.loads(base64.urlsafe_b64decode(response.headers["PAYMENT-REQUIRED"]))
    assert decoded["x402Version"] == 2
    assert decoded["accepts"][0]["extra"]["serviceType"] == "A2MCP"


def test_paid_wallet_analysis_accepts_payment_signature(monkeypatch):
    monkeypatch.setenv("PHAROSGUARD_OKX_PAYMENTS_ENABLED", "true")
    client = TestClient(app)
    wallet = "0x33aD3000126D3257110fa8B4Db038059cF684614"

    response = client.get(f"/analyze/{wallet}", headers={"PAYMENT-SIGNATURE": "test-signature"})

    assert response.status_code == 200
    body = response.json()
    assert body["wallet_address"] == wallet
    assert body["payment"]["protocol"] == "OKX Agent Payments Protocol"
    assert body["payment"]["service_type"] == "A2MCP"
