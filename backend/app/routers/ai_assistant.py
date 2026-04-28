import json
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import settings
from app.database import (
    users_collection,
    preferences_collection,
    favorites_collection,
    restaurants_collection,
    reviews_collection,
)
from app.utils.auth import oauth2_scheme

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


def serialize_restaurant(restaurant: dict) -> dict:
    return {
        "id": str(restaurant.get("_id")),
        "name": restaurant.get("name"),
        "cuisine_type": restaurant.get("cuisine_type"),
        "city": restaurant.get("city"),
        "address": restaurant.get("address"),
        "pricing_tier": restaurant.get("pricing_tier"),
        "avg_rating": float(restaurant.get("avg_rating", 0) or 0),
        "review_count": int(restaurant.get("review_count", 0) or 0),
        "description": restaurant.get("description"),
    }


def get_optional_current_user(token: str = Depends(oauth2_scheme)) -> dict | None:
    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id = payload.get("sub")
        if not user_id:
            return None

        if ObjectId.is_valid(user_id):
            return users_collection.find_one({"_id": ObjectId(user_id)})

        return None
    except JWTError:
        return None
    except Exception:
        return None


def get_user_context(user: dict | None) -> dict:
    if not user:
        return {"is_authenticated": False}

    user_id = str(user["_id"])

    preference = preferences_collection.find_one({"user_id": user_id})

    favorite_docs = list(favorites_collection.find({"user_id": user_id}).limit(10))
    favorite_restaurant_ids = [
        ObjectId(doc["restaurant_id"])
        for doc in favorite_docs
        if doc.get("restaurant_id") and ObjectId.is_valid(doc["restaurant_id"])
    ]
    favorites = (
        list(restaurants_collection.find({"_id": {"$in": favorite_restaurant_ids}}))
        if favorite_restaurant_ids
        else []
    )

    owned_restaurants = list(
        restaurants_collection.find({"owner_user_id": user_id}).limit(10)
    )

    recent_reviews = list(
        reviews_collection.find({"user_id": user_id}).sort("created_at", -1).limit(10)
    )

    review_restaurant_ids = [
        ObjectId(review["restaurant_id"])
        for review in recent_reviews
        if review.get("restaurant_id") and ObjectId.is_valid(review["restaurant_id"])
    ]
    review_restaurants = (
        list(restaurants_collection.find({"_id": {"$in": review_restaurant_ids}}))
        if review_restaurant_ids
        else []
    )
    restaurant_name_map = {str(r["_id"]): r.get("name") for r in review_restaurants}

    return {
        "is_authenticated": True,
        "profile": {
            "name": user.get("name"),
            "city": user.get("city"),
            "state": user.get("state"),
            "country": user.get("country"),
            "languages": user.get("languages"),
            "about_me": user.get("about_me"),
        },
        "preferences": {
            "cuisines": preference.get("cuisines") if preference else None,
            "price_range": preference.get("price_range") if preference else None,
            "dietary_needs": preference.get("dietary_needs") if preference else None,
            "ambiance": preference.get("ambiance") if preference else None,
            "preferred_location": preference.get("preferred_location") if preference else None,
            "search_radius_miles": preference.get("search_radius_miles") if preference else None,
        },
        "favorites": [serialize_restaurant(r) for r in favorites],
        "owned_restaurants": [serialize_restaurant(r) for r in owned_restaurants],
        "recent_reviews": [
            {
                "restaurant_name": restaurant_name_map.get(review.get("restaurant_id")),
                "rating": review.get("rating"),
                "comment": review.get("comment"),
            }
            for review in recent_reviews
        ],
    }


def get_candidate_restaurants(user_message: str) -> list[dict]:
    query = {}
    if user_message.strip():
        search_regex = {"$regex": user_message.strip(), "$options": "i"}
        query = {
            "$or": [
                {"name": search_regex},
                {"cuisine_type": search_regex},
                {"city": search_regex},
                {"description": search_regex},
            ]
        }

    rows = list(
        restaurants_collection.find(query).sort(
            [("avg_rating", -1), ("review_count", -1)]
        ).limit(8)
    )

    if not rows:
        rows = list(
            restaurants_collection.find({}).sort(
                [("avg_rating", -1), ("review_count", -1)]
            ).limit(8)
        )

    return [serialize_restaurant(r) for r in rows]


def call_ollama(messages: list[dict]) -> str:
    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
    }

    req = Request(
        url=f"{settings.OLLAMA_HOST}/api/chat",
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
    current_user: dict | None = Depends(get_optional_current_user),
):
    user_context = get_user_context(current_user)
    candidate_restaurants = get_candidate_restaurants(payload.message)

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
{json.dumps(user_context, indent=2, default=str)}

Candidate restaurants:
{json.dumps(candidate_restaurants, indent=2, default=str)}
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