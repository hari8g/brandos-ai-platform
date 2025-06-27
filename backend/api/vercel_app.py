"""
Vercel serverless function entry point for the BrandOS AI Platform API.
"""
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.main import app

# Export the FastAPI app for Vercel
handler = app 