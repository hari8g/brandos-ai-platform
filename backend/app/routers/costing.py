"""
FastAPI router for costing and pricing
"""
from fastapi import APIRouter
from app.models.costing import CostingRequest, CostingResponse
from app.services.costing.costing_service import estimate_cost

router = APIRouter(prefix="/costing", tags=["costing"])

@router.post("/estimate", response_model=CostingResponse)
async def estimate_costing(request: CostingRequest):
    """Estimate costs and pricing for different batch sizes"""
    try:
        cost_estimate = estimate_cost(request)
        
        return CostingResponse(
            success=True,
            message="Cost estimate generated successfully",
            cost_estimate=cost_estimate
        )
    
    except Exception as e:
        return CostingResponse(
            success=False,
            message="Error generating cost estimate",
            error=str(e)
        ) 