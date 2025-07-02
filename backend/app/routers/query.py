"""
FastAPI router for query assessment
"""
from fastapi import APIRouter
from app.models.assess import AssessRequest, AssessResponse
from app.models.query import SuggestionRequest, SuggestionResponse
from app.services.query.suggestions_service import generate_suggestions

router = APIRouter(prefix="/query", tags=["query"])

def assess_query_quality_simple(query: str, category: str | None = None):
    """Simple query quality assessment"""
    if not query:
        query = ""
    
    query_lower = query.lower()
    score = 3
    
    if len(query.split()) > 10:
        score += 1
    if any(word in query_lower for word in ['serum', 'cream', 'gel', 'lotion', 'moisturizer']):
        score += 1
    if any(word in query_lower for word in ['skin', 'face', 'body', 'hair']):
        score += 1
    if any(word in query_lower for word in ['acne', 'aging', 'hydration', 'brightening', 'anti-aging']):
        score += 1
    
    needs_improvement = score < 5
    
    suggestions = [
        "Specify the type of product (serum, cream, gel, lotion, etc.)",
        "Mention your target skin type or concern (oily, dry, sensitive, acne-prone, etc.)",
        "Include any ingredient preferences or restrictions (natural, vegan, fragrance-free, etc.)",
        "Describe the desired texture or performance (lightweight, rich, fast-absorbing, etc.)",
        "Add your target audience (age group, skin concerns, lifestyle)"
    ]
    
    return {
        "score": score,
        "feedback": f"Query scored {score}/7. {'Needs improvement' if needs_improvement else 'Good quality'}. We can still generate a formulation, but more details would help create a more targeted product.",
        "needs_improvement": needs_improvement,
        "suggestions": suggestions,
        "improvement_examples": [
            f"Instead of '{query}', try: 'I need a lightweight serum for oily, acne-prone skin that contains salicylic acid and niacinamide for blemish control'",
            f"Or: 'Create a rich anti-aging night cream for mature, dry skin with retinol and hyaluronic acid, suitable for sensitive skin'"
        ],
        "missing_elements": [],
        "confidence_level": "medium" if score >= 4 else "low",
        "can_generate_formulation": True,
        "formulation_warnings": []
    }

@router.post("/assess", response_model=AssessResponse)
async def assess_query(request: AssessRequest):
    """Assess the quality of a formulation query"""
    try:
        result = assess_query_quality_simple(request.prompt, request.category)
        
        return AssessResponse(
            score=result["score"] / 7.0,  # Normalize to 0-1
            can_generate=result["can_generate_formulation"],
            feedback=result["feedback"],
            suggestions=result["suggestions"]
        )
    
    except Exception as e:
        return AssessResponse(
            score=0.0,
            can_generate=False,
            feedback=f"Error assessing query: {str(e)}"
        )

@router.post("/suggestions", response_model=SuggestionResponse)
async def suggestions(request: SuggestionRequest):
    return generate_suggestions(request) 