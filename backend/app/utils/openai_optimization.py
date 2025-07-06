"""
OpenAI Optimization Utilities
Provides caching, monitoring, and smart model selection for token optimization
"""

import os
import json
import hashlib
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


@dataclass
class ApiCallMetrics:
    """Metrics for tracking API call performance"""
    tokens_used: int
    cost: float
    response_time: float
    model: str
    cache_hit: bool
    timestamp: datetime


class OpenAICache:
    """Redis-based caching for OpenAI API responses"""
    
    def __init__(self, redis_url: Optional[str] = None, default_ttl: int = 3600):
        self.default_ttl = default_ttl
        self.redis_client = None
        
        if REDIS_AVAILABLE:
            try:
                redis_url = redis_url or os.getenv('REDIS_URL', 'redis://localhost:6379')
                self.redis_client = redis.from_url(redis_url)
                # Test connection
                self.redis_client.ping()
                print("✅ Redis cache initialized successfully")
            except Exception as e:
                print(f"⚠️ Redis cache initialization failed: {e}")
                self.redis_client = None
        else:
            print("⚠️ Redis not available, caching disabled")
    
    def get_cache_key(self, prompt: str, model: str, max_tokens: int, **kwargs) -> str:
        """Generate cache key from request parameters"""
        content = f"{prompt}:{model}:{max_tokens}:{json.dumps(kwargs, sort_keys=True)}"
        return f"openai_cache:{hashlib.md5(content.encode()).hexdigest()}"
    
    def get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached response"""
        if not self.redis_client:
            return None
        
        try:
            cached = self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"Cache retrieval error: {e}")
        return None
    
    def cache_response(self, cache_key: str, response: Dict[str, Any], ttl: Optional[int] = None) -> None:
        """Cache response with TTL"""
        if not self.redis_client:
            return
        
        try:
            ttl = ttl or self.default_ttl
            self.redis_client.setex(cache_key, ttl, json.dumps(response))
        except Exception as e:
            print(f"Cache storage error: {e}")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.redis_client:
            return {"status": "disabled"}
        
        try:
            info = self.redis_client.info()
            return {
                "status": "active",
                "used_memory": info.get("used_memory_human", "N/A"),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": info.get("keyspace_hits", 0) / max(1, info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0))
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}


class TokenUsageMonitor:
    """Monitor and track token usage and costs"""
    
    def __init__(self):
        self.metrics: List[ApiCallMetrics] = []
        self.model_prices = {
            'gpt-4': {'input': 0.03, 'output': 0.06},
            'gpt-3.5-turbo': {'input': 0.001, 'output': 0.002},
            'gpt-4o-mini': {'input': 0.00015, 'output': 0.0006}
        }
    
    def log_api_call(self, tokens_used: int, model: str, response_time: float, cache_hit: bool = False) -> None:
        """Log API call metrics"""
        cost = self.calculate_cost(tokens_used, model)
        
        metric = ApiCallMetrics(
            tokens_used=tokens_used,
            cost=cost,
            response_time=response_time,
            model=model,
            cache_hit=cache_hit,
            timestamp=datetime.now()
        )
        
        self.metrics.append(metric)
    
    def calculate_cost(self, tokens_used: int, model: str) -> float:
        """Calculate cost based on tokens and model"""
        if model not in self.model_prices:
            return 0.0
        
        # Simplified cost calculation (assuming equal input/output)
        avg_price = (self.model_prices[model]['input'] + self.model_prices[model]['output']) / 2
        return (tokens_used / 1000) * avg_price
    
    def get_usage_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get usage summary for the last N hours"""
        cutoff_time = datetime.now().timestamp() - (hours * 3600)
        recent_metrics = [m for m in self.metrics if m.timestamp.timestamp() > cutoff_time]
        
        if not recent_metrics:
            return {"total_calls": 0, "total_tokens": 0, "total_cost": 0.0}
        
        return {
            "total_calls": len(recent_metrics),
            "total_tokens": sum(m.tokens_used for m in recent_metrics),
            "total_cost": sum(m.cost for m in recent_metrics),
            "avg_response_time": sum(m.response_time for m in recent_metrics) / len(recent_metrics),
            "cache_hit_rate": sum(1 for m in recent_metrics if m.cache_hit) / len(recent_metrics),
            "model_usage": {
                model: len([m for m in recent_metrics if m.model == model])
                for model in set(m.model for m in recent_metrics)
            }
        }


