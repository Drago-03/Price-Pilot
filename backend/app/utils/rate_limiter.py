import redis
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings

class RateLimiter:
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL)
        self.rate_limit = settings.RATE_LIMIT_PER_MINUTE
        self.window = 60  # 1 minute window

    async def is_rate_limited(self, key: str) -> bool:
        """
        Check if the request should be rate limited
        """
        current = int(datetime.now().timestamp())
        window_start = current - self.window

        # Remove old requests
        self.redis_client.zremrangebyscore(key, 0, window_start)

        # Count requests in current window
        request_count = self.redis_client.zcard(key)

        if request_count >= self.rate_limit:
            return True

        # Add current request
        self.redis_client.zadd(key, {str(current): current})
        return False

    async def get_remaining_requests(self, key: str) -> int:
        """
        Get remaining requests in current window
        """
        current = int(datetime.now().timestamp())
        window_start = current - self.window

        # Remove old requests
        self.redis_client.zremrangebyscore(key, 0, window_start)

        # Count requests in current window
        request_count = self.redis_client.zcard(key)
        return max(0, self.rate_limit - request_count)

class CacheManager:
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL)
        self.default_ttl = 300  # 5 minutes

    async def get(self, key: str) -> Optional[str]:
        """
        Get value from cache
        """
        return self.redis_client.get(key)

    async def set(self, key: str, value: str, ttl: int = None) -> None:
        """
        Set value in cache
        """
        if ttl is None:
            ttl = self.default_ttl
        self.redis_client.setex(key, ttl, value)

    async def delete(self, key: str) -> None:
        """
        Delete value from cache
        """
        self.redis_client.delete(key) 