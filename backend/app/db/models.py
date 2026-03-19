import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    health_metrics = relationship("HealthMetric", back_populates="user")
    diet_plans = relationship("DietPlan", back_populates="user")
    workout_plans = relationship("WorkoutPlan", back_populates="user")
    meal_logs = relationship("MealLog", back_populates="user")
    workout_logs = relationship("WorkoutLog", back_populates="user")
    ai_recommendations = relationship("AIRecommendation", back_populates="user")
    chat_history = relationship("ChatHistory", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    
    age = Column(Integer)
    gender = Column(String)
    height = Column(Float)
    weight = Column(Float)
    body_fat = Column(Float, nullable=True)
    dietary_preference = Column(String)
    allergies = Column(String, nullable=True)
    medical_conditions = Column(String, nullable=True)
    fitness_goal = Column(String)
    activity_level = Column(String)
    sleep_hours = Column(Float)
    stress_level = Column(String)

    user = relationship("User", back_populates="profile")


class HealthMetric(Base):
    __tablename__ = "health_metrics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    recorded_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    weight = Column(Float)
    estimated_metabolic_rate = Column(Float)  # Feature A
    
    user = relationship("User", back_populates="health_metrics")


class DietPlan(Base):
    __tablename__ = "diet_plans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    week_start_date = Column(Date)
    daily_calories_target = Column(Integer)
    plan_json = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="diet_plans")


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    plan_json = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="workout_plans")


class MealLog(Base):
    __tablename__ = "meal_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    log_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    meal_type = Column(String)
    food_items_json = Column(JSONB)
    total_calories = Column(Integer)
    protein = Column(Float)
    carbs = Column(Float)
    fats = Column(Float)
    mood = Column(String, nullable=True)  # Feature C
    
    user = relationship("User", back_populates="meal_logs")


class WorkoutLog(Base):
    __tablename__ = "workout_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    log_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    completed_exercises_json = Column(JSONB)
    duration_mins = Column(Integer)
    calories_burned = Column(Integer)
    
    user = relationship("User", back_populates="workout_logs")


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    recommendation_type = Column(String)  # habit, metabolism, weekly_report
    content = Column(JSONB) # Store JSON string or dict
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="ai_recommendations")


class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    role = Column(String) # user or ai
    message = Column(String)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="chat_history")
