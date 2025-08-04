from pydantic import BaseModel
from typing import List, Optional

class Suggestion(BaseModel):
    prompt: str
    why: str
    how: str
    score: Optional[float] = None
    manufacturing_ease: Optional[str] = None
    indian_market_trends: Optional[str] = None
    efficacy_performance: Optional[str] = None
    shelf_life: Optional[str] = None

class RecommendedSuggestion(BaseModel):
    suggestion: Suggestion
    recommendation_reason: str
    confidence_score: float
    key_strengths: List[str]

class SuggestionRequest(BaseModel):
    prompt: str
    category: Optional[str] = None

class SuggestionResponse(BaseModel):
    suggestions: List[Suggestion]
    recommended_suggestion: Optional[RecommendedSuggestion] = None
    success: bool = True
    message: str = "Suggestions generated successfully"
    error: Optional[str] = None 