from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from fastapi import UploadFile

class ImageAnalysisRequest(BaseModel):
    """Request model for image analysis"""
    prompt: str
    category: Optional[str] = None
    target_cost: Optional[str] = None
    image_description: Optional[str] = None
    image_analysis: Optional[Dict[str, Any]] = None

class ImageAnalysisResponse(BaseModel):
    """Response model for image analysis"""
    success: bool
    image_analysis: Dict[str, Any]
    enhanced_prompt: str
    product_insights: List[str]
    visual_elements: List[str]
    color_scheme: Optional[str] = None
    packaging_style: Optional[str] = None
    target_audience_hints: List[str]
    brand_name: Optional[str] = None
    error: Optional[str] = None

class MultiModalRequest(BaseModel):
    """Combined text and image analysis request"""
    text_prompt: str
    category: Optional[str] = None
    target_cost: Optional[str] = None
    image_analysis: Optional[Dict[str, Any]] = None
    fusion_strategy: str = "enhanced"  # "enhanced", "balanced", "image_primary"

class MultiModalResponse(BaseModel):
    """Response for multi-modal fusion"""
    success: bool
    fused_prompt: str
    image_insights: Dict[str, Any]
    text_enhancements: List[str]
    formulation: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ImageUploadResponse(BaseModel):
    """Response for image upload and processing"""
    success: bool
    image_url: Optional[str] = None
    analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class MultimodalSuggestion(BaseModel):
    prompt: str
    why: str
    how: str

class MultimodalSuggestionRequest(BaseModel):
    enhanced_prompt: str
    image_analysis: Dict[str, Any]
    category: Optional[str] = None

class MultimodalSuggestionResponse(BaseModel):
    suggestions: List[MultimodalSuggestion]
    success: bool = True
    message: str = "Multimodal suggestions generated successfully"
    error: Optional[str] = None 