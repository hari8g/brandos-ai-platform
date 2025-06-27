"""
Simple test API for Vercel
"""
import json

def handler(request):
    """Simple test handler"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            "message": "Hello from Vercel Python!",
            "method": request.method,
            "path": getattr(request, 'path', 'unknown')
        })
    } 