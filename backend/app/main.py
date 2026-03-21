import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, users, restaurants, reviews, favorites, ai_assistant

app = FastAPI(
    title="YelpClone API",
    description="Yelp-style restaurant discovery and review platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(restaurants.router, prefix="/api/restaurants", tags=["Restaurants"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(favorites.router, prefix="/api/users/me/favorites", tags=["Favorites"])
app.include_router(ai_assistant.router, prefix="/api/ai-assistant", tags=["AI Assistant"])


@app.get("/")
def root():
    return {"message": "YelpClone API is running"}