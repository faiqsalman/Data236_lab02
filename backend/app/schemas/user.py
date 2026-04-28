from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    about_me: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    languages: Optional[str] = None
    gender: Optional[str] = None
    profile_pic_url: Optional[str] = None


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    about_me: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    languages: Optional[str] = None
    gender: Optional[str] = None
    profile_pic_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}