"""
scraper/sources/reddit.py
─────────────────────────
Scrapes r/CreditCardsIndia and r/IndiaInvestments via PRAW (official Reddit API).
Targets posts mentioning transfer bonuses, devaluations, and sweet spot deals.
"""

from scraper.base import BaseScraper


class RedditScraper(BaseScraper):
    SUBREDDITS = ["CreditCardsIndia", "IndiaInvestments"]
    KEYWORDS   = ["transfer bonus", "miles", "points", "devaluation", "sweet spot", "krisflyer", "avios", "marriott", "infinia", "atlas", "aurum"]

    async def scrape(self):
        # TODO: implement PRAW client + keyword filter
        pass
