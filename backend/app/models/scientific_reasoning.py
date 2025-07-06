from pydantic import BaseModel
from typing import List, Optional

class KeyComponent(BaseModel):
    name: str
    why: str

class DemographicInfo(BaseModel):
    age_range: str
    income_level: str
    lifestyle: str
    purchase_behavior: str

class PsychographicInfo(BaseModel):
    values: List[str]
    preferences: List[str]
    motivations: List[str]

class ScientificReasoningRequest(BaseModel):
    category: Optional[str] = None
    product_description: Optional[str] = None
    target_concerns: Optional[List[str]] = None

class ScientificReasoningResponse(BaseModel):
    keyComponents: List[KeyComponent]
    impliedDesire: str
    psychologicalDrivers: List[str]
    valueProposition: List[str]
    targetAudience: str
    indiaTrends: List[str]
    regulatoryStandards: List[str]
    demographic_breakdown: Optional[DemographicInfo] = None
    psychographic_profile: Optional[PsychographicInfo] = None
    market_opportunity_summary: Optional[str] = None 