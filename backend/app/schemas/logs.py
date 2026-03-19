from pydantic import BaseModel
from datetime import date
from typing import Optional, Dict, Any, List
from uuid import UUID

class MealLogBase(BaseModel):
    meal_type: str
    food_items_json: Dict[str, Any] | List[Any]
    total_calories: int
    protein: float
    carbs: float
    fats: float
    mood: Optional[str] = None

class MealLogCreate(MealLogBase):
    pass

class MealLogInDBBase(MealLogBase):
    id: UUID
    user_id: UUID
    log_date: date

    model_config = {"from_attributes": True}

class MealLog(MealLogInDBBase):
    pass


class WorkoutLogBase(BaseModel):
    completed_exercises_json: Dict[str, Any] | List[Any]
    duration_mins: int
    calories_burned: int

class WorkoutLogCreate(WorkoutLogBase):
    pass

class WorkoutLogInDBBase(WorkoutLogBase):
    id: UUID
    user_id: UUID
    log_date: date

    model_config = {"from_attributes": True}

class WorkoutLog(WorkoutLogInDBBase):
    pass
