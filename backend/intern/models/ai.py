print("INTERN MODELS AI LOADED")
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def get_ai_response(message):
    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant for an Internship Portal."
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        )

        return completion.choices[0].message.content

    except Exception as e:
        print("GROQ ERROR:", e)
        return f"AI Error: {str(e)}"
