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

class SuggestionRequest(BaseModel):
    prompt: str
    category: Optional[str] = None

class SuggestionResponse(BaseModel):
    suggestions: List[Suggestion]
    success: bool = True
    message: str = "Suggestions generated successfully"
    error: Optional[str] = None 