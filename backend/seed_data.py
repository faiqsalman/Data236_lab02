from datetime import datetime, timezone
from pymongo import MongoClient
from bson import ObjectId
import bcrypt

MONGODB_URL = "mongodb://mongo:27017"
MONGODB_DB = "yelp_lab2"

client = MongoClient(MONGODB_URL)
db = client[MONGODB_DB]

users_collection = db["users"]
restaurants_collection = db["restaurants"]
reviews_collection = db["reviews"]
preferences_collection = db["user_preferences"]
favorites_collection = db["favorites"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def main():
    print("Clearing old data...")
    favorites_collection.delete_many({})
    reviews_collection.delete_many({})
    preferences_collection.delete_many({})
    restaurants_collection.delete_many({})
    users_collection.delete_many({})

    now = datetime.now(timezone.utc)

    print("Inserting users...")
    users = [
        {
            "name": "John Doe",
            "email": "john@example.com",
            "hashed_password": hash_password("123456"),
            "phone": "1234567890",
            "about_me": "Food lover who enjoys Italian and burgers.",
            "city": "San Jose",
            "country": "USA",
            "state": "California",
            "languages": "English",
            "gender": "Male",
            "profile_pic_url": None,
            "created_at": now,
        },
        {
            "name": "Sarah Khan",
            "email": "sarah@example.com",
            "hashed_password": hash_password("123456"),
            "phone": "2345678901",
            "about_me": "Always looking for cozy brunch spots.",
            "city": "San Francisco",
            "country": "USA",
            "state": "California",
            "languages": "English, Urdu",
            "gender": "Female",
            "profile_pic_url": None,
            "created_at": now,
        },
        {
            "name": "Ali Raza",
            "email": "ali@example.com",
            "hashed_password": hash_password("123456"),
            "phone": "3456789012",
            "about_me": "Big fan of spicy food and BBQ.",
            "city": "Fremont",
            "country": "USA",
            "state": "California",
            "languages": "English, Urdu",
            "gender": "Male",
            "profile_pic_url": None,
            "created_at": now,
        },
    ]

    user_result = users_collection.insert_many(users)
    user_ids = user_result.inserted_ids

    print("Inserting user preferences...")
    preferences = [
        {
            "user_id": str(user_ids[0]),
            "cuisines": "Italian, American",
            "price_range": "$$",
            "dietary_needs": None,
            "ambiance": "Casual",
            "sort_by": "rating",
            "preferred_location": "San Jose",
            "search_radius_miles": 10,
        },
        {
            "user_id": str(user_ids[1]),
            "cuisines": "Cafe, Breakfast, Mediterranean",
            "price_range": "$$$",
            "dietary_needs": "Halal",
            "ambiance": "Cozy",
            "sort_by": "rating",
            "preferred_location": "San Francisco",
            "search_radius_miles": 15,
        },
        {
            "user_id": str(user_ids[2]),
            "cuisines": "BBQ, Pakistani, Indian",
            "price_range": "$$",
            "dietary_needs": None,
            "ambiance": "Family Friendly",
            "sort_by": "reviews",
            "preferred_location": "Fremont",
            "search_radius_miles": 12,
        },
    ]
    preferences_collection.insert_many(preferences)

    print("Inserting restaurants...")
    restaurants = [
        {
            "name": "Test Kitchen",
            "cuisine_type": "Italian",
            "address": "123 Main Street",
            "city": "San Jose",
            "zip_code": "95112",
            "description": "A modern Italian spot with handmade pasta and pizza.",
            "hours": "10 AM - 10 PM",
            "contact_phone": "1234567890",
            "contact_email": "testkitchen@example.com",
            "pricing_tier": "$$",
            "amenities": "WiFi, Outdoor Seating",
            "avg_rating": 0.0,
            "review_count": 0,
            "added_by_user_id": str(user_ids[0]),
            "owner_user_id": str(user_ids[0]),
            "created_at": now,
        },
        {
            "name": "Golden Burger House",
            "cuisine_type": "American",
            "address": "45 Market Street",
            "city": "San Jose",
            "zip_code": "95113",
            "description": "Classic burgers, fries, and shakes.",
            "hours": "11 AM - 11 PM",
            "contact_phone": "1112223333",
            "contact_email": "goldenburger@example.com",
            "pricing_tier": "$",
            "amenities": "Takeout, Delivery",
            "avg_rating": 0.0,
            "review_count": 0,
            "added_by_user_id": str(user_ids[1]),
            "owner_user_id": str(user_ids[1]),
            "created_at": now,
        },
        {
            "name": "Spice Route",
            "cuisine_type": "Indian",
            "address": "88 Mission Blvd",
            "city": "Fremont",
            "zip_code": "94539",
            "description": "Rich curries, biryani, and tandoori specialties.",
            "hours": "12 PM - 10 PM",
            "contact_phone": "2223334444",
            "contact_email": "spiceroute@example.com",
            "pricing_tier": "$$",
            "amenities": "Family Seating, Halal Options",
            "avg_rating": 0.0,
            "review_count": 0,
            "added_by_user_id": str(user_ids[2]),
            "owner_user_id": str(user_ids[2]),
            "created_at": now,
        },
        {
            "name": "Taco Fiesta",
            "cuisine_type": "Mexican",
            "address": "77 Sunset Ave",
            "city": "San Francisco",
            "zip_code": "94107",
            "description": "Street tacos, burritos, and fresh salsa.",
            "hours": "10 AM - 9 PM",
            "contact_phone": "3334445555",
            "contact_email": "tacofiesta@example.com",
            "pricing_tier": "$",
            "amenities": "Outdoor Seating, Quick Service",
            "avg_rating": 0.0,
            "review_count": 0,
            "added_by_user_id": str(user_ids[1]),
            "owner_user_id": str(user_ids[1]),
            "created_at": now,
        },
        {
            "name": "Ocean Breeze Sushi",
            "cuisine_type": "Japanese",
            "address": "501 Bay Street",
            "city": "San Francisco",
            "zip_code": "94133",
            "description": "Fresh sushi, ramen, and Japanese small plates.",
            "hours": "12 PM - 11 PM",
            "contact_phone": "4445556666",
            "contact_email": "oceanbreeze@example.com",
            "pricing_tier": "$$$",
            "amenities": "Reservations, Indoor Dining",
            "avg_rating": 0.0,
            "review_count": 0,
            "added_by_user_id": str(user_ids[1]),
            "owner_user_id": str(user_ids[1]),
            "created_at": now,
        },
    ]

    restaurant_result = restaurants_collection.insert_many(restaurants)
    restaurant_ids = restaurant_result.inserted_ids

    print("Inserting reviews...")
    reviews = [
        {
            "user_id": str(user_ids[0]),
            "restaurant_id": str(restaurant_ids[0]),
            "rating": 5,
            "comment": "Excellent pasta and great atmosphere.",
            "photo_url": None,
            "created_at": now,
        },
        {
            "user_id": str(user_ids[1]),
            "restaurant_id": str(restaurant_ids[0]),
            "rating": 4,
            "comment": "Loved the pizza, would come again.",
            "photo_url": None,
            "created_at": now,
        },
        {
            "user_id": str(user_ids[2]),
            "restaurant_id": str(restaurant_ids[2]),
            "rating": 5,
            "comment": "Authentic flavors and generous portions.",
            "photo_url": None,
            "created_at": now,
        },
        {
            "user_id": str(user_ids[0]),
            "restaurant_id": str(restaurant_ids[1]),
            "rating": 4,
            "comment": "Solid burger and crispy fries.",
            "photo_url": None,
            "created_at": now,
        },
        {
            "user_id": str(user_ids[1]),
            "restaurant_id": str(restaurant_ids[4]),
            "rating": 5,
            "comment": "Very fresh sushi and beautiful presentation.",
            "photo_url": None,
            "created_at": now,
        },
    ]
    reviews_collection.insert_many(reviews)

    print("Updating restaurant ratings...")
    for restaurant_id in restaurant_ids:
        restaurant_reviews = list(
            reviews_collection.find({"restaurant_id": str(restaurant_id)})
        )
        review_count = len(restaurant_reviews)
        avg_rating = (
            sum(float(r["rating"]) for r in restaurant_reviews) / review_count
            if review_count > 0
            else 0.0
        )

        restaurants_collection.update_one(
            {"_id": restaurant_id},
            {"$set": {"review_count": review_count, "avg_rating": avg_rating}},
        )

    print("Inserting favorites...")
    favorites = [
        {"user_id": str(user_ids[0]), "restaurant_id": str(restaurant_ids[2])},
        {"user_id": str(user_ids[1]), "restaurant_id": str(restaurant_ids[0])},
        {"user_id": str(user_ids[2]), "restaurant_id": str(restaurant_ids[1])},
    ]
    favorites_collection.insert_many(favorites)

    print("Done seeding database.")
    print("Users created:")
    print("john@example.com / 123456")
    print("sarah@example.com / 123456")
    print("ali@example.com / 123456")


if __name__ == "__main__":
    main()