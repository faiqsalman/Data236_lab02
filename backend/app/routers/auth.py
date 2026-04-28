from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import users_collection, sessions_collection
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import Token, LoginRequest
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter()


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user.get("_id")),
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "about_me": user.get("about_me"),
        "city": user.get("city"),
        "country": user.get("country"),
        "state": user.get("state"),
        "languages": user.get("languages"),
        "gender": user.get("gender"),
        "profile_pic_url": user.get("profile_pic_url"),
        "created_at": user.get("created_at"),
    }


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate):
    existing_user = users_collection.find_one({"email": payload.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "phone": None,
        "about_me": None,
        "city": None,
        "country": None,
        "state": None,
        "languages": None,
        "gender": None,
        "profile_pic_url": None,
        "created_at": datetime.now(timezone.utc),
    }

    result = users_collection.insert_one(user_doc)
    created_user = users_collection.find_one({"_id": result.inserted_id})

    return serialize_user(created_user)


@router.post("/login", response_model=Token)
def login(payload: LoginRequest):
    user = users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user["_id"])})

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=1440)
    sessions_collection.insert_one(
        {
            "user_id": str(user["_id"]),
            "token": access_token,
            "created_at": datetime.now(timezone.utc),
            "expires_at": expires_at,
        }
    )

    return Token(access_token=access_token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)