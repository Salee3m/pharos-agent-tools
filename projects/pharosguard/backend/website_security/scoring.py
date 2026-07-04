CATEGORY_MAX = {"ssl": 30, "headers": 30, "email": 25, "dns": 10, "technology": 5}


def calculate_score(scan_results: dict) -> dict:
    category_scores = {}
    for name, max_points in CATEGORY_MAX.items():
        raw = scan_results.get(name, {}) or {}
        score = int(raw.get("score", 0) or 0)
        category_scores[name] = max(0, min(max_points, score))
    overall = max(0, min(100, sum(category_scores.values())))
    return {
        "overall_score": overall,
        "score_band": score_band(overall),
        "category_scores": category_scores,
    }


def score_band(score: int) -> str:
    if score >= 90:
        return "Strong"
    if score >= 75:
        return "Good"
    if score >= 50:
        return "Needs Improvement"
    if score >= 25:
        return "Weak"
    return "Critical"
