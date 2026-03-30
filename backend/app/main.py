"""
main.py — FastAPI application entry point for Project Maximize
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import calculator, routing, sweet_spots, users, admin
from app.scheduler.scheduler import start_scheduler

app = FastAPI(
    title="Project Maximize API",
    description="Credit card rewards optimisation engine — India's points advisor.",
    version="0.1.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url=None,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
PREFIX = f"/api/{settings.api_version}"

app.include_router(calculator.router,  prefix=f"{PREFIX}/calculator",   tags=["Calculator"])
app.include_router(routing.router,     prefix=f"{PREFIX}/routing",      tags=["Routing"])
app.include_router(sweet_spots.router, prefix=f"{PREFIX}/sweet-spots",  tags=["Sweet Spots"])
app.include_router(users.router,       prefix=f"{PREFIX}/users",        tags=["Users"])
app.include_router(admin.router,       prefix=f"{PREFIX}/admin",        tags=["Admin"])


# ── Lifecycle ─────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    start_scheduler()


# ── Health ────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "project-maximize-api",
        "environment": settings.environment,
    }
