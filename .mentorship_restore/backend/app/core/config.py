from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "StayFit"
    API_V1_STR: str = "/api/v1"
    
    # JWT Settings
    SECRET_KEY: str = "SUPER_SECRET_KEY_CHANGE_ME_IN_PROD"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/healthifyai"
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        # Render provides postgres://, but asyncpg needs postgresql+asyncpg://
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    # CORS Settings
    CORS_ORIGINS: list[str] = ["*"]
    
    # Gemini API Settings
    GEMINI_API_KEY: str = ""
    
    # Groq API Settings (Alternative free provider)
    GROQ_API_KEY: str = ""
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
