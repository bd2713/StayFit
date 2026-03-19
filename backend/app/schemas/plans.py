from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import date
from uuid import UUID

class DietPlanGenerateReq(BaseModel):
    week_start_date: date
    daily_calories_target: int

class DietPlanSchema(BaseModel):
    id: UUID
    user_id: UUID
    week_start_date: date
    daily_calories_target: int
    plan_json: Dict[str, Any]

    model_config = {"from_attributes": True}

class WorkoutPlanSchema(BaseModel):
    id: UUID
    user_id: UUID
    plan_json: Dict[str, Any]

    model_config = {"from_attributes": True}

class NutritionScanReq(BaseModel):
    food_description: str

class NutritionScanRes(BaseModel):
    calories: int
    protein: float
    carbs: float
    fats: float
    health_score: int
    suggestion: str
