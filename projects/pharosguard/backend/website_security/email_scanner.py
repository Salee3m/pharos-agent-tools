import dns.resolver


def _txt(domain: str) -> list[str]:
    try:
        return [b"".join(answer.strings).decode("utf-8", errors="ignore") for answer in dns.resolver.resolve(domain, "TXT")]
    except Exception:
        return []


def scan_email_security(domain: str) -> dict:
    root_txt = _txt(domain)
    dmarc_txt = _txt(f"_dmarc.{domain}")
    spf = next((t for t in root_txt if t.lower().startswith("v=spf1")), None)
    dmarc = next((t for t in dmarc_txt if t.lower().startswith("v=dmarc1")), None)
    score = 0
    if spf:
        score += 8
        if "-all" in spf or "~all" in spf:
            score += 4
    if dmarc:
        score += 8
        lower = dmarc.lower()
        if "p=reject" in lower:
            score += 5
        elif "p=quarantine" in lower:
            score += 3
    return {"ok": True, "score": min(score, 25), "max_score": 25, "spf": spf, "dmarc": dmarc, "has_spf": bool(spf), "has_dmarc": bool(dmarc)}
