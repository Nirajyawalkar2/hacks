"""URL Parser module for PhishGuard."""
import re
from typing import Optional, Dict, Any
from urllib.parse import urlparse, parse_qs

# Regex to detect URLs inside message strings
URL_REGEX = re.compile(
    r'(https?[\\/]+[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*)',
    re.IGNORECASE
)

def extract_url_from_text(text: str) -> Optional[str]:
    """Extract first URL found in text if any."""
    match = URL_REGEX.search(text)
    if match:
        url = match.group(0).strip(".,!?;:()[]{}'\"")
        return url
    return None

def parse_url_segments(raw_url: str) -> Optional[Dict[str, str]]:
    """
    Parse a URL into its structural segments:
    - protocol
    - subdomain
    - domain
    - path
    - params
    Handles user typos, backslashes (https:\\), and single-slash schemes.
    Returns None if URL cannot be parsed.
    """
    if not raw_url or not isinstance(raw_url, str):
        return None

    cleaned_url = raw_url.strip()

    # 1. Normalize all backslashes to forward slashes (e.g. https:\\ -> https://)
    cleaned_url = cleaned_url.replace("\\", "/")

    # 2. Fix schemes with irregular slash counts: e.g. https:/example.com or https:///example.com -> https://example.com
    cleaned_url = re.sub(r'^([a-zA-Z]+):/*([^\s/])', r'\1://\2', cleaned_url)

    # 3. Add protocol if missing for urllib parsing
    if not re.match(r'^[a-zA-Z]+://', cleaned_url):
        cleaned_url = "http://" + cleaned_url

    try:
        parsed = urlparse(cleaned_url)
        netloc = parsed.netloc.lower()

        # Remove port if present
        host = netloc.split(":")[0]

        # Extract subdomain and domain
        parts = host.split(".")
        if len(parts) > 2:
            # Check for two-part TLDs like .co.uk, .com.br, .co.in
            two_part_tlds = {"co.uk", "org.uk", "com.au", "co.jp", "com.br", "gov.uk", "co.in"}
            last_two = ".".join(parts[-2:])
            if last_two in two_part_tlds and len(parts) > 3:
                domain = ".".join(parts[-3:])
                subdomain = ".".join(parts[:-3])
            else:
                domain = ".".join(parts[-2:])
                subdomain = ".".join(parts[:-2])
        elif len(parts) == 2:
            domain = host
            subdomain = ""
        else:
            domain = host
            subdomain = ""

        protocol = parsed.scheme if parsed.scheme else "http"
        path = parsed.path if parsed.path else "/"
        params = parsed.query if parsed.query else ""

        return {
            "protocol": protocol,
            "subdomain": subdomain,
            "domain": domain,
            "path": path,
            "params": params
        }
    except Exception:
        return None
