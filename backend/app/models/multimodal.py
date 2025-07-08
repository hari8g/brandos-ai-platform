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
    
    # Enhanced fields for comprehensive analysis
    product_category: Optional[str] = None
    intended_use: Optional[str] = None
    key_ingredients: List[str] = []
    claims: List[str] = []
    packaging_type: Optional[str] = None
    packaging_size: Optional[str] = None
    packaging_material: Optional[str] = None
    target_audience: Optional[str] = None
    brand_style: Optional[str] = None
    competitor_positioning: Optional[str] = None
    
    # New rich fields for comprehensive analysis
    formulation_insights: List[str] = []
    market_positioning: Optional[str] = None
    consumer_insights: List[str] = []
    price_positioning: Optional[str] = None
    distribution_channels: List[str] = []
    sustainability_aspects: List[str] = []
    innovation_claims: List[str] = []
    brand_story: Optional[str] = None
    usage_instructions: Optional[str] = None
    storage_requirements: Optional[str] = None
    
    # Intent classification fields
    intent_classification: Optional[Dict[str, Any]] = None

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