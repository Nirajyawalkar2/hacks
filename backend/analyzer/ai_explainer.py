"""Gemini-powered structured AI explanation generator with resilient fallback for PhishGuard."""
import os
import re
import json
import logging
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

REQUIRED_KEYS = ["summary", "detailed_reasoning", "attacker_intent", "real_world_comparison"]

def generate_fallback_explanation(
    input_type: str,
    content: str,
    signals: List[Dict[str, str]],
    severity: str,
    risk_score: int,
    classification_title: str,
    breakdown: Optional[Dict[str, int]] = None
) -> Dict[str, str]:
    """
    Generate a robust, content-specific structured explanation
    matching the 4-field schema when Gemini is offline, unconfigured, or returns invalid JSON.
    """
    content_snippet = content[:90] + "..." if len(content) > 90 else content

    if not signals or severity == "LOW":
        return {
            "summary": f"This {input_type} exhibits normal structure and passed all baseline phishing heuristics.",
            "detailed_reasoning": (
                f"The analyzed target '{content_snippet}' does not demonstrate brand lookalike tricks, "
                "deceptive subdomains, unencrypted transmission risks, or high-pressure social engineering keywords. "
                "The routing parameters and SSL configuration align with standard legitimate traffic."
            ),
            "attacker_intent": "No malicious intent or credential harvesting pattern was detected in this submission.",
            "real_world_comparison": "Consistent with authentic digital communications and verified public endpoints."
        }

    # Extract granular signal details
    signal_details = [s.get("detail", s.get("label", "")) for s in signals]
    reasoning_body = " ".join(signal_details[:3])

    # Contextual attacker intent
    if any("Credential" in s.get("label", "") or "Password" in s.get("label", "") for s in signals):
        intent = "The threat actor aims to deceive the recipient into surrendering sensitive authentication credentials, passwords, or one-time codes."
        comparison = "Commonly seen in credential phishing portals mimicking financial institutions or enterprise SSO login screens."
    elif any("Urgency" in s.get("label", "") or "Panic" in s.get("label", "") for s in signals):
        intent = "The threat actor is fabricating an artificial crisis (such as account termination) to induce hasty compliance before the victim can verify authenticity."
        comparison = "Classic smishing/spear-phishing social engineering lure that exploits psychological urgency."
    elif any("Brand" in s.get("label", "") or "Typosquat" in s.get("label", "") or "Substitution" in s.get("label", "") for s in signals):
        intent = "The threat actor seeks to capitalize on visual deception by spoofing trusted brand trademarks on an illegitimate host."
        comparison = "Standard typosquatting and homoglyph brand impersonation campaign designed to deceive human visual inspection."
    else:
        intent = f"The threat actor is using obfuscation techniques to route user traffic through an unauthorized {input_type} vector."
        comparison = "Representative of malicious redirection chains and disposable phishing campaigns."

    return {
        "summary": f"Flagged as {severity} risk ({risk_score}/100) exhibiting distinct signatures of {classification_title}.",
        "detailed_reasoning": (
            f"Analysis of '{content_snippet}' identified critical deception markers: {reasoning_body}. "
            "These structural anomalies are intentionally engineered to bypass basic security scrutiny and trick recipients."
        ),
        "attacker_intent": intent,
        "real_world_comparison": comparison
    }

