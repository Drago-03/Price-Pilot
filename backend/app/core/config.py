from pydantic import BaseModel
from typing import Optional
from functools import lru_cache

class Settings(BaseModel):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Price Pilot"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/price_pilot"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # Scraping Configuration
    CAPTCHA_API_KEY: Optional[str] = None
    PROXY_URL: Optional[str] = None
    RETRY_ATTEMPTS: int = 3
    REQUEST_TIMEOUT: int = 30
    
    # Uber Configuration
    UBER_BASE_URL: str = "https://m.uber.com"
    
    # Ola Configuration
    OLA_BASE_URL: str = "https://book.olacabs.com"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()