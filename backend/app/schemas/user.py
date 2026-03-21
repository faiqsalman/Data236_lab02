from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


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


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    about_me: Optional[str]
    city: Optional[str]
    country: Optional[str]
    state: Optional[str]
    languages: Optional[str]
    gender: Optional[str]
    profile_pic_url: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}