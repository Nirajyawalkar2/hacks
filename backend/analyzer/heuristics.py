"""Rule-based heuristic scoring engine for PhishGuard."""
import re
from typing import Dict, Any, List, Tuple, Optional
from urllib.parse import urlparse
from .url_parser import parse_url_segments, extract_url_from_text

# High-profile global brand targets commonly spoofed by phishing threat actors
POPULAR_BRANDS = [
    # AI & Machine Learning
    "chatgpt", "openai", "claude", "anthropic", "gemini", "midjourney", "huggingface", "perplexity",
    # Big Tech & Search Engines
    "google", "microsoft", "apple", "amazon", "meta", "yahoo", "bing", "baidu", "yandex",
    # Social Media & Messaging
    "facebook", "instagram", "whatsapp", "twitter", "tiktok", "telegram",
    "discord", "reddit", "linkedin", "snapchat", "pinterest", "signal", "wechat", "threads",
    # Streaming & Entertainment
    "netflix", "spotify", "youtube", "twitch", "disney", "disneyplus", "hulu",
    "paramount", "roblox", "steam", "epicgames", "playstation", "xbox", "nintendo",
    # Financial Services & Online Banking
    "paypal", "chase", "bankofamerica", "wellsfargo", "citibank", "citi", "capitalone",
    "barclays", "hsbc", "santander", "usbank", "pnc", "fidelity", "vanguard",
    "schwab", "robinhood", "stripe", "square", "venmo", "zelle", "cashapp",
    "revolut", "monzo", "sofi", "klarna", "afterpay",
    # Cryptocurrency Platforms & Wallets
    "coinbase", "binance", "kraken", "metamask", "kucoin", "bybit", "okx",
    "crypto", "trustwallet", "ledger", "trezor", "bitfinex", "opensea",
    # E-Commerce & Logistics
    "ebay", "walmart", "target", "bestbuy", "costco", "aliexpress", "alibaba",
    "temu", "shein", "etsy", "shopify", "dhl", "fedex", "usps", "ups",
    "uber", "ubereats", "doordash", "airbnb", "booking", "instacart",
    # Cloud, Productivity & Enterprise
    "dropbox", "zoom", "slack", "notion", "trello", "asana", "salesforce",
    "zendesk", "adobe", "canva", "figma", "atlassian", "jira", "github",
    "gitlab", "bitbucket", "stackoverflow", "docker", "cloudflare", "aws",
    "azure", "oracle", "office", "office365", "outlook", "onedrive", "icloud"
]

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".click", ".info", ".buzz", ".club",
    ".work", ".live", ".loan", ".support", ".online",
    ".cam", ".vip", ".party", ".gq", ".ml", ".cf", ".tk",
    ".cc", ".pw", ".rest", ".bid", ".country", ".stream"
}

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd",
    "buff.ly", "ow.ly", "cutt.ly", "rb.gy", "shorturl.at",
    "tiny.cc", "rebrand.ly"
}

TYPOSQUAT_PATTERNS = [
    (r'paypa[l1i]', 'paypal'),
    (r'faceb[o0]{1,2}k', 'facebook'),
    (r'arnaz[o0]n', 'amazon'),
    (r'amaz[o0]n', 'amazon'),
    (r'g[o0]{2}gle', 'google'),
    (r'micr[o0]s[o0]ft', 'microsoft'),
    (r'app[l1i]e', 'apple'),
    (r'netf[l1i]x', 'netflix'),
    (r'ch[a4]se', 'chase'),
    (r'insta[gq]ram', 'instagram'),
    (r'twi[t7]{2}er', 'twitter'),
    (r'wa[t7]sapp', 'whatsapp'),
]

URGENCY_KEYWORDS = [
    "verify now", "account suspended", "act immediately", "within 24 hours",
    "limited time", "immediate action required", "security alert",
    "suspended", "urgent", "temporarily locked", "action needed",
    "final notice", "deadline", "immediate verification", "terminated"
]

CREDENTIAL_KEYWORDS = [
    "password", "otp", "pin", "ssn", "social security",
    "card number", "cvv", "login to confirm", "update billing",
    "verify your identity", "banking credentials", "credit card",
    "security code", "passcode", "account details", "bank account"
]

FEAR_REWARD_KEYWORDS = [
    "you've won", "unusual login detected", "unauthorized access detected",
    "gift card", "claim your prize", "parcel waiting", "delivery failed",
    "wire transfer", "lottery", "refund approved", "compromised",
    "suspicious activity", "payment pending", "failed delivery"
]

IP_ADDRESS_REGEX = re.compile(
    r'^(?:https?://)?(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?(?:/.*)?$'
)

