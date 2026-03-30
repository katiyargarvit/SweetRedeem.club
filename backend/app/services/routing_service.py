"""
services/routing_service.py — Recommendation ranking logic
───────────────────────────────────────────────────────────
Builds on calculator_service to produce the top-3 curated recommendations
shown in the "Optimal Routing Engine" section of the UI.

Phase 1: Single-hop only (card → program direct transfer).
Phase 2: This service will be extended with multi-hop graph traversal.
"""

from app.services.calculator_service import calculate_point_value
from app.database import supabase_admin


CATEGORY_LABELS: dict[str, str] = {
    "economy":       "Economy Class",
    "business":      "Business Class",
    "first":         "First Class",
    "hotel_standard":"Hotel — Standard Room",
    "hotel_suite":   "Hotel — Suite",
}

PROGRAM_TYPE_FILTER: dict[str, list[str]] = {
    "flight": ["flight"],
    "hotel":  ["hotel"],
    "all":    ["flight", "hotel", "hybrid"],
}


async def get_recommendations(
    card_id: str,
    points_balance: int,
    category_filter: str | None = None,
) -> dict:
    """
    Returns the top-3 transfer recommendations for a card + balance,
    ranked by total INR value descending.

    Args:
        card_id:         Card UUID string.
        points_balance:  User's current points.
        category_filter: "flight" | "hotel" | None (all programs).

    Returns:
        Dict matching RecommendResponse schema.
    """

    # Reuse the full calculator output — no duplicate DB calls
    calc = await calculate_point_value(card_id, points_balance)

    # Determine which program types to include
    allowed_types = PROGRAM_TYPE_FILTER.get(category_filter or "all", ["flight", "hotel", "hybrid"])

    # Fetch destination_urls for sweet_spot lookups (best effort)
    dest_url_map = await _fetch_destination_urls()

    # Flatten: one entry per (program × best_category) pair, filtered by type
    candidates = []
    for result in calc["results"]:
        prog = result["program"]
        if prog["type"] not in allowed_types:
            continue

        # Use the best category for this program as the recommendation
        best_cat = result["categories"][0]  # already sorted best→worst

        action_text = _build_action_text(
            program_name=prog["name"],
            category=best_cat["category"],
            has_bonus=result["has_active_bonus"],
            bonus_pct=result["bonus_pct"],
        )

        statement_credit_value = calc["baseline_comparisons"][0]["total_value_inr"]
        vs_sc = (
            round(best_cat["total_value_inr"] / statement_credit_value, 2)
            if statement_credit_value > 0 else 1.0
        )

        candidates.append({
            "program": prog,
            "category": best_cat["category"],
            "program_points": result["program_points"],
            "total_value_inr": best_cat["total_value_inr"],
            "effective_cpp_inr": best_cat["effective_cpp_inr"],
            "has_active_bonus": result["has_active_bonus"],
            "bonus_pct": result["bonus_pct"],
            "vs_statement_credit": vs_sc,
            "action_text": action_text,
            "destination_url": dest_url_map.get(prog["id"]),
        })

    # Sort by total value descending, take top 3
    candidates.sort(key=lambda x: x["total_value_inr"], reverse=True)
    top_3 = candidates[:3]

    # Attach rank
    recommendations = [{"rank": i + 1, **c} for i, c in enumerate(top_3)]

    return {
        "card_name": calc["card_name"],
        "points_balance": points_balance,
        "recommendations": recommendations,
        "statement_credit_value": calc["baseline_comparisons"][0]["total_value_inr"],
    }


def _build_action_text(
    program_name: str,
    category: str,
    has_bonus: bool,
    bonus_pct: int | None,
) -> str:
    """
    Human-readable action string shown on the recommendation card.
    e.g. "Transfer to KrisFlyer — Business Class (25% bonus active)"
    """
    label = CATEGORY_LABELS.get(category, category.replace("_", " ").title())
    text = f"Transfer to {program_name} — {label}"
    if has_bonus and bonus_pct:
        text += f" ({bonus_pct}% transfer bonus active)"
    return text


async def _fetch_destination_urls() -> dict[str, str | None]:
    """
    Returns a map of program_id → destination_url from sweet_spots.
    Used to attach a direct link to each recommendation.
    Best-effort: missing entries return None (no link shown).
    """
    try:
        resp = (
            supabase_admin
            .table("sweet_spots")
            .select("program_id, destination_url")
            .eq("status", "live")
            .eq("is_active", True)
            .not_.is_("destination_url", "null")
            .execute()
        )
        # One URL per program — take the first live entry found
        url_map: dict[str, str] = {}
        for row in resp.data:
            pid = row["program_id"]
            if pid not in url_map and row["destination_url"]:
                url_map[pid] = row["destination_url"]
        return url_map
    except Exception:
        return {}
