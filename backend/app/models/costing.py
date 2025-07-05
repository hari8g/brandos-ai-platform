from pydantic import BaseModel
from typing import List, Optional, Dict
from .generate import GenerateResponse

class BatchPricing(BaseModel):
    batch_size: str  # "small", "medium", "large"
    units: int
    unit_cost: float
    total_cost: float
    retail_price_30ml: float
    retail_price_50ml: float
    retail_price_100ml: float
    wholesale_price: float
    profit_margin: float
    currency: str = "INR"

class SimpleCostEstimate(BaseModel):
    batch_pricing: List[BatchPricing]
    total_ingredient_cost: float
    manufacturing_cost: float
    packaging_cost: float
    overhead_cost: float
    currency: str = "INR"
    pricing_strategy: str
    market_positioning: str

class CostingRequest(BaseModel):
    formulation: GenerateResponse
    batch_sizes: List[str] = ["small", "medium", "large"]
    target_market: Optional[str] = "premium"  # "premium", "mid-market", "budget"
    region: Optional[str] = "IN"  # for currency and pricing context

class CostingResponse(BaseModel):
    success: bool
    message: str
    cost_estimate: Optional[SimpleCostEstimate] = None
    error: Optional[str] = None 