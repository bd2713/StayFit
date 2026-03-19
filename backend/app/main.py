from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.api.api import api_router
import logging

# Setup basic logging to see things in Render console
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered health and fitness platform API",
    version="1.0.0"
)

@app.on_event("startup")
async def on_startup():
    logger.info("StayFit Backend: Starting up...")
    try:
        from app.db.database import engine, Base
        import app.db.models
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("StayFit Backend: DB tables verified.")
    except Exception as e:
        logger.error(f"StayFit Backend STARTUP ERROR: {str(e)}")

# Standard FastAPI CORS - Very loose for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"status": "online", "message": "StayFit API is running"}

@app.get("/health")
async def health_check():
    try:
        from app.db.database import engine
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "error": str(e)}

app.include_router(api_router, prefix=settings.API_V1_STR)
