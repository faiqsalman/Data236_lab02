from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "yelpclone"
    db_user: str = "root"
    db_password: str = ""

    # JWT
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # Ollama
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()