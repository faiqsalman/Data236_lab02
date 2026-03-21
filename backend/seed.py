from app.database import SessionLocal
from app.models.user import User
from app.models.restaurant import Restaurant
from app.utils.auth import hash_password


USERS = [
    {"name": "Alice Johnson", "email": "alice@example.com", "password": "123456"},
    {"name": "Bob Smith", "email": "bob@example.com", "password": "123456"},
    {"name": "Charlie Brown", "email": "charlie@example.com", "password": "123456"},
    {"name": "David Lee", "email": "david@example.com", "password": "123456"},
    {"name": "Emma Watson", "email": "emma@example.com", "password": "123456"},
]

RESTAURANTS = [
    {
        "name": "Pizza Palace",
        "cuisine_type": "Italian",
        "address": "123 Main St",
        "city": "San Jose",
        "zip_code": "95112",
        "description": "Best pizza in town",
        "hours": "10 AM - 11 PM",
        "contact_phone": "1111111111",
        "contact_email": "pizza@palace.com",
        "pricing_tier": "$$",
        "amenities": "Wifi,Parking",
    },
    {
        "name": "Burger Hub",
        "cuisine_type": "American",
        "address": "456 Elm St",
        "city": "San Jose",
        "zip_code": "95113",
        "description": "Juicy burgers and fries",
        "hours": "9 AM - 10 PM",
        "contact_phone": "2222222222",
        "contact_email": "burger@hub.com",
        "pricing_tier": "$",
        "amenities": "Parking",
    },
    {
        "name": "Spice Garden",
        "cuisine_type": "Indian",
        "address": "789 Oak St",
        "city": "San Jose",
        "zip_code": "95114",
        "description": "Authentic Indian food",
        "hours": "11 AM - 10 PM",
        "contact_phone": "3333333333",
        "contact_email": "spice@garden.com",
        "pricing_tier": "$$",
        "amenities": "Wifi",
    },
    {
        "name": "Dragon Express",
        "cuisine_type": "Chinese",
        "address": "321 Pine St",
        "city": "San Jose",
        "zip_code": "95115",
        "description": "Fast and tasty Chinese food",
        "hours": "10 AM - 9 PM",
        "contact_phone": "4444444444",
        "contact_email": "dragon@express.com",
        "pricing_tier": "$",
        "amenities": "Takeout",
    },
    {
        "name": "Taco Fiesta",
        "cuisine_type": "Mexican",
        "address": "654 Maple St",
        "city": "San Jose",
        "zip_code": "95116",
        "description": "Delicious tacos and burritos",
        "hours": "10 AM - 10 PM",
        "contact_phone": "5555555555",
        "contact_email": "taco@fiesta.com",
        "pricing_tier": "$",
        "amenities": "Outdoor Seating",
    },
]


def seed_users(db):
    created = 0
    for user_data in USERS:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            continue

        user = User(
            name=user_data["name"],
            email=user_data["email"],
            hashed_password=hash_password(user_data["password"]),
        )
        db.add(user)
        created += 1

    db.commit()
    return created


def seed_restaurants(db):
    created = 0
    first_user = db.query(User).order_by(User.id.asc()).first()
    added_by_user_id = first_user.id if first_user else None

    for restaurant_data in RESTAURANTS:
        existing = db.query(Restaurant).filter(Restaurant.name == restaurant_data["name"]).first()
        if existing:
            continue

        restaurant = Restaurant(
            **restaurant_data,
            added_by_user_id=added_by_user_id,
        )
        db.add(restaurant)
        created += 1

    db.commit()
    return created


def main():
    db = SessionLocal()
    try:
        users_created = seed_users(db)
        restaurants_created = seed_restaurants(db)
        print(f"Seed complete. Users added: {users_created}, Restaurants added: {restaurants_created}")
    finally:
        db.close()


if __name__ == "__main__":
    main()