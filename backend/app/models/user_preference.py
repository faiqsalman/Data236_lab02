from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    cuisines = Column(String(500))
    price_range = Column(String(10))
    dietary_needs = Column(String(500))
    ambiance = Column(String(500))
    sort_by = Column(String(50))
    preferred_location = Column(String(200))
    search_radius_miles = Column(Integer, default=10)