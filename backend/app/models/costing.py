from pydantic import BaseModel
from typing import List, Optional, Dict
from .generate import GenerateResponse

class BatchPricing(BaseModel):
    batch_size: str  # "small" (100-500 units), "medium" (1000-5000 units), "large" (10000+ units)
    unit_cost: float
    total_cost: float
    retail_price: float
    wholesale_price: float
    profit_margin: float
    currency: str = "INR"

class CostEstimate(BaseModel):
    raw_materials: float
    labor_cost: float
    packaging_cost: float
    overhead_cost: float
    quality_control_cost: Optional[float] = None
    total_production_cost: float
    margin: float
    total: float
    breakdown: Optional[Dict] = None
    currency: str = "INR"
    batch_pricing: Optional[List[BatchPricing]] = None
    premium_factors: Optional[List[str]] = None
    cost_optimization_suggestions: Optional[List[str]] = None

class CostingRequest(BaseModel):
    formulation: GenerateResponse
    batch_sizes: List[str] = ["small", "medium", "large"]
    target_market: Optional[str] = "premium"  # "premium", "mid-market", "budget"
    region: Optional[str] = "IN"  # for currency and pricing context

class CostingResponse(BaseModel):
    success: bool
    message: str
    cost_estimate: Optional[CostEstimate] = None
    error: Optional[str] = None 