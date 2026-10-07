import google.generativeai as genai
import json
import logging
import re
from groq import Groq
from app.core.config import settings
from app.db.models import UserProfile, HealthMetric

logger = logging.getLogger(__name__)

# Global client cache
_gemini_model = None
_groq_client = None

def get_groq_client():
    global _groq_client
    if not _groq_client and settings.GROQ_API_KEY:
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
    return _groq_client

def get_gemini_model():
    global _gemini_model
    if not _gemini_model and settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    return _gemini_model

def get_friendly_error(e: Exception) -> str:
    error_str = str(e)
    if "429" in error_str or "quota" in error_str.lower():
        return "I'm currently assisting many users on the free tier! Please wait about 30-60 seconds and try again. 🧘‍♂️"
    if "500" in error_str:
        return "The AI service is a bit overwhelmed right now. Please try again in a moment!"
    return f"I encountered a small hiccup: {error_str}"

def parse_json_safely(text: str) -> dict:
    """Robust parser that handles markdown formatting, preambles, and minor syntax anomalies."""
    if not text:
        raise ValueError("Empty response received from AI model.")
        
    text = text.strip()
    
    # Strip markdown code blocks if present
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    # Extract the outermost JSON object
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        text = match.group(0)
        
    # Attempt standard parse; if trailing commas exist, clean them
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        cleaned = re.sub(r',\s*([\}\]])', r'\1', text)
        return json.loads(cleaned)

async def _generate_content(prompt: str, system_message: str = "You are a helpful assistant.", is_json: bool = False) -> str:
    last_error = None
    
    # 1. Try Groq with active models and JSON mode
    groq = get_groq_client()
    if groq:
        for model_name in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "llama-3.3-70b-specdec"]:
            try:
                kwargs = {
                    "messages": [
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": prompt}
                    ],
                    "model": model_name,
                    "temperature": 0.5,
                }
                if is_json:
                    kwargs["response_format"] = {"type": "json_object"}
                
                chat_completion = groq.chat.completions.create(**kwargs)
                content = chat_completion.choices[0].message.content
                if content:
                    return content
            except Exception as e:
                last_error = e
                logger.warning(f"Groq model {model_name} failed: {e}")
                continue

    # 2. Fallback to Gemini
    gemini = get_gemini_model()
    if gemini:
        try:
            full_prompt = f"{system_message}\n\n{prompt}"
            response = gemini.generate_content(full_prompt)
            if hasattr(response, 'text') and response.text:
                return response.text
        except Exception as e:
            last_error = e
            logger.warning(f"Gemini fallback failed: {e}")

    if last_error:
        raise last_error
    raise Exception("No working AI provider configured. Please check your GROQ_API_KEY or GEMINI_API_KEY.")

def estimate_metabolism(profile: UserProfile, latest_metric: HealthMetric = None) -> float:
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
    You are an expert AI Dietitian. Generate a concise 7-day meal plan for a {profile.age} year old {profile.gender}, 
    weighing {profile.weight}kg with a goal of {profile.fitness_goal}. 
    Dietary preference: {profile.dietary_preference}. Allergies: {profile.allergies or 'None'}. 
    Daily calorie target: {calories_target}.
    
    Keep meal names concise and strictly output valid JSON with this exact structure:
    {{
      "days": [
        {{
          "day": "Monday",
          "meals": [
            {{"type": "Breakfast", "name": "Oatmeal with almonds & berries", "calories": 400, "macros": {{"p": 15, "c": 60, "f": 10}}}},
            {{"type": "Lunch", "name": "Quinoa salad with chickpeas", "calories": 600, "macros": {{"p": 25, "c": 80, "f": 15}}}},
            {{"type": "Snack", "name": "Greek yogurt with honey", "calories": 200, "macros": {{"p": 15, "c": 20, "f": 5}}}},
            {{"type": "Dinner", "name": "Grilled tofu with brown rice & veggies", "calories": 800, "macros": {{"p": 35, "c": 90, "f": 20}}}}
          ]
        }}
      ]
    }}
    Include all 7 days (Monday through Sunday). Output raw JSON only.
    """
    try:
        text = await _generate_content(prompt, "You are a specialized nutritionist AI. Output valid JSON only.", is_json=True)
        data = parse_json_safely(text)
        if "days" not in data and "plan" in data and "days" in data["plan"]:
            data = data["plan"]
        return data
    except Exception as e:
        logger.error(f"Diet Generation Error: {e}")
        return {"error": get_friendly_error(e)}

async def generate_workout_plan(profile: UserProfile) -> dict:
    prompt = f"""
    You are an expert AI Personal Trainer. Design a concise 7-day workout routine for {profile.age} year old, 
    level: {profile.activity_level}, goal: {profile.fitness_goal}, conditions: {profile.medical_conditions or 'None'}.
    
    Keep descriptions concise and strictly output valid JSON with this exact structure:
    {{
      "workouts": [
        {{
          "day": "Day 1",
          "focus": "Upper Body Push",
          "exercises": [
            {{"name": "Bench Press", "sets": 3, "reps": "8-10", "rest_seconds": 90, "tips": "Control descent"}},
            {{"name": "Overhead Press", "sets": 3, "reps": "10-12", "rest_seconds": 75, "tips": "Core engaged"}},
            {{"name": "Triceps Pushdown", "sets": 3, "reps": "12-15", "rest_seconds": 60, "tips": "Full extension"}}
          ]
        }}
      ]
    }}
    Include all 7 days. Output raw JSON only.
    """
    try:
        text = await _generate_content(prompt, "You are a high-level fitness coach AI. Output valid JSON only.", is_json=True)
        data = parse_json_safely(text)
        if "workouts" not in data and "plan" in data and "workouts" in data["plan"]:
            data = data["plan"]
        return data
    except Exception as e:
        logger.error(f"Workout Generation Error: {e}")
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
    """
    try:
        text = await _generate_content(prompt, "You are a meal analysis AI. Output valid JSON only.", is_json=True)
        return parse_json_safely(text)
    except Exception as e:
        logger.error(f"Nutrition Analysis Error: {e}")
        return {"error": get_friendly_error(e)}

async def chat_with_coach(profile: UserProfile, message: str) -> str:
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
        "Use this data to provide highly personalized, scientifically-accurate, and encouraging advice."
    )
    
    try:
        return await _generate_content(prompt, system_msg, is_json=False)
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        return get_friendly_error(e)
