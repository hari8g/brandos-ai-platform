from pydantic import BaseModel
from typing import Optional

class AssessRequest(BaseModel):
    prompt: str
    category: Optional[str] = None

class AssessResponse(BaseModel):
    score: float
    can_generate: bool
    feedback: Optional[str] = None
    suggestions: Optional[list[str]] = None 