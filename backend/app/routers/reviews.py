from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from bson import ObjectId

from app.database import reviews_collection
from app.schemas.review import ReviewOut, ReviewUpdate
from app.utils.auth import get_current_user
from app.kafka_producer import publish_event
from app.config import settings

router = APIRouter()


def to_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail="Invalid ID")
    return ObjectId(value)


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

    event = {
        "review_id": review_id,
        "rating": payload.rating,
        "comment": payload.comment,
    }

    publish_event(settings.KAFKA_REVIEW_UPDATED_TOPIC, event)

    updated_preview = review.copy()
    if payload.rating is not None:
        updated_preview["rating"] = payload.rating
    if payload.comment is not None:
        updated_preview["comment"] = payload.comment

    return ReviewOut(
        id=review_id,
        user_id=updated_preview.get("user_id"),
        restaurant_id=updated_preview.get("restaurant_id"),
        rating=updated_preview.get("rating"),
        comment=updated_preview.get("comment"),
        photo_url=updated_preview.get("photo_url"),
        created_at=updated_preview.get("created_at", datetime.now(timezone.utc)),
        user_name=current_user.get("name"),
    )


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

    event = {
        "review_id": review_id,
    }

    publish_event(settings.KAFKA_REVIEW_DELETED_TOPIC, event)

    return Response(status_code=status.HTTP_204_NO_CONTENT)