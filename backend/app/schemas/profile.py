from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class UserProfileBase(BaseModel):
    age: int
    gender: str
    height: float
    weight: float
    body_fat: Optional[float] = None
    dietary_preference: str
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    fitness_goal: str
    activity_level: str
    sleep_hours: float
    stress_level: str

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    body_fat: Optional[float] = None
    dietary_preference: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    fitness_goal: Optional[str] = None
    activity_level: Optional[str] = None
    sleep_hours: Optional[float] = None
    stress_level: Optional[str] = None

class UserProfileInDBBase(UserProfileBase):
    id: UUID
    user_id: UUID

    model_config = {"from_attributes": True}

class UserProfile(UserProfileInDBBase):
    pass
