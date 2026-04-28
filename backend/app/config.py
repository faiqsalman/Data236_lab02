from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "yelp_lab2"

    # JWT
    SECRET_KEY: str = "lab2-local-dev-secret-key-123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Ollama
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_REVIEW_CREATED_TOPIC: str = "review.created"
    KAFKA_REVIEW_UPDATED_TOPIC: str = "review.updated"
    KAFKA_REVIEW_DELETED_TOPIC: str = "review.deleted"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()