class SmartModelSelector:
    """Intelligent model selection based on task complexity and cost optimization"""
    
    def __init__(self):
        self.models = {
            'simple': 'gpt-4o-mini',      # $0.00015/1K input, $0.0006/1K output
            'standard': 'gpt-3.5-turbo',   # $0.001/1K input, $0.002/1K output
            'complex': 'gpt-4'             # $0.03/1K input, $0.06/1K output
        }
        
        self.task_complexity_rules = {
            'extract': 'simple',
            'classify': 'simple',
            'generate_short': 'standard',
            'generate_long': 'complex',
            'formulate': 'complex'
        }
    
    def get_optimal_model(self, task_type: str, token_estimate: int = 0, force_accuracy: bool = False) -> str:
        """Get the optimal model based on task type and requirements"""
        if force_accuracy:
            return self.models['complex']
        
        # Rule-based selection
        if task_type in self.task_complexity_rules:
            complexity = self.task_complexity_rules[task_type]
            return self.models[complexity]
        
        # Token-based selection
        if token_estimate < 200:
            return self.models['simple']
        elif token_estimate < 1000:
            return self.models['standard']
        else:
            return self.models['complex']
    
    def get_optimal_max_tokens(self, task_type: str, estimated_output: int = 0) -> int:
        """Get optimal max_tokens based on task type"""
        token_limits = {
            'extract': 100,
            'classify': 50,
            'generate_short': 600,
            'generate_long': 3000,
            'formulate': 3000
        }
        
        if task_type in token_limits:
            return token_limits[task_type]
        
        # Fallback to estimated output + 20% buffer
        return max(100, int(estimated_output * 1.2))


class OptimizedOpenAIClient:
    """Wrapper for OpenAI client with caching and monitoring"""
    
    def __init__(self, openai_client, cache: Optional[OpenAICache] = None, 
                 monitor: Optional[TokenUsageMonitor] = None):
        self.client = openai_client
        self.cache = cache or OpenAICache()
        self.monitor = monitor or TokenUsageMonitor()
        self.model_selector = SmartModelSelector()
    
    def create_optimized_completion(self, 
                                   prompt: str,
                                   task_type: str = 'generate_short',
                                   model: Optional[str] = None,
                                   max_tokens: Optional[int] = None,
                                   use_cache: bool = True,
                                   **kwargs) -> Dict[str, Any]:
        """Create completion with optimization features"""
        
        # Select optimal model if not specified
        if not model:
            model = self.model_selector.get_optimal_model(task_type)
        
        # Select optimal max_tokens if not specified
        if not max_tokens:
            max_tokens = self.model_selector.get_optimal_max_tokens(task_type)
        
        # Check cache first
        cache_key = None
        if use_cache and self.cache:
            cache_key = self.cache.get_cache_key(prompt, model, max_tokens, **kwargs)
            cached_response = self.cache.get_cached_response(cache_key)
            if cached_response:
                self.monitor.log_api_call(
                    tokens_used=cached_response.get('usage', {}).get('total_tokens', 0),
                    model=model,
                    response_time=0.0,
                    cache_hit=True
                )
                return cached_response
        
        # Make API call
        start_time = time.time()
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                **kwargs
            )
            
            response_time = time.time() - start_time
            
            # Convert to dict for caching
            response_dict = {
                'choices': [{'message': {'content': response.choices[0].message.content}}],
                'usage': {'total_tokens': response.usage.total_tokens if response.usage else 0}
            }
            
            # Cache response
            if use_cache and self.cache and cache_key:
                self.cache.cache_response(cache_key, response_dict)
            
            # Log metrics
            self.monitor.log_api_call(
                tokens_used=response.usage.total_tokens if response.usage else 0,
                model=model,
                response_time=response_time,
                cache_hit=False
            )
            
            return response_dict
            
        except Exception as e:
            print(f"API call error: {e}")
            raise


# Singleton instances for easy import
cache = OpenAICache()
monitor = TokenUsageMonitor()
model_selector = SmartModelSelector()


# Utility functions for easy integration
def get_optimized_model(task_type: str) -> str:
    """Quick function to get optimal model for a task"""
    return model_selector.get_optimal_model(task_type)


def get_optimized_max_tokens(task_type: str) -> int:
    """Quick function to get optimal max_tokens for a task"""
    return model_selector.get_optimal_max_tokens(task_type)


def log_api_usage(tokens: int, model: str, response_time: float, cache_hit: bool = False):
    """Quick function to log API usage"""
    monitor.log_api_call(tokens, model, response_time, cache_hit)


def get_usage_report() -> Dict[str, Any]:
    """Get current usage report"""
    return {
        "usage_summary": monitor.get_usage_summary(),
        "cache_stats": cache.get_cache_stats()
    }