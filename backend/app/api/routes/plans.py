from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User, UserProfile, DietPlan, WorkoutPlan
from app.schemas.plans import DietPlanSchema, DietPlanGenerateReq, WorkoutPlanSchema, NutritionScanReq
from app.services import ai_service

router = APIRouter()

@router.post("/diet", response_model=DietPlanSchema)
async def generate_diet(
    *,
    db: AsyncSession = Depends(get_db),
    req: DietPlanGenerateReq,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Generate a new AI diet plan.
    """
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=400, detail="User profile required to generate diet plan")

    plan_json = await ai_service.generate_diet_plan(profile, req.daily_calories_target)
    
    diet_plan = DietPlan(
        user_id=current_user.id,
        week_start_date=req.week_start_date,
        daily_calories_target=req.daily_calories_target,
        plan_json=plan_json
    )
    db.add(diet_plan)
    await db.commit()
    await db.refresh(diet_plan)
    return diet_plan

@router.post("/workout", response_model=WorkoutPlanSchema)
async def generate_workout(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Generate a new AI workout plan.
    """
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=400, detail="User profile required to generate workout plan")

    plan_json = await ai_service.generate_workout_plan(profile)
    
    workout_plan = WorkoutPlan(
        user_id=current_user.id,
        plan_json=plan_json
    )
    db.add(workout_plan)
    await db.commit()
    await db.refresh(workout_plan)
    return workout_plan

@router.post("/scan")
async def scan_nutrition(
    req: NutritionScanReq,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Scan a food description and return nutritional estimates.
    """
    return await ai_service.analyze_nutrition(req.food_description)
