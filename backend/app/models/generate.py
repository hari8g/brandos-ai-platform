from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SupplierInfo(BaseModel):
    name: str
    contact: str
    location: str
    price_per_unit: float

class IngredientDetail(BaseModel):
    name: str
    percent: float
    cost_per_100ml: float
    why_chosen: str
    suppliers: List[SupplierInfo]

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

class ScientificReasoning(BaseModel):
    keyComponents: List[Dict[str, str]]
    impliedDesire: str
    targetAudience: str
    indiaTrends: List[str]
    regulatoryStandards: List[str]

class MarketResearch(BaseModel):
    tam: Dict[str, Any]
    sam: Dict[str, Any]
    tm: Dict[str, Any]

class GenerateResponse(BaseModel):
    product_name: str
    reasoning: str
    ingredients: List[IngredientDetail]
    manufacturing_steps: List[str]
    estimated_cost: float
    safety_notes: List[str]
    packaging_marketing_inspiration: Optional[str]
    market_trends: Optional[List[str]]
    competitive_landscape: Optional[dict]
    scientific_reasoning: Optional[ScientificReasoning] = None
    market_research: Optional[MarketResearch] = None 