from pydantic import BaseModel
from typing import List, Optional
from .generate import GenerateResponse

class BrandNameSuggestion(BaseModel):
    name: str
    meaning: str
    category: str  # "modern", "traditional", "premium", "eco-friendly"
    reasoning: str
    availability_check: str

class SocialMediaChannel(BaseModel):
    platform: str  # "Instagram", "TikTok", "YouTube", "LinkedIn", "Facebook"
    content_strategy: str
    target_audience: str
    post_frequency: str
    content_ideas: List[str]
    hashtag_strategy: List[str]
    engagement_tips: List[str]

class BrandingStrategy(BaseModel):
    brand_name_suggestions: List[BrandNameSuggestion]
    social_media_channels: List[SocialMediaChannel]
    overall_branding_theme: str
    brand_personality: str
    visual_identity_guidelines: List[str]
    marketing_messaging: List[str]

class BrandingRequest(BaseModel):
    formulation: GenerateResponse
    target_audience: Optional[str] = "general"
    brand_tone: Optional[str] = "modern"  # "modern", "traditional", "premium", "eco-friendly"
    region: Optional[str] = "IN"

class BrandingResponse(BaseModel):
    success: bool
    message: str
    branding_strategy: Optional[BrandingStrategy] = None
    error: Optional[str] = None 