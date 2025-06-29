# backend/app/core/cors.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings

def setup_cors(app: FastAPI) -> None:
    """
    Add CORS middleware to the given FastAPI app using origins from settings.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
