from abc import ABC, abstractmethod
from typing import Dict, Optional
import aiohttp
import asyncio
from playwright.async_api import async_playwright
from app.core.config import settings
from datetime import datetime

class BaseScraper(ABC):
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.browser = None
        self.context = None
        self.page = None
        self.retry_attempts = settings.RETRY_ATTEMPTS
        self.timeout = settings.REQUEST_TIMEOUT

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
        if self.page:
            await self.page.close()
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()

    @abstractmethod
    async def get_price(self, pickup_location: str, dropoff_location: str, timestamp: Optional[datetime] = None) -> Dict:
        """
        Get price estimate for a ride.
        
        Args:
            pickup_location: Starting point of the ride
            dropoff_location: Destination of the ride
            timestamp: Optional time for the ride
            
        Returns:
            Dict containing price information:
            {
                "price": float,
                "currency": str,
                "surge_multiplier": float,
                "estimate_minutes": int
            }
        """
        pass

    async def setup_browser(self):
        """Set up Playwright browser with stealth mode"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        self.page = await self.context.new_page()
        
        # Add stealth mode scripts
        await self.page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)

    async def retry_with_backoff(self, func, *args, **kwargs):
        """Retry function with exponential backoff"""
        for attempt in range(self.retry_attempts):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                if attempt == self.retry_attempts - 1:
                    raise e
                wait_time = (2 ** attempt) * 1  # Exponential backoff
                await asyncio.sleep(wait_time)

    def format_location(self, location: str) -> str:
        """Format location string for API requests"""
        return location.replace(" ", "+").lower()

    async def solve_captcha(self, image_url: str) -> str:
        """Solve CAPTCHA using 2captcha service"""
        if not settings.CAPTCHA_API_KEY:
            raise ValueError("CAPTCHA API key not configured")
        
        # Implementation for 2captcha service would go here
        raise NotImplementedError("CAPTCHA solving not implemented") 