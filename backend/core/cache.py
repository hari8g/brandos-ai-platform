"""
Redis cache management.
"""
import redis
from config.settings import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_cache():
    return redis_client
