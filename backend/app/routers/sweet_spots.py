"""
routers/sweet_spots.py
──────────────────────
GET  /api/v1/sweet-spots            → paginated catalogue of approved sweet spots
GET  /api/v1/sweet-spots/{id}       → single sweet spot detail

All public — no auth required.
Filtering: ?program_id=&category=&program_type=flight|hotel&limit=&offset=
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.models.sweet_spots import SweetSpotResponse
from app.services import sweet_spots_service

router = APIRouter()


@router.get("/", response_model=list[SweetSpotResponse])
async def list_sweet_spots(
    program_id: Optional[str] = Query(default=None, description="Filter by loyalty program UUID"),
    category: Optional[str]   = Query(default=None, description="economy | business | first | hotel_standard | hotel_suite"),
    program_type: Optional[str] = Query(default=None, description="flight | hotel"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """
    Public catalogue of manually curated, approved sweet spots.

    Returns deals sorted by estimated cash value (highest first).
    Only 'approved' rows are returned — pending_review and stale rows
    are held back until manually re-verified in the admin queue.

    No auth required.
    TODO: cache with Upstash Redis TTL=1h (sweet spots change at most daily).
    """
    spots = await sweet_spots_service.get_sweet_spots(
        program_id=program_id,
        category=category,
        program_type=program_type,
        limit=limit,
        offset=offset,
    )
    return spots


@router.get("/{spot_id}", response_model=SweetSpotResponse)
async def get_sweet_spot(spot_id: str):
    """
    Single sweet spot detail by UUID.
    Returns 404 if the spot doesn't exist or isn't approved yet.
    """
    spot = await sweet_spots_service.get_sweet_spot_by_id(spot_id)
    if not spot:
        raise HTTPException(status_code=404, detail=f"Sweet spot {spot_id} not found.")
    return spot
