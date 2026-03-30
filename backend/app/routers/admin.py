"""
routers/admin.py
────────────────
GET  /api/v1/admin/review-queue          → list pending scraped_signals + stale sweet spots
POST /api/v1/admin/bonuses/{id}/approve  → approve a transfer bonus → status=live
POST /api/v1/admin/bonuses/{id}/dismiss  → dismiss a scraped signal
POST /api/v1/admin/sweet-spots/{id}/approve
POST /api/v1/admin/sweet-spots/{id}/dismiss
"""

from fastapi import APIRouter

router = APIRouter()

# TODO: implement endpoints
