from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User, UserProfile, ChatHistory
from app.schemas.chat import ChatMessageReq, ChatMessageRes
from app.services import ai_service

router = APIRouter()

@router.get("", response_model=List[ChatMessageRes])
async def read_chat_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve user chat history.
    """
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.timestamp.asc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/message", response_model=ChatMessageRes)
async def send_chat_message(
    *,
    db: AsyncSession = Depends(get_db),
    req: ChatMessageReq,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Send a message to the AI Health Coach and get a response.
    """
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=400, detail="User profile required to chat with coach")

    # Save user message
    user_msg = ChatHistory(user_id=current_user.id, role="user", message=req.message)
    db.add(user_msg)
    
    # Get AI response
    ai_response = await ai_service.chat_with_coach(profile, req.message)
    
    # Save AI response
    ai_msg = ChatHistory(user_id=current_user.id, role="ai", message=ai_response)
    db.add(ai_msg)
    
    await db.commit()
    await db.refresh(ai_msg)
    
    return ai_msg

@router.delete("")
async def clear_chat_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete all chat history for the current user.
    """
    from sqlalchemy import delete
    await db.execute(delete(ChatHistory).where(ChatHistory.user_id == current_user.id))
    await db.commit()
    return {"message": "Chat history cleared successfully"}
