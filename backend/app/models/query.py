from pydantic import BaseModel
from typing import List, Optional

class Suggestion(BaseModel):
    text: str
    why: str
    how: str

class SuggestionRequest(BaseModel):
    prompt: str
    category: Optional[str] = None

class SuggestionResponse(BaseModel):
    suggestions: List[Suggestion]
    success: bool = True
    message: str = "Suggestions generated successfully"
    error: Optional[str] = None 