from fastapi import APIRouter, HTTPException, Depends
from app.models.scientific_reasoning import ScientificReasoningRequest, ScientificReasoningResponse
from app.services.scientific_reasoning_service import ScientificReasoningService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["scientific-reasoning"])

# Dependency to get the service
def get_scientific_reasoning_service():
    return ScientificReasoningService()

@router.post("/scientific-reasoning/", response_model=ScientificReasoningResponse)
def generate_scientific_reasoning(
    request: ScientificReasoningRequest,
    service: ScientificReasoningService = Depends(get_scientific_reasoning_service)
) -> ScientificReasoningResponse:
    """
    Generate comprehensive scientific reasoning data for cosmetic formulations.
    
    This endpoint analyzes the provided category or product description and returns
    detailed scientific reasoning including key components, psychological drivers,
    market trends, and regulatory compliance information.
    
    Args:
        request: ScientificReasoningRequest containing category, product description, and target concerns
        
    Returns:
        ScientificReasoningResponse with all required fields populated
        
    Raises:
        HTTPException: If there's an error generating the scientific reasoning
    """
    
    try:
        logger.info(f"Generating scientific reasoning for category: {request.category}")
        
        # Generate scientific reasoning data
        scientific_data = service.generate_scientific_reasoning(request)
        
        logger.info("Scientific reasoning generated successfully")
        return scientific_data
        
    except Exception as e:
        logger.error(f"Error generating scientific reasoning: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate scientific reasoning: {str(e)}"
        )

@router.get("/scientific-reasoning/health")
def health_check():
    """Health check endpoint for scientific reasoning service"""
    return {"status": "healthy", "service": "scientific-reasoning"} 