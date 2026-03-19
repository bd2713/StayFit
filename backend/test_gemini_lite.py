import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    # Testing the Lite model which often has lower overhead/higher availability on free tiers
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    try:
        print("Testing Gemini 2.0 Flash Lite...")
        response = model.generate_content("Hi!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("GEMINI_API_KEY not found in .env")
