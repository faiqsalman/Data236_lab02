from datetime import datetime, timezone
from typing import Optional, List

from bson import ObjectId
from fastapi import APIRouter, Depends, Query, HTTPException

from app.database import restaurants_collection, reviews_collection, users_collection
from app.schemas.restaurant import RestaurantCreate, RestaurantOut, RestaurantUpdate
from app.schemas.review import ReviewCreate, ReviewOut
from app.utils.auth import get_current_user

router = APIRouter()


def to_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail="Invalid ID")
    return ObjectId(value)


def serialize_restaurant(restaurant: dict) -> dict:
    return {
        "id": str(restaurant.get("_id")),
        "name": restaurant.get("name"),
        "cuisine_type": restaurant.get("cuisine_type"),
        "address": restaurant.get("address"),
        "city": restaurant.get("city"),
        "zip_code": restaurant.get("zip_code"),
        "description": restaurant.get("description"),
        "hours": restaurant.get("hours"),
        "contact_phone": restaurant.get("contact_phone"),
        "contact_email": restaurant.get("contact_email"),
        "pricing_tier": restaurant.get("pricing_tier"),
        "amenities": restaurant.get("amenities"),
        "avg_rating": float(restaurant.get("avg_rating", 0.0) or 0.0),
        "review_count": int(restaurant.get("review_count", 0) or 0),
        "added_by_user_id": restaurant.get("added_by_user_id"),
        "owner_user_id": restaurant.get("owner_user_id"),
        "created_at": restaurant.get("created_at"),
    }


def recalculate_restaurant_rating(restaurant_id: str):
    reviews = list(reviews_collection.find({"restaurant_id": restaurant_id}))
    review_count = len(reviews)
    avg_rating = (
        sum(float(review.get("rating", 0)) for review in reviews) / review_count
        if review_count > 0
        else 0.0
    )

    restaurants_collection.update_one(
        {"_id": to_object_id(restaurant_id)},
        {"$set": {"review_count": review_count, "avg_rating": avg_rating}},
    )


@router.get("", response_model=List[RestaurantOut])
def search_restaurants(
    q: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    cuisine_type: Optional[str] = Query(None),
    pricing_tier: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
):
    filters = []

    if q:
        search_regex = {"$regex": q.strip(), "$options": "i"}
        filters.append(
            {
                "$or": [
                    {"name": search_regex},
                    {"description": search_regex},
                    {"address": search_regex},
                    {"city": search_regex},
                    {"cuisine_type": search_regex},
                ]
            }
        )

    if city:
        filters.append({"city": {"$regex": city, "$options": "i"}})

    if cuisine_type:
        filters.append({"cuisine_type": {"$regex": cuisine_type, "$options": "i"}})

    if pricing_tier:
        filters.append({"pricing_tier": pricing_tier})

    if min_rating is not None:
        filters.append({"avg_rating": {"$gte": min_rating}})

    mongo_query = {"$and": filters} if filters else {}

    restaurants = list(
        restaurants_collection.find(mongo_query).sort(
            [("avg_rating", -1), ("created_at", -1)]
        )
    )
    return [serialize_restaurant(restaurant) for restaurant in restaurants]


@router.post("", response_model=RestaurantOut, status_code=201)
def create_restaurant(
    payload: RestaurantCreate,
    current_user: dict = Depends(get_current_user),
):
    restaurant_doc = {
        **payload.model_dump(),
        "avg_rating": 0.0,
        "review_count": 0,
        "added_by_user_id": current_user["_id"],
        "owner_user_id": current_user["_id"],
        "created_at": datetime.now(timezone.utc),
    }

    result = restaurants_collection.insert_one(restaurant_doc)
    restaurant = restaurants_collection.find_one({"_id": result.inserted_id})
    return serialize_restaurant(restaurant)


@router.get("/{restaurant_id}", response_model=RestaurantOut)
def get_restaurant(restaurant_id: str):
    restaurant = restaurants_collection.find_one({"_id": to_object_id(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return serialize_restaurant(restaurant)


@router.put("/{restaurant_id}", response_model=RestaurantOut)
def update_restaurant(
    restaurant_id: str,
    payload: RestaurantUpdate,
    current_user: dict = Depends(get_current_user),
):
    restaurant = restaurants_collection.find_one({"_id": to_object_id(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if restaurant.get("owner_user_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="You can only update a restaurant you own")

    data = payload.model_dump(exclude_unset=True)

    if data:
        restaurants_collection.update_one(
            {"_id": to_object_id(restaurant_id)},
            {"$set": data},
        )

    updated_restaurant = restaurants_collection.find_one({"_id": to_object_id(restaurant_id)})
    return serialize_restaurant(updated_restaurant)


@router.post("/{restaurant_id}/claim", response_model=RestaurantOut)
def claim_restaurant(
    restaurant_id: str,
    current_user: dict = Depends(get_current_user),
):
    restaurant = restaurants_collection.find_one({"_id": to_object_id(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    owner_user_id = restaurant.get("owner_user_id")
    if owner_user_id is not None:
        if owner_user_id == current_user["_id"]:
            return serialize_restaurant(restaurant)
        raise HTTPException(status_code=400, detail="This restaurant already has an owner")

    restaurants_collection.update_one(
        {"_id": to_object_id(restaurant_id)},
        {"$set": {"owner_user_id": current_user["_id"]}},
    )

    updated_restaurant = restaurants_collection.find_one({"_id": to_object_id(restaurant_id)})
    return serialize_restaurant(updated_restaurant)


@router.get("/{restaurant_id}/reviews", response_model=List[ReviewOut])
def get_reviews(restaurant_id: str):
    restaurant = restaurants_collection.find_one({"_id": to_object_id(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    reviews = list(
        reviews_collection.find({"restaurant_id": restaurant_id}).sort("created_at", -1)
    )

    results = []
    for review in reviews:
        user_name = None
        user_id = review.get("user_id")

        if user_id and ObjectId.is_valid(user_id):
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user_name = user.get("name")

        results.append(
            ReviewOut(
                id=str(review.get("_id")),
                user_id=review.get("user_id"),
                restaurant_id=review.get("restaurant_id"),
                rating=review.get("rating"),
                comment=review.get("comment"),
                photo_url=review.get("photo_url"),
                created_at=review.get("created_at"),
                user_name=user_name,
            )
        )

    return results


@router.post("/{restaurant_id}/reviews", response_model=ReviewOut, status_code=201)
def create_review(
    restaurant_id: str,
    payload: ReviewCreate,
    current_user: dict = Depends(get_current_user),
):
    restaurant = restaurants_collection.find_one({"_id": to_object_id(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    review_doc = {
        "user_id": current_user["_id"],
        "restaurant_id": restaurant_id,
        "rating": payload.rating,
        "comment": payload.comment,
        "photo_url": None,
        "created_at": datetime.now(timezone.utc),
    }

    result = reviews_collection.insert_one(review_doc)
    review = reviews_collection.find_one({"_id": result.inserted_id})

    recalculate_restaurant_rating(restaurant_id)

    return ReviewOut(
        id=str(review.get("_id")),
        user_id=review.get("user_id"),
        restaurant_id=review.get("restaurant_id"),
        rating=review.get("rating"),
        comment=review.get("comment"),
        photo_url=review.get("photo_url"),
        created_at=review.get("created_at"),
        user_name=current_user.get("name"),
    )