#!/usr/bin/env bash
set -e

PROJECT_ROOT="backend"
MLOPS_DIR="$PROJECT_ROOT/mlops"

echo "🚀 Setting up BrandOS AI Platform Backend..."

# Create main backend structure
mkdir -p "$PROJECT_ROOT"/{api,core,models,services,utils,tests,config,docs}

# Create API structure
mkdir -p "$PROJECT_ROOT/api"/{routes,middleware,controllers,schemas}
mkdir -p "$PROJECT_ROOT/api/v1"

# Create core modules
mkdir -p "$PROJECT_ROOT/core"/{database,cache,logging,config}
mkdir -p "$PROJECT_ROOT/models"/{ml,data,domain}
mkdir -p "$PROJECT_ROOT/services"/{ai,formulation,validation,optimization}

# Create MLOps structure
mkdir -p "$MLOPS_DIR"

cd "$MLOPS_DIR"

# Top-level README
cat > README.md << 'EOF'
# MLOps for BrandOS AI Platform

This folder contains all MLOps pipelines, training projects, serving services,
pipeline orchestrations, experiment tracking configs, and shared utilities for
the BrandOS AI Platform.

## Structure
- training/: Model training pipelines
- serving/: Model serving services
- pipelines/: Orchestration (Airflow, Kubeflow)
- mlflow/: Experiment tracking
- utils/: Shared utilities
- infra/: Infrastructure as code
EOF

# Training sub-folders
mkdir -p training/formulation_generator/{data,src,config,notebooks}
mkdir -p training/ingredient_optimizer/{data,src,config,notebooks}
mkdir -p training/ph_predictor/{data,src,config,notebooks}
mkdir -p training/cost_estimator/{data,src,config,notebooks}

# Serving sub-folders
mkdir -p serving/formulation_service
mkdir -p serving/optimization_service
mkdir -p serving/validation_service
mkdir -p serving/ai_service

# Pipelines
mkdir -p pipelines/airflow_dags
mkdir -p pipelines/kubeflow
mkdir -p pipelines/argo

# MLflow config
mkdir -p mlflow
cat > mlflow/mlflow_config.yaml << 'EOF'
# MLflow tracking server configuration
backend_store_uri: sqlite:///mlflow.db
default_artifact_root: ./mlflow/artifacts
EOF

# Shared utils
mkdir -p utils
cat > utils/__init__.py << 'EOF'
# Shared utilities for MLOps pipelines
EOF

cat > utils/database_client.py << 'EOF'
"""
Shared database client for MLOps pipelines.
"""
import psycopg2
from sqlalchemy import create_engine
import os

def get_postgres_client():
    """Get PostgreSQL client connection."""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'brandos_ai'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password')
    )

def get_sqlalchemy_engine():
    """Get SQLAlchemy engine."""
    return create_engine(
        f"postgresql://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'brandos_ai')}"
    )
EOF

cat > utils/redis_client.py << 'EOF'
"""
Shared Redis client for MLOps pipelines.
"""
import redis
import os

def get_redis_client():
    """Get Redis client connection."""
    return redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        db=int(os.getenv('REDIS_DB', 0)),
        decode_responses=True
    )
EOF

# Infrastructure
mkdir -p infra/{docker,kubernetes,terraform}
mkdir -p infra/docker/{development,production,testing}

echo "✅ Backend folder structure created under $PROJECT_ROOT"
echo "✅ MLOps folder structure created under $MLOPS_DIR"

cd ..

# Create main backend files
echo "📝 Creating main backend files..."

# Requirements files
cat > requirements.txt << 'EOF'
# Core dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.23
alembic==1.13.1
psycopg2-binary==2.9.9

# Cache
redis==5.0.1

# ML/AI
numpy==1.24.3
pandas==2.1.4
scikit-learn==1.3.2
torch==2.1.1
transformers==4.36.0

# Utilities
python-dotenv==1.0.0
httpx==0.25.2
pytest==7.4.3
pytest-asyncio==0.21.1

# Monitoring
prometheus-client==0.19.0
structlog==23.2.0
EOF

cat > requirements-dev.txt << 'EOF'
-r requirements.txt

# Development dependencies
black==23.11.0
isort==5.12.0
flake8==6.1.0
mypy==1.7.1
pre-commit==3.6.0
jupyter==1.0.0
ipython==8.18.1
EOF

# Docker files
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/brandos_ai
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./:/app
    command: uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=brandos_ai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mlflow:
    image: python:3.11-slim
    working_dir: /app
    ports:
      - "5000:5000"
    environment:
      - MLFLOW_TRACKING_URI=http://localhost:5000
    volumes:
      - ./mlops:/app
    command: |
      bash -c "pip install mlflow && mlflow server --host 0.0.0.0 --port 5000"

volumes:
  postgres_data:
  redis_data:
EOF

# Configuration files
cat > config/settings.py << 'EOF'
"""
Application settings and configuration.
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "BrandOS AI Platform"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/brandos_ai"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # ML/AI
    MODEL_PATH: str = "./models"
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()
EOF

# Main API file
cat > api/main.py << 'EOF'
"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import formulation, optimization, health

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

@app.get("/")
async def root():
    return {"message": "Welcome to BrandOS AI Platform API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Create route files
mkdir -p api/routes
cat > api/routes/__init__.py << 'EOF'
# API routes package
EOF

cat > api/routes/health.py << 'EOF'
"""
Health check endpoints.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health_check():
    return {"status": "healthy", "service": "brandos-ai-platform"}

