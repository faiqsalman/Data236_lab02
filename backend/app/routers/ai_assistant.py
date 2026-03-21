from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.restaurant import Restaurant

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    recommendations: Optional[list] = []


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    message_lower = payload.message.lower()

    query = db.query(Restaurant)

    if "pizza" in message_lower:
        query = query.filter(Restaurant.cuisine_type.ilike("%pizza%"))
    elif "burger" in message_lower:
        query = query.filter(Restaurant.cuisine_type.ilike("%burger%"))
    elif "indian" in message_lower:
        query = query.filter(Restaurant.cuisine_type.ilike("%indian%"))
    elif "chinese" in message_lower:
        query = query.filter(Restaurant.cuisine_type.ilike("%chinese%"))
    elif "italian" in message_lower:
        query = query.filter(Restaurant.cuisine_type.ilike("%italian%"))
    elif "mexican" in message_lower:
        query = query.filter(Restaurant.cuisine_type.ilike("%mexican%"))

    recommendations = query.order_by(Restaurant.avg_rating.desc()).limit(5).all()

    return ChatResponse(
        reply="Here are some restaurant suggestions based on your message. Later you can replace this with real AI + LangChain logic.",
        recommendations=[
            {
                "id": r.id,
                "name": r.name,
                "cuisine_type": r.cuisine_type,
                "city": r.city,
                "avg_rating": r.avg_rating,
                "pricing_tier": r.pricing_tier,
            }
            for r in recommendations
        ],
    )