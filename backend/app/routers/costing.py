"""
FastAPI router for manufacturing analysis
"""
from fastapi import APIRouter
from app.models.costing import ManufacturingRequest, ManufacturingResponse
from app.services.costing.costing_service import analyze_manufacturing

router = APIRouter(prefix="/costing", tags=["manufacturing"])

@router.post("/estimate", response_model=ManufacturingResponse)
async def analyze_manufacturing_scenarios(request: ManufacturingRequest):
    """Analyze manufacturing scenarios for different customer scales"""
    try:
        manufacturing_insights = analyze_manufacturing(request)
        
        return ManufacturingResponse(
            success=True,
            message="Manufacturing analysis generated successfully",
            manufacturing_insights=manufacturing_insights
        )
    
    except Exception as e:
        return ManufacturingResponse(
            success=False,
            message="Error generating manufacturing analysis",
            error=str(e)
        ) 