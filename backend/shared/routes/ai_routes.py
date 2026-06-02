from flask import Blueprint, request, jsonify
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json or {}
        message = data.get("message", "").strip()

        if not message:
            return jsonify({
                "error": "Message is required"
            }), 400

        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            return jsonify({
                "reply": "ERROR: GROQ_API_KEY not found in .env"
            }), 500

        client = Groq(api_key=api_key)

        completion = client.chat.completions.create(
           model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are InternPortal AI Assistant. "
                        "Help users with internship management, "
                        "coding, Python, JavaScript, React, Flask, "
                        "MongoDB, APIs, databases, web development, "
                        "and general knowledge questions."
                    )
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature=0.7,
            max_tokens=1024
        )

        return jsonify({
            "reply": completion.choices[0].message.content
        })

    except Exception as e:
        print("GROQ ERROR:", str(e))

        return jsonify({
            "reply": f"GROQ ERROR: {str(e)}"
        }), 500