#!/bin/bash
echo "🚀 Starting BrandOS AI Platform in development mode..."
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload 