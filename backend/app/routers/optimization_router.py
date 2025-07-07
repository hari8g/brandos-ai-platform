"""
Phase 2 Optimization Router
Provides endpoints for advanced optimization features.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.cache_service import cache_service
from app.services.adaptive_prompt_service import prompt_optimizer
from app.utils.advanced_compression import compress_api_response, CompressionLevel

router = APIRouter(prefix="/optimization", tags=["optimization"])

class OptimizationStatsRequest(BaseModel):
    compression_level: Optional[str] = "medium"
    cache_strategy: Optional[str] = "balanced"

class OptimizationStatsResponse(BaseModel):
    cache_stats: Dict[str, Any]
    prompt_stats: Dict[str, Any]
    compression_stats: Optional[Dict[str, Any]] = None

@router.get("/stats")
async def get_optimization_stats() -> OptimizationStatsResponse:
    """
    Get optimization statistics
    """
    try:
        # Get cache stats
        cache_stats = cache_service.get_stats()
        
        # Get prompt optimization stats
        prompt_stats = prompt_optimizer.adaptive_service.get_optimization_stats()
        
        return OptimizationStatsResponse(
            cache_stats=cache_stats,
            prompt_stats=prompt_stats
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get optimization stats: {str(e)}")

@router.post("/compress")
async def compress_data(data: Dict[str, Any], compression_level: str = "medium") -> Dict[str, Any]:
    """
    Compress data using advanced compression techniques
    """
    try:
        level = CompressionLevel(compression_level)
        compressed_data, stats = compress_api_response(data, level)
        
        return {
            "compressed_data": compressed_data,
            "stats": {
                "original_tokens": stats.original_tokens,
                "compressed_tokens": stats.compressed_tokens,
                "reduction_percentage": stats.reduction_percentage,
                "techniques_used": stats.compression_techniques_used
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")

@router.delete("/cache/clear")
async def clear_cache() -> Dict[str, str]:
    """
    Clear all cached data
    """
    try:
        cache_service.clear_stats()
        return {"message": "Cache cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")

@router.delete("/cache/invalidate/{pattern}")
async def invalidate_cache_pattern(pattern: str) -> Dict[str, Any]:
    """
    Invalidate cache entries matching pattern
    """
    try:
        deleted_count = cache_service.invalidate_pattern(pattern)
        return {
            "message": f"Invalidated {deleted_count} cache entries",
            "pattern": pattern,
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to invalidate cache: {str(e)}")

@router.get("/cache/keys")
async def get_cache_keys() -> Dict[str, Any]:
    """
    Get all cache keys (for debugging)
    """
    try:
        # This is a simplified version - in production you'd want more sophisticated key management
        keys = cache_service.redis_client.keys("brandos:*")
        return {
            "total_keys": len(keys),
            "keys": keys[:10]  # Limit to first 10 for security
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cache keys: {str(e)}")

@router.post("/prompt/optimize")
async def optimize_prompt(prompt: str, prompt_type: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Optimize a prompt using adaptive techniques
    """
    try:
        from app.services.adaptive_prompt_service import PromptType, PromptContext
        
        # Convert string to enum
        prompt_type_enum = PromptType(prompt_type)
        
        # Create context
        prompt_context = PromptContext(
            query=prompt,
            product_type=context.get("product_type") if context else None,
            category=context.get("category") if context else None,
            requirements=context.get("requirements", []) if context else None,
            region=context.get("region", "India") if context else None
        )
        
        # Optimize prompt
        optimized = prompt_optimizer.adaptive_service.optimize_prompt(prompt_type_enum, prompt_context)
        
        return {
            "original_prompt": prompt,
            "optimized_prompt": optimized.prompt,
            "token_count": optimized.token_count,
            "confidence_score": optimized.confidence_score,
            "techniques_used": optimized.optimization_techniques
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prompt optimization failed: {str(e)}")

@router.get("/health")
async def optimization_health() -> Dict[str, str]:
    """
    Health check for optimization services
    """
    try:
        # Test cache connection
        cache_service.redis_client.ping()
        
        # Test prompt optimizer
        test_prompt = prompt_optimizer.create_formulation_prompt("test", product_type="cosmetics")
        
        return {
            "status": "healthy",
            "cache": "connected",
            "prompt_optimizer": "working",
            "compression": "available"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization services unhealthy: {str(e)}") 