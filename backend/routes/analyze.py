from flask import Blueprint, jsonify, request

from services.heuristic_engine import analyze_message

analyze_bp = Blueprint("analyze", __name__, url_prefix="/api/analyze")


@analyze_bp.route("/", methods=["POST"])
def analyze():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text", "").strip()

    if not text:
        return jsonify({"error": "text is required"}), 400

    result = analyze_message(text)
    return jsonify({"message": "Heuristic engine stub", **result})
