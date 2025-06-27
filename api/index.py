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

class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler"""
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/v1/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "status": "healthy",
                "service": "brandos-ai-platform"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"error": "Endpoint not found", "path": path}
            self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        print(f"🔍 POST request to path: {path}")
        
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            print(f"🔍 Content length: {content_length}")
            
            body = self.rfile.read(content_length).decode('utf-8')
            print(f"🔍 Request body: {body}")
            
            # Parse JSON
            try:
                data = json.loads(body)
                print(f"🔍 Parsed data: {data}")
            except json.JSONDecodeError as e:
                print(f"🔍 JSON decode error: {e}")
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
                return
            
            # Process request based on path
            if path == '/api/v1/query/assess':
                print(f"🔍 Processing query assessment for: {data.get('text', '')}")
                result = assess_query_quality_simple(data.get('text', ''), data.get('category'))
                print(f"🔍 Assessment result: {result}")
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response_json = json.dumps(result)
                print(f"🔍 Sending response: {response_json}")
                self.wfile.write(response_json.encode())
                
            elif path == '/api/v1/formulation/generate':
                print(f"🚀 Processing formulation generation for: {data.get('text', '')}")
                result = generate_formulation_simple(
                    data.get('text', ''),
                    data.get('category'),
                    data.get('location')
                )
                print(f"🚀 Formulation result: {result}")
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response_json = json.dumps(result)
                print(f"🚀 Sending response: {response_json}")
                self.wfile.write(response_json.encode())
                
            else:
                print(f"🔍 Unknown path: {path}")
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                result = {"error": "Endpoint not found", "path": path}
                self.wfile.write(json.dumps(result).encode())
                
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"🔍 Exception occurred: {e}")
            print(f"🔍 Error details: {error_details}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {
                "error": f"Internal server error: {str(e)}",
                "details": error_details
            }
            print(f"🔍 Sending error response: {error_response}")
            self.wfile.write(json.dumps(error_response).encode()) 