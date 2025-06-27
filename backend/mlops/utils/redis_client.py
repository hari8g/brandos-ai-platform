"""
Shared Redis client for MLOps pipelines.
"""
import redis
import os

def get_redis_client():
    """Get Redis client connection."""
    return redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        db=int(os.getenv('REDIS_DB', 0)),
        decode_responses=True
    )
