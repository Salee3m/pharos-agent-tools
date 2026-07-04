import socket
import ssl
from datetime import datetime, timezone


def scan_ssl(domain: str, timeout: int = 8) -> dict:
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=timeout) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                tls_version = ssock.version()
                cipher = ssock.cipher()
    except Exception as exc:
        return {"ok": False, "score": 0, "max_score": 30, "error": str(exc), "has_https": False}

    not_after_raw = cert.get("notAfter")
    days_remaining = None
    expired = False
    if not_after_raw:
        expires = datetime.strptime(not_after_raw, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        days_remaining = int((expires - datetime.now(timezone.utc)).total_seconds() // 86400)
        expired = days_remaining < 0

    score = 0
    if cert:
        score += 12
    if not expired:
        score += 8
    if days_remaining is not None and days_remaining >= 30:
        score += 5
    if tls_version in {"TLSv1.3", "TLSv1.2"}:
        score += 5

    return {
        "ok": True,
        "score": min(score, 30),
        "max_score": 30,
        "has_https": True,
        "tls_version": tls_version,
        "cipher": cipher[0] if cipher else None,
        "issuer": dict(x[0] for x in cert.get("issuer", [])) if cert else {},
        "subject": dict(x[0] for x in cert.get("subject", [])) if cert else {},
        "not_after": not_after_raw,
        "days_remaining": days_remaining,
        "expired": expired,
    }
