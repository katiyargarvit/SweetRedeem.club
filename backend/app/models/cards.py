"""
models/cards.py — Pydantic schemas for cards and loyalty programs
"""

from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class CardResponse(BaseModel):
    id: UUID
    name: str                       # e.g. "HDFC Infinia"
    issuer: str                     # e.g. "HDFC Bank"
    points_currency_name: str       # e.g. "Reward Points"
    base_earn_rate: Optional[float] # points per ₹100 spent
    cash_redemption_cpp: float      # baseline CPP for statement credit comparison


class ProgramResponse(BaseModel):
    id: UUID
    name: str                       # e.g. "KrisFlyer"
    full_name: Optional[str]        # e.g. "Singapore Airlines KrisFlyer"
    type: str                       # "flight" | "hotel" | "hybrid"
    currency_name: str              # e.g. "Miles"
    website_url: Optional[str]
