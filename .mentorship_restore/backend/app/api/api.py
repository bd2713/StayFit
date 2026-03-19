from fastapi import APIRouter
from app.api.routes import auth, profile, metrics, logs, plans, chat
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(plans.router, prefix="/plans", tags=["plans"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
