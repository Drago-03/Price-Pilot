from typing import Dict, Optional
from datetime import datetime
import json
import re
from .base import BaseScraper
from app.core.config import settings

class UberScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = settings.UBER_BASE_URL

    async def get_price(self, pickup_location: str, dropoff_location: str, timestamp: Optional[datetime] = None) -> Dict:
        """Get Uber price estimate"""
        await self.setup_browser()
        
        try:
            # Navigate to Uber's mobile site
            await self.page.goto(f"{self.base_url}/", timeout=self.timeout * 1000)
            
            # Wait for the page to load and enter pickup location
            pickup_input = await self.page.wait_for_selector('input[placeholder*="pickup"]', timeout=self.timeout * 1000)
            await pickup_input.fill(pickup_location)
            await self.page.wait_for_timeout(1000)  # Wait for suggestions
            await self.page.keyboard.press('Enter')
            
            # Enter dropoff location
            dropoff_input = await self.page.wait_for_selector('input[placeholder*="destination"]', timeout=self.timeout * 1000)
            await dropoff_input.fill(dropoff_location)
            await self.page.wait_for_timeout(1000)  # Wait for suggestions
            await self.page.keyboard.press('Enter')
            
            # Wait for price to load
            price_element = await self.page.wait_for_selector('[data-test="fare-estimate"]', timeout=self.timeout * 1000)
            price_text = await price_element.text_content()
            
            # Extract price using regex
            price_match = re.search(r'₹\s*(\d+(?:\.\d{2})?)', price_text)
            if not price_match:
                raise ValueError("Could not extract price from Uber page")
            
            price = float(price_match.group(1))
            
            # Get surge multiplier if available
            surge_multiplier = 1.0
            surge_element = await self.page.query_selector('[data-test="surge-multiplier"]')
            if surge_element:
                surge_text = await surge_element.text_content()
                surge_match = re.search(r'(\d+(?:\.\d+)?)x', surge_text)
                if surge_match:
                    surge_multiplier = float(surge_match.group(1))
            
            # Get estimated time
            time_element = await self.page.wait_for_selector('[data-test="arrival-estimate"]')
            time_text = await time_element.text_content()
            minutes_match = re.search(r'(\d+)\s*min', time_text)
            estimate_minutes = int(minutes_match.group(1)) if minutes_match else 0
            
            return {
                "price": price,
                "currency": "INR",
                "surge_multiplier": surge_multiplier,
                "estimate_minutes": estimate_minutes
            }
            
        except Exception as e:
            raise Exception(f"Failed to get Uber price: {str(e)}")
        
        finally:
            await self.page.close()
            await self.context.close()
            await self.browser.close()

    async def _handle_captcha(self):
        """Handle CAPTCHA if encountered"""
        captcha_selector = '[data-test="captcha-container"]'
        try:
            captcha_element = await self.page.wait_for_selector(captcha_selector, timeout=5000)
            if captcha_element:
                # Get CAPTCHA image
                captcha_img = await self.page.query_selector('img[alt*="captcha"]')
                if captcha_img:
                    img_src = await captcha_img.get_attribute('src')
                    # Solve CAPTCHA
                    solution = await self.solve_captcha(img_src)
                    # Enter solution
                    input_field = await self.page.query_selector('input[name="captcha"]')
                    await input_field.fill(solution)
                    await self.page.click('button[type="submit"]')
        except:
            # No CAPTCHA found or timeout
            pass 