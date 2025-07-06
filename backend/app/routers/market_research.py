"""
FastAPI router for market research analysis
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.services.market_research_service import MarketResearchService

router = APIRouter(prefix="/market-research", tags=["market-research"])

class MarketSizeRequest(BaseModel):
    product_name: str
    category: str
    ingredients: List[dict]

class MarketSizeResponse(BaseModel):
    success: bool
    message: str
    current_market_size: Optional[str] = None
    growth_rate: Optional[str] = None
    market_drivers: Optional[List[str]] = None
    competitive_landscape: Optional[List[str]] = None
    pricing_analysis: Optional[dict] = None
    distribution_channels: Optional[List[str]] = None
    methodology: Optional[str] = None
    data_sources: Optional[List[str]] = None
    confidence_level: Optional[str] = None
    product_segment: Optional[str] = None
    ingredient_premium_factor: Optional[str] = None
    unique_selling_points: Optional[List[str]] = None
    error: Optional[str] = None

@router.post("/current-market-size", response_model=MarketSizeResponse)
async def get_current_market_size(request: MarketSizeRequest):
    """Get current market size specifically for the product the user wants to build"""
    try:
        service = MarketResearchService()
        market_data = service.get_current_market_size(
            request.product_name,
            request.category,
            request.ingredients
        )
        
        return MarketSizeResponse(
            success=True,
            message="Current market size analysis generated successfully",
            current_market_size=market_data.get("current_market_size"),
            growth_rate=market_data.get("growth_rate"),
            market_drivers=market_data.get("market_drivers"),
            competitive_landscape=market_data.get("competitive_landscape"),
            pricing_analysis=market_data.get("pricing_analysis"),
            distribution_channels=market_data.get("distribution_channels"),
            methodology=market_data.get("methodology"),
            data_sources=market_data.get("data_sources"),
            confidence_level=market_data.get("confidence_level"),
            product_segment=market_data.get("product_segment"),
            ingredient_premium_factor=market_data.get("ingredient_premium_factor"),
            unique_selling_points=market_data.get("unique_selling_points")
        )
    
    except Exception as e:
        return MarketSizeResponse(
            success=False,
            message="Error generating current market size analysis",
            error=str(e)
        ) 