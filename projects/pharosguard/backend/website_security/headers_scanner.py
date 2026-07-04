import http.client
import ssl
from urllib.parse import urlparse

SECURITY_HEADERS = {
    "strict-transport-security": (8, "Strict-Transport-Security"),
    "content-security-policy": (8, "Content-Security-Policy"),
    "x-frame-options": (5, "X-Frame-Options"),
    "x-content-type-options": (4, "X-Content-Type-Options"),
    "referrer-policy": (3, "Referrer-Policy"),
    "permissions-policy": (2, "Permissions-Policy"),
}


def scan_headers(domain: str, timeout: int = 8) -> dict:
    url = f"https://{domain}/"
    try:
        conn = http.client.HTTPSConnection(domain, 443, timeout=timeout, context=ssl.create_default_context())
        conn.request("GET", "/", headers={"User-Agent": "PharosGuard/0.1 passive-security-check"})
        resp = conn.getresponse()
        body = resp.read(120_000)
        headers = {k.lower(): v for k, v in resp.getheaders()}
        final_url = url
        status_code = resp.status
    except Exception as https_error:
        try:
            conn = http.client.HTTPConnection(domain, 80, timeout=timeout)
            conn.request("GET", "/", headers={"User-Agent": "PharosGuard/0.1 passive-security-check"})
            resp = conn.getresponse()
            body = resp.read(120_000)
            headers = {k.lower(): v for k, v in resp.getheaders()}
            final_url = f"http://{domain}/"
            status_code = resp.status
        except Exception as http_error:
            return {"ok": False, "score": 0, "max_score": 30, "error": str(http_error), "https_error": str(https_error)}

    present = []
    missing = []
    score = 0
    for key, (points, display) in SECURITY_HEADERS.items():
        if key in headers:
            present.append(display)
            score += points
        else:
            missing.append(display)

    return {
        "ok": True,
        "score": min(score, 30),
        "max_score": 30,
        "url": final_url,
        "status_code": status_code,
        "headers": headers,
        "present_security_headers": present,
        "missing_security_headers": missing,
        "html_sample": body[:2000].decode("utf-8", errors="ignore"),
    }
