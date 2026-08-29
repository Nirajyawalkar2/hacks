"""Automated verification suite for PhishGuard backend."""
import json
from app import create_app
from analyzer.heuristics import analyze_input
from analyzer.url_parser import parse_url_segments

def run_tests():
    print("=== 1. Testing URL Parser ===")
    parsed = parse_url_segments("http://secure-login.paypa1-checkpoint.net/verify?token=123")
    assert parsed is not None
    assert parsed["protocol"] == "http"
    assert parsed["domain"] == "paypa1-checkpoint.net"
    assert parsed["subdomain"] == "secure-login"
    assert parsed["path"] == "/verify"
    assert parsed["params"] == "token=123"
    print("[PASS] URL Parser works as expected.")

    print("\n=== 2. Testing Heuristic Analyzer on Phishing URL ===")
    res_url = analyze_input("url", "http://secure-login.paypa1-checkpoint.net/verify?token=12345678901234567890123456789012345678901234567890123456")
    print(f"Risk Score: {res_url['risk_score']}")
    print(f"Severity: {res_url['severity']}")
    print(f"Classification: {res_url['classification_title']}")
    print(f"Signals Triggered: {[s['label'] for s in res_url['signals']]}")
    assert res_url["risk_score"] >= 80, "Expected high/critical risk score for lookalike domain"
    assert res_url["severity"] in ("HIGH", "CRITICAL")
    assert len(res_url["signals"]) >= 2
    assert "domain_structure" in res_url["breakdown"]
    print("[PASS] Phishing URL test passed.")

    print("\n=== 3. Testing Heuristic Analyzer on Phishing Message ===")
    msg = "URGENT: Your Chase bank account is suspended within 24 hours. Enter your password and OTP immediately to verify."
    res_msg = analyze_input("message", msg)
    print(f"Risk Score: {res_msg['risk_score']}")
    print(f"Severity: {res_msg['severity']}")
    print(f"Signals Triggered: {[s['label'] for s in res_msg['signals']]}")
    assert res_msg["risk_score"] >= 80
    assert res_msg["severity"] in ("HIGH", "CRITICAL")
    print("[PASS] Phishing message test passed.")

    print("\n=== 4. Testing Flask App Endpoints ===")
    app = create_app()
    client = app.test_client()

    # Health
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"
    print("[PASS] GET /api/health passed.")

    # Analyze URL
    payload_url = {
        "type": "url",
        "content": "http://secure-login.paypa1-checkpoint.net/verify?token=123"
    }
    r = client.post("/api/analyze", json=payload_url)
    assert r.status_code == 200
    data_url = r.get_json()
    assert "id" in data_url
    assert data_url["input_type"] == "url"
    assert "risk_score" in data_url
    assert "severity" in data_url
    assert "confidence" in data_url
    assert "classification_title" in data_url
    assert "signals" in data_url
    assert "breakdown" in data_url
    assert "url_segments" in data_url
    assert "ai_explanation" in data_url
    assert "recommended_action" in data_url
    scan_id = data_url["id"]
    print(f"[PASS] POST /api/analyze (URL) passed. Scan ID: {scan_id}")

    # Analyze Message
    payload_msg = {
        "type": "message",
        "content": "Your account will be suspended! Verify password now."
    }
    r = client.post("/api/analyze", json=payload_msg)
    assert r.status_code == 200
    data_msg = r.get_json()
    assert data_msg["input_type"] == "message"
    print("[PASS] POST /api/analyze (Message) passed.")

    # History
    r = client.get("/api/history")
    assert r.status_code == 200
    history = r.get_json()
    assert len(history) >= 2
    assert history[0]["id"] in (scan_id, data_msg["id"])
    print(f"[PASS] GET /api/history passed with {len(history)} items.")

    # Report by ID
    r = client.get(f"/api/report/{scan_id}")
    assert r.status_code == 200
    report = r.get_json()
    assert report["id"] == scan_id
    assert report["content"] == payload_url["content"]
    print("[PASS] GET /api/report/<id> passed.")

    # Non-existent report
    r = client.get("/api/report/invalid-id-000")
    assert r.status_code == 404
    print("[PASS] GET /api/report/invalid-id returned 404 as expected.")

    print("\nALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
