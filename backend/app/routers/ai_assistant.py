import json
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.favorite import Favorite
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.user import User
from app.models.user_preference import UserPreference
from app.utils.auth import get_current_user

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    recommendations: list[dict] = []


def serialize_restaurant(restaurant: Restaurant) -> dict:
    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "cuisine_type": restaurant.cuisine_type,
        "city": restaurant.city,
        "address": restaurant.address,
        "pricing_tier": restaurant.pricing_tier,
        "avg_rating": float(restaurant.avg_rating or 0),
        "review_count": int(restaurant.review_count or 0),
        "description": restaurant.description,
    }


def get_user_context(db: Session, user: User | None) -> dict:
    if not user:
        return {"is_authenticated": False}

    preference = (
        db.query(UserPreference)
        .filter(UserPreference.user_id == user.id)
        .first()
    )

    favorites = (
        db.query(Restaurant)
        .join(Favorite, Favorite.restaurant_id == Restaurant.id)
        .filter(Favorite.user_id == user.id)
        .limit(10)
        .all()
    )

    owned_restaurants = (
        db.query(Restaurant)
        .filter(Restaurant.owner_user_id == user.id)
        .limit(10)
        .all()
    )

    recent_reviews = (
        db.query(Review, Restaurant.name)
        .join(Restaurant, Restaurant.id == Review.restaurant_id)
        .filter(Review.user_id == user.id)
        .order_by(Review.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "is_authenticated": True,
        "profile": {
            "name": user.name,
            "city": user.city,
            "state": user.state,
            "country": user.country,
            "languages": user.languages,
            "about_me": user.about_me,
        },
        "preferences": {
            "cuisines": preference.cuisines if preference else None,
            "price_range": preference.price_range if preference else None,
            "dietary_needs": preference.dietary_needs if preference else None,
            "ambiance": preference.ambiance if preference else None,
            "preferred_location": preference.preferred_location if preference else None,
            "search_radius_miles": preference.search_radius_miles if preference else None,
        },
        "favorites": [serialize_restaurant(r) for r in favorites],
        "owned_restaurants": [serialize_restaurant(r) for r in owned_restaurants],
        "recent_reviews": [
            {
                "restaurant_name": restaurant_name,
                "rating": review.rating,
                "comment": review.comment,
            }
            for review, restaurant_name in recent_reviews
        ],
    }


def get_candidate_restaurants(db: Session, user_message: str) -> list[dict]:
    search_term = f"%{user_message.strip()}%"
    rows = (
        db.query(Restaurant)
        .filter(
            (Restaurant.name.ilike(search_term))
            | (Restaurant.cuisine_type.ilike(search_term))
            | (Restaurant.city.ilike(search_term))
            | (Restaurant.description.ilike(search_term))
        )
        .order_by(Restaurant.avg_rating.desc(), Restaurant.review_count.desc())
        .limit(8)
        .all()
    )

    if not rows:
        rows = (
            db.query(Restaurant)
            .order_by(Restaurant.avg_rating.desc(), Restaurant.review_count.desc())
            .limit(8)
            .all()
        )

    return [serialize_restaurant(r) for r in rows]


def call_ollama(messages: list[dict]) -> str:
    payload = {
        "model": settings.ollama_model,
        "messages": messages,
        "stream": False,
    }

    req = Request(
        url=f"{settings.ollama_host}/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(req, timeout=90) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data.get("message", {}).get("content", "").strip()

    except HTTPError as e:
        error_body = ""
        try:
            error_body = e.read().decode("utf-8")
        except Exception:
            pass

        raise HTTPException(
            status_code=502,
            detail=f"Ollama HTTP error: {e.code} {e.reason}. {error_body}"
        )

    except URLError:
        raise HTTPException(
            status_code=502,
            detail="Could not reach Ollama. Make sure Ollama is running locally."
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI assistant error: {str(e)}"
        )


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    user_context = get_user_context(db, current_user)
    candidate_restaurants = get_candidate_restaurants(db, payload.message)

    system_prompt = f"""
You are a Yelp-style restaurant assistant inside a restaurant discovery app.

Rules:
- answer naturally and helpfully
- use the provided user context to personalize suggestions
- recommend restaurants only from the PROVIDED restaurant list
- never invent restaurants not in the list
- if you mention recommendations, explain why they fit
- keep the answer concise and useful

User context:
{json.dumps(user_context, indent=2)}

Candidate restaurants:
{json.dumps(candidate_restaurants, indent=2)}
""".strip()

    messages = [{"role": "system", "content": system_prompt}]

    for item in payload.conversation_history[-8:]:
        messages.append({"role": item.role, "content": item.content})

    messages.append({"role": "user", "content": payload.message})

    reply = call_ollama(messages)

    return ChatResponse(
        reply=reply,
        recommendations=candidate_restaurants[:5],
    )