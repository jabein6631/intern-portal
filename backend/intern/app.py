import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from routes.ai_routes import ai_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(ai_bp)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_message = request.json.get("message")

        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": user_message}
            ]
        )

        return jsonify({
            "reply": completion.choices[0].message.content
        })

    except Exception as e:
        return jsonify({"reply": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)