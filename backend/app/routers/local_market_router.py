from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import logging
from ..services.local_market_size_service import LocalMarketSizeService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/local-market", tags=["Local Market Analysis"])

class LocalMarketRequest(BaseModel):
    location: str
    category: str
    product_name: Optional[str] = ""
    ingredients: Optional[List[str]] = []

class LocalMarketResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    message: Optional[str] = None

@router.post("/analyze", response_model=LocalMarketResponse)
async def analyze_local_market_size(request: LocalMarketRequest):
    """
    Analyze local market size using population triangulation only.
    """
    try:
        logger.info(f"Starting local market analysis for {request.location} in {request.category} category")
        market_service = LocalMarketSizeService()
        # Ensure product_name is a string and ingredients is a list
        product_name = request.product_name if request.product_name is not None else ""
        ingredients = request.ingredients if request.ingredients is not None else []
        market_data = market_service.analyze_local_market_size(
            location=request.location,
            category=request.category,
            product_name=product_name,
            ingredients=ingredients
        )
        formatted_data = market_service.format_market_data_for_frontend(market_data)
        logger.info(f"Local market analysis completed successfully for {request.location}")
        return LocalMarketResponse(
            success=True,
            data=formatted_data,
            message=f"Local market analysis completed for {request.location}"
        )
    except Exception as e:
        logger.error(f"Error in local market analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze local market size: {str(e)}"
        )

@router.get("/cities")
async def get_available_cities():
    """
    Get list of available cities for local market analysis.
    """
    try:
        market_service = LocalMarketSizeService()
        cities = list(market_service.city_populations.keys())
        
        return {
            "success": True,
            "cities": cities,
            "total_cities": len(cities)
        }
        
    except Exception as e:
        logger.error(f"Error getting available cities: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get available cities: {str(e)}"
        )

@router.get("/categories")
async def get_available_categories():
    """
    Get list of available categories for local market analysis.
    """
    try:
        market_service = LocalMarketSizeService()
        categories = list(market_service.category_config.keys())
        return {
            "success": True,
            "categories": categories,
            "total_categories": len(categories)
        }
    except Exception as e:
        logger.error(f"Error getting available categories: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get available categories: {str(e)}"
        ) 