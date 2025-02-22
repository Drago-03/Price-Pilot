from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from app.db.session import get_db
from app.db.models import Route, PriceHistory, ServiceProvider
from sqlalchemy import and_

router = APIRouter()

@router.get("/price-history/{route_id}")
async def get_price_history(
    route_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    service_provider: Optional[ServiceProvider] = None,
    db: Session = Depends(get_db)
):
    """
    Get price history for a specific route
    """
    try:
        # Verify route exists
        route = db.query(Route).filter(Route.id == route_id).first()
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        
        # Build query
        query = db.query(PriceHistory).filter(PriceHistory.route_id == route_id)
        
        # Apply date filters
        if start_date:
            query = query.filter(PriceHistory.timestamp >= start_date)
        if end_date:
            query = query.filter(PriceHistory.timestamp <= end_date)
        
        # Apply service provider filter
        if service_provider:
            query = query.filter(PriceHistory.service_provider == service_provider)
        
        # Get results
        history = query.order_by(PriceHistory.timestamp.desc()).all()
        
        return {
            "route": {
                "id": route.id,
                "pickup_location": route.pickup_location,
                "dropoff_location": route.dropoff_location
            },
            "history": history
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/price-trends")
async def get_price_trends(
    route_id: int,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    Get price trends for a specific route over time
    """
    try:
        # Verify route exists
        route = db.query(Route).filter(Route.id == route_id).first()
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get price history for both services
        history = db.query(PriceHistory).filter(
            and_(
                PriceHistory.route_id == route_id,
                PriceHistory.timestamp >= start_date,
                PriceHistory.timestamp <= end_date
            )
        ).order_by(PriceHistory.timestamp.asc()).all()
        
        # Process data for trends
        uber_prices = []
        ola_prices = []
        
        for record in history:
            price_point = {
                "timestamp": record.timestamp,
                "price": record.price,
                "surge_multiplier": record.surge_multiplier
            }
            
            if record.service_provider == ServiceProvider.UBER:
                uber_prices.append(price_point)
            else:
                ola_prices.append(price_point)
        
        return {
            "route": {
                "id": route.id,
                "pickup_location": route.pickup_location,
                "dropoff_location": route.dropoff_location
            },
            "trends": {
                "uber": {
                    "prices": uber_prices,
                    "average": sum(p["price"] for p in uber_prices) / len(uber_prices) if uber_prices else 0,
                    "max": max(p["price"] for p in uber_prices) if uber_prices else 0,
                    "min": min(p["price"] for p in uber_prices) if uber_prices else 0
                },
                "ola": {
                    "prices": ola_prices,
                    "average": sum(p["price"] for p in ola_prices) / len(ola_prices) if ola_prices else 0,
                    "max": max(p["price"] for p in ola_prices) if ola_prices else 0,
                    "min": min(p["price"] for p in ola_prices) if ola_prices else 0
                }
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/popular-routes")
async def get_popular_routes(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get most frequently searched routes
    """
    try:
        # Get routes with most price history entries
        popular_routes = (
            db.query(
                Route,
                db.func.count(PriceHistory.id).label('search_count')
            )
            .join(PriceHistory)
            .group_by(Route.id)
            .order_by(db.func.count(PriceHistory.id).desc())
            .limit(limit)
            .all()
        )
        
        return [
            {
                "route": {
                    "id": route.id,
                    "pickup_location": route.pickup_location,
                    "dropoff_location": route.dropoff_location
                },
                "search_count": search_count
            }
            for route, search_count in popular_routes
        ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 