"""PhishGuard Backend Flask Application."""
import os
import uuid
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure .env is explicitly loaded from backend directory and working directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, ".env"))
load_dotenv()

gemini_key = (os.getenv("GEMINI_API_KEY") or "").strip()
if gemini_key:
    masked_key = gemini_key[:4] + "..." + gemini_key[-4:] if len(gemini_key) > 8 else "***"
    print(f"[PhishGuard Engine] GEMINI_API_KEY detected: {masked_key}")
else:
    print("[PhishGuard Engine] Notice: GEMINI_API_KEY is not set in backend/.env. AI Explainer will utilize structured heuristic fallback.")

from analyzer.heuristics import analyze_input
from analyzer.ai_explainer import explain_threat
from models.scan_store import add_scan, get_all_scans, get_scan_by_id

def create_app() -> Flask:
    app = Flask(__name__)

    # Enable CORS for frontend dev server and deployed origins
    cors_env = os.getenv("CORS_ORIGINS", "*").strip()
    cors_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
    origins_to_allow = "*" if ("*" in cors_origins or not cors_origins) else cors_origins
    CORS(app, resources={r"/*": {"origins": origins_to_allow}}, supports_credentials=True)

    @app.route("/", methods=["GET"])
    def root():
        if "text/html" in request.headers.get("Accept", ""):
            return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PhishGuard Backend API</title>
    <style>
        body {
            margin: 0;
            padding: 40px 20px;
            background: #05070c;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
        }
        .card {
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(6, 182, 212, 0.35);
            border-radius: 16px;
            padding: 32px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 0 40px rgba(6, 182, 212, 0.15);
        }
        h1 { color: #fff; margin-top: 0; font-size: 24px; display: flex; align-items: center; gap: 10px; }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.4);
            border-radius: 9999px;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
        ul { padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.8; }
        code { background: #080c15; color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-family: monospace; }
        a { color: #06b6d4; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .btn {
            display: inline-block;
            margin-top: 20px;
            background: #06b6d4;
            color: #05070c;
            font-weight: bold;
            padding: 12px 24px;
            border-radius: 10px;
            text-decoration: none;
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
        }
        .btn:hover { background: #22d3ee; }
    </style>
</head>
<body>
    <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
            <h1>🛡️ PhishGuard API</h1>
            <span class="badge"><span class="dot"></span> ENGINE ONLINE</span>
        </div>
        <p style="color: #cbd5e1; font-size: 14px;">Phishing Link & Suspicious Message Heuristic Analyzer Backend</p>
        
        <h3 style="color: #38bdf8; font-size: 14px; margin-top: 24px;">ACTIVE REST API ENDPOINTS:</h3>
        <ul>
            <li><code>POST /api/analyze</code> - Submit URL or Message for threat scoring</li>
            <li><code>GET /api/history</code> - <a href="/api/history">View past scan history JSON</a></li>
            <li><code>GET /api/health</code> - <a href="/api/health">System health check status</a></li>
            <li><code>GET /api/report/&lt;id&gt;</code> - Retrieve full analysis report by ID</li>
        </ul>

        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 10px 0;">Looking for the Frontend UI interface?</p>
            <a href="http://localhost:5173" class="btn" target="_blank">Open Frontend UI (http://localhost:5173) →</a>
        </div>
    </div>
</body>
</html>
""", 200, {"Content-Type": "text/html"}

        return jsonify({
            "service": "PhishGuard Threat Analysis Engine",
            "status": "online",
            "frontend_url": "http://localhost:5173",
            "endpoints": {
                "health": "/api/health",
                "analyze": "POST /api/analyze",
                "history": "/api/history",
                "report": "/api/report/<id>"
            }
        }), 200

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "ok",
            "service": "PhishGuard Threat Analysis Engine",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 200

    @app.route("/api/analyze", methods=["POST"])
    def analyze():
        data = request.get_json(force=True, silent=True)
        if not data and request.data:
            import json
            try:
                data = json.loads(request.data.decode("utf-8"))
            except Exception:
                pass
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid request body. Expected JSON object."}), 400

        input_type = data.get("type", "").strip().lower()
        content = data.get("content", "").strip()

        if input_type not in ("url", "message"):
            return jsonify({"error": "Field 'type' must be either 'url' or 'message'."}), 400

        if not content:
            return jsonify({"error": "Field 'content' cannot be empty."}), 400

        if len(content) > 10000:
            return jsonify({"error": "Field 'content' exceeds maximum allowable limit (10,000 characters)."}), 400

        # Execute heuristic rules
        heuristic_result = analyze_input(input_type, content)

        # Generate unique scan ID and timestamp
        scan_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()

        # Generate AI explanation with fallback
        ai_explanation = explain_threat(
            input_type=input_type,
            content=content,
            signals=heuristic_result["signals"],
            severity=heuristic_result["severity"],
            risk_score=heuristic_result["risk_score"],
            classification_title=heuristic_result["classification_title"],
            breakdown=heuristic_result["breakdown"]
        )

        # Build response strictly matching required frontend shape
        analysis_payload = {
            "id": scan_id,
            "timestamp": timestamp,
            "input_type": input_type,
            "content": content,
            "risk_score": heuristic_result["risk_score"],
            "severity": heuristic_result["severity"],
            "confidence": heuristic_result["confidence"],
            "classification_title": heuristic_result["classification_title"],
            "signals": heuristic_result["signals"],
            "breakdown": heuristic_result["breakdown"],
            "url_segments": heuristic_result["url_segments"],
            "ai_explanation": ai_explanation,
            "recommended_action": heuristic_result["recommended_action"]
        }

        # Save into in-memory store
        add_scan(analysis_payload)

        return jsonify(analysis_payload), 200

    @app.route("/api/history", methods=["GET"])
    def history():
        scans = get_all_scans()
        return jsonify(scans), 200

    @app.route("/api/report/<string:scan_id>", methods=["GET"])
    def report(scan_id: str):
        scan = get_scan_by_id(scan_id)
        if not scan:
            return jsonify({"error": f"Scan report with ID '{scan_id}' not found."}), 404
        return jsonify(scan), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "An internal server error occurred"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
