import os
from dotenv import load_dotenv
from groq import Groq
from app.core.config import settings

load_dotenv()

print(f"DEBUG: settings.GROQ_API_KEY: '{settings.GROQ_API_KEY}'")
print(f"DEBUG: os.environ.get('GROQ_API_KEY'): '{os.environ.get('GROQ_API_KEY')}'")

if settings.GROQ_API_KEY:
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        print("DEBUG: Attempting Groq test call (Llama 3.3 70B)...")
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": "Say 'Groq is ready'"}
            ],
            model="llama-3.3-70b-versatile",
        )
        print(f"DEBUG: Success! Response: {chat_completion.choices[0].message.content}")
    except Exception as e:
        print(f"DEBUG: Groq failed: {e}")
else:
    print("DEBUG: GROQ_API_KEY is empty in settings.")
