"""
routers/calculator.py
──────────────────────
GET  /api/v1/calculator/cards          → dropdown: all active cards
POST /api/v1/calculator/calculate      → core value calculation
POST /api/v1/calculator/track-click    → outbound click telemetry

Session tracking:
  - A session_id (UUID) is generated on first request and stored in an
    HTTP-only, SameSite=Strict cookie. Every calculate call logs a
    search_event tied to this session_id. This seeds affiliate conversion
    attribution for Phase 2 at zero extra cost.
"""

from uuid import uuid4
from typing import Optional

from fastapi import APIRouter, Cookie, Response, HTTPException

from app.models.calculator import CalculateRequest, CalculateResponse
from app.models.cards import CardResponse
from app.models.sweet_spots import TrackClickRequest
from app.services import calculator_service
from app.database import supabase_admin

router = APIRouter()

SESSION_COOKIE = "pm_session_id"
SESSION_MAX_AGE = 60 * 60 * 24 * 365  # 1 year


# ── GET /cards ────────────────────────────────────────────────

@router.get("/cards", response_model=list[CardResponse])
async def list_cards():
    """
    Returns all active cards for the calculator dropdown.
    No auth required — public endpoint.

    TODO: cache with Upstash Redis, TTL=24h.
    """
    cards = await calculator_service.get_active_cards()
    return cards


# ── POST /calculate ───────────────────────────────────────────

@router.post("/calculate", response_model=CalculateResponse)
async def calculate(
    request: CalculateRequest,
    response: Response,
    pm_session_id: Optional[str] = Cookie(default=None),
):
    """
    Core calculator endpoint.

    1. Ensures a session_id cookie exists (creates one if not).
    2. Logs a search_event for telemetry.
    3. Computes the full point value breakdown via calculator_service.
    4. Returns results sorted best → worst by INR value.

    No auth required — the calculator works for anonymous visitors.
    """

    # ── Session management ────────────────────────────────────
    session_id = pm_session_id
    if not session_id:
        session_id = str(uuid4())
        response.set_cookie(
            key=SESSION_COOKIE,
            value=session_id,
            httponly=True,
            samesite="strict",
            max_age=SESSION_MAX_AGE,
            secure=True,     # HTTPS only in production
        )

    # ── Telemetry: log search event (fire-and-forget) ─────────
    try:
        supabase_admin.table("search_events").insert({
            "session_id": session_id,
            "card_id": str(request.card_id),
            "points_balance_queried": request.points_balance,
        }).execute()
    except Exception:
        pass  # Never let telemetry failure break the user's request

    # ── Calculate ─────────────────────────────────────────────
    try:
        result = await calculator_service.calculate_point_value(
            card_id=str(request.card_id),
            points_balance=request.points_balance,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return result


# ── POST /track-click ─────────────────────────────────────────

@router.post("/track-click", status_code=204)
async def track_outbound_click(
    request: TrackClickRequest,
    pm_session_id: Optional[str] = Cookie(default=None),
):
    """
    Logs an outbound click before the user is redirected to an external partner.
    Accepts a JSON body: { sweet_spot_id, destination_url, destination_partner? }

    Fire-and-forget from the frontend — never blocks UI.
    In Phase 2, destination_url becomes an affiliate URL — this click log
    is the conversion attribution seed.
    """
    if not pm_session_id:
        return  # Anonymous with no session — nothing to track

    try:
        supabase_admin.table("outbound_clicks").insert({
            "session_id": pm_session_id,
            "destination_partner": request.destination_partner or "unknown",
            "destination_url": request.destination_url,
            "sweet_spot_id": request.sweet_spot_id,
        }).execute()
    except Exception:
        pass
