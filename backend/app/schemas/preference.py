from pydantic import BaseModel
from typing import Optional


class PreferenceUpdate(BaseModel):
    cuisines: Optional[str] = None
    price_range: Optional[str] = None
    dietary_needs: Optional[str] = None
    ambiance: Optional[str] = None
    sort_by: Optional[str] = None
    preferred_location: Optional[str] = None
    search_radius_miles: Optional[int] = None


class PreferenceOut(PreferenceUpdate):
    id: int
    user_id: int

    model_config = {"from_attributes": True}