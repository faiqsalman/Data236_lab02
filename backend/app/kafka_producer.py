import json
from confluent_kafka import Producer

from app.config import settings


producer = Producer(
    {
        "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
    }
)


def delivery_report(err, msg):
    if err is not None:
        print(f"Kafka delivery failed: {err}")
    else:
        print(
            f"Kafka delivered to {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}"
        )


def publish_event(topic: str, payload: dict):
    producer.produce(
        topic=topic,
        value=json.dumps(payload).encode("utf-8"),
        callback=delivery_report,
    )
    producer.flush()