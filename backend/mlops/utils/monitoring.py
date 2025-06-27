"""
Monitoring utilities for MLOps pipelines.
"""
import logging
from prometheus_client import Counter, Histogram, start_http_server
import time

# Prometheus metrics
PREDICTION_COUNTER = Counter('predictions_total', 'Total number of predictions')
PREDICTION_DURATION = Histogram('prediction_duration_seconds', 'Prediction duration')

def setup_monitoring(port=8000):
    """Setup Prometheus monitoring."""
    start_http_server(port)
    logging.info(f"Prometheus metrics server started on port {port}")

def log_prediction(model_name: str, duration: float, success: bool):
    """Log prediction metrics."""
    PREDICTION_COUNTER.labels(model=model_name, success=success).inc()
    PREDICTION_DURATION.labels(model=model_name).observe(duration)
