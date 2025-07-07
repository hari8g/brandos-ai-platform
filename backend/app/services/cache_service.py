"""
Advanced Redis Cache Service for Phase 2 Optimization
Provides intelligent caching with compression and adaptive TTL.
"""

import json
import hashlib
import redis
from typing import Any, Optional, Dict, List
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class CacheStrategy(Enum):
    AGGRESSIVE = "aggressive"  # Cache everything for long periods
    BALANCED = "balanced"      # Cache based on usage patterns
    CONSERVATIVE = "conservative"  # Cache only frequently used data

@dataclass
class CacheStats:
    hits: int = 0
    misses: int = 0
    saves: int = 0
    compression_ratio: float = 0.0
    total_saved_tokens: int = 0

class AdvancedCacheService:
    """
    Advanced caching service with compression and intelligent TTL
    """
    
    def __init__(self, redis_url: str = "redis://localhost:6379", strategy: CacheStrategy = CacheStrategy.BALANCED):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.strategy = strategy
        self.stats = CacheStats()
        
        # Cache patterns for different data types
        self.cache_patterns = {
            "formulation": {"ttl": 3600, "compression": True},  # 1 hour
            "market_research": {"ttl": 7200, "compression": True},  # 2 hours
            "branding": {"ttl": 1800, "compression": True},  # 30 minutes
            "costing": {"ttl": 3600, "compression": True},  # 1 hour
            "scientific": {"ttl": 5400, "compression": True},  # 1.5 hours
            "default": {"ttl": 1800, "compression": False}  # 30 minutes
        }
        
        # Usage tracking for adaptive caching
        self.usage_tracker = {}
        
    def get_cache_key(self, data_type: str, query_hash: str) -> str:
        """
        Generate cache key with type prefix
        """
        return f"brandos:{data_type}:{query_hash}"
    
    def get_query_hash(self, query: str, context: Optional[Dict] = None) -> str:
        """
        Generate hash for query and context
        """
        query_data = {
            "query": query,
            "context": context or {}
        }
        return hashlib.md5(json.dumps(query_data, sort_keys=True).encode()).hexdigest()
    
    def get(self, data_type: str, query: str, context: Optional[Dict] = None) -> Optional[Any]:
        """
        Get cached data with intelligent key generation
        """
        query_hash = self.get_query_hash(query, context)
        cache_key = self.get_cache_key(data_type, query_hash)
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                self.stats.hits += 1
                self._track_usage(data_type, query_hash)
                return json.loads(cached_data)
            else:
                self.stats.misses += 1
                return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    def set(self, data_type: str, query: str, data: Any, context: Optional[Dict] = None, custom_ttl: Optional[int] = None) -> bool:
        """
        Cache data with intelligent TTL and compression
        """
        query_hash = self.get_query_hash(query, context)
        cache_key = self.get_cache_key(data_type, query_hash)
        
        # Get cache pattern
        pattern = self.cache_patterns.get(data_type, self.cache_patterns["default"])
        ttl = custom_ttl or pattern["ttl"]
        
        # Apply adaptive TTL based on strategy
        ttl = self._get_adaptive_ttl(data_type, ttl)
        
        try:
            # Compress data if enabled
            if pattern.get("compression", False):
                data = self._compress_data(data)
            
            # Store in cache
            success = self.redis_client.setex(
                cache_key,
                ttl,
                json.dumps(data, separators=(',', ':'))
            )
            
            if success:
                self.stats.saves += 1
                self._track_usage(data_type, query_hash)
            
            return success
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    def _get_adaptive_ttl(self, data_type: str, base_ttl: int) -> int:
        """
        Get adaptive TTL based on usage patterns and strategy
        """
        if self.strategy == CacheStrategy.AGGRESSIVE:
            return base_ttl * 2
        elif self.strategy == CacheStrategy.CONSERVATIVE:
            return base_ttl // 2
        else:  # BALANCED
            usage_count = self.usage_tracker.get(data_type, 0)
            if usage_count > 10:
                return int(base_ttl * 1.5)
            elif usage_count < 3:
                return int(base_ttl // 1.5)
            else:
                return base_ttl
    
    def _compress_data(self, data: Any) -> Any:
        """
        Compress data for storage
        """
        if isinstance(data, dict):
            compressed = {}
            for key, value in data.items():
                # Compress key names
                compressed_key = self._compress_key(key)
                compressed[compressed_key] = value
            return compressed
        return data
    
    def _compress_key(self, key: str) -> str:
        """
        Compress dictionary keys
        """
        key_mapping = {
            "ingredients": "ing",
            "manufacturing": "mfg",
            "scientific_reasoning": "sci",
            "market_research": "mrkt",
            "branding_strategy": "brand",
            "cost_analysis": "cost",
            "safety_assessment": "safety",
            "recommendations": "rec",
            "benefits": "ben",
            "features": "feat"
        }
        return key_mapping.get(key, key)
    
    def _track_usage(self, data_type: str, query_hash: str):
        """
        Track usage patterns for adaptive caching
        """
        if data_type not in self.usage_tracker:
            self.usage_tracker[data_type] = 0
        self.usage_tracker[data_type] += 1
    
    def invalidate_pattern(self, pattern: str) -> int:
        """
        Invalidate cache entries matching pattern
        """
        try:
            keys = self.redis_client.keys(f"brandos:{pattern}:*")
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
            return 0
    
    def get_stats(self) -> Dict:
        """
        Get cache statistics
        """
        total_requests = self.stats.hits + self.stats.misses
        hit_rate = (self.stats.hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "hits": self.stats.hits,
            "misses": self.stats.misses,
            "saves": self.stats.saves,
            "hit_rate": hit_rate,
            "total_requests": total_requests,
            "usage_patterns": self.usage_tracker
        }
    
    def clear_stats(self):
        """
        Clear cache statistics
        """
        self.stats = CacheStats()
        self.usage_tracker = {}

class CacheMiddleware:
    """
    Middleware for automatic caching of API responses
    """
    
    def __init__(self, cache_service: AdvancedCacheService):
        self.cache_service = cache_service
    
    async def get_cached_response(self, data_type: str, query: str, context: Optional[Dict] = None) -> Optional[Any]:
        """
        Get cached response if available
        """
        return self.cache_service.get(data_type, query, context)
    
    async def cache_response(self, data_type: str, query: str, data: Any, context: Optional[Dict] = None) -> bool:
        """
        Cache API response
        """
        return self.cache_service.set(data_type, query, data, context)

# Global cache service instance
cache_service = AdvancedCacheService()
cache_middleware = CacheMiddleware(cache_service)

# Utility functions for easy integration
async def get_cached_formulation(query: str, context: Optional[Dict] = None) -> Optional[Any]:
    """Get cached formulation data"""
    return await cache_middleware.get_cached_response("formulation", query, context)

async def cache_formulation(query: str, data: Any, context: Optional[Dict] = None) -> bool:
    """Cache formulation data"""
    return await cache_middleware.cache_response("formulation", query, data, context)

async def get_cached_market_research(query: str, context: Optional[Dict] = None) -> Optional[Any]:
    """Get cached market research data"""
    return await cache_middleware.get_cached_response("market_research", query, context)

async def cache_market_research(query: str, data: Any, context: Optional[Dict] = None) -> bool:
    """Cache market research data"""
    return await cache_middleware.cache_response("market_research", query, data, context)

async def get_cached_branding(query: str, context: Optional[Dict] = None) -> Optional[Any]:
    """Get cached branding data"""
    return await cache_middleware.get_cached_response("branding", query, context)

async def cache_branding(query: str, data: Any, context: Optional[Dict] = None) -> bool:
    """Cache branding data"""
    return await cache_middleware.cache_response("branding", query, data, context) 