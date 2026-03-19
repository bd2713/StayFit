import google.generativeai as genai
import json
from groq import Groq
from app.core.config import settings
from app.db.models import UserProfile, HealthMetric

# Global client cache
_gemini_model = None
_groq_client = None

def get_groq_client():
    global _groq_client
    if not _groq_client and settings.GROQ_API_KEY:
        print("--- Initializing Groq Client ---")
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
    return _groq_client

def get_gemini_model():
    global _gemini_model
    if not _gemini_model and settings.GEMINI_API_KEY:
        print("--- Initializing Gemini Model ---")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel('gemini-2.0-flash-lite')
    return _gemini_model

def get_friendly_error(e: Exception) -> str:
    """Helper to convert complex API errors into friendly guidance."""
    error_str = str(e)
    if "429" in error_str or "quota" in error_str.lower():
        return "I'm currently assisting many users on the free tier! Please wait about 30-60 seconds and try again so I can give you my full attention. 🧘‍♂️"
    if "500" in error_str:
        return "The AI service is a bit overwhelmed right now. Please try again in a moment!"
    return f"I encountered a small hiccup: {error_str}"

async def _generate_content(prompt: str, system_message: str = "You are a helpful assistant.") -> str:
    """Internal helper to route requests to Groq (preferred) or Gemini."""
    groq = get_groq_client()
    # Preferred: Groq (Higher rate limits on free tier)
    if groq:
        try:
            print(f"DEBUG: Using Groq (Llama 3.3 70B)...")
            chat_completion = groq.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.3-70b-versatile",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq primary error: {e}")
            # fall through to Gemini if Groq fails
    
    # Fallback: Gemini
    gemini = get_gemini_model()
    if gemini:
        try:
            print(f"DEBUG: Using Gemini Fallback...")
            response = gemini.generate_content(f"{system_message}\n\n{prompt}")
            if hasattr(response, 'parts') and response.parts:
                return response.text
            return "Unable to generate response via Gemini."
        except Exception as e:
            raise e
            
    raise Exception("No AI provider configured. Please add GROQ_API_KEY or GEMINI_API_KEY to your .env file.")

def estimate_metabolism(profile: UserProfile, latest_metric: HealthMetric = None) -> float:
    """Feature A: Basic calculation for BMR with simple multipliers based on profile/metric."""
    weight = latest_metric.weight if latest_metric else profile.weight
    s = 5 if profile.gender.lower() in ['male', 'm'] else -161
    bmr = 10 * weight + 6.25 * profile.height - 5 * profile.age + s
    
    multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very active': 1.9,
        'very_active': 1.9
    }
    multiplier = multipliers.get(profile.activity_level.lower(), 1.2)
    return bmr * multiplier

async def generate_diet_plan(profile: UserProfile, calories_target: int) -> dict:
    prompt = f"""
    You are an expert AI Dietitian. Generate a 7-day meal plan for a {profile.age} year old {profile.gender}, 
    weighing {profile.weight}kg with a goal of {profile.fitness_goal}. 
    Dietary preference: {profile.dietary_preference}. Allergies: {profile.allergies}. 
    Daily calorie target: {calories_target}.
    
    Return strictly as a JSON object with this structure:
    {{
      "days": [
        {{
          "day": "Monday",
          "meals": [
            {{"type": "Breakfast", "name": "...", "calories": 0, "macros": {{"p":0, "c":0, "f":0}}}},
            ...
          ]
        }}
      ]
    }}
    Do not wrap with markdown code blocks. Just output raw JSON.
    """
    try:
        text = await _generate_content(prompt, "You are a specialized nutritionist AI.")
        text = text.strip()
        if text.startswith('```json'):
            text = text[7:-3]
        elif text.startswith('```'):
            text = text[3:-3]
        return json.loads(text)
    except Exception as e:
        print(f"Diet Generation Error: {e}")
        return {"error": get_friendly_error(e)}

async def generate_workout_plan(profile: UserProfile) -> dict:
    prompt = f"""
    You are an expert AI Personal Trainer. Design a workout plan for {profile.age} year old, 
    level: {profile.activity_level}, goal: {profile.fitness_goal}, conditions: {profile.medical_conditions}.
    
    Return strictly as a JSON object:
    {{
      "workouts": [
        {{
          "day": "Day 1",
          "focus": "Full Body",
          "exercises": [
            {{"name": "...", "sets": 3, "reps": "10-12", "rest_seconds": 60, "tips": "..."}}
          ]
        }}
      ]
    }}
    Do not wrap with markdown code blocks. Just output raw JSON.
    """
    try:
        text = await _generate_content(prompt, "You are a high-level fitness coach AI.")
        text = text.strip()
        if text.startswith('```json'):
            text = text[7:-3]
        elif text.startswith('```'):
            text = text[3:-3]
        return json.loads(text)
    except Exception as e:
        print(f"Workout Generation Error: {e}")
        return {"error": get_friendly_error(e)}

async def analyze_nutrition(food_description: str) -> dict:
    prompt = f"""
    Analyze this food/meal description: '{food_description}'. 
    Estimate total calories, protein, carbs, and fats. 
    Provide a health score (1-10) and one specific suggestion to make it healthier.
    
    Return strictly as a JSON object:
    {{
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fats": 0,
      "health_score": 0,
      "suggestion": "..."
    }}
    Do not wrap with markdown code blocks. Just output raw JSON.
    """
    try:
        text = await _generate_content(prompt, "You are a meal analysis AI.")
        text = text.strip()
        if text.startswith('```json'):
            text = text[7:-3]
        elif text.startswith('```'):
            text = text[3:-3]
        return json.loads(text)
    except Exception as e:
        print(f"Nutrition Analysis Error: {e}")
        return {"error": get_friendly_error(e)}

async def chat_with_coach(profile: UserProfile, message: str) -> str:
    # Build a detailed context string to make the AI truly aware of who it's talking to
    context = (
        f"The user is {profile.age} years old, {profile.gender}. "
        f"Height: {profile.height}cm, Weight: {profile.weight}kg. "
        f"Activity Level: {profile.activity_level}. "
        f"Fitness Goal: {profile.fitness_goal}. "
        f"Dietary Preference: {profile.dietary_preference or 'None'}. "
        f"Allergies: {profile.allergies or 'None'}. "
        f"Medical Conditions: {profile.medical_conditions or 'None'}."
    )
    
    prompt = f"User profile for your reference: {context}\n\nUser message: '{message}'"
    
    system_msg = (
        "You are StayFit, a holistic and highly intelligent AI Health Coach. "
        "You have access to the user's biological profile and goals. "
        "Use this data to provide highly personalized, scientifically-accurate, and encouraging advice. "
        "If they ask about their own stats (like height or goal), you should know them."
    )
    
    try:
        return await _generate_content(prompt, system_msg)
    except Exception as e:
        print(f"Chat Error: {e}")
        return get_friendly_error(e)
