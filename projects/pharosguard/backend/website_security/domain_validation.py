import ipaddress
import re
from urllib.parse import urlparse


class DomainValidationError(ValueError):
    """Raised when a scan target is not a valid public domain."""


DOMAIN_RE = re.compile(r"^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$")
BLOCKED_SUFFIXES = (".local", ".localhost", ".internal", ".lan", ".home", ".test")


def normalize_domain(raw: str) -> str:
    if not raw or not raw.strip():
        raise DomainValidationError("Enter a valid public domain.")

    target = raw.strip().lower()
    if "://" not in target:
        target = "//" + target
    parsed = urlparse(target)
    host = (parsed.hostname or "").strip(".")

    if not host:
        raise DomainValidationError("Enter a valid public domain.")

    if host == "localhost" or host.endswith(BLOCKED_SUFFIXES):
        raise DomainValidationError("Enter a valid public domain, not a local/internal target.")

    try:
        ip = ipaddress.ip_address(host)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified:
            raise DomainValidationError("Enter a valid public domain, not a private/internal IP.")
        raise DomainValidationError("Enter a domain name instead of a raw IP address.")
    except ValueError as exc:
        if isinstance(exc, DomainValidationError):
            raise

    if not DOMAIN_RE.match(host):
        raise DomainValidationError("Enter a valid public domain.")

    return host
