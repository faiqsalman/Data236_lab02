from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import Review
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.review import ReviewOut, ReviewUpdate
from app.utils.auth import get_current_user

router = APIRouter()


def recalculate_restaurant_rating(db: Session, restaurant_id: int):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        return

    stats = (
        db.query(
            func.count(Review.id).label("review_count"),
            func.avg(Review.rating).label("avg_rating"),
        )
        .filter(Review.restaurant_id == restaurant_id)
        .first()
    )

    restaurant.review_count = stats.review_count or 0
    restaurant.avg_rating = float(stats.avg_rating or 0.0)
    db.commit()
    db.refresh(restaurant)


@router.put("/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own review")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(review, key, value)

    db.commit()
    db.refresh(review)

    recalculate_restaurant_rating(db, review.restaurant_id)

    return review


@router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own review")

    restaurant_id = review.restaurant_id
    db.delete(review)
    db.commit()

    recalculate_restaurant_rating(db, restaurant_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)