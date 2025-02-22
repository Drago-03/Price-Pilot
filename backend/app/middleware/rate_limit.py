from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from redis import asyncio as aioredis
from app.core.config import settings
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.redis = aioredis.from_url(settings.REDIS_URL)
        self.rate_limit = 100  # requests per minute
        self.window = 60  # seconds

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for certain paths
        if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)

        # Use client IP as rate limit key
        client_ip = request.client.host
        key = f"rate_limit:{client_ip}"
        
        # Get current timestamp
        now = int(time.time())
        
        async with self.redis.pipeline() as pipe:
            # Clean old requests
            await pipe.zremrangebyscore(key, 0, now - self.window)
            # Count requests in current window
            await pipe.zcard(key)
            # Add current request
            await pipe.zadd(key, {str(now): now})
            # Set expiry on the key
            await pipe.expire(key, self.window)
            # Execute pipeline
            _, request_count, *_ = await pipe.execute()

        # Check if rate limit is exceeded
        if request_count > self.rate_limit:
            # Calculate remaining time in the window
            oldest_req = await self.redis.zrange(key, 0, 0, withscores=True)
            if oldest_req:
                reset_time = int(oldest_req[0][1]) + self.window - now
            else:
                reset_time = self.window

            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Too many requests",
                    "retry_after": reset_time
                }
            )

        response = await call_next(request)
        
        # Add rate limit headers
        remaining = self.rate_limit - request_count
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Limit"] = str(self.rate_limit)
        response.headers["X-RateLimit-Reset"] = str(now + self.window)
        
        return response

    async def close(self):
        await self.redis.close() 