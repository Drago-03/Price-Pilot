from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.endpoints import prices, history
from app.core.config import settings

app = FastAPI(
    title="Price Pilot API",
    description="API for comparing cab prices across different services",
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

# Include routers
app.include_router(prices.router, prefix="/api/v1", tags=["prices"])
app.include_router(history.router, prefix="/api/v1", tags=["history"])

@app.get("/")
async def root():
    return {"message": "Welcome to Price Pilot API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 