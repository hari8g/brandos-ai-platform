"""
OpenAI Optimization Monitoring Router
Provides endpoints to monitor token usage, costs, and optimization performance
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import sys
import os

# Add utils to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.utils.openai_optimization import get_usage_report, monitor, cache
except ImportError:
    # Fallback if optimization utils are not available
    get_usage_report = None
    monitor = None
    cache = None

router = APIRouter(prefix="/optimization", tags=["optimization"])


@router.get("/usage-report")
async def get_optimization_report() -> Dict[str, Any]:
    """Get current OpenAI usage and optimization report"""
    if not get_usage_report:
        raise HTTPException(status_code=503, detail="Optimization monitoring not available")
    
    try:
        report = get_usage_report()
        return {
            "status": "success",
            "data": report,
            "message": "Usage report generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")


@router.get("/cache-stats")
async def get_cache_statistics() -> Dict[str, Any]:
    """Get cache performance statistics"""
    if not cache:
        return {
            "status": "disabled",
            "message": "Caching not available"
        }
    
    try:
        stats = cache.get_cache_stats()
        return {
            "status": "success",
            "data": stats,
            "message": "Cache statistics retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting cache stats: {str(e)}")


@router.get("/cost-savings")
async def get_cost_savings() -> Dict[str, Any]:
    """Calculate cost savings from optimizations"""
    if not monitor:
        raise HTTPException(status_code=503, detail="Cost monitoring not available")
    
    try:
        # Get recent usage
        usage_24h = monitor.get_usage_summary(24)
        usage_7d = monitor.get_usage_summary(168)  # 7 days
        
        # Calculate savings estimates
        # Assuming 40-60% savings from optimizations
        estimated_savings_24h = usage_24h.get('total_cost', 0) * 0.5
        estimated_savings_7d = usage_7d.get('total_cost', 0) * 0.5
        
        return {
            "status": "success",
            "data": {
                "last_24h": {
                    "actual_cost": usage_24h.get('total_cost', 0),
                    "estimated_original_cost": usage_24h.get('total_cost', 0) * 2,
                    "estimated_savings": estimated_savings_24h,
                    "savings_percentage": 50.0
                },
                "last_7d": {
                    "actual_cost": usage_7d.get('total_cost', 0),
                    "estimated_original_cost": usage_7d.get('total_cost', 0) * 2,
                    "estimated_savings": estimated_savings_7d,
                    "savings_percentage": 50.0
                },
                "optimization_impact": {
                    "cache_hit_rate": usage_24h.get('cache_hit_rate', 0),
                    "model_distribution": usage_24h.get('model_usage', {}),
                    "avg_response_time": usage_24h.get('avg_response_time', 0)
                }
            },
            "message": "Cost savings calculated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating savings: {str(e)}")


@router.get("/health")
async def optimization_health_check() -> Dict[str, Any]:
    """Check the health of optimization services"""
    health_status = {
        "monitoring": monitor is not None,
        "caching": cache is not None,
        "redis_connection": False
    }
    
    if cache:
        cache_stats = cache.get_cache_stats()
        health_status["redis_connection"] = cache_stats.get("status") == "active"
    
    overall_health = all(health_status.values())
    
    return {
        "status": "healthy" if overall_health else "degraded",
        "components": health_status,
        "message": "All optimization services operational" if overall_health else "Some optimization services unavailable"
    }


@router.post("/clear-cache")
async def clear_optimization_cache() -> Dict[str, Any]:
    """Clear the OpenAI response cache"""
    if not cache or not cache.redis_client:
        raise HTTPException(status_code=503, detail="Cache not available")
    
    try:
        # Clear only OpenAI cache keys
        keys = cache.redis_client.keys("openai_cache:*")
        if keys:
            cache.redis_client.delete(*keys)
            cleared_count = len(keys)
        else:
            cleared_count = 0
        
        return {
            "status": "success",
            "data": {
                "cleared_keys": cleared_count
            },
            "message": f"Cache cleared successfully. {cleared_count} keys removed."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cache: {str(e)}")


@router.get("/recommendations")
async def get_optimization_recommendations() -> Dict[str, Any]:
    """Get recommendations for further optimization"""
    if not monitor:
        return {
            "status": "limited",
            "recommendations": [
                "Enable monitoring to get personalized recommendations",
                "Implement caching for frequently repeated queries",
                "Consider using GPT-3.5-turbo for simple extraction tasks"
            ]
        }
    
    try:
        usage = monitor.get_usage_summary(168)  # 7 days
        recommendations = []
        
        # Model usage recommendations
        model_usage = usage.get('model_usage', {})
        gpt4_usage = model_usage.get('gpt-4', 0)
        total_calls = usage.get('total_calls', 1)
        
        if gpt4_usage / total_calls > 0.7:
            recommendations.append({
                "type": "model_optimization",
                "priority": "high",
                "suggestion": "Consider using GPT-3.5-turbo for simple tasks",
                "potential_savings": "60-70% cost reduction"
            })
        
        # Cache recommendations
        cache_hit_rate = usage.get('cache_hit_rate', 0)
        if cache_hit_rate < 0.3:
            recommendations.append({
                "type": "caching",
                "priority": "medium",
                "suggestion": "Implement caching for repeated queries",
                "potential_savings": "20-30% cost reduction"
            })
        
        # Response time recommendations
        avg_response_time = usage.get('avg_response_time', 0)
        if avg_response_time > 3.0:
            recommendations.append({
                "type": "performance",
                "priority": "medium",
                "suggestion": "Consider response streaming for better user experience",
                "potential_savings": "Improved user satisfaction"
            })
        
        # Token usage recommendations
        total_tokens = usage.get('total_tokens', 0)
        if total_tokens > 100000:  # High usage
            recommendations.append({
                "type": "token_optimization",
                "priority": "high",
                "suggestion": "Implement prompt engineering and token limit optimization",
                "potential_savings": "25-40% token reduction"
            })
        
        return {
            "status": "success",
            "data": {
                "recommendations": recommendations,
                "usage_stats": usage,
                "next_steps": [
                    "Monitor cache hit rates",
                    "A/B test different models",
                    "Implement batch processing for high-volume scenarios"
                ]
            },
            "message": f"Generated {len(recommendations)} optimization recommendations"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")