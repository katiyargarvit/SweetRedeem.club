"""
services/sweet_spots_service.py — Sweet Spot Catalogue queries
──────────────────────────────────────────────────────────────
Reads from the sweet_spots table, joined with loyalty_programs.
Only returns rows with status = 'approved' to the public.
Admin routes use a separate query that returns all statuses.
"""

from typing import Any, Optional

from app.database import supabase_admin


async def get_sweet_spots(
    program_id: Optional[str] = None,
    category: Optional[str] = None,
    program_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """
    Returns approved sweet spots for the public catalogue.
    Joins loyalty_programs so the frontend gets program_name and program_type
    without a second query.
    """
    query = (
        supabase_admin
        .table("sweet_spots")
        .select(
            "id, program_id, title, route_or_property, "
            "points_required, est_cash_value_inr, "
            "category, destination_url, status, "
            "last_verified_at, needs_review, "
            "loyalty_programs(name, type)"
        )
        .eq("status", "approved")
        .order("est_cash_value_inr", desc=True)
        .range(offset, offset + limit - 1)
    )

    if program_id:
        query = query.eq("program_id", program_id)
    if category:
        query = query.eq("category", category)

    resp = query.execute()
    rows = resp.data or []

    # Flatten the join and compute cpp
    result = []
    for row in rows:
        program = row.pop("loyalty_programs", {}) or {}
        pts = row.get("points_required", 0)
        cash = float(row.get("est_cash_value_inr", 0))
        cpp = round(cash / pts, 4) if pts > 0 else 0.0

        flat = {
            **row,
            "program_name": program.get("name", "Unknown"),
            "program_type": program.get("type", "flight"),
            "cpp": cpp,
        }

        # Optional type filter after join (Supabase can't filter on joined columns easily)
        if program_type and flat["program_type"] != program_type:
            continue

        result.append(flat)

    return result


async def get_sweet_spot_by_id(spot_id: str) -> Optional[dict[str, Any]]:
    """
    Returns a single sweet spot by ID (approved only).
    Returns None if not found or not approved.
    """
    resp = (
        supabase_admin
        .table("sweet_spots")
        .select(
            "id, program_id, title, route_or_property, "
            "points_required, est_cash_value_inr, "
            "category, destination_url, status, "
            "last_verified_at, needs_review, "
            "loyalty_programs(name, type)"
        )
        .eq("id", spot_id)
        .eq("status", "approved")
        .maybe_single()
        .execute()
    )

    row = resp.data
    if not row:
        return None

    program = row.pop("loyalty_programs", {}) or {}
    pts = row.get("points_required", 0)
    cash = float(row.get("est_cash_value_inr", 0))

    return {
        **row,
        "program_name": program.get("name", "Unknown"),
        "program_type": program.get("type", "flight"),
        "cpp": round(cash / pts, 4) if pts > 0 else 0.0,
    }


async def get_all_for_admin(
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """
    Admin-only: returns sweet spots of any status for review queue.
    Called from the admin router, not exposed publicly.
    """
    query = (
        supabase_admin
        .table("sweet_spots")
        .select("*, loyalty_programs(name, type)")
        .order("needs_review", desc=True)   # stale items first
        .order("last_verified_at", desc=False)
        .range(offset, offset + limit - 1)
    )

    if status:
        query = query.eq("status", status)

    resp = query.execute()
    rows = resp.data or []

    result = []
    for row in rows:
        program = row.pop("loyalty_programs", {}) or {}
        pts = row.get("points_required", 0)
        cash = float(row.get("est_cash_value_inr", 0))
        result.append({
            **row,
            "program_name": program.get("name", "Unknown"),
            "program_type": program.get("type", "flight"),
            "cpp": round(cash / pts, 4) if pts > 0 else 0.0,
        })

    return result
