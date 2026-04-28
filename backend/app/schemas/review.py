from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: str
    user_id: str
    restaurant_id: str
    rating: int
    comment: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: Optional[datetime] = None
    user_name: Optional[str] = None

    model_config = {"from_attributes": True}