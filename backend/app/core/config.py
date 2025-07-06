# backend/app/core/config.py

from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List, Optional

class Settings(BaseSettings):
    # API metadata
    PROJECT_NAME: str = "Brandos AI Platform API"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"

    # CORS origins (add your production UI host here)
    CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:5173",       # Vite dev server
        "http://127.0.0.1:5173",       # alternate host
        # "https://app.yourdomain.com", # add your prod domain
    ]

    # Mailchimp Configuration
    MAILCHIMP_API_KEY: Optional[str] = None
    MAILCHIMP_SERVER_PREFIX: Optional[str] = None
    MAILCHIMP_LIST_ID: Optional[str] = None

    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = None

    model_config = {
        "extra": "allow"
    }

# instantiate for import
settings = Settings()
