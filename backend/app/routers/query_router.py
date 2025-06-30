"""
FastAPI router for query suggestions
"""
from fastapi import APIRouter
from app.models.query import SuggestionRequest, SuggestionResponse
from app.services.query.suggestions_service import generate_suggestions

router = APIRouter(prefix="/query", tags=["query"])

@router.post("/suggestions", response_model=SuggestionResponse)
async def suggestions_endpoint(request: SuggestionRequest):
    """Generate AI-powered suggestions to refine user queries"""
    try:
        return generate_suggestions(request)
    except Exception as e:
        return SuggestionResponse(
            suggestions=[],
            success=False,
            message="Error generating suggestions",
            error=str(e)
        ) 