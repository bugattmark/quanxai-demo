"""Application configuration."""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "QuanXAI"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./quanxai.db"

    # LLM Provider Keys (optional - for actual API calls)
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
