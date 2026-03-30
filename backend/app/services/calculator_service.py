"""
services/calculator_service.py — Core point value calculation logic
────────────────────────────────────────────────────────────────────
All transfer arithmetic delegates to utils/points.py.
Never perform point math directly in this file.
"""

from collections import defaultdict
from typing import Any

from app.database import supabase_admin
from app.utils.points import (
    calculate_transfer,
    effective_cpp_after_transfer,
    total_inr_value,
)


async def get_active_cards() -> list[dict]:
    """
    Return all active cards for the calculator dropdown.
    Cached by the router layer (TODO: add Upstash Redis TTL=24h).
    """
    resp = (
        supabase_admin
        .table("cards")
        .select("id, name, issuer, points_currency_name, base_earn_rate, cash_redemption_cpp")
        .eq("is_active", True)
        .order("name")
        .execute()
    )
    return resp.data


async def calculate_point_value(card_id: str, points_balance: int) -> dict[str, Any]:
    """
    Core calculator logic. Given a card and a point balance, returns the
    full value breakdown across every active transfer partner and their
    redemption categories.

    Steps:
      1. Fetch card details (includes cash_redemption_cpp for baseline)
      2. Fetch all active transfer_links for this card
      3. Fetch any live transfer_bonuses for those links
      4. Fetch redemption_benchmarks for the destination programs
      5. Compute values using utils/points.py functions
      6. Build and return the structured response dict
    """

    # ── 1. Card details ───────────────────────────────────────
    card_resp = (
        supabase_admin
        .table("cards")
        .select("*")
        .eq("id", card_id)
        .eq("is_active", True)
        .maybe_single()
        .execute()
    )
    card = card_resp.data
    if not card:
        raise ValueError(f"Card {card_id} not found or inactive.")

    # ── 2. Active transfer links for this card ────────────────
    links_resp = (
        supabase_admin
        .table("transfer_links")
        .select("*, loyalty_programs(*)")
        .eq("source_type", "card")
        .eq("source_id", card_id)
        .eq("is_active", True)
        .execute()
    )
    links = links_resp.data
    if not links:
        return _empty_response(card, points_balance)

    # ── 3. Live transfer bonuses for these links ──────────────
    link_ids = [lnk["id"] for lnk in links]
    bonuses_resp = (
        supabase_admin
        .table("transfer_bonuses")
        .select("*")
        .in_("transfer_link_id", link_ids)
        .eq("status", "live")
        .execute()
    )
    # Most recent bonus wins if somehow multiple are live for the same link.
    bonus_map: dict[str, dict] = {}
    for b in sorted(bonuses_resp.data, key=lambda x: x["created_at"]):
        bonus_map[b["transfer_link_id"]] = b

    # ── 4. Redemption benchmarks for destination programs ─────
    program_ids = list({lnk["dest_id"] for lnk in links})
    benchmarks_resp = (
        supabase_admin
        .table("redemption_benchmarks")
        .select("*")
        .in_("program_id", program_ids)
        .eq("is_active", True)
        .execute()
    )
    benchmark_map: dict[str, list] = defaultdict(list)
    for b in benchmarks_resp.data:
        benchmark_map[b["program_id"]].append(b)

    # ── 5. Compute values per link ────────────────────────────
    results = []
    for link in links:
        program = link["loyalty_programs"]
        bonus = bonus_map.get(link["id"])
        bonus_pct = bonus["bonus_pct"] if bonus else None

        program_points = calculate_transfer(
            points_in=points_balance,
            source_qty=link["source_qty"],
            dest_qty=link["dest_qty"],
            bonus_pct=bonus_pct,
        )

        categories = []
        for bm in benchmark_map.get(link["dest_id"], []):
            cat_value = total_inr_value(
                card_points=points_balance,
                source_qty=link["source_qty"],
                dest_qty=link["dest_qty"],
                dest_cpp_inr=float(bm["cpp_inr"]),
                bonus_pct=bonus_pct,
            )
            eff_cpp = effective_cpp_after_transfer(
                card_points=points_balance,
                source_qty=link["source_qty"],
                dest_qty=link["dest_qty"],
                dest_cpp_inr=float(bm["cpp_inr"]),
                bonus_pct=bonus_pct,
            )
            categories.append({
                "category": bm["category"],
                "cpp_inr": float(bm["cpp_inr"]),
                "total_value_inr": cat_value,
                "effective_cpp_inr": round(eff_cpp, 4),
            })

        if not categories:
            continue

        best = max(categories, key=lambda x: x["total_value_inr"])
        results.append({
            "program": program,
            "program_points": program_points,
            "has_active_bonus": bonus is not None,
            "bonus_pct": bonus_pct,
            "categories": sorted(categories, key=lambda x: x["total_value_inr"], reverse=True),
            "best_value_inr": best["total_value_inr"],
            "best_category": best["category"],
        })

    # Sort programs: best headline value first
    results.sort(key=lambda x: x["best_value_inr"], reverse=True)

    # ── 6. Baseline comparisons ───────────────────────────────
    cash_cpp = float(card.get("cash_redemption_cpp", 0.50))
    statement_credit_value = round(points_balance * cash_cpp, 2)

    baselines = [
        {
            "label": "Statement Credit",
            "total_value_inr": statement_credit_value,
            "cpp_inr": cash_cpp,
        },
        {
            "label": "Bank Rewards Portal",
            # Portal value is typically 20% worse than statement credit
            "total_value_inr": round(statement_credit_value * 0.80, 2),
            "cpp_inr": round(cash_cpp * 0.80, 4),
        },
    ]

    max_value = results[0]["best_value_inr"] if results else statement_credit_value
    vs_baseline = round(max_value / statement_credit_value, 2) if statement_credit_value > 0 else 1.0

    return {
        "card_id": card_id,
        "card_name": card["name"],
        "points_currency_name": card["points_currency_name"],
        "points_balance": points_balance,
        "results": results,
        "baseline_comparisons": baselines,
        "max_value_inr": max_value,
        "vs_baseline_multiplier": vs_baseline,
    }


def _empty_response(card: dict, points_balance: int) -> dict:
    """Fallback when no transfer links exist for a card yet."""
    cash_cpp = float(card.get("cash_redemption_cpp", 0.50))
    return {
        "card_id": card["id"],
        "card_name": card["name"],
        "points_currency_name": card["points_currency_name"],
        "points_balance": points_balance,
        "results": [],
        "baseline_comparisons": [
            {"label": "Statement Credit", "total_value_inr": round(points_balance * cash_cpp, 2), "cpp_inr": cash_cpp}
        ],
        "max_value_inr": round(points_balance * cash_cpp, 2),
        "vs_baseline_multiplier": 1.0,
    }
