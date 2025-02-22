from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.db.session import get_db
from app.db.models import Route, PriceHistory, ServiceProvider
from app.scrapers.uber import UberScraper
from app.scrapers.ola import OlaScraper
import asyncio

router = APIRouter()

@router.get("/compare-prices")
async def compare_prices(
    pickup_location: str,
    dropoff_location: str,
    timestamp: Optional[datetime] = None,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Compare prices between Uber and Ola for a given route
    """
    try:
        # Create or get existing route
        route = db.query(Route).filter(
            Route.pickup_location == pickup_location,
            Route.dropoff_location == dropoff_location
        ).first()
        
        if not route:
            route = Route(
                pickup_location=pickup_location,
                dropoff_location=dropoff_location
            )
            db.add(route)
            db.commit()
            db.refresh(route)
        
        # Get prices from both services concurrently
        async with UberScraper() as uber_scraper, OlaScraper() as ola_scraper:
            uber_task = asyncio.create_task(uber_scraper.get_price(pickup_location, dropoff_location, timestamp))
            ola_task = asyncio.create_task(ola_scraper.get_price(pickup_location, dropoff_location, timestamp))
            
            uber_price, ola_price = await asyncio.gather(uber_task, ola_task, return_exceptions=True)
        
        result = {
            "route": {
                "pickup_location": pickup_location,
                "dropoff_location": dropoff_location
            },
            "prices": {}
        }
        
        # Process Uber results
        if isinstance(uber_price, dict):
            result["prices"]["uber"] = uber_price
            background_tasks.add_task(
                save_price_history,
                db,
                route.id,
                ServiceProvider.UBER,
                uber_price
            )
        else:
            result["prices"]["uber"] = {"error": str(uber_price)}
        
        # Process Ola results
        if isinstance(ola_price, dict):
            result["prices"]["ola"] = ola_price
            background_tasks.add_task(
                save_price_history,
                db,
                route.id,
                ServiceProvider.OLA,
                ola_price
            )
        else:
            result["prices"]["ola"] = {"error": str(ola_price)}
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def save_price_history(
    db: Session,
    route_id: int,
    service_provider: ServiceProvider,
    price_data: dict
):
    """
    Save price history to database
    """
    try:
        price_history = PriceHistory(
            route_id=route_id,
            service_provider=service_provider,
            price=price_data["price"],
            currency=price_data["currency"],
            surge_multiplier=price_data["surge_multiplier"],
            estimate_minutes=price_data["estimate_minutes"]
        )
        db.add(price_history)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error saving price history: {str(e)}")

@router.get("/routes")
async def get_routes(db: Session = Depends(get_db)):
    """
    Get all saved routes
    """
    routes = db.query(Route).all()
    return routes 