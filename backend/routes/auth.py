from flask import Blueprint, jsonify, request

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    return jsonify({"message": "Auth not implemented yet"}), 501


@auth_bp.route("/login", methods=["POST"])
def login():
    return jsonify({"message": "Auth not implemented yet"}), 501
