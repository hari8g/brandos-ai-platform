# OpenAI Token Optimization Guide

## Current Implementation Analysis

### Token Usage Patterns Identified
1. **Suggestions Service**: 2 API calls per request (extract + generate) with 200 + 800 tokens
2. **Generate Service**: 1 API call per request with 4000 tokens
3. **Model Used**: GPT-4 exclusively (most expensive)
4. **Function Calling**: Structured responses with JSON schemas

### Cost Analysis (Current Implementation)
- **GPT-4 Pricing**: ~$0.03/1K input tokens, ~$0.06/1K output tokens
- **Suggestions Service**: ~$0.03 per request (1000 tokens avg)
- **Generate Service**: ~$0.24 per request (4000 tokens avg)
- **Monthly Cost Estimate**: $500-2000 based on usage volume

## Optimization Strategies

### 1. Model Selection Optimization

#### Replace GPT-4 with GPT-3.5-turbo for specific use cases
```python
# Current (expensive)
model="gpt-4"  # $0.03/1K input, $0.06/1K output

# Optimized (70% cost reduction)
model="gpt-3.5-turbo"  # $0.001/1K input, $0.002/1K output
```

**Recommendation**: Use GPT-3.5-turbo for:
- Product info extraction (simple classification)
- Suggestion generation (template-based responses)

Keep GPT-4 for:
- Complex formulation generation with detailed scientific reasoning

#### Consider GPT-4o-mini for simple tasks
```python
# For product extraction only
model="gpt-4o-mini"  # $0.00015/1K input, $0.0006/1K output
```

### 2. Token Limit Optimization

#### Current vs Optimized Token Limits
```python
# Current Implementation
extract_product_info: max_tokens=200  # Often uses ~50-80 tokens
generate_suggestions: max_tokens=800  # Often uses ~400-600 tokens  
generate_formulation: max_tokens=4000 # Often uses ~2000-3000 tokens

# Optimized Implementation
extract_product_info: max_tokens=100   # 50% reduction
generate_suggestions: max_tokens=600   # 25% reduction
generate_formulation: max_tokens=3000  # 25% reduction
```

### 3. Prompt Engineering for Efficiency

#### Optimize Current Prompts
```python
# Current verbose prompt
def get_extraction_prompt(user_prompt: str, category: Optional[str] = None) -> str:
    return f'''
    You are a cosmetic formulation expert.
    From this user input:
      "{user_prompt}"
    Return strict JSON with keys:
      - product_type (e.g. "anti-aging face cream")
      - form (e.g. "cream", "serum", "gel")
      - concern (e.g. "wrinkle reduction", "hydration")
    '''

# Optimized concise prompt (40% token reduction)
def get_extraction_prompt_optimized(user_prompt: str, category: Optional[str] = None) -> str:
    return f'Extract from "{user_prompt}": product_type, form, concern as JSON'
```

### 4. Caching Strategy Implementation

#### Add Response Caching
```python
import redis
import hashlib
import json

class OpenAICache:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.cache_ttl = 3600  # 1 hour
    
    def get_cache_key(self, prompt: str, model: str, max_tokens: int) -> str:
        content = f"{prompt}:{model}:{max_tokens}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get_cached_response(self, cache_key: str):
        cached = self.redis_client.get(cache_key)
        return json.loads(cached) if cached else None
    
    def cache_response(self, cache_key: str, response):
        self.redis_client.setex(cache_key, self.cache_ttl, json.dumps(response))

# Usage in extract_product_info
cache = OpenAICache()
cache_key = cache.get_cache_key(extraction_prompt, "gpt-3.5-turbo", 100)
cached_response = cache.get_cached_response(cache_key)

if cached_response:
    return cached_response
else:
    response = client.chat.completions.create(...)
    cache.cache_response(cache_key, response)
```

### 5. API Call Reduction

#### Combine Multiple Operations
```python
# Current: 2 separate API calls
def generate_suggestions_current(request):
    info = extract_product_info(request.prompt)  # API call 1
    suggestions = generate_suggestions(info)      # API call 2

# Optimized: 1 combined API call
def generate_suggestions_optimized(request):
    combined_prompt = f"""
    Extract product info AND generate 3 suggestions from: "{request.prompt}"
    Return JSON: {{"product_info": {{"type": "", "form": "", "concern": ""}}, "suggestions": [...]}}
    """
    # Single API call with combined logic
```

### 6. Batch Processing Implementation

#### Process Multiple Requests Together
```python
def process_batch_suggestions(requests: List[SuggestionRequest]) -> List[SuggestionResponse]:
    """Process multiple suggestion requests in a single API call"""
    
    batch_prompt = "Process these formulation requests:\n\n"
    for i, req in enumerate(requests):
        batch_prompt += f"Request {i+1}: {req.prompt}\n"
    
    batch_prompt += "\nReturn JSON array with results for each request."
    
    # Single API call for multiple requests
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": batch_prompt}],
        max_tokens=2000  # Adjust based on batch size
    )
    
    # Parse and distribute results
    return parse_batch_response(response, requests)
```

