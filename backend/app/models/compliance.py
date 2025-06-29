from pydantic import BaseModel
from typing import List, Optional

class ComplianceRequest(BaseModel):
    ingredients: List[str]
    target_market: Optional[str] = None
    product_type: Optional[str] = None

class ComplianceResponse(BaseModel):
    is_compliant: bool
    issues: List[str]
    warnings: List[str]
    recommendations: List[str] 