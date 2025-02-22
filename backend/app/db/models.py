from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

Base = declarative_base()

class ServiceProvider(enum.Enum):
    UBER = "uber"
    OLA = "ola"

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    pickup_location = Column(String, nullable=False)
    dropoff_location = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    price_history = relationship("PriceHistory", back_populates="route")

    class Config:
        orm_mode = True

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    service_provider = Column(Enum(ServiceProvider), nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    surge_multiplier = Column(Float, default=1.0)
    estimate_minutes = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    route = relationship("Route", back_populates="price_history")

    class Config:
        orm_mode = True 