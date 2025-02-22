import asyncio
from typing import List, Optional
import httpx
from app.models.location import Location
from app.models.ride import RideResponse
from datetime import datetime

class RapidoScraper:
    BASE_URL = "https://app.rapido.bike/api/v1"  # Example URL
    
    def __init__(self):
        self.session = None

    async def get_prices(self, pickup: Location, drop: Location) -> List[RideResponse]:
        """Get Rapido price estimates"""
        try:
            response = await self._make_request(
                "/price-estimate",
                method="POST",
                json={
                    "pickup": {
                        "latitude": pickup.latitude,
                        "longitude": pickup.longitude
                    },
                    "drop": {
                        "latitude": drop.latitude,
                        "longitude": drop.longitude
                    }
                }
            )
            
            rides = []
            for estimate in response.get("estimates", []):
                rides.append(
                    RideResponse(
                        provider="Rapido",
                        vehicle_type=estimate.get("vehicle_type", "Bike"),
                        price=float(estimate.get("price", 0)),
                        surge_multiplier=float(estimate.get("surge_multiplier", 1.0)),
                        estimate_minutes=int(estimate.get("eta", 0)),
                        distance=float(estimate.get("distance", 0))
                    )
                )
            return rides
        except Exception as e:
            print(f"Error getting Rapido prices: {str(e)}")
            return []

    async def get_tracking_url(self, booking_id: str) -> Optional[str]:
        """Get tracking URL for a specific ride"""
        try:
            response = await self._make_request(f"/bookings/{booking_id}/track")
            return response.get("tracking_url")
        except Exception as e:
            print(f"Error getting tracking URL: {str(e)}")
            return None

    async def _make_request(self, endpoint: str, method: str = "GET", **kwargs) -> dict:
        """Make authenticated request to Rapido API"""
        async with httpx.AsyncClient() as client:
            headers = {
                "User-Agent": "Rapido/1.0",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            response = await client.request(
                method,
                f"{self.BASE_URL}{endpoint}",
                headers=headers,
                timeout=30.0,
                **kwargs
            )
            
            response.raise_for_status()
            return response.json() 