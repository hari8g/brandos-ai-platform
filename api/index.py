"""
Vercel serverless function for BrandOS AI Platform API
"""
import os
import json
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

def assess_query_quality_simple(query: str, category: str | None = None):
    """Simple query quality assessment"""
    if not query:
        query = ""
    
    query_lower = query.lower()
    score = 3
    
    if len(query.split()) > 10:
        score += 1
    if any(word in query_lower for word in ['serum', 'cream', 'gel', 'lotion', 'moisturizer']):
        score += 1
    if any(word in query_lower for word in ['skin', 'face', 'body', 'hair']):
        score += 1
    if any(word in query_lower for word in ['acne', 'aging', 'hydration', 'brightening', 'anti-aging']):
        score += 1
    
    needs_improvement = score < 5
    
    suggestions = [
        "Specify the type of product (serum, cream, gel, lotion, etc.)",
        "Mention your target skin type or concern (oily, dry, sensitive, acne-prone, etc.)",
        "Include any ingredient preferences or restrictions (natural, vegan, fragrance-free, etc.)",
        "Describe the desired texture or performance (lightweight, rich, fast-absorbing, etc.)",
        "Add your target audience (age group, skin concerns, lifestyle)"
    ]
    
    formulation_warnings = []
    if score < 4:
        formulation_warnings.append("⚠️ This formulation is based on limited information. Consider refining your query for more targeted results.")
        formulation_warnings.append("⚠️ The formulation may be generic due to vague query details.")
    
    return {
        "score": score,
        "feedback": f"Query scored {score}/7. {'Needs improvement' if needs_improvement else 'Good quality'}. We can still generate a formulation, but more details would help create a more targeted product.",
        "needs_improvement": needs_improvement,
        "suggestions": suggestions,
        "improvement_examples": [
            f"Instead of '{query}', try: 'I need a lightweight serum for oily, acne-prone skin that contains salicylic acid and niacinamide for blemish control'",
            f"Or: 'Create a rich anti-aging night cream for mature, dry skin with retinol and hyaluronic acid, suitable for sensitive skin'"
        ],
        "missing_elements": [],
        "confidence_level": "medium" if score >= 4 else "low",
        "can_generate_formulation": True,
        "formulation_warnings": formulation_warnings
    }

def generate_formulation_simple(query: str, category: str | None = None, location: str | None = None):
    """Simple formulation generation"""
    if not query:
        query = ""
    if not category:
        category = "General"
    if not location:
        location = "India"
    
    # Assess query quality
    quality_assessment = assess_query_quality_simple(query, category)
    quality_score = quality_assessment["score"]
    quality_feedback = quality_assessment["feedback"]
    quality_warnings = quality_assessment["formulation_warnings"]
    improvement_suggestions = quality_assessment["suggestions"]
    
    # Generate simple formulation
    ingredients = [
        {
            "name": "Water",
            "percent": 70.0,
            "cost_per_100ml": 10.0,
            "suppliers": [
                {"name": "Local Supplier", "location": location, "url": "N/A", "price_per_100ml": 10.0}
            ],
            "alternatives": [
                {"name": "Distilled Water", "price_impact": 5.0, "reasoning": "Purer, but more expensive"}
            ]
        },
        {
            "name": "Glycerin",
            "percent": 5.0,
            "cost_per_100ml": 30.0,
            "suppliers": [
                {"name": "Chemical Supply Co", "location": location, "url": "www.chemicalsupplyco.in", "price_per_100ml": 30.0}
            ],
            "alternatives": [
                {"name": "Propylene Glycol", "price_impact": -5.0, "reasoning": "Cheaper, but may cause skin irritation"}
            ]
        }
    ]
    
    return {
        "product_name": "Hydrating Moisturizer",
        "ingredients": ingredients,
        "estimated_cost": 200.0,
        "predicted_ph": 5.5,
        "reasoning": "A simple, safe moisturizer with cost-effective ingredients suitable for general use.",
        "safety_notes": ["Patch test before use", "Store in a cool place"],
        "category": category,
        "pricing": {
            "small_batch": 250.0,
            "medium_scale": 120.0,
            "reasoning": "Small batch has higher per-unit cost due to less bulk purchasing and higher overhead. Medium scale benefits from economies of scale."
        },
        "query_quality_score": quality_score,
        "query_quality_feedback": quality_feedback,
        "quality_warnings": quality_warnings,
        "improvement_suggestions": improvement_suggestions
    }

def create_response(status_code, data):
    """Create a standardized response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        'body': json.dumps(data)
    }

def app(request):
    """Vercel serverless function handler - simplified version"""
    try:
        # Get request method and path
        method = request.method
        path = request.path if hasattr(request, 'path') else '/'
        
        # Handle OPTIONS (CORS preflight)
        if method == 'OPTIONS':
            return create_response(200, {})
        
        # Handle GET requests
        if method == 'GET':
            if path == '/api/v1/health':
                return create_response(200, {
                    "status": "healthy",
                    "service": "brandos-ai-platform"
                })
            else:
                return create_response(404, {"error": "Endpoint not found", "path": path})
        
        # Handle POST requests
        if method == 'POST':
            # Read request body
            body = request.body
            if isinstance(body, bytes):
                body = body.decode('utf-8')
            
            # Parse JSON
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                return create_response(400, {"error": "Invalid JSON"})
            
            # Route to appropriate handler
            if path == '/api/v1/query/assess':
                result = assess_query_quality_simple(data.get('text', ''), data.get('category'))
                return create_response(200, result)
            
            elif path == '/api/v1/formulation/generate':
                result = generate_formulation_simple(
                    data.get('text', ''),
                    data.get('category'),
                    data.get('location')
                )
                return create_response(200, result)
            
            else:
                return create_response(404, {"error": "Endpoint not found", "path": path})
        
        # Default response for unsupported methods
        return create_response(405, {"error": "Method not allowed"})
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return create_response(500, {
            "error": f"Internal server error: {str(e)}",
            "details": error_details
        }) 