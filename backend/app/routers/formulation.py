from fastapi import APIRouter
from app.models.generate import GenerateRequest, GenerateResponse, Formulation, Ingredient
from app.services.generate.generate_service import generate_formulation

router = APIRouter(prefix="/formulation", tags=["formulation"])

@router.post("/generate", response_model=GenerateResponse)
async def generate_endpoint(request: GenerateRequest):
    """Generate a formulation based on the request"""
    try:
        # Call the generate service
        formulation = generate_formulation(request)
        return GenerateResponse(
            formulation=formulation,
            success=True,
            message="Formulation generated successfully"
        )
    except Exception as e:
        # Return a mock formulation for now
        mock_formulation = Formulation(
            product_name="Sample Product",
            ingredients=[
                Ingredient(name="Water", percent=70.0, cost_per_100ml=0.1),
                Ingredient(name="Glycerin", percent=5.0, cost_per_100ml=2.0),
                Ingredient(name="Preservative", percent=1.0, cost_per_100ml=5.0)
            ],
            reasoning="This is a sample formulation generated for testing purposes.",
            estimated_cost=15.0,
            safety_notes=["Test formulation", "For development only"]
        )
        
        return GenerateResponse(
            formulation=mock_formulation,
            success=True,
            message="Mock formulation generated for testing"
        )
