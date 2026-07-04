def scan_technology(headers_result: dict) -> dict:
    headers = headers_result.get("headers", {}) or {}
    html = (headers_result.get("html_sample") or "").lower()
    tech = []
    server = headers.get("server")
    powered_by = headers.get("x-powered-by")
    if server:
        tech.append({"name": server, "source": "server-header"})
    if powered_by:
        tech.append({"name": powered_by, "source": "x-powered-by"})
    if "wp-content" in html:
        tech.append({"name": "WordPress", "source": "html"})
    if "shopify" in html:
        tech.append({"name": "Shopify", "source": "html"})
    score = 5
    exposed = []
    if powered_by:
        score -= 3
        exposed.append("X-Powered-By header exposes backend technology")
    return {"ok": True, "score": max(0, score), "max_score": 5, "detected": tech, "exposure_notes": exposed}