def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def analyze_input(input_type: str, content: str) -> Dict[str, Any]:
    """
    Core heuristic engine evaluating content against phishing indicators.
    Returns full risk assessment dictionary.
    """
    signals: List[Dict[str, str]] = []
    
    cat_domain_score = 0
    cat_url_score = 0
    cat_social_score = 0
    cat_credential_score = 0

    target_url = content if input_type == "url" else extract_url_from_text(content)
    url_segments = parse_url_segments(target_url) if target_url else None

    # ----------------------------------------------------
    # 1. DOMAIN STRUCTURE CHECKS
    # ----------------------------------------------------
    if url_segments:
        domain = url_segments.get("domain", "").lower()
        subdomain = url_segments.get("subdomain", "").lower()
        full_host = f"{subdomain}.{domain}" if subdomain else domain

        # Check IP address as domain
        if IP_ADDRESS_REGEX.match(full_host) or re.match(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', domain):
            signals.append({
                "label": "Direct IP Address Host",
                "severity": "CRITICAL",
                "detail": "URL routes directly to a raw IP address instead of an authenticated domain name."
            })
            cat_domain_score += 45

        # Check excessive subdomains
        if subdomain:
            sub_count = len(subdomain.split("."))
            if sub_count >= 2:
                signals.append({
                    "label": "Excessive Subdomains",
                    "severity": "HIGH",
                    "detail": f"Domain contains {sub_count} nested subdomains to obfuscate the real target authority."
                })
                cat_domain_score += 30

        # Check suspicious TLDs
        for tld in SUSPICIOUS_TLDS:
            if domain.endswith(tld):
                signals.append({
                    "label": f"High-Risk TLD ({tld})",
                    "severity": "HIGH",
                    "detail": f"Domain utilizes '{tld}', a top-level domain heavily associated with disposable phishing campaigns."
                })
                cat_domain_score += 35
                break

        # Brand impersonation and Levenshtein similarity
        domain_no_tld = domain.split(".")[0] if "." in domain else domain

        # Check for numbers embedded inside words (e.g. chatg2t, facebo0k, paypa1, g00gle, netfl1x)
        num_in_word = re.search(r'([a-z]{2,}[0-9]+[a-z]{1,})', domain_no_tld)
        if num_in_word:
            signals.append({
                "label": "Embedded Numeric Obfuscation (Leetspeak)",
                "severity": "HIGH",
                "detail": f"Domain embeds numbers directly into alphabetic text ('{num_in_word.group(1)}'), a deceptive visual spoofing technique."
            })
            cat_domain_score += 40

        # Universal Leetspeak homoglyph mapping: 0->o, 1->l/i, 2->z, 3->e, 4->a, 5->s, 7->t, 8->b, @->a, $->s
        LEET_MAP = str.maketrans({
            '0': 'o', '1': 'l', '2': 'z', '3': 'e', '4': 'a', '5': 's',
            '7': 't', '8': 'b', '@': 'a', '$': 's'
        })
        unleet_domain = domain_no_tld.translate(LEET_MAP)

        # Tokens in host (e.g. login-chatg2t.com -> ['login', 'chatg2t'])
        host_tokens = [t for t in re.split(r'[-_.]', full_host) if len(t) >= 4 and t not in {"www", "com", "net", "org", "co", "io", "app", "dev", "edu"}]

        # Check if leetspeak translates directly to a popular brand (e.g. facebo0k -> facebook)
        if unleet_domain != domain_no_tld:
            for brand in POPULAR_BRANDS:
                if unleet_domain == brand or (len(brand) >= 5 and brand in unleet_domain and not domain.endswith(f"{brand}.com")):
                    signals.append({
                        "label": f"Leetspeak Character Substitution ({brand.capitalize()})",
                        "severity": "CRITICAL",
                        "detail": f"Substituted characters (e.g., '0' for 'o', '1' for 'l') detected mimicking authentic brand '{brand}.com' ('{domain_no_tld}' -> '{unleet_domain}')."
                    })
                    cat_domain_score += 55
                    break

        for brand in POPULAR_BRANDS:
            # Lookalike typo substitution in full host
            if brand in full_host and not full_host.endswith(f"{brand}.com") and not full_host.endswith(f"{brand}.org"):
                signals.append({
                    "label": f"Brand Keyword in Untrusted Host ({brand})",
                    "severity": "CRITICAL",
                    "detail": f"The brand name '{brand}' is embedded inside an unauthorized host ({full_host})."
                })
                cat_domain_score += 45
                break

            # If the current domain itself is an authentic brand domain (e.g. spotify.com vs shopify.com), do not cross-flag
            is_authentic_brand = (domain_no_tld in POPULAR_BRANDS and any(domain.endswith(f"{domain_no_tld}.{tld}") for tld in ["com", "org", "net", "io", "ai", "co", "app", "dev"]))
            if is_authentic_brand:
                continue

            # Typosquat / edit distance check on whole domain and individual tokens
            best_dist = min(levenshtein_distance(domain_no_tld, brand), levenshtein_distance(unleet_domain, brand))
            matched_token = domain_no_tld

            for token in host_tokens:
                t_unleet = token.translate(LEET_MAP)
                t_dist = min(levenshtein_distance(token, brand), levenshtein_distance(t_unleet, brand))
                if t_dist < best_dist:
                    best_dist = t_dist
                    matched_token = token

            if 0 < best_dist <= 2 and len(matched_token) >= 4 and len(brand) >= 4 and not domain.endswith(f"{brand}.com"):
                # Avoid duplicate if leetspeak already fired for same brand
                if not any(brand.capitalize() in s["label"] for s in signals):
                    signals.append({
                        "label": f"Typosquatted Brand Lookalike ({brand})",
                        "severity": "CRITICAL",
                        "detail": f"Domain token '{matched_token}' is deceptively similar to legitimate brand '{brand}.com' (Edit distance: {best_dist})."
                    })
                    cat_domain_score += 50
                    break

        # Typosquat regex patterns (e.g. paypa1, facebo0k, arnaz0n)
        for pattern, brand_name in TYPOSQUAT_PATTERNS:
            if re.search(pattern, full_host):
                if not (brand_name in domain and domain.endswith(f"{brand_name}.com")):
                    if not any("Leetspeak" in s["label"] for s in signals):
                        signals.append({
                            "label": "Leetspeak Character Substitution",
                            "severity": "CRITICAL",
                            "detail": f"Substituted characters (e.g., '1' for 'l' or '0' for 'o') detected mimicking {brand_name.capitalize()}."
                        })
                        cat_domain_score += 45
                        break

        # HTTPS spoofing check: Attackers use HTTPS on lookalikes to convey false trust
        if any("Typosquat" in s["label"] or "Leetspeak" in s["label"] or "Brand" in s["label"] for s in signals):
            if url_segments.get("protocol") == "https":
                signals.append({
                    "label": "Spoofed Brand on SSL/HTTPS Certificate",
                    "severity": "HIGH",
                    "detail": "Target operates over HTTPS on an illegitimate lookalike domain to create a deceptive appearance of security."
                })
                cat_domain_score += 25

    # ----------------------------------------------------
    # 2. URL PATTERN CHECKS
    # ----------------------------------------------------
    if target_url:
        lowered_url = target_url.lower()

        # Check deceptive backslash syntax (e.g. https:\\ or http:\)
        if "\\" in target_url:
            signals.append({
                "label": "Deceptive URL Syntax (Backslashes)",
                "severity": "HIGH",
                "detail": "URL uses backslashes ('\\') instead of standard forward slashes, an evasion technique used to bypass security parsers."
            })
            cat_url_score += 35

        # Missing HTTPS
        if lowered_url.startswith("http://"):
            signals.append({
                "label": "Missing HTTPS Encryption",
                "severity": "MEDIUM",
                "detail": "Connection is unencrypted (plain HTTP), allowing credential interception in transit."
            })
            cat_url_score += 25

        # '@' symbol redirect trick
        if "@" in target_url:
            signals.append({
                "label": "URL Credential Redirect Trick (@)",
                "severity": "CRITICAL",
                "detail": "Uses the '@' symbol in URL path to deceive users while redirecting to an arbitrary destination."
            })
            cat_url_score += 45

        # Known URL shortener
        if url_segments:
            dom = url_segments.get("domain", "")
            if dom in URL_SHORTENERS:
                signals.append({
                    "label": "Known URL Shortener",
                    "severity": "HIGH",
                    "detail": f"Uses shortening service '{dom}' to mask the true destination endpoint."
                })
                cat_url_score += 35

        # Long / obfuscated query parameters
        if url_segments:
            params = url_segments.get("params", "")
            if len(params) > 50 or "token=" in params.lower() or "redirect=" in params.lower():
                signals.append({
                    "label": "Suspicious Query Parameters",
                    "severity": "MEDIUM",
                    "detail": "Contains lengthy or redirection-based URL query parameters typical in session hijacking."
                })
                cat_url_score += 20

    # ----------------------------------------------------
    # 3. SOCIAL ENGINEERING & MESSAGE CHECKS
    # ----------------------------------------------------
    content_lower = content.lower()

    # Urgency keywords
    urgency_hits = [k for k in URGENCY_KEYWORDS if k in content_lower]
    if urgency_hits:
        signals.append({
            "label": "Urgency & Panic Triggers",
            "severity": "HIGH",
            "detail": f"Urgency language identified: '{', '.join(urgency_hits[:2])}', pressuring rapid user compliance."
        })
        cat_social_score += min(50, 25 * len(urgency_hits))

    # Fear or reward framing
    fear_hits = [k for k in FEAR_REWARD_KEYWORDS if k in content_lower]
    if fear_hits:
        signals.append({
            "label": "Fear / Reward Coercion",
            "severity": "HIGH",
            "detail": f"Deceptive emotional hooks detected: '{', '.join(fear_hits[:2])}'."
        })
        cat_social_score += min(45, 25 * len(fear_hits))

    # Credential requests
    credential_hits = [k for k in CREDENTIAL_KEYWORDS if k in content_lower]
    if credential_hits:
        signals.append({
            "label": "Explicit Credential Harvest Request",
            "severity": "CRITICAL",
            "detail": f"Explicitly solicits private authentication data: '{', '.join(credential_hits[:2])}'."
        })
        cat_credential_score += min(55, 30 * len(credential_hits))

    # ----------------------------------------------------
    # 4. SCORING & AGGREGATION
    # ----------------------------------------------------
    # Cap breakdown categories to 0-100
    b_domain = min(100, cat_domain_score)
    b_url = min(100, cat_url_score)
    b_social = min(100, cat_social_score)
    b_credential = min(100, cat_credential_score)

    if input_type == "url":
        # URLs weight domain and URL pattern more heavily
        weighted_score = (b_domain * 0.45) + (b_url * 0.35) + (b_social * 0.10) + (b_credential * 0.10)
    else:
        # Messages weight social engineering and credential harvest more
        weighted_score = (b_social * 0.40) + (b_credential * 0.40) + (b_domain * 0.10) + (b_url * 0.10)

    # If critical signals exist, guarantee a floor
    has_critical = any(s["severity"] == "CRITICAL" for s in signals)
    has_high = any(s["severity"] == "HIGH" for s in signals)

    if has_critical:
        weighted_score = max(weighted_score, 82)
    elif has_high:
        weighted_score = max(weighted_score, 55)

    risk_score = int(min(100, max(5, round(weighted_score))))

    # Severity Mapping: 0-30 LOW, 31-60 MEDIUM, 61-85 HIGH, 86-100 CRITICAL
    if risk_score >= 86:
        severity = "CRITICAL"
    elif risk_score >= 61:
        severity = "HIGH"
    elif risk_score >= 31:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    # Confidence calculation based on number of triggered signals
    num_signals = len(signals)
    if num_signals == 0:
        confidence = 92
    else:
        confidence = min(98, max(70, 70 + (num_signals * 6)))

    # Classification Title
    if b_domain >= 40 and any("Brand" in s["label"] or "Typosquat" in s["label"] for s in signals):
        classification_title = "Brand Impersonation & Typosquatting"
    elif b_credential >= 40 and b_social >= 30:
        classification_title = "Smishing Credential Harvest" if input_type == "message" else "Credential Phishing Gateway"
    elif b_social >= 40:
        classification_title = "Urgent Social Engineering Lure"
    elif b_url >= 40 and any("Redirect" in s["label"] or "Shortener" in s["label"] for s in signals):
        classification_title = "Suspicious Redirect Chain"
    elif risk_score >= 61:
        classification_title = "High Risk Phishing Vector"
    elif risk_score >= 31:
        classification_title = "Suspicious Unverified Target"
    else:
        classification_title = "Benign Content Passed Clean"

    # Recommended Actions
    if risk_score >= 61:
        recommended_action = [
            "Do not click this link or submit any personal credentials.",
            "Do not enter passwords, OTP codes, or banking details.",
            "Report this message or URL to your organization's security team."
        ]
    elif risk_score >= 31:
        recommended_action = [
            "Exercise caution: verify the sender identity through an official external channel.",
            "Inspect the domain certificate and avoid downloading unexpected attachments."
        ]
    else:
        recommended_action = [
            "No immediate malicious signatures identified.",
            "Always verify SSL encryption status when entering credentials online."
        ]

    return {
        "risk_score": risk_score,
        "severity": severity,
        "confidence": confidence,
        "classification_title": classification_title,
        "signals": signals,
        "breakdown": {
            "domain_structure": b_domain,
            "url_pattern": b_url,
            "social_engineering": b_social,
            "credential_request": b_credential
        },
        "url_segments": url_segments,
        "recommended_action": recommended_action
    }
