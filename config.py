from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "EduGenie"
    app_version: str = "1.0.0"
    gemini_api_key: str = ""
    demo_mode: bool = True
    use_local_explainer: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

@lru_cache
def get_settings():
    return Settings()