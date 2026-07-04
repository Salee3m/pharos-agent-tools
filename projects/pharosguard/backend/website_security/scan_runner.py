from .dns_scanner import scan_dns
from .email_scanner import scan_email_security
from .finding_builder import build_findings
from .headers_scanner import scan_headers
from .ssl_scanner import scan_ssl
from .tech_scanner import scan_technology
from .scoring import calculate_score
from .ai_report import generate_report, DISCLAIMER


def run_passive_scan(domain: str) -> dict:
    dns = scan_dns(domain)
    ssl = scan_ssl(domain)
    headers = scan_headers(domain)
    email = scan_email_security(domain)
    technology = scan_technology(headers)
    raw = {"dns": dns, "ssl": ssl, "headers": headers, "email": email, "technology": technology}
    score = calculate_score(raw)
    findings = build_findings(raw)
    report = generate_report(domain, score["overall_score"], score["score_band"], findings, raw)
    return {"scanner_results": raw, "score": score, "findings": findings, "report": report, "disclaimer": DISCLAIMER}
