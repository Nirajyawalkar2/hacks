"""In-memory scan store with file persistence and seed data for PhishGuard."""
import os
import json
import copy
from typing import List, Optional, Dict, Any

DB_FILE = os.path.join(os.path.dirname(__file__), "..", "scans_db.json")

INITIAL_SEEDS: List[Dict[str, Any]] = [
    {
        "id": "SCN-92841",
        "timestamp": "2026-08-29 12:45:10",
        "input_type": "url",
        "content": "http://secure-login.paypa1-checkpoint.net/verify?token=ab239c8192830192830192",
        "risk_score": 92,
        "severity": "CRITICAL",
        "confidence": 98,
        "classification_title": "Brand Impersonation & Typosquatting",
        "signals": [
            {
                "label": "Typosquatted Brand Lookalike (paypal)",
                "severity": "CRITICAL",
                "detail": "Domain 'paypa1-checkpoint.net' uses character substitution '1' to mimic authentic PayPal."
            },
            {
                "label": "Excessive Subdomains",
                "severity": "HIGH",
                "detail": "Domain contains 2 nested subdomains to obfuscate the real target authority."
            },
            {
                "label": "Missing HTTPS Encryption",
                "severity": "MEDIUM",
                "detail": "Connection is unencrypted (plain HTTP), allowing credential interception in transit."
            },
            {
                "label": "Suspicious Query Parameters",
                "severity": "MEDIUM",
                "detail": "Contains lengthy session hijacking redirect tokens."
            }
        ],
        "breakdown": {
            "domain_structure": 90,
            "url_pattern": 85,
            "social_engineering": 65,
            "credential_request": 80
        },
        "url_segments": {
            "protocol": "http",
            "subdomain": "secure-login",
            "domain": "paypa1-checkpoint.net",
            "path": "/verify",
            "params": "token=ab239c8192830192830192"
        },
        "ai_explanation": {
            "summary": "This URL is an active credential phishing site impersonating PayPal via character substitution.",
            "detailed_reasoning": "The domain 'paypa1-checkpoint.net' utilizes character substitution ('1' for 'l') to mimic authentic PayPal. Combined with an unencrypted plain HTTP transport, credentials entered here are directly harvested in transit.",
            "attacker_intent": "The adversary intends to steal PayPal account login credentials and associated payment methods.",
            "real_world_comparison": "Classic typosquatting credential harvesting portal targeting financial consumers."
        },
        "recommended_action": [
            "Do not click this link or enter any PayPal credentials.",
            "Navigate directly to paypal.com through a secure, bookmarked browser session.",
            "Report the abusive domain to PayPal anti-phishing (spoof@paypal.com)."
        ]
    },
    {
        "id": "SCN-84192",
        "timestamp": "2026-08-29 11:20:44",
        "input_type": "message",
        "content": "URGENT: Your Chase bank account is temporarily suspended. Please enter your password and OTP immediately to verify your identity.",
        "risk_score": 88,
        "severity": "CRITICAL",
        "confidence": 94,
        "classification_title": "Smishing Credential Harvest",
        "signals": [
            {
                "label": "Urgency & Panic Triggers",
                "severity": "HIGH",
                "detail": "High-pressure words ('URGENT', 'temporarily suspended') intended to bypass critical thinking."
            },
            {
                "label": "Explicit Credential Harvest Request",
                "severity": "CRITICAL",
                "detail": "Explicitly requests private authentication data (password and one-time password OTP)."
            }
        ],
        "breakdown": {
            "domain_structure": 0,
            "url_pattern": 0,
            "social_engineering": 95,
            "credential_request": 90
        },
        "url_segments": None,
        "ai_explanation": {
            "summary": "This message is a fraudulent smishing lure designed to hijack bank accounts using artificial panic.",
            "detailed_reasoning": "The text fabricates an urgent account suspension to pressure the victim into hasty action. It explicitly solicits two-factor authentication tokens (OTP) and passwords, which legitimate financial institutions never request via unauthenticated messaging.",
            "attacker_intent": "The adversary is attempting to capture real-time 2FA codes to perform unauthorized account takeovers and wire transfers.",
            "real_world_comparison": "High-urgency SMS banking lure targeting retail customers."
        },
        "recommended_action": [
            "Do not reply or click any links embedded in this message.",
            "Banks will never ask for your one-time password (OTP) or password via text message.",
            "Block the sender and verify your account status directly via the Chase mobile app."
        ]
    },
    {
        "id": "SCN-34102",
        "timestamp": "2026-08-29 09:12:15",
        "input_type": "url",
        "content": "https://www.google.com/search?q=cybersecurity+threat+intel",
        "risk_score": 12,
        "severity": "LOW",
        "confidence": 92,
        "classification_title": "Benign Content Passed Clean",
        "signals": [],
        "breakdown": {
            "domain_structure": 0,
            "url_pattern": 0,
            "social_engineering": 0,
            "credential_request": 0
        },
        "url_segments": {
            "protocol": "https",
            "subdomain": "www",
            "domain": "google.com",
            "path": "/search",
            "params": "q=cybersecurity+threat+intel"
        },
        "ai_explanation": {
            "summary": "This submission directs to legitimate Google search infrastructure and is safe to browse.",
            "detailed_reasoning": "The URL uses authentic Google SSL certificates, standard search routing parameters, and shows no indication of domain spoofing or deceptive redirection.",
            "attacker_intent": "No malicious intent detected; authentic search engine request.",
            "real_world_comparison": "Standard benign public web query."
        },
        "recommended_action": [
            "No immediate malicious signatures identified.",
            "Always verify SSL encryption status when entering credentials online."
        ]
    }
]

def _load_db() -> List[Dict[str, Any]]:
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception:
            pass
    # Initialize with seeds
    _save_db(INITIAL_SEEDS)
    return copy.deepcopy(INITIAL_SEEDS)

def _save_db(data: List[Dict[str, Any]]) -> None:
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

# In-memory working cache backed by disk
_SCANS: List[Dict[str, Any]] = _load_db()

def add_scan(scan_data: Dict[str, Any]) -> Dict[str, Any]:
    """Prepend a scan to history and persist."""
    global _SCANS
    item = copy.deepcopy(scan_data)
    _SCANS.insert(0, item)
    _save_db(_SCANS)
    return item

def get_all_scans() -> List[Dict[str, Any]]:
    """Return brief history of all scans."""
    global _SCANS
    if not _SCANS:
        _SCANS = _load_db()
    
    history = []
    for s in _SCANS:
        content_preview = s.get("content", "")
        if len(content_preview) > 65:
            content_preview = content_preview[:62] + "..."
        history.append({
            "id": s.get("id"),
            "timestamp": s.get("timestamp"),
            "input_type": s.get("input_type"),
            "content": content_preview,
            "risk_score": s.get("risk_score"),
            "severity": s.get("severity"),
            "classification_title": s.get("classification_title", "Threat Analysis")
        })
    return history

def get_scan_by_id(scan_id: str) -> Optional[Dict[str, Any]]:
    """Return full scan data by ID or None."""
    global _SCANS
    if not _SCANS:
        _SCANS = _load_db()
    for s in _SCANS:
        if s.get("id") == scan_id:
            return copy.deepcopy(s)
    return None

def clear_scans() -> None:
    """Reset to initial seeds."""
    global _SCANS
    _SCANS = copy.deepcopy(INITIAL_SEEDS)
    _save_db(_SCANS)