def explain_threat(
    input_type: str,
    content: str,
    signals: List[Dict[str, str]],
    severity: str,
    risk_score: int,
    classification_title: str = "Phishing Threat Assessment",
    breakdown: Optional[Dict[str, int]] = None
) -> Dict[str, str]:
    """
    Generate deep, structured threat analysis via Gemini API (REST endpoint for lightning-fast latency),
    returning a 4-key JSON object:
    - summary
    - detailed_reasoning
    - attacker_intent
    - real_world_comparison
    Guaranteed to return all 4 fields via fallback if API fails or parsing errors occur.
    """
    api_key = (os.getenv("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY", "")).strip()

    if not api_key:
        print("[AI Explainer] GEMINI_API_KEY is not configured or empty. Using fallback template.", flush=True)
        return generate_fallback_explanation(
            input_type, content, signals, severity, risk_score, classification_title, breakdown
        )

    print(f"[AI Explainer] Live Gemini API call started for {input_type.upper()}...", flush=True)

    signal_descriptions = "\n".join(
        [f"- [{s.get('severity', 'HIGH')}] {s.get('label')}: {s.get('detail')}" for s in signals]
    ) if signals else "None (passed all heuristic checks)"

    breakdown_info = ""
    if breakdown:
        breakdown_info = f"""
Category Breakdown:
- Domain Structure: {breakdown.get('domain_structure', 0)}%
- URL Pattern: {breakdown.get('url_pattern', 0)}%
- Social Engineering: {breakdown.get('social_engineering', 0)}%
- Credential Harvesting: {breakdown.get('credential_request', 0)}%
"""

    prompt = f"""You are a cybersecurity analyst explaining phishing detection results to a non-technical user. Be specific and reference the actual content analyzed, not generic phrasing. Keep tone clear and educational, not alarmist. Respond ONLY with valid JSON, no markdown formatting, no code fences, no extra text before or after the JSON.

Original Submission Type: {input_type}
Original Content Analyzed: {content}
Classification Verdict: {classification_title}
Calculated Threat Score: {risk_score}/100 ({severity})
{breakdown_info}
Triggered Detection Signals:
{signal_descriptions}

Task:
Return a JSON object with EXACTLY these four string fields:
{{
  "summary": "1-2 sentence plain-language verdict a non-technical user understands immediately",
  "detailed_reasoning": "3-5 sentences explaining the specific red flags found — reference the actual domain/URL/message content, not generic phrasing. E.g. explain WHY lookalikes, unusual TLDs, or urgency triggers in the content are deceptive rather than just saying 'suspicious domain detected'",
  "attacker_intent": "1-2 sentences on what the attacker is likely trying to achieve",
  "real_world_comparison": "1 sentence comparing this to a known phishing pattern type if applicable"
}}"""

    # Direct Google AI REST endpoint with fast flash-lite models
    models_to_try = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash"]

    for model_name in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            }

            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=12) as resp:
                resp_json = json.loads(resp.read().decode("utf-8"))

            candidates = resp_json.get("candidates", [])
            if not candidates:
                raise ValueError("No candidates returned from Gemini API.")

            parts = candidates[0].get("content", {}).get("parts", [])
            raw_text = parts[0].get("text", "").strip() if parts else ""

            if not raw_text:
                raise ValueError("Empty text part returned from Gemini candidate.")

            # Strip any residual code fences
            cleaned_text = re.sub(r'^```(?:json)?\s*', '', raw_text, flags=re.IGNORECASE)
            cleaned_text = re.sub(r'\s*```$', '', cleaned_text).strip()

            data = json.loads(cleaned_text)

            if isinstance(data, dict) and all(
                k in data and isinstance(data[k], str) and data[k].strip() for k in REQUIRED_KEYS
            ):
                result = {
                    "summary": data["summary"].strip(),
                    "detailed_reasoning": data["detailed_reasoning"].strip(),
                    "attacker_intent": data["attacker_intent"].strip(),
                    "real_world_comparison": data["real_world_comparison"].strip()
                }
                preview = result["summary"][:80]
                print(f"[AI Explainer] Gemini API call succeeded ({model_name})! Summary: \"{preview}...\"", flush=True)
                return result
            else:
                missing = [k for k in REQUIRED_KEYS if not (isinstance(data, dict) and data.get(k))]
                raise ValueError(f"Missing required fields: {missing}")

        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            print(f"[AI Explainer] Model {model_name} HTTP {he.code}: {err_body[:120]}", flush=True)
            if he.code == 404:
                continue # Try next model
            break
        except Exception as e:
            print(f"[AI Explainer] Gemini call with {model_name} failed: {type(e).__name__} - {str(e)}", flush=True)
            continue

    print("[AI Explainer] Falling back to structured heuristic synthesis.", flush=True)
    return generate_fallback_explanation(
        input_type, content, signals, severity, risk_score, classification_title, breakdown
    )
