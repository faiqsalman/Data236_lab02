from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from app.database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    cuisine_type = Column(String(100), index=True)
    address = Column(String(300))
    city = Column(String(100), index=True)
    zip_code = Column(String(20))
    description = Column(Text)
    hours = Column(String(500))
    contact_phone = Column(String(20))
    contact_email = Column(String(255))
    pricing_tier = Column(String(10))
    amenities = Column(String(500))
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    added_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())