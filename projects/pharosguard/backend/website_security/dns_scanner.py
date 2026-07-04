import dns.resolver

RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT"]


def scan_dns(domain: str, timeout: int = 5) -> dict:
    resolver = dns.resolver.Resolver()
    resolver.lifetime = timeout
    records = {}
    errors = {}
    for rtype in RECORD_TYPES:
        try:
            answers = resolver.resolve(domain, rtype)
            records[rtype] = [str(a).rstrip(".") for a in answers]
        except Exception as exc:
            records[rtype] = []
            errors[rtype] = exc.__class__.__name__
    score = 0
    if records["A"] or records["AAAA"] or records["CNAME"]:
        score += 5
    if records["NS"]:
        score += 3
    if records["MX"]:
        score += 2
    return {"ok": bool(records["A"] or records["AAAA"] or records["CNAME"]), "score": score, "max_score": 10, "records": records, "errors": errors}
