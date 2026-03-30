"""
utils/points.py — Canonical point transfer math for Project Maximize
=====================================================================
ALL point calculations across the entire codebase must use these functions.
Never re-implement transfer math anywhere else.

Transfer formula (integer ratio, no floats):
    points_out = floor((points_in / source_qty) * dest_qty)

With active bonus:
    points_out = floor((points_in / source_qty) * dest_qty * (1 + bonus_pct / 100))

Rule: Always floor(), never round().
Users never receive fractional points or miles.
"""

from math import floor
from typing import Optional


def calculate_transfer(
    points_in: int,
    source_qty: int,
    dest_qty: int,
    bonus_pct: Optional[int] = None,
) -> int:
    """
    Calculate points/miles received after a single transfer hop.

    Args:
        points_in:   Native card points (or program points) being transferred.
        source_qty:  Left side of the transfer ratio (e.g. 2 in a 2:1 ratio).
        dest_qty:    Right side of the transfer ratio (e.g. 1 in a 2:1 ratio).
        bonus_pct:   Optional active transfer bonus as a positive integer
                     (e.g. 25 means 25% more miles). None = no bonus.

    Returns:
        Integer points/miles credited at the destination program.

    Raises:
        ValueError: On invalid inputs.

    Examples:
        # HDFC Infinia → KrisFlyer at 2:1, no bonus
        >>> calculate_transfer(10_000, source_qty=2, dest_qty=1)
        5000

        # Same transfer with a 25% bonus
        >>> calculate_transfer(10_000, source_qty=2, dest_qty=1, bonus_pct=25)
        6250

        # 1:1 transfer with a 20% bonus
        >>> calculate_transfer(10_000, source_qty=1, dest_qty=1, bonus_pct=20)
        12000
    """
    if points_in <= 0:
        raise ValueError(f"points_in must be positive, got {points_in}")
    if source_qty <= 0:
        raise ValueError(f"source_qty must be positive, got {source_qty}")
    if dest_qty <= 0:
        raise ValueError(f"dest_qty must be positive, got {dest_qty}")
    if bonus_pct is not None and bonus_pct <= 0:
        raise ValueError(f"bonus_pct must be positive when provided, got {bonus_pct}")

    base = (points_in / source_qty) * dest_qty

    if bonus_pct is not None:
        base = base * (1 + bonus_pct / 100)

    return floor(base)


def calculate_cpp_inr(
    points_required: int,
    est_cash_value_inr: float,
) -> float:
    """
    Calculate Cost Per Point in INR for a specific redemption.

    Args:
        points_required:    Points/miles needed for this redemption.
        est_cash_value_inr: Estimated cash equivalent of the redemption in ₹.

    Returns:
        CPP as a float — ₹ value per point. Higher is better.

    Example:
        # 50,000 KrisFlyer miles redeemable for a flight worth ₹35,000
        >>> calculate_cpp_inr(50_000, 35_000)
        0.7
    """
    if points_required <= 0:
        raise ValueError(f"points_required must be positive, got {points_required}")
    if est_cash_value_inr <= 0:
        raise ValueError(f"est_cash_value_inr must be positive, got {est_cash_value_inr}")

    return round(est_cash_value_inr / points_required, 6)


def effective_cpp_after_transfer(
    card_points: int,
    source_qty: int,
    dest_qty: int,
    dest_cpp_inr: float,
    bonus_pct: Optional[int] = None,
) -> float:
    """
    Calculate the effective ₹ value per native card point after transferring
    to a loyalty program. This is the core number shown in the calculator.

    Args:
        card_points:   User's native card reward points.
        source_qty:    Transfer ratio — card side (e.g. 2 in 2:1).
        dest_qty:      Transfer ratio — program side (e.g. 1 in 2:1).
        dest_cpp_inr:  Program's CPP benchmark in ₹ (from redemption_benchmarks).
        bonus_pct:     Optional active transfer bonus percentage.

    Returns:
        Effective ₹ value per native card point. Higher = better deal.

    Examples:
        # HDFC Infinia → KrisFlyer at 2:1, Business Class CPP = ₹2.8, no bonus
        # effective_cpp = (1/2) * 2.8 = ₹1.40 per Reward Point
        >>> effective_cpp_after_transfer(50_000, 2, 1, 2.8)
        1.4

        # Same but with 25% transfer bonus
        # effective_cpp = (1/2) * 1.25 * 2.8 = ₹1.75 per Reward Point
        >>> effective_cpp_after_transfer(50_000, 2, 1, 2.8, bonus_pct=25)
        1.75
    """
    if card_points <= 0:
        raise ValueError(f"card_points must be positive, got {card_points}")

    program_points = calculate_transfer(card_points, source_qty, dest_qty, bonus_pct)
    total_inr_value = program_points * dest_cpp_inr
    return round(total_inr_value / card_points, 6)


def total_inr_value(
    card_points: int,
    source_qty: int,
    dest_qty: int,
    dest_cpp_inr: float,
    bonus_pct: Optional[int] = None,
) -> float:
    """
    Calculate the total ₹ value of a user's entire point balance
    if transferred to a specific loyalty program and redeemed in
    a specific category.

    This is the headline number in the calculator output —
    e.g. "Your 80,000 Reward Points = ₹56,000 in KrisFlyer Business Class."

    Args:
        card_points:   User's total native card points.
        source_qty:    Transfer ratio — card side.
        dest_qty:      Transfer ratio — program side.
        dest_cpp_inr:  Program CPP benchmark in ₹.
        bonus_pct:     Optional active transfer bonus.

    Returns:
        Total ₹ value as a float, rounded to 2 decimal places.

    Example:
        >>> total_inr_value(80_000, 2, 1, 2.8)
        112000.0

        >>> total_inr_value(80_000, 2, 1, 2.8, bonus_pct=25)
        140000.0
    """
    program_points = calculate_transfer(card_points, source_qty, dest_qty, bonus_pct)
    return round(program_points * dest_cpp_inr, 2)
