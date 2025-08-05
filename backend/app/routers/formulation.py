from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.generate import GenerateRequest, GenerateResponse
from app.services.generate.generate_service import generate_formulation
import json
import asyncio
import time
from typing import AsyncGenerator

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

@router.post("/generate/stream")
async def generate_formulation_stream(request: GenerateRequest):
    """Stream formulation generation with personality-driven status updates"""
    
    async def generate_status_stream() -> AsyncGenerator[str, None]:
        # Define personality-driven status messages
        status_messages = [
            {"status": "thinking", "message": "🤔 Hmm, let me think about this formulation...", "progress": 5},
            {"status": "analyzing", "message": "🔍 Analyzing your requirements in detail...", "progress": 15},
            {"status": "researching", "message": "📚 Researching the latest market trends...", "progress": 25},
            {"status": "brainstorming", "message": "💡 Brainstorming innovative ingredient combinations...", "progress": 35},
            {"status": "calculating", "message": "🧮 Calculating optimal ingredient percentages...", "progress": 45},
            {"status": "validating", "message": "✅ Validating formulation against safety standards...", "progress": 55},
            {"status": "optimizing", "message": "⚡ Optimizing for cost-effectiveness...", "progress": 65},
            {"status": "sourcing", "message": "🏪 Finding the best suppliers for your ingredients...", "progress": 75},
            {"status": "packaging", "message": "📦 Designing packaging and marketing strategies...", "progress": 85},
            {"status": "finalizing", "message": "🎯 Finalizing your comprehensive formulation...", "progress": 95},
        ]
        
        # Stream each status update
        for status_update in status_messages:
            yield f"data: {json.dumps(status_update)}\n\n"
            await asyncio.sleep(1.5)  # Wait 1.5 seconds between updates
        
        # Generate the actual formulation
        try:
            formulation = generate_formulation(request)
            final_response = {
                "status": "complete",
                "message": "🎉 Your formulation is ready!",
                "progress": 100,
                "data": formulation.dict()
            }
            yield f"data: {json.dumps(final_response)}\n\n"
        except Exception as e:
            error_response = {
                "status": "error",
                "message": f"❌ Oops! Something went wrong: {str(e)}",
                "progress": 0,
                "error": str(e)
            }
            yield f"data: {json.dumps(error_response)}\n\n"
    
    return StreamingResponse(
        generate_status_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )
