"""
jobs/expire_bonuses.py
──────────────────────
Sets transfer_bonuses.status = 'expired'
where valid_to < NOW() AND status = 'live'.
"""


async def expire_old_bonuses() -> None:
    # TODO: implement Supabase UPDATE query
    pass