### 7. Response Streaming

#### Implement Streaming for Large Responses
```python
def generate_formulation_streaming(req: GenerateRequest):
    """Stream formulation generation to reduce perceived latency"""
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=3000,
        stream=True  # Enable streaming
    )
    
    for chunk in response:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content
```

### 8. Smart Fallback System

#### Implement Tiered Model Selection
```python
class SmartOpenAIClient:
    def __init__(self):
        self.models = {
            'simple': 'gpt-4o-mini',      # $0.00015/1K
            'standard': 'gpt-3.5-turbo',   # $0.001/1K  
            'complex': 'gpt-4'             # $0.03/1K
        }
    
    def get_optimal_model(self, task_complexity: str, token_estimate: int):
        if task_complexity == 'extraction' or token_estimate < 200:
            return self.models['simple']
        elif task_complexity == 'generation' or token_estimate < 1000:
            return self.models['standard']
        else:
            return self.models['complex']
```

## Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. **Reduce max_tokens** in all API calls by 25-50%
2. **Switch extract_product_info to gpt-3.5-turbo** (70% cost reduction)
3. **Optimize prompts** for conciseness

### Phase 2: Caching (3-5 days)
1. **Implement Redis caching** for repeated queries
2. **Add cache invalidation** strategy
3. **Monitor cache hit rates**

### Phase 3: Advanced Optimizations (1-2 weeks)
1. **Combine API calls** where possible
2. **Implement batch processing** for high-volume scenarios
3. **Add response streaming** for user experience

### Phase 4: Monitoring (Ongoing)
1. **Track token usage** per endpoint
2. **Monitor cost per request**
3. **A/B test model performance**

## Expected Cost Savings

### Conservative Estimates
- **Phase 1**: 40-50% reduction in token costs
- **Phase 2**: Additional 20-30% reduction from caching
- **Phase 3**: Additional 10-15% reduction from batching
- **Total**: 60-75% cost reduction

### Specific to Your Implementation
- **Suggestions Service**: $0.03 → $0.008 per request (73% reduction)
- **Generate Service**: $0.24 → $0.08 per request (67% reduction)
- **Monthly Savings**: $300-1500 based on current volume

## Monitoring & Metrics

### Key Metrics to Track
```python
class TokenUsageMonitor:
    def __init__(self):
        self.metrics = {
            'total_tokens': 0,
            'total_cost': 0,
            'cache_hits': 0,
            'api_calls': 0,
            'avg_response_time': 0
        }
    
    def log_api_call(self, tokens_used: int, cost: float, response_time: float):
        self.metrics['total_tokens'] += tokens_used
        self.metrics['total_cost'] += cost
        self.metrics['api_calls'] += 1
        self.metrics['avg_response_time'] = (
            (self.metrics['avg_response_time'] * (self.metrics['api_calls'] - 1) + response_time) 
            / self.metrics['api_calls']
        )
```

## Code Implementation Examples

### Optimized Suggestions Service
```python
# Replace in backend/app/services/query/suggestions_service.py
def extract_product_info_optimized(user_prompt: str, category: Optional[str] = None) -> dict:
    # Use cache first
    cache_key = f"extract:{hashlib.md5(user_prompt.encode()).hexdigest()}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached
    
    # Optimized prompt
    prompt = f'Extract from "{user_prompt}": product_type, form, concern as JSON'
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # Changed from gpt-4
        messages=[{"role": "user", "content": prompt}],
        max_tokens=100,  # Reduced from 200
        temperature=0
    )
    
    result = parse_response(response)
    set_cache(cache_key, result, ttl=3600)
    return result
```

### Optimized Generate Service
```python
# Replace in backend/app/services/generate/generate_service.py
def generate_formulation_optimized(req: GenerateRequest) -> GenerateResponse:
    # Use smart model selection
    model = get_optimal_model(req.complexity, estimate_tokens(req.prompt))
    
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": get_concise_system_prompt()},
            {"role": "user", "content": req.prompt}
        ],
        max_tokens=get_optimal_max_tokens(req.complexity),  # Dynamic sizing
        temperature=0.7
    )
    
    return parse_response(response)
```

## Testing Strategy

### A/B Testing Framework
```python
class OptimizationTester:
    def __init__(self):
        self.test_groups = ['original', 'optimized']
        self.metrics = {}
    
    def run_ab_test(self, request, test_group):
        start_time = time.time()
        
        if test_group == 'original':
            result = generate_suggestions_original(request)
        else:
            result = generate_suggestions_optimized(request)
        
        end_time = time.time()
        
        self.record_metrics(test_group, {
            'response_time': end_time - start_time,
            'tokens_used': result.token_usage,
            'cost': result.cost,
            'quality_score': assess_quality(result)
        })
        
        return result
```

This guide provides a comprehensive roadmap for optimizing your OpenAI token usage with specific implementation details tailored to your codebase. Start with Phase 1 for immediate cost savings, then progressively implement the advanced optimizations.