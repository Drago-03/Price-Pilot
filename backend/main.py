from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import rides, auth
from app.core.config import settings
from app.middleware.rate_limit import RateLimitMiddleware

app = FastAPI(
    title="Price Pilot API",
    description="API for comparing cab prices across different providers in India",
    version="1.0.0",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(rides.router, prefix="/api/v1", tags=["rides"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Price Pilot API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        workers=4
    ) 