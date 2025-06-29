from pydantic import BaseModel
from typing import List, Optional
from .generate import Formulation

class CostEstimate(BaseModel):
    raw_materials: float
    margin: float
    total: float
    breakdown: Optional[dict] = None
    currency: str = "INR" 