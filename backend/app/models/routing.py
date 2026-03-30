"""
models/routing.py — Pydantic schemas for the routing/recommendation endpoints
"""

from pydantic import BaseModel, Field
from uuid import UUID
from typing import List, Optional
from app.models.cards import ProgramResponse


class RecommendRequest(BaseModel):
    card_id: UUID
    points_balance: int = Field(gt=0)
    category_filter: Optional[str] = Field(
        default=None,
        description="Filter by type: 'flight' | 'hotel' | None for all"
    )


class Recommendation(BaseModel):
    """One ranked redemption recommendation."""
    rank: int
    program: ProgramResponse
    category: str               # best category for this program
    program_points: int         # miles/points after transfer
    total_value_inr: float      # headline INR value
    effective_cpp_inr: float    # ₹ per native card point
    has_active_bonus: bool
    bonus_pct: Optional[int]
    vs_statement_credit: float  # e.g. 2.8 means "2.8× better than statement credit"
    action_text: str            # e.g. "Transfer to KrisFlyer — Business Class"
    destination_url: Optional[str]  # direct URL (Phase 1) → affiliate URL (Phase 2)


class RecommendResponse(BaseModel):
    card_name: str
    points_balance: int
    recommendations: List[Recommendation]  # top 3, sorted by total_value_inr desc
    statement_credit_value: float           # baseline shown in the UI for contrast
