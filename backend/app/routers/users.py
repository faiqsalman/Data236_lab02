import os
import shutil
import uuid
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from app.database import (
    users_collection,
    preferences_collection,
    favorites_collection,
    restaurants_collection,
    reviews_collection,
)
from app.schemas.user import UserOut, UserUpdate
from app.schemas.preference import PreferenceOut, PreferenceUpdate
from app.utils.auth import get_current_user

router = APIRouter()


def to_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail="Invalid ID")
    return ObjectId(value)


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


def serialize_preference(preference: dict) -> dict:
    return {
        "id": str(preference.get("_id")),
        "user_id": preference.get("user_id"),
        "cuisines": preference.get("cuisines"),
        "price_range": preference.get("price_range"),
        "dietary_needs": preference.get("dietary_needs"),
        "ambiance": preference.get("ambiance"),
        "sort_by": preference.get("sort_by"),
        "preferred_location": preference.get("preferred_location"),
        "search_radius_miles": preference.get("search_radius_miles"),
    }


@router.get("/me", response_model=UserOut)
def get_profile(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)


@router.put("/me", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)

    if "email" in data:
        existing_user = users_collection.find_one(
            {
                "email": data["email"],
                "_id": {"$ne": to_object_id(current_user["_id"])},
            }
        )
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")

    if data:
        users_collection.update_one(
            {"_id": to_object_id(current_user["_id"])},
            {"$set": data},
        )

    updated_user = users_collection.find_one({"_id": to_object_id(current_user["_id"])})
    return serialize_user(updated_user)


@router.post("/me/photo")
def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    os.makedirs("uploads", exist_ok=True)

    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join("uploads", filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    profile_pic_url = f"/uploads/{filename}"

    users_collection.update_one(
        {"_id": to_object_id(current_user["_id"])},
        {"$set": {"profile_pic_url": profile_pic_url}},
    )

    return {
        "message": "Profile picture uploaded successfully",
        "profile_pic_url": profile_pic_url,
    }


@router.get("/me/preferences", response_model=PreferenceOut)
def get_preferences(current_user: dict = Depends(get_current_user)):
    preference = preferences_collection.find_one({"user_id": current_user["_id"]})

    if not preference:
        preference_doc = {
            "user_id": current_user["_id"],
            "cuisines": None,
            "price_range": None,
            "dietary_needs": None,
            "ambiance": None,
            "sort_by": None,
            "preferred_location": None,
            "search_radius_miles": 10,
            "updated_at": datetime.now(timezone.utc),
        }
        result = preferences_collection.insert_one(preference_doc)
        preference = preferences_collection.find_one({"_id": result.inserted_id})

    return serialize_preference(preference)


@router.put("/me/preferences", response_model=PreferenceOut)
def update_preferences(
    payload: PreferenceUpdate,
    current_user: dict = Depends(get_current_user),
):
    preference = preferences_collection.find_one({"user_id": current_user["_id"]})
    data = payload.model_dump(exclude_unset=True)

    if not preference:
        preference_doc = {
            "user_id": current_user["_id"],
            "cuisines": data.get("cuisines"),
            "price_range": data.get("price_range"),
            "dietary_needs": data.get("dietary_needs"),
            "ambiance": data.get("ambiance"),
            "sort_by": data.get("sort_by"),
            "preferred_location": data.get("preferred_location"),
            "search_radius_miles": data.get("search_radius_miles", 10),
            "updated_at": datetime.now(timezone.utc),
        }
        result = preferences_collection.insert_one(preference_doc)
        preference = preferences_collection.find_one({"_id": result.inserted_id})
        return serialize_preference(preference)

    if "search_radius_miles" not in data and preference.get("search_radius_miles") is None:
        data["search_radius_miles"] = 10

    data["updated_at"] = datetime.now(timezone.utc)

    preferences_collection.update_one(
        {"_id": preference["_id"]},
        {"$set": data},
    )

    updated_preference = preferences_collection.find_one({"_id": preference["_id"]})
    return serialize_preference(updated_preference)


@router.get("/me/favorites")
def get_favorites(current_user: dict = Depends(get_current_user)):
    favorite_docs = list(favorites_collection.find({"user_id": current_user["_id"]}))
    restaurant_ids = [
        to_object_id(fav["restaurant_id"])
        for fav in favorite_docs
        if fav.get("restaurant_id") and ObjectId.is_valid(fav["restaurant_id"])
    ]

    if not restaurant_ids:
        return []

    restaurants = list(restaurants_collection.find({"_id": {"$in": restaurant_ids}}))

    return [
        {
            "id": str(restaurant.get("_id")),
            "name": restaurant.get("name"),
            "city": restaurant.get("city"),
            "state": restaurant.get("state"),
            "country": restaurant.get("country"),
            "cuisine_type": restaurant.get("cuisine_type"),
            "avg_rating": restaurant.get("avg_rating"),
            "review_count": restaurant.get("review_count"),
            "photo_url": restaurant.get("photo_url"),
        }
        for restaurant in restaurants
    ]


@router.post("/me/favorites/{restaurant_id}")
def add_favorite(
    restaurant_id: str,
    current_user: dict = Depends(get_current_user),
):
    restaurant = restaurants_collection.find_one({"_id": to_object_id(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    favorite = favorites_collection.find_one(
        {
            "user_id": current_user["_id"],
            "restaurant_id": restaurant_id,
        }
    )

    if not favorite:
        favorites_collection.insert_one(
            {
                "user_id": current_user["_id"],
                "restaurant_id": restaurant_id,
                "created_at": datetime.now(timezone.utc),
            }
        )

    return {"message": "Restaurant added to favorites"}


@router.delete("/me/favorites/{restaurant_id}")
def remove_favorite(
    restaurant_id: str,
    current_user: dict = Depends(get_current_user),
):
    favorites_collection.delete_one(
        {
            "user_id": current_user["_id"],
            "restaurant_id": restaurant_id,
        }
    )

    return {"message": "Restaurant removed from favorites"}


@router.get("/me/history")
def get_history(current_user: dict = Depends(get_current_user)):
    reviews = list(
        reviews_collection.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    )

    restaurants_added = list(
        restaurants_collection.find({"added_by_user_id": current_user["_id"]}).sort(
            "created_at", -1
        )
    )

    restaurants_owned = list(
        restaurants_collection.find({"owner_user_id": current_user["_id"]}).sort(
            "created_at", -1
        )
    )

    return {
        "reviews": [
            {
                "id": str(review.get("_id")),
                "restaurant_id": review.get("restaurant_id"),
                "rating": review.get("rating"),
                "comment": review.get("comment"),
                "photo_url": review.get("photo_url"),
                "created_at": review.get("created_at"),
            }
            for review in reviews
        ],
        "restaurants_added": [
            {
                "id": str(restaurant.get("_id")),
                "name": restaurant.get("name"),
                "city": restaurant.get("city"),
                "cuisine_type": restaurant.get("cuisine_type"),
                "avg_rating": restaurant.get("avg_rating"),
                "review_count": restaurant.get("review_count"),
            }
            for restaurant in restaurants_added
        ],
        "restaurants_owned": [
            {
                "id": str(restaurant.get("_id")),
                "name": restaurant.get("name"),
                "city": restaurant.get("city"),
                "cuisine_type": restaurant.get("cuisine_type"),
                "avg_rating": restaurant.get("avg_rating"),
                "review_count": restaurant.get("review_count"),
            }
            for restaurant in restaurants_owned
        ],
    }