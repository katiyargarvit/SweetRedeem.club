"""
config.py — Application settings loaded from environment variables.
All secrets are read from .env (development) or Railway environment (production).
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── Supabase ───────────────────────────────────────────────
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str   # server-side only, never exposed to frontend

    # ── Upstash Redis ──────────────────────────────────────────
    upstash_redis_url: str
    upstash_redis_token: str

    # ── Reddit API (PRAW) ──────────────────────────────────────
    reddit_client_id: str
    reddit_client_secret: str
    reddit_user_agent: str = "project-maximize-scraper/0.1"

    # ── CORS ───────────────────────────────────────────────────
    # Comma-separated in .env: "http://localhost:3000,https://yourapp.vercel.app"
    allowed_origins: List[str] = ["http://localhost:3000"]

    # ── App ────────────────────────────────────────────────────
    environment: str = "development"
    api_version: str = "v1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
