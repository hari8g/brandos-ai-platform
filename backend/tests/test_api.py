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
