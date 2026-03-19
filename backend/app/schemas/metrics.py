from pydantic import BaseModel
from datetime import date
from typing import Optional
from uuid import UUID

class HealthMetricBase(BaseModel):
    weight: float
    estimated_metabolic_rate: Optional[float] = None

class HealthMetricCreate(HealthMetricBase):
    pass

class HealthMetricInDBBase(HealthMetricBase):
    id: UUID
    user_id: UUID
    recorded_date: date

    model_config = {"from_attributes": True}

class HealthMetric(HealthMetricInDBBase):
    pass
