"""
scheduler/scheduler.py
──────────────────────
APScheduler configuration. Starts on FastAPI startup.

Jobs registered here:
  - scrape_partner_sites   (daily 02:00 IST)
  - scrape_reddit          (every 6 hours)
  - flag_stale_data        (daily 03:00 IST) — benchmarks + sweet spots
  - expire_old_bonuses     (daily 04:00 IST) — transfer_bonuses → 'expired'
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.scheduler.jobs.scrape_bonuses import scrape_partner_sites, scrape_reddit
from app.scheduler.jobs.flag_stale import flag_stale_data
from app.scheduler.jobs.expire_bonuses import expire_old_bonuses

scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")


def start_scheduler() -> None:
    scheduler.add_job(scrape_partner_sites, CronTrigger(hour=2,  minute=0))
    scheduler.add_job(scrape_reddit,        CronTrigger(hour="0,6,12,18", minute=0))
    scheduler.add_job(flag_stale_data,      CronTrigger(hour=3,  minute=0))
    scheduler.add_job(expire_old_bonuses,   CronTrigger(hour=4,  minute=0))
    scheduler.start()
