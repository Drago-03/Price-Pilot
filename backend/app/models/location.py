from pydantic import BaseModel, Field

class Location(BaseModel):
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    address: str | None = Field(None, description="Full address")
    place_id: str | None = Field(None, description="Place ID from mapping service")
    locality: str | None = Field(None, description="Locality or area name")
    city: str | None = Field(None, description="City name") 