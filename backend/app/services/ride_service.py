import asyncio
from typing import List, Optional
from app.models.location import Location
from app.models.ride import Ride, RideResponse
from app.services.scrapers.ola_scraper import OlaScraper
from app.services.scrapers.uber_scraper import UberScraper
from app.services.scrapers.rapido_scraper import RapidoScraper

class RideService:
    def __init__(self):
        self.ola_scraper = OlaScraper()
        self.uber_scraper = UberScraper()
        self.rapido_scraper = RapidoScraper()

    async def compare_rides(self, pickup: Location, drop: Location) -> List[RideResponse]:
        """
        Compare ride prices across different providers
        """
        tasks = [
            self.ola_scraper.get_prices(pickup, drop),
            self.uber_scraper.get_prices(pickup, drop),
            self.rapido_scraper.get_prices(pickup, drop)
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)
        rides = []

        for result in results:
            if isinstance(result, list) and result:
                rides.extend(result)

        return sorted(rides, key=lambda x: x.price)

    async def get_tracking_url(self, provider: str, booking_id: str) -> Optional[str]:
        """
        Get tracking URL for a specific ride
        """
        scraper = self._get_scraper(provider)
        if not scraper:
            return None
        
        return await scraper.get_tracking_url(booking_id)

    def _get_scraper(self, provider: str):
        scrapers = {
            'ola': self.ola_scraper,
            'uber': self.uber_scraper,
            'rapido': self.rapido_scraper
        }
        return scrapers.get(provider.lower()) 