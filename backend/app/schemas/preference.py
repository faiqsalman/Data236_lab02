from typing import Optional
from pydantic import BaseModel


class PreferenceUpdate(BaseModel):
    cuisines: Optional[str] = None
    price_range: Optional[str] = None
    dietary_needs: Optional[str] = None
    ambiance: Optional[str] = None
    sort_by: Optional[str] = None
    preferred_location: Optional[str] = None
    search_radius_miles: Optional[int] = None


class PreferenceOut(PreferenceUpdate):
    id: str
    user_id: str

    model_config = {"from_attributes": True}