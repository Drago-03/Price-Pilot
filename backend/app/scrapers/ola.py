from typing import Dict, Optional
from datetime import datetime
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
from .base import BaseScraper
from app.core.config import settings

class OlaScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = settings.OLA_BASE_URL
        self.driver = None

    async def get_price(self, pickup_location: str, dropoff_location: str, timestamp: Optional[datetime] = None) -> Dict:
        """Get Ola price estimate"""
        try:
            # Set up Selenium WebDriver
            options = webdriver.ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
            
            self.driver = webdriver.Chrome(options=options)
            wait = WebDriverWait(self.driver, self.timeout)
            
            # Navigate to Ola's booking page
            self.driver.get(f"{self.base_url}/")
            
            # Handle location permission popup if it appears
            try:
                allow_location = wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Allow')]")))
                allow_location.click()
            except TimeoutException:
                pass
            
            # Enter pickup location
            pickup_input = wait.until(EC.presence_of_element_located((By.ID, "pickup-location")))
            pickup_input.clear()
            pickup_input.send_keys(pickup_location)
            pickup_input.send_keys(Keys.RETURN)
            
            # Wait for location suggestions and select first one
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "location-suggestions")))
            pickup_input.send_keys(Keys.ARROW_DOWN)
            pickup_input.send_keys(Keys.RETURN)
            
            # Enter dropoff location
            dropoff_input = wait.until(EC.presence_of_element_located((By.ID, "drop-location")))
            dropoff_input.clear()
            dropoff_input.send_keys(dropoff_location)
            dropoff_input.send_keys(Keys.RETURN)
            
            # Wait for location suggestions and select first one
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "location-suggestions")))
            dropoff_input.send_keys(Keys.ARROW_DOWN)
            dropoff_input.send_keys(Keys.RETURN)
            
            # Wait for price to load
            price_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "ride-fare")))
            price_text = price_element.text
            
            # Extract price using regex
            price_match = re.search(r'₹\s*(\d+(?:\.\d{2})?)', price_text)
            if not price_match:
                raise ValueError("Could not extract price from Ola page")
            
            price = float(price_match.group(1))
            
            # Get surge multiplier if available
            surge_multiplier = 1.0
            try:
                surge_element = self.driver.find_element(By.CLASS_NAME, "surge-multiplier")
                surge_text = surge_element.text
                surge_match = re.search(r'(\d+(?:\.\d+)?)x', surge_text)
                if surge_match:
                    surge_multiplier = float(surge_match.group(1))
            except:
                pass
            
            # Get estimated time
            time_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "eta")))
            time_text = time_element.text
            minutes_match = re.search(r'(\d+)\s*min', time_text)
            estimate_minutes = int(minutes_match.group(1)) if minutes_match else 0
            
            return {
                "price": price,
                "currency": "INR",
                "surge_multiplier": surge_multiplier,
                "estimate_minutes": estimate_minutes
            }
            
        except Exception as e:
            raise Exception(f"Failed to get Ola price: {str(e)}")
        
        finally:
            if self.driver:
                self.driver.quit()

    async def _handle_captcha(self):
        """Handle CAPTCHA if encountered"""
        try:
            captcha_element = WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "captcha-container"))
            )
            if captcha_element:
                # Get CAPTCHA image
                captcha_img = self.driver.find_element(By.CSS_SELECTOR, 'img[alt*="captcha"]')
                if captcha_img:
                    img_src = captcha_img.get_attribute('src')
                    # Solve CAPTCHA
                    solution = await self.solve_captcha(img_src)
                    # Enter solution
                    input_field = self.driver.find_element(By.NAME, "captcha")
                    input_field.send_keys(solution)
                    submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
                    submit_button.click()
        except TimeoutException:
            # No CAPTCHA found or timeout
            pass 