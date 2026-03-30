"""
scraper/base.py — Base class for all scrapers
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseScraper(ABC):
    """All scrapers inherit from this. Enforces a consistent interface."""

    @abstractmethod
    async def scrape(self) -> List[Dict[str, Any]]:
        """
        Run the scraper and return a list of raw signal dicts.
        Each dict will be written to scraped_signals as an 'unreviewed' row.
        """
        raise NotImplementedError
