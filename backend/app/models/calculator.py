"""
models/calculator.py — Pydantic schemas for the calculator endpoints
"""

from pydantic import BaseModel, Field
from uuid import UUID
from typing import List, Optional
from app.models.cards import ProgramResponse


class CalculateRequest(BaseModel):
    card_id: UUID
    points_balance: int = Field(gt=0, description="User's current point balance")


class CategoryValue(BaseModel):
    """Value of the user's points in one redemption category (e.g. Business Class)."""
    category: str               # "economy" | "business" | "first" | "hotel_standard" | "hotel_suite"
    cpp_inr: float              # program's benchmark CPP in ₹
    total_value_inr: float      # total ₹ value of the user's full balance in this category
    effective_cpp_inr: float    # ₹ value per native card point (accounts for transfer ratio)


class ProgramResult(BaseModel):
    """All redemption values for one transfer partner."""
    program: ProgramResponse
    program_points: int         # miles/points received after transfer
    has_active_bonus: bool
    bonus_pct: Optional[int]    # e.g. 25 for a 25% transfer bonus
    categories: List[CategoryValue]
    best_value_inr: float       # highest total_value_inr across all categories
    best_category: str          # category name that gives best_value_inr


class BaselineComparison(BaseModel):
    """Worst-case redemption value — used to show how much better transfer is."""
    label: str                  # e.g. "Statement Credit", "Bank Portal"
    total_value_inr: float
    cpp_inr: float


class CalculateResponse(BaseModel):
    card_id: str
    card_name: str
    points_currency_name: str
    points_balance: int
    results: List[ProgramResult]            # sorted best→worst by best_value_inr
    baseline_comparisons: List[BaselineComparison]
    max_value_inr: float                    # headline number: best achievable value
    vs_baseline_multiplier: float           # e.g. 2.8x better than statement credit
