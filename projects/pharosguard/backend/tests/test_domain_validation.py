import pytest

from website_security.domain_validation import DomainValidationError, normalize_domain


def test_normalize_domain_strips_scheme_path_and_lowercases():
    assert normalize_domain(" HTTPS://Example.COM/some/path?x=1 ") == "example.com"


def test_normalize_domain_accepts_subdomain():
    assert normalize_domain("www.example.org") == "www.example.org"


@pytest.mark.parametrize("target", ["localhost", "http://localhost:3000", "127.0.0.1", "192.168.1.1", "10.0.0.5", "172.16.0.1", "invalid string", "example.local"])
def test_normalize_domain_rejects_invalid_or_private_targets(target):
    with pytest.raises(DomainValidationError):
        normalize_domain(target)
