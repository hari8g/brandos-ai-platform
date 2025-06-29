"""
Main FastAPI application entry point.
"""
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

# Load environment variables from .env file in project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
dotenv_path = os.path.join(project_root, '.env')
print(f"Loading .env from: {dotenv_path}")
load_dotenv(dotenv_path)
print(f"OPENAI_API_KEY loaded: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import formulation, optimization, health, query_assessment

app = FastAPI(
    title="BrandOS AI Platform API",
    description="AI-powered formulation generation and optimization platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(formulation.router, prefix="/api/v1")
app.include_router(optimization.router, prefix="/api/v1")
app.include_router(query_assessment.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to BrandOS AI Platform API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
