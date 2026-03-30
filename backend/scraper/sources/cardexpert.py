"""
scraper/sources/cardexpert.py
──────────────────────────────
Scrapes CardExpert and CardInsider blogs for bonus announcements.
Static HTML — uses requests + BeautifulSoup.
"""

from scraper.base import BaseScraper


class CardExpertScraper(BaseScraper):
    SOURCES = [
        "https://cardexpert.in",
        "https://cardinsider.com",
    ]

    async def scrape(self):
        # TODO: implement
        pass
