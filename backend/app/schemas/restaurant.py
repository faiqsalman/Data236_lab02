from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RestaurantCreate(BaseModel):
    name: str
    cuisine_type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip_code: Optional[str] = None
    description: Optional[str] = None
    hours: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    pricing_tier: Optional[str] = None
    amenities: Optional[str] = None


class RestaurantUpdate(RestaurantCreate):
    name: Optional[str] = None


class RestaurantOut(BaseModel):
    id: int
    name: str
    cuisine_type: Optional[str]
    address: Optional[str]
    city: Optional[str]
    zip_code: Optional[str]
    description: Optional[str]
    hours: Optional[str]
    contact_phone: Optional[str]
    contact_email: Optional[str]
    pricing_tier: Optional[str]
    amenities: Optional[str]
    avg_rating: float
    review_count: int
    added_by_user_id: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}