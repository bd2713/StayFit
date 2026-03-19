from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User, UserProfile
from app.schemas.profile import UserProfile as UserProfileSchema, UserProfileCreate, UserProfileUpdate

router = APIRouter()

@router.get("", response_model=UserProfileSchema)
async def read_user_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user profile.
    """
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("", response_model=UserProfileSchema)
async def create_user_profile(
    *,
    db: AsyncSession = Depends(get_db),
    profile_in: UserProfileCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new profile.
    """
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    db_profile = UserProfile(**profile_in.model_dump(), user_id=current_user.id)
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)
    return db_profile

@router.put("", response_model=UserProfileSchema)
async def update_user_profile(
    *,
    db: AsyncSession = Depends(get_db),
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update profile.
    """
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    db_profile = result.scalars().first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
        
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)
    return db_profile
