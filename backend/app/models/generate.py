from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Ingredient(BaseModel):
    name: str
    percent: float
    cost_per_100ml: float
    function: Optional[str] = None
    safety_notes: Optional[str] = None

class Formulation(BaseModel):
    product_name: str
    ingredients: List[Ingredient]
    reasoning: str
    estimated_cost: float
    safety_notes: List[str]
    instructions: Optional[str] = None
    packaging: Optional[Dict[str, Any]] = None
    marketing_inspiration: Optional[Dict[str, Any]] = None

class GenerateRequest(BaseModel):
    prompt: str
    category: Optional[str] = None
    target_cost: Optional[float] = None

class GenerateResponse(BaseModel):
    formulation: Formulation
    success: bool
    message: Optional[str] = None 