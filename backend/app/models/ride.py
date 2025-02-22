from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class RideResponse(BaseModel):
    service_provider: str = Field(..., description="Name of the service provider (Ola, Uber, Rapido)")
    price: float = Field(..., description="Ride price in INR")
    vehicle_type: str = Field(..., description="Type of vehicle (Mini, Prime, Bike, etc.)")
    estimated_time_minutes: int = Field(..., description="Estimated time in minutes")
    distance: float = Field(..., description="Distance in kilometers")
    tracking_url: Optional[str] = Field(None, description="URL for live tracking")
    additional_info: Optional[Dict[str, Any]] = Field(None, description="Additional provider-specific information")

    class Config:
        json_schema_extra = {
            "example": {
                "service_provider": "Uber",
                "price": 250.0,
                "vehicle_type": "UberGo",
                "estimated_time_minutes": 15,
                "distance": 8.5,
                "tracking_url": "https://track.uber.com/xyz",
                "additional_info": {
                    "surge_multiplier": 1.2,
                    "driver_rating": 4.5
                }
            }
        } 