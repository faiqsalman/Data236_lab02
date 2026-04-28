import json
from datetime import datetime, timezone

from bson import ObjectId
from confluent_kafka import Consumer

from app.config import settings
from app.database import reviews_collection, restaurants_collection


def recalculate_restaurant_rating(restaurant_id: str):
    reviews = list(reviews_collection.find({"restaurant_id": restaurant_id}))
    review_count = len(reviews)
    avg_rating = (
        sum(float(review.get("rating", 0)) for review in reviews) / review_count
        if review_count > 0
        else 0.0
    )

    restaurants_collection.update_one(
        {"_id": ObjectId(restaurant_id)},
        {"$set": {"review_count": review_count, "avg_rating": avg_rating}},
    )


def handle_review_created(event: dict):
    review_doc = {
        "user_id": event["user_id"],
        "restaurant_id": event["restaurant_id"],
        "rating": event["rating"],
        "comment": event.get("comment"),
        "photo_url": event.get("photo_url"),
        "created_at": datetime.now(timezone.utc),
    }
    reviews_collection.insert_one(review_doc)
    recalculate_restaurant_rating(event["restaurant_id"])


def handle_review_updated(event: dict):
    review_id = event["review_id"]
    updates = {
        "rating": event.get("rating"),
        "comment": event.get("comment"),
    }
    updates = {k: v for k, v in updates.items() if v is not None}

    review = reviews_collection.find_one({"_id": ObjectId(review_id)})
    if not review:
        print(f"Review not found for update: {review_id}")
        return

    reviews_collection.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": updates},
    )
    recalculate_restaurant_rating(review["restaurant_id"])


def handle_review_deleted(event: dict):
    review_id = event["review_id"]
    review = reviews_collection.find_one({"_id": ObjectId(review_id)})
    if not review:
        print(f"Review not found for delete: {review_id}")
        return

    restaurant_id = review["restaurant_id"]
    reviews_collection.delete_one({"_id": ObjectId(review_id)})
    recalculate_restaurant_rating(restaurant_id)


def main():
    consumer = Consumer(
        {
            "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
            "group.id": "review-worker-group",
            "auto.offset.reset": "earliest",
        }
    )

    topics = [
        settings.KAFKA_REVIEW_CREATED_TOPIC,
        settings.KAFKA_REVIEW_UPDATED_TOPIC,
        settings.KAFKA_REVIEW_DELETED_TOPIC,
    ]

    consumer.subscribe(topics)
    print(f"Review worker listening on: {topics}")

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                print(f"Kafka error: {msg.error()}")
                continue

            topic = msg.topic()
            event = json.loads(msg.value().decode("utf-8"))
            print(f"Received event on {topic}: {event}")

            if topic == settings.KAFKA_REVIEW_CREATED_TOPIC:
                handle_review_created(event)
            elif topic == settings.KAFKA_REVIEW_UPDATED_TOPIC:
                handle_review_updated(event)
            elif topic == settings.KAFKA_REVIEW_DELETED_TOPIC:
                handle_review_deleted(event)

    except KeyboardInterrupt:
        print("Stopping review worker...")
    finally:
        consumer.close()


if __name__ == "__main__":
    main()