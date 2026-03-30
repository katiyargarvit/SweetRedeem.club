"""
models/sweet_spots.py — Pydantic schemas for the sweet spots endpoints
"""

from pydantic import BaseModel, Field, computed_field
from uuid import UUID
from typing import Optional
from datetime import datetime


class SweetSpotResponse(BaseModel):
    id: str
    program_id: str
    program_name: str
    program_type: str               # "flight" | "hotel"
    title: str
    route_or_property: str
    points_required: int
    est_cash_value_inr: float
    cpp: float                      # computed: est_cash_value_inr / points_required
    category: str                   # "economy" | "business" | "first" | "hotel_standard" | "hotel_suite"
    destination_url: Optional[str]
    status: str
    last_verified_at: datetime
    needs_review: bool


class TrackClickRequest(BaseModel):
    sweet_spot_id: str
    destination_url: str
    destination_partner: Optional[str] = None   # derived from program name if not provided


class SweetSpotsListResponse(BaseModel):
    items: list[SweetSpotResponse]
    total: int