@router.get("/ready")
async def readiness_check():
    return {"status": "ready"}
EOF

cat > api/routes/formulation.py << 'EOF'
"""
Formulation generation endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/formulation", tags=["formulation"])

class FormulationRequest(BaseModel):
    text: str
    category: Optional[str] = None

class Ingredient(BaseModel):
    name: str
    percent: float

class FormulationResponse(BaseModel):
    product_name: str
    ingredients: List[Ingredient]
    estimated_cost: float
    predicted_ph: float

@router.post("/generate", response_model=FormulationResponse)
async def generate_formulation(request: FormulationRequest):
    """
    Generate a formulation based on the input text and category.
    """
    try:
        # TODO: Implement actual AI model integration
        # This is a placeholder response
        mock_response = FormulationResponse(
            product_name=f"{request.category or 'Custom'} Formulation",
            ingredients=[
                Ingredient(name="Water", percent=70.0),
                Ingredient(name="Glycerin", percent=5.0),
                Ingredient(name="Niacinamide", percent=2.0),
                Ingredient(name="Salicylic Acid", percent=1.0),
                Ingredient(name="Phenoxyethanol", percent=0.5),
                Ingredient(name="Aloe Vera Juice", percent=15.0),
                Ingredient(name="Vitamin C", percent=1.5),
                Ingredient(name="Ethylhexylglycerin", percent=0.5)
            ],
            estimated_cost=150.0,
            predicted_ph=5.5
        )
        return mock_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
EOF

cat > api/routes/optimization.py << 'EOF'
"""
Formulation optimization endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/optimization", tags=["optimization"])

class OptimizationRequest(BaseModel):
    formulation_id: str
    target_cost: Optional[float] = None
    target_ph: Optional[float] = None

@router.post("/optimize")
async def optimize_formulation(request: OptimizationRequest):
    """
    Optimize an existing formulation.
    """
    try:
        # TODO: Implement optimization logic
        return {"message": "Optimization endpoint - to be implemented"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
EOF

# Create core modules
cat > core/__init__.py << 'EOF'
# Core modules package
EOF

cat > core/database.py << 'EOF'
"""
Database connection and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF

cat > core/cache.py << 'EOF'
"""
Redis cache management.
"""
import redis
from config.settings import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_cache():
    return redis_client
EOF

# Create models
cat > models/__init__.py << 'EOF'
# Models package
EOF

cat > models/domain.py << 'EOF'
"""
Domain models for the application.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from core.database import Base

class Formulation(Base):
    __tablename__ = "formulations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    ingredients = Column(Text)  # JSON string
    estimated_cost = Column(Float)
    predicted_ph = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
EOF

# Create services
cat > services/__init__.py << 'EOF'
# Services package
EOF

cat > services/ai_service.py << 'EOF'
"""
AI/ML service for formulation generation.
"""
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.logger = logger
    
    async def generate_formulation(self, text: str, category: str = None) -> Dict[str, Any]:
        """
        Generate formulation using AI models.
        """
        # TODO: Implement actual AI model integration
        self.logger.info(f"Generating formulation for text: {text}, category: {category}")
        
        # Placeholder implementation
        return {
            "product_name": f"{category or 'Custom'} Formulation",
            "ingredients": [
                {"name": "Water", "percent": 70.0},
                {"name": "Glycerin", "percent": 5.0},
                {"name": "Niacinamide", "percent": 2.0},
                {"name": "Salicylic Acid", "percent": 1.0},
                {"name": "Phenoxyethanol", "percent": 0.5},
                {"name": "Aloe Vera Juice", "percent": 15.0},
                {"name": "Vitamin C", "percent": 1.5},
                {"name": "Ethylhexylglycerin", "percent": 0.5}
            ],
            "estimated_cost": 150.0,
            "predicted_ph": 5.5
        }
EOF

# Create tests
cat > tests/__init__.py << 'EOF'
# Tests package
EOF

cat > tests/test_api.py << 'EOF'
"""
API tests.
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_formulation_generation():
    response = client.post(
        "/api/v1/formulation/generate",
        json={"text": "Create a face serum", "category": "skincare"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "product_name" in data
    assert "ingredients" in data
    assert "estimated_cost" in data
    assert "predicted_ph" in data
EOF

# Create utility scripts
cat > scripts/start_dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting BrandOS AI Platform in development mode..."
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
EOF

cat > scripts/setup_db.sh << 'EOF'
#!/bin/bash
echo "🗄️ Setting up database..."
alembic upgrade head
echo "✅ Database setup complete"
EOF

cat > scripts/run_tests.sh << 'EOF'
#!/bin/bash
echo "🧪 Running tests..."
pytest tests/ -v
EOF

# Make scripts executable
chmod +x scripts/*.sh

# Create .env template
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/brandos_ai

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-here

# ML/AI
MODEL_PATH=./models
MLFLOW_TRACKING_URI=http://localhost:5000

# Logging
LOG_LEVEL=INFO
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
env/
ENV/

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log

# Database
*.db
*.sqlite3

# MLflow
mlflow/

# Docker
.dockerignore

# OS
.DS_Store
Thumbs.db
EOF

echo "🎉 Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.example to .env and configure your environment variables"
echo "2. Install dependencies: pip install -r requirements.txt"
echo "3. Start the development server: ./scripts/start_dev.sh"
echo "4. Run tests: ./scripts/run_tests.sh"
echo ""
echo "🚀 Your BrandOS AI Platform backend is ready!" 