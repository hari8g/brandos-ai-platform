from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import io
from app.models.multimodal import (
    ImageAnalysisRequest, 
    ImageAnalysisResponse, 
    MultiModalRequest, 
    MultiModalResponse,
    ImageUploadResponse,
    MultimodalSuggestionRequest,
    MultimodalSuggestionResponse,
    MultimodalRecommendationRequest,
    MultimodalRecommendationResponse,
    ComprehensiveAnalysisResponse
)
from app.services.image_analysis_service import image_analysis_service
from app.services.multimodal_fusion_service import multimodal_fusion_service
from app.services.multimodal_suggestions_service import (
    generate_multimodal_suggestions, 
    generate_text_only_suggestions,
    generate_multimodal_recommendation
)
from app.services.comprehensive_analysis_service import ComprehensiveAnalysisService

router = APIRouter(prefix="/multimodal", tags=["multimodal"])

@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image_endpoint(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    category: Optional[str] = Form(None),
    target_cost: Optional[str] = Form(None)
):
    """Analyze an uploaded image and extract product insights with intent classification"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Use integrated analysis (intent classification + image analysis)
        analysis = image_analysis_service.analyze_image_with_intent(image_data, prompt, category)
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

@router.post("/fuse-text-image", response_model=MultiModalResponse)
async def fuse_text_image_endpoint(request: MultiModalRequest):
    """Fuse text prompt with image analysis data"""
    try:
        result = multimodal_fusion_service.fuse_text_and_image(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-modal fusion failed: {str(e)}")

@router.post("/analyze-and-fuse", response_model=MultiModalResponse)
async def analyze_and_fuse_endpoint(
    file: UploadFile = File(...),
    text_prompt: str = Form(...),
    category: Optional[str] = Form(None),
    target_cost: Optional[str] = Form(None),
    fusion_strategy: str = Form("enhanced")
):
    """Analyze image and fuse with text prompt in one operation"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Analyze and fuse
        result = multimodal_fusion_service.analyze_and_fuse(
            text_prompt=text_prompt,
            image_data=image_data,
            category=category,
            target_cost=target_cost,
            strategy=fusion_strategy
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analyze and fuse failed: {str(e)}")

@router.post("/upload-image", response_model=ImageUploadResponse)
async def upload_image_endpoint(file: UploadFile = File(...)):
    """Upload and process an image for later analysis"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and validate image
        image_data = await file.read()
        
        # For now, just return success (in a real app, you'd save to storage)
        return ImageUploadResponse(
            success=True,
            image_url=f"uploaded_{file.filename}",
            analysis=None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@router.post("/suggestions", response_model=MultimodalSuggestionResponse)
async def multimodal_suggestions_endpoint(request: MultimodalSuggestionRequest):
    """Generate AI-powered suggestions based on image analysis and enhanced prompt"""
    try:
        return generate_multimodal_suggestions(request)
    except Exception as e:
        return MultimodalSuggestionResponse(
            suggestions=[],
            success=False,
            message="Error generating multimodal suggestions",
            error=str(e)
        )

@router.post("/recommendation", response_model=MultimodalRecommendationResponse)
async def multimodal_recommendation_endpoint(request: MultimodalRecommendationRequest):
    """Generate AI-powered recommendation based on image analysis with scoring for efficacy, Indian trends, manufacturing ease, and shelf life"""
    try:
        return generate_multimodal_recommendation(request)
    except Exception as e:
        return MultimodalRecommendationResponse(
            success=False,
            message="Error generating multimodal recommendation",
            error=str(e)
        )

@router.post("/text-suggestions", response_model=MultimodalSuggestionResponse)
async def text_only_suggestions_endpoint(
    text_prompt: str = Form(...),
    category: Optional[str] = Form(None)
):
    """Generate AI-powered suggestions based on text prompt only (no image)"""
    try:
        return generate_text_only_suggestions(text_prompt, category)
    except Exception as e:
        return MultimodalSuggestionResponse(
            suggestions=[],
            success=False,
            message="Error generating text-only suggestions",
            error=str(e)
        )

@router.post("/comprehensive-analysis", response_model=ComprehensiveAnalysisResponse)
async def comprehensive_analysis_endpoint(
    enhanced_prompt: str = Form(...),
    category: Optional[str] = Form(None)
):
    """Generate comprehensive 6-step formulation analysis using enhanced prompt"""
    try:
        # Initialize the comprehensive analysis service
        analysis_service = ComprehensiveAnalysisService()
        
        # Generate comprehensive analysis using the enhanced prompt
        result = await analysis_service.generate_comprehensive_analysis(
            enhanced_prompt=enhanced_prompt,
            category=category
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive analysis failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for multi-modal services"""
    return {
        "status": "healthy",
        "services": {
            "image_analysis": "available",
            "multimodal_fusion": "available",
            "multimodal_suggestions": "available",
            "multimodal_recommendation": "available",
            "comprehensive_analysis": "available"
        }
    } 