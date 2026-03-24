from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.user import User
from app.schemas.restaurant import RestaurantCreate, RestaurantOut, RestaurantUpdate
from app.schemas.review import ReviewCreate, ReviewOut
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


@router.get("", response_model=List[RestaurantOut])
def search_restaurants(
    q: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    cuisine_type: Optional[str] = Query(None),
    pricing_tier: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Restaurant)

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Restaurant.name.ilike(search_term),
                Restaurant.description.ilike(search_term),
                Restaurant.address.ilike(search_term),
                Restaurant.city.ilike(search_term),
                Restaurant.cuisine_type.ilike(search_term),
            )
        )

    if city:
        query = query.filter(Restaurant.city.ilike(f"%{city}%"))

    if cuisine_type:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine_type}%"))

    if pricing_tier:
        query = query.filter(Restaurant.pricing_tier == pricing_tier)

    if min_rating is not None:
        query = query.filter(Restaurant.avg_rating >= min_rating)

    restaurants = query.order_by(Restaurant.avg_rating.desc(), Restaurant.id.desc()).all()
    return restaurants


@router.post("", response_model=RestaurantOut, status_code=201)
def create_restaurant(
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = Restaurant(
        **payload.model_dump(),
        added_by_user_id=current_user.id,
        owner_user_id=current_user.id,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/{restaurant_id}", response_model=RestaurantOut)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@router.put("/{restaurant_id}", response_model=RestaurantOut)
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if restaurant.owner_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update a restaurant you own")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(restaurant, key, value)

    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.post("/{restaurant_id}/claim", response_model=RestaurantOut)
def claim_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if restaurant.owner_user_id is not None:
        if restaurant.owner_user_id == current_user.id:
            return restaurant
        raise HTTPException(status_code=400, detail="This restaurant already has an owner")

    restaurant.owner_user_id = current_user.id
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/{restaurant_id}/reviews", response_model=List[ReviewOut])
def get_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    rows = (
        db.query(Review, User.name)
        .join(User, User.id == Review.user_id)
        .filter(Review.restaurant_id == restaurant_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    results = []
    for review, user_name in rows:
        results.append(
            ReviewOut(
                id=review.id,
                user_id=review.user_id,
                restaurant_id=review.restaurant_id,
                rating=review.rating,
                comment=review.comment,
                photo_url=review.photo_url,
                created_at=review.created_at,
                user_name=user_name,
            )
        )

    return results


@router.post("/{restaurant_id}/reviews", response_model=ReviewOut, status_code=201)
def create_review(
    restaurant_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    review = Review(
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    recalculate_restaurant_rating(db, restaurant_id)

    return ReviewOut(
        id=review.id,
        user_id=review.user_id,
        restaurant_id=restaurant_id,
        rating=review.rating,
        comment=review.comment,
        photo_url=review.photo_url,
        created_at=review.created_at,
        user_name=current_user.name,
    )