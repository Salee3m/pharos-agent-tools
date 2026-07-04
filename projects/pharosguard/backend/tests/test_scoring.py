from website_security.scoring import calculate_score, score_band


def test_calculate_score_sums_weighted_category_scores_and_clamps_to_100():
    scan = {
        "ssl": {"score": 30, "max_score": 30},
        "headers": {"score": 30, "max_score": 30},
        "email": {"score": 25, "max_score": 25},
        "dns": {"score": 10, "max_score": 10},
        "technology": {"score": 8, "max_score": 5},
    }
    assert calculate_score(scan)["overall_score"] == 100


def test_calculate_score_preserves_mvp_category_weights():
    scan = {
        "ssl": {"score": 15, "max_score": 30},
        "headers": {"score": 10, "max_score": 30},
        "email": {"score": 5, "max_score": 25},
        "dns": {"score": 5, "max_score": 10},
        "technology": {"score": 2, "max_score": 5},
    }
    result = calculate_score(scan)
    assert result["overall_score"] == 37
    assert result["category_scores"] == {"ssl": 15, "headers": 10, "email": 5, "dns": 5, "technology": 2}


def test_score_band_maps_score_to_public_posture_label():
    assert score_band(95) == "Strong"
    assert score_band(80) == "Good"
    assert score_band(65) == "Needs Improvement"
    assert score_band(30) == "Weak"
    assert score_band(10) == "Critical"
