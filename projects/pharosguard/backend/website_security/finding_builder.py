SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3, "positive": 4, "info": 5}


def build_findings(results: dict) -> list[dict]:
    findings = []
    ssl = results.get("ssl", {})
    if not ssl.get("has_https"):
        findings.append({"severity": "critical", "title": "HTTPS certificate check failed", "detail": "PharosGuard could not validate a public TLS certificate for this domain.", "recommendation": "Install and maintain a valid TLS certificate for the website."})
    elif ssl.get("days_remaining") is not None and ssl["days_remaining"] < 30:
        findings.append({"severity": "high", "title": "TLS certificate expires soon", "detail": f"Certificate expires in {ssl['days_remaining']} day(s).", "recommendation": "Renew the certificate or enable automated renewal."})

    headers = results.get("headers", {})
    for header in headers.get("missing_security_headers", []):
        severity = "high" if header in {"Content-Security-Policy", "Strict-Transport-Security"} else "medium"
        findings.append({"severity": severity, "title": f"Missing {header}", "detail": f"The response did not include {header}.", "recommendation": f"Add a suitable {header} policy at the web server or application edge."})

    email = results.get("email", {})
    if not email.get("has_spf"):
        findings.append({"severity": "medium", "title": "Missing SPF record", "detail": "No SPF TXT record was detected on the root domain.", "recommendation": "Publish an SPF record listing authorized mail senders."})
    if not email.get("has_dmarc"):
        findings.append({"severity": "medium", "title": "Missing DMARC policy", "detail": "No DMARC TXT record was detected.", "recommendation": "Publish a DMARC record, starting with monitoring and moving toward quarantine/reject."})

    tech = results.get("technology", {})
    for note in tech.get("exposure_notes", []):
        findings.append({"severity": "low", "title": "Technology exposure", "detail": note, "recommendation": "Remove unnecessary version or platform disclosure headers where practical."})

    if not findings:
        findings.append({"severity": "positive", "title": "No major passive-scan gaps found", "detail": "The public checks completed without major issues in the MVP scanner scope.", "recommendation": "Continue monitoring headers, TLS, DNS, and email security records."})

    return sorted(findings, key=lambda f: SEVERITY_ORDER.get(f["severity"], 9))
