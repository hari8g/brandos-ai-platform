"""
Vercel serverless function for query assessment
"""
import json

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

def handler(request):
    """Vercel serverless function handler for query assessment"""
    # Set CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # Parse request body
        body = getattr(request, 'body', None)
        if not body:
            content_length = int(request.headers.get('Content-Length', 0))
            body = request.rfile.read(content_length).decode('utf-8')
        
        if isinstance(body, bytes):
            body = body.decode('utf-8')
        
        data = json.loads(body)
        
        # Assess query quality
        result = assess_query_quality_simple(data.get('text', ''), data.get('category'))
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(result)
        }
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                "error": f"Internal server error: {str(e)}",
                "details": error_details
            })
        } 