import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    try:
        print("Testing Gemini 2.0 Flash...")
        response = model.generate_content("Hello, are you working? Please respond with 'Yes, I am working.'")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("GEMINI_API_KEY not found in .env")
