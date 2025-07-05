"""
FastAPI router for branding analysis
"""
from fastapi import APIRouter
from app.models.branding import BrandingRequest, BrandingResponse
from app.services.branding.branding_service import analyze_branding

router = APIRouter(prefix="/branding", tags=["branding"])

@router.post("/analyze", response_model=BrandingResponse)
async def analyze_branding_strategy(request: BrandingRequest):
    """Analyze branding opportunities for the formulation"""
    try:
        branding_strategy = analyze_branding(request)
        
        return BrandingResponse(
            success=True,
            message="Branding strategy generated successfully",
            branding_strategy=branding_strategy
        )
    
    except Exception as e:
        return BrandingResponse(
            success=False,
            message="Error generating branding strategy",
            error=str(e)
        ) 