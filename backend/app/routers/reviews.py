from fastapi import APIRouter, Depends, HTTPException, Response, status
from bson import ObjectId

from app.database import reviews_collection, restaurants_collection
from app.schemas.review import ReviewOut, ReviewUpdate
from app.utils.auth import get_current_user

router = APIRouter()


def to_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail="Invalid ID")
    return ObjectId(value)


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


def serialize_review(review: dict, user_name: str | None = None) -> ReviewOut:
    return ReviewOut(
        id=str(review.get("_id")),
        user_id=review.get("user_id"),
        restaurant_id=review.get("restaurant_id"),
        rating=review.get("rating"),
        comment=review.get("comment"),
        photo_url=review.get("photo_url"),
        created_at=review.get("created_at"),
        user_name=user_name,
    )


@router.put("/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: str,
    payload: ReviewUpdate,
    current_user: dict = Depends(get_current_user),
):
    review = reviews_collection.find_one({"_id": to_object_id(review_id)})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.get("user_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="You can only update your own review")

    data = payload.model_dump(exclude_unset=True)

    if data:
        reviews_collection.update_one(
            {"_id": to_object_id(review_id)},
            {"$set": data},
        )

    updated_review = reviews_collection.find_one({"_id": to_object_id(review_id)})
    recalculate_restaurant_rating(updated_review["restaurant_id"])

    return serialize_review(updated_review, current_user.get("name"))


@router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: str,
    current_user: dict = Depends(get_current_user),
):
    review = reviews_collection.find_one({"_id": to_object_id(review_id)})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.get("user_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own review")

    restaurant_id = review.get("restaurant_id")
    reviews_collection.delete_one({"_id": to_object_id(review_id)})

    if restaurant_id:
        recalculate_restaurant_rating(restaurant_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)