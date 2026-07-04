DISCLAIMER = "PharosGuard performs non-invasive checks using publicly available website, DNS, SSL, and HTTP header information. It does not perform penetration testing, exploit attempts, brute force attacks, or intrusive scanning. Results are informational and should not be treated as a full security audit."

SYSTEM_PROMPT = """You are PharosGuard, an AI website security intelligence analyst. Use only the scanner JSON provided by the backend. Do not invent vulnerabilities, breaches, exposed data, or exploitability. Keep the report practical, concise, and clearly non-invasive."""

USER_PROMPT_TEMPLATE = """Create a concise website security posture report from this scanner JSON only:\n\n{scanner_json}\n\nReturn JSON with: executive_summary, business_risk, top_priorities, quick_wins, limitations."""


def generate_report(domain: str, score: int, score_band: str, findings: list[dict], scanner_results: dict) -> dict:
    top = findings[:3]
    if score >= 75:
        summary = f"{domain} shows a {score_band.lower()} public security posture in PharosGuard's passive MVP checks. The main improvements are around policy hardening and ongoing monitoring."
    elif score >= 50:
        summary = f"{domain} has a mixed public security posture. Core website checks completed, but several practical improvements can reduce browser, email, or configuration risk."
    else:
        summary = f"{domain} has important public security posture gaps in PharosGuard's passive MVP checks. Prioritize the highest-severity findings before treating the site as production-ready."
    return {
        "domain": domain,
        "executive_summary": summary,
        "business_risk": "Public configuration gaps can reduce user trust, weaken phishing resistance, or leave browsers without modern defensive policies.",
        "top_priorities": [f["title"] for f in top],
        "quick_wins": [f["recommendation"] for f in top],
        "limitations": DISCLAIMER,
        "prompt_templates": {"system": SYSTEM_PROMPT, "user": USER_PROMPT_TEMPLATE},
        "scanner_snapshot": scanner_results,
    }
