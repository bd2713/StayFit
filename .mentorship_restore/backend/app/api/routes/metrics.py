from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User, HealthMetric
from app.schemas.metrics import HealthMetric as HealthMetricSchema, HealthMetricCreate

router = APIRouter()

@router.get("", response_model=List[HealthMetricSchema])
async def read_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve user metrics.
    """
    result = await db.execute(
        select(HealthMetric)
        .where(HealthMetric.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    metrics = result.scalars().all()
    return metrics

@router.post("", response_model=HealthMetricSchema)
async def create_metric(
    *,
    db: AsyncSession = Depends(get_db),
    metric_in: HealthMetricCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Log a new health metric (e.g. weight entry).
    """
    metric = HealthMetric(**metric_in.model_dump(), user_id=current_user.id)
    db.add(metric)
    await db.commit()
    await db.refresh(metric)
    return metric
