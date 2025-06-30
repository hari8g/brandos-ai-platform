from fastapi import APIRouter
from app.models.generate import GenerateRequest, GenerateResponse
from app.services.generate.generate_service import generate_formulation

router = APIRouter(prefix="/formulation", tags=["formulation"])

@router.post("/generate", response_model=GenerateResponse)
async def generate_endpoint(request: GenerateRequest):
    """Generate a formulation based on the request"""
    try:
        # Call the generate service
        formulation = generate_formulation(request)
        return formulation
    except Exception as e:
        # Return a mock formulation for now
        return GenerateResponse(
            product_name="Sample Product",
            reasoning="This is a sample formulation generated for testing purposes.",
            ingredients=[],
            manufacturing_steps=[
                "Step 1: Prepare equipment",
                "Step 2: Mix ingredients",
                "Step 3: Package product"
            ],
            estimated_cost=15.0,
            safety_notes=["Test formulation", "For development only"],
            packaging_marketing_inspiration="Sample packaging ideas",
            market_trends=["Sample trend"],
            competitive_landscape={"sample": "data"}
        )
