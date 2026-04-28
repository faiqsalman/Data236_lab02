from datetime import datetime
from typing import Optional

from pydantic import BaseModel


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
    id: str
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
    avg_rating: float = 0.0
    review_count: int = 0
    added_by_user_id: Optional[str] = None
    owner_user_id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}