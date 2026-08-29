"""HTTP Client Verification for running Flask server."""
import urllib.request
import json

def test_endpoints():
    BASE_URL = "http://127.0.0.1:5000"

    print("=== 1. Testing POST /api/analyze (Phishing URL) ===")
    url_payload = {
        "type": "url",
        "content": "http://secure-login.paypa1-checkpoint.net/verify?token=ab239c8192830192830192"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/analyze",
        data=json.dumps(url_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        res1 = json.loads(resp.read().decode("utf-8"))
        print(json.dumps(res1, indent=2))
        assert "id" in res1
        assert res1["input_type"] == "url"
        assert res1["risk_score"] >= 80
        assert res1["severity"] in ("HIGH", "CRITICAL")
        assert res1["url_segments"] is not None
        assert "domain" in res1["url_segments"]
        scan_id1 = res1["id"]
        print(f"[SUCCESS] Phishing URL analyzed. Scan ID: {scan_id1}")

    print("\n=== 2. Testing POST /api/analyze (Phishing Message) ===")
    msg_payload = {
        "type": "message",
        "content": "URGENT: Your Chase bank account is temporarily suspended. Please enter your password and OTP immediately to verify your identity."
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/analyze",
        data=json.dumps(msg_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        res2 = json.loads(resp.read().decode("utf-8"))
        print(json.dumps(res2, indent=2))
        assert "id" in res2
        assert res2["input_type"] == "message"
        assert res2["risk_score"] >= 80
        scan_id2 = res2["id"]
        print(f"[SUCCESS] Phishing Message analyzed. Scan ID: {scan_id2}")

    print("\n=== 3. Testing GET /api/history ===")
    with urllib.request.urlopen(f"{BASE_URL}/api/history") as resp:
        assert resp.status == 200
        history = json.loads(resp.read().decode("utf-8"))
        print(f"History contains {len(history)} entries:")
        print(json.dumps(history, indent=2))
        assert len(history) >= 2
        print("[SUCCESS] Scan history retrieved successfully.")

    print(f"\n=== 4. Testing GET /api/report/{scan_id1} ===")
    with urllib.request.urlopen(f"{BASE_URL}/api/report/{scan_id1}") as resp:
        assert resp.status == 200
        report = json.loads(resp.read().decode("utf-8"))
        assert report["id"] == scan_id1
        assert report["input_type"] == "url"
        print(f"[SUCCESS] Full report for {scan_id1} verified.")

    print("\n=== 5. Testing GET /api/report/invalid-uuid ===")
    try:
        urllib.request.urlopen(f"{BASE_URL}/api/report/invalid-uuid")
        assert False, "Expected 404"
    except urllib.error.HTTPError as e:
        assert e.code == 404
        print("[SUCCESS] 404 correctly returned for non-existent report ID.")

    print("\nALL HTTP ENDPOINTS FULLY OPERATIONAL AND VERIFIED!")

if __name__ == "__main__":
    test_endpoints()
