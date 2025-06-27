"""
Main FastAPI application entry point.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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
