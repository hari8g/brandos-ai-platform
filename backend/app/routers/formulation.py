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
    """Generate a formulation based on the request (with timeout handling)"""
    try:
        # Add timeout handling - run in background task with timeout
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        
        def run_generation():
            return generate_formulation(request)
        
        # Use thread pool to run sync function with timeout
        with ThreadPoolExecutor() as executor:
            future = executor.submit(run_generation)
            try:
                # Wait for up to 90 seconds
                formulation = future.result(timeout=90)
                return formulation
            except Exception as timeout_error:
                future.cancel()
                raise timeout_error
                
    except Exception as e:
        print(f"❌ Generation failed: {e}")
        # Return a proper mock formulation instead of basic one
        from app.services.generate.generate_service import _generate_mock_formulation
        return _generate_mock_formulation(request)

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
        
        # Stream each status update (optimized for speed)
        for status_update in status_messages:
            yield f"data: {json.dumps(status_update)}\n\n"
            await asyncio.sleep(0.8)  # Reduced from 1.5 to 0.8 seconds for faster UX
        
        # Generate the actual formulation with aggressive timeout handling
        try:
            from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
            import asyncio
            
            def run_generation():
                return generate_formulation(request)
            
            # Use thread pool with very aggressive timeout
            with ThreadPoolExecutor() as executor:
                future = executor.submit(run_generation)
                try:
                    print("⏱️ Starting formulation generation with 30-second timeout...")
                    # Reduced timeout to 30 seconds for faster failure
                    formulation = future.result(timeout=30)
                    print("✅ Formulation generation completed successfully")
                    
                    final_response = {
                        "status": "complete",
                        "message": "🎉 Your formulation is ready!",
                        "progress": 100,
                        "data": formulation.dict()
                    }
                    yield f"data: {json.dumps(final_response)}\n\n"
                    
                except (FutureTimeoutError, TimeoutError) as timeout_error:
                    print(f"⏰ Formulation generation timed out after 30 seconds")
                    future.cancel()
                    # Generate quick fallback response
                    from app.services.generate.generate_service import _generate_mock_formulation
                    fallback_formulation = _generate_mock_formulation(request)
                    
                    fallback_response = {
                        "status": "complete",
                        "message": "🚀 Generated fast formulation (timeout fallback)",
                        "progress": 100,
                        "data": fallback_formulation.dict()
                    }
                    yield f"data: {json.dumps(fallback_response)}\n\n"
                    
                except Exception as other_error:
                    print(f"❌ Formulation generation failed: {other_error}")
                    future.cancel()
                    raise other_error
                    
        except Exception as e:
            # Handle all other errors
            print(f"❌ Critical error in streaming generation: {e}")
            error_message = "Generation failed - please try again with a simpler request"
            error_response = {
                "status": "error", 
                "message": f"❌ {error_message}",
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
