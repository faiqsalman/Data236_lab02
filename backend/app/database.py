from pymongo import MongoClient
from app.config import settings

client = MongoClient(settings.MONGODB_URL)
db = client[settings.MONGODB_DB]

users_collection = db["users"]
sessions_collection = db["sessions"]
restaurants_collection = db["restaurants"]
reviews_collection = db["reviews"]
favorites_collection = db["favorites"]
preferences_collection = db["user_preferences"]
activity_logs_collection = db["activity_logs"]


def get_db():
    return db