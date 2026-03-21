import os
import shutil
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.user_preference import UserPreference
from app.models.favorite import Favorite
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.schemas.user import UserOut, UserUpdate
from app.schemas.preference import PreferenceOut, PreferenceUpdate
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)

    if "email" in data:
        existing_user = (
            db.query(User)
            .filter(User.email == data["email"], User.id != current_user.id)
            .first()
        )
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")

    for key, value in data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/photo")
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    os.makedirs("uploads", exist_ok=True)

    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join("uploads", filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.profile_pic_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile picture uploaded successfully",
        "profile_pic_url": current_user.profile_pic_url,
    }


@router.get("/me/preferences", response_model=PreferenceOut)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preference = (
        db.query(UserPreference)
        .filter(UserPreference.user_id == current_user.id)
        .first()
    )

    if not preference:
        preference = UserPreference(user_id=current_user.id, search_radius_miles=10)
        db.add(preference)
        db.commit()
        db.refresh(preference)

    return preference


@router.put("/me/preferences", response_model=PreferenceOut)
def update_preferences(
    payload: PreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preference = (
        db.query(UserPreference)
        .filter(UserPreference.user_id == current_user.id)
        .first()
    )

    if not preference:
        preference = UserPreference(user_id=current_user.id)
        db.add(preference)

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(preference, key, value)

    if preference.search_radius_miles is None:
        preference.search_radius_miles = 10

    db.commit()
    db.refresh(preference)
    return preference


@router.get("/me/favorites")
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorites = (
        db.query(Restaurant)
        .join(Favorite, Favorite.restaurant_id == Restaurant.id)
        .filter(Favorite.user_id == current_user.id)
        .all()
    )

    return favorites


@router.post("/me/favorites/{restaurant_id}")
def add_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.restaurant_id == restaurant_id,
        )
        .first()
    )

    if not favorite:
        favorite = Favorite(user_id=current_user.id, restaurant_id=restaurant_id)
        db.add(favorite)
        db.commit()

    return {"message": "Restaurant added to favorites"}


@router.delete("/me/favorites/{restaurant_id}")
def remove_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.restaurant_id == restaurant_id,
        )
        .first()
    )

    if favorite:
        db.delete(favorite)
        db.commit()

    return {"message": "Restaurant removed from favorites"}


@router.get("/me/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    restaurants_added = (
        db.query(Restaurant)
        .filter(Restaurant.added_by_user_id == current_user.id)
        .all()
    )

    return {
        "reviews": reviews,
        "restaurants_added": restaurants_added,
    }