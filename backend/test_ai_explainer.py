"""Verification suite for structured 4-field AI explanation engine."""
import os
import json
from analyzer.ai_explainer import explain_threat, generate_fallback_explanation
from analyzer.heuristics import analyze_input
from app import create_app

def run_tests():
    print("=== 1. Testing Structured Fallback Generator (No API Key) ===")
    url_content = "http://secure-login.paypa1-checkpoint.net/verify?token=ab239c8192830192830192"
    heuristics_url = analyze_input("url", url_content)

    fallback_res = generate_fallback_explanation(
        input_type="url",
        content=url_content,
        signals=heuristics_url["signals"],
        severity=heuristics_url["severity"],
        risk_score=heuristics_url["risk_score"],
        classification_title=heuristics_url["classification_title"],
        breakdown=heuristics_url["breakdown"]
    )

    print("Fallback Output:")
    print(json.dumps(fallback_res, indent=2))

    required_keys = ["summary", "detailed_reasoning", "attacker_intent", "real_world_comparison"]
    for key in required_keys:
        assert key in fallback_res, f"Missing required key: {key}"
        assert isinstance(fallback_res[key], str) and len(fallback_res[key]) > 0, f"Key {key} must be non-empty string"

    assert "paypa1" in fallback_res["detailed_reasoning"] or "PayPal" in fallback_res["detailed_reasoning"]
    print("[PASS] Fallback generator verified with all 4 structured fields.")

    print("\n=== 2. Testing Malformed JSON Recovery in explain_threat ===")
    # Temporarily set dummy key to test parsing resilience
    old_key = os.environ.get("GEMINI_API_KEY")
    os.environ["GEMINI_API_KEY"] = "invalid_test_key_for_fallback_check"

    res_malformed = explain_threat(
        input_type="url",
        content=url_content,
        signals=heuristics_url["signals"],
        severity=heuristics_url["severity"],
        risk_score=heuristics_url["risk_score"],
        classification_title=heuristics_url["classification_title"],
        breakdown=heuristics_url["breakdown"]
    )

    for key in required_keys:
        assert key in res_malformed, f"Missing key in recovery: {key}"
    print("[PASS] Malformed/Failed API response recovered into valid 4-field structure.")

    if old_key is not None:
        os.environ["GEMINI_API_KEY"] = old_key
    else:
        os.environ.pop("GEMINI_API_KEY", None)

    print("\n=== 3. Testing Flask App POST /api/analyze Response Shape ===")
    app = create_app()
    client = app.test_client()

    # Phishing URL test
    resp_url = client.post("/api/analyze", json={
        "type": "url",
        "content": url_content
    })
    assert resp_url.status_code == 200
    data_url = resp_url.get_json()
    assert "ai_explanation" in data_url
    assert isinstance(data_url["ai_explanation"], dict), "ai_explanation must be a structured JSON object"
    for key in required_keys:
        assert key in data_url["ai_explanation"]
    print("[PASS] /api/analyze URL returned structured ai_explanation:")
    print(json.dumps(data_url["ai_explanation"], indent=2))

    # Phishing Message test
    msg_content = "URGENT: Your Chase bank account is suspended within 24 hours. Enter your password and OTP immediately to verify."
    resp_msg = client.post("/api/analyze", json={
        "type": "message",
        "content": msg_content
    })
    assert resp_msg.status_code == 200
    data_msg = resp_msg.get_json()
    assert isinstance(data_msg["ai_explanation"], dict)
    for key in required_keys:
        assert key in data_msg["ai_explanation"]
    print("[PASS] /api/analyze Message returned structured ai_explanation:")
    print(json.dumps(data_msg["ai_explanation"], indent=2))

    print("\nALL STRUCTURED AI EXPLANATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
