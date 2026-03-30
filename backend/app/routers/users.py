"""
routers/users.py
────────────────
POST /api/v1/users/cards            → save card + balance for authenticated user
POST /api/v1/users/transactions     → append point transaction to ledger
POST /api/v1/users/parse-statement  → in-memory PDF parsing (never touches disk)
"""

from fastapi import APIRouter

router = APIRouter()

# TODO: implement endpoints
