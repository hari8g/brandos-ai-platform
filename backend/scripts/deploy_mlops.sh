#!/bin/bash
echo "🚀 Deploying MLOps infrastructure..."

# Start MLflow
echo "📊 Starting MLflow..."
cd mlops/mlflow
./start_mlflow.sh &
MLFLOW_PID=$!

# Wait for MLflow to start
sleep 5

# Start training services
echo "📚 Starting training services..."
cd ../training/formulation_generator
docker build -t brandos-ai/formulation-generator .
docker run -d --name formulation-generator brandos-ai/formulation-generator

echo "✅ MLOps infrastructure deployed!"
echo "📊 MLflow: http://localhost:5000"
echo "🤖 Training services: Running in Docker" 