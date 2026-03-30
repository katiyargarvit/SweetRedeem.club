"""
routers/routing.py
───────────────────
POST /api/v1/routing/recommend   → top-3 transfer recommendations
                                   ranked by total INR value

Phase 1: Single-hop only (card → program).
Phase 2: Multi-hop chain engine added as a new service layer
         — this router requires no changes.
"""

from typing import Optional

from fastapi import APIRouter, Cookie, HTTPException

from app.models.routing import RecommendRequest, RecommendResponse
from app.services import routing_service

router = APIRouter()


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(
    request: RecommendRequest,
    pm_session_id: Optional[str] = Cookie(default=None),
):
    """
    Returns the top-3 curated transfer recommendations for a card + balance.

    Optionally filter by category:
      - "flight"  → only flight loyalty programs
      - "hotel"   → only hotel loyalty programs
      - omit      → all programs

    Results are ranked by total INR value descending and include:
      - Program + category
      - Points received after transfer (with any active bonus)
      - Total ₹ value
      - vs_statement_credit multiplier (e.g. 2.8× better)
      - action_text (human-readable instruction)
      - destination_url (direct link in Phase 1, affiliate in Phase 2)
    """
    try:
        result = await routing_service.get_recommendations(
            card_id=str(request.card_id),
            points_balance=request.points_balance,
            category_filter=request.category_filter,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return result
