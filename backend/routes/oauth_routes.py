from flask import Blueprint, redirect, request, jsonify
import os

oauth_bp = Blueprint("oauth_bp", __name__)

@oauth_bp.route("/google")
def google_login():
    return jsonify({"message": "Google OAuth - configure with Google Cloud credentials", "status": "not_configured"})

@oauth_bp.route("/github")
def github_login():
    return jsonify({"message": "GitHub OAuth - configure with GitHub App credentials", "status": "not_configured"})

@oauth_bp.route("/callback")
def oauth_callback():
    code = request.args.get("code")
    provider = request.args.get("provider", "google")
    return jsonify({"message": f"OAuth callback from {provider}", "code": code})
