from pydantic import BaseModel
from typing import List, Optional, Dict
from .generate import GenerateResponse

class ManufacturingScenario(BaseModel):
    customer_scale: str  # "1000", "10k", "10k_plus"
    batch_size: int
    total_customers: int
    manufacturing_cost: float
    ingredient_cost: float
    packaging_cost: float
    overhead_cost: float
    total_cost: float
    cost_per_unit: float
    retail_price: float
    wholesale_price: float
    profit_margin: float
    revenue_potential: float
    break_even_customers: int
    currency: str = "INR"

class ManufacturingInsights(BaseModel):
    small_scale: ManufacturingScenario
    medium_scale: ManufacturingScenario
    large_scale: ManufacturingScenario
    scaling_benefits: List[str]
    risk_factors: List[str]
    market_opportunity: str

class ManufacturingRequest(BaseModel):
    formulation: GenerateResponse
    target_market: Optional[str] = "premium"
    region: Optional[str] = "IN"

class ManufacturingResponse(BaseModel):
    success: bool
    message: str
    manufacturing_insights: Optional[ManufacturingInsights] = None
    error: Optional[str] = None 