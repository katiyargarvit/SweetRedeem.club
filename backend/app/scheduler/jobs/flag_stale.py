"""
jobs/flag_stale.py
──────────────────
Flags sweet_spots and redemption_benchmarks where
last_verified_at < NOW() - 30 days as needs_review = TRUE.
These surface in the admin review queue.
"""


async def flag_stale_data() -> None:
    # TODO: implement Supabase UPDATE query
    pass
