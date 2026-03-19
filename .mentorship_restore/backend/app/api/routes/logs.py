from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User, MealLog, WorkoutLog
from app.schemas.logs import MealLog as MealLogSchema, MealLogCreate, WorkoutLog as WorkoutLogSchema, WorkoutLogCreate

router = APIRouter()

@router.get("/meals", response_model=List[MealLogSchema])
async def read_meal_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve user meal logs.
    """
    result = await db.execute(select(MealLog).where(MealLog.user_id == current_user.id).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/meals", response_model=MealLogSchema)
async def create_meal_log(
    *,
    db: AsyncSession = Depends(get_db),
    log_in: MealLogCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new meal log.
    """
    log = MealLog(**log_in.model_dump(), user_id=current_user.id)
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


@router.get("/workouts", response_model=List[WorkoutLogSchema])
async def read_workout_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve user workout logs.
    """
    result = await db.execute(select(WorkoutLog).where(WorkoutLog.user_id == current_user.id).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/workouts", response_model=WorkoutLogSchema)
async def create_workout_log(
    *,
    db: AsyncSession = Depends(get_db),
    log_in: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new workout log.
    """
    log = WorkoutLog(**log_in.model_dump(), user_id=current_user.id)
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log
