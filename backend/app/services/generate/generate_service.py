import os
import json
from typing import List
from openai import OpenAI
from dotenv import load_dotenv
from app.models.generate import GenerateRequest, Formulation, Ingredient

# Load .env file
load_dotenv()

# Initialize OpenAI client only if API key is available
client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here":
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client initialized successfully")
    else:
        print("⚠️ OpenAI API key not found, will use fallback mock data")
except Exception as e:
    print(f"⚠️ Failed to initialize OpenAI client: {e}")

def generate_formulation(req: GenerateRequest) -> Formulation:
    """
    Use OpenAI to generate a real formulation based on the request.
    """
    # Check if OpenAI client is available
    if not client:
        print("🔄 Using fallback mock formulation (OpenAI not available)")
        return _generate_mock_formulation(req)
    
    try:
        # Create the prompt for OpenAI
        system_prompt = """You are an expert cosmetic formulator and chemist. Generate a detailed formulation based on the user's request. 
        
        Return the response as a JSON object with the following structure:
        {
            "product_name": "Descriptive product name",
            "ingredients": [
                {
                    "name": "Ingredient name",
                    "percent": 5.0,
                    "cost_per_100ml": 2.0,
                    "function": "What this ingredient does",
                    "safety_notes": "Safety considerations"
                }
            ],
            "reasoning": "Detailed scientific reasoning for the formulation",
            "estimated_cost": 15.0,
            "safety_notes": ["Safety note 1", "Safety note 2"],
            "instructions": "Usage instructions",
            "packaging": {
                "type": "Airless pump bottle",
                "material": "Recycled PET",
                "size": "30ml",
                "features": ["UV protection", "Airless dispensing"],
                "sustainability": "100% recyclable, made from 30% post-consumer recycled material"
            },
            "marketing_inspiration": {
                "tagline": "Transform your skin with science-backed natural ingredients",
                "key_benefits": ["Hydrates for 24 hours", "Suitable for sensitive skin", "Vegan and cruelty-free"],
                "target_audience": "Women aged 25-45 with sensitive, dry skin",
                "brand_positioning": "Luxury natural skincare that combines science with sustainability",
                "social_media_hooks": ["#CleanBeauty", "#SustainableSkincare", "#SensitiveSkinSolutions"]
            }
        }
        
        Guidelines:
        - Total ingredients should add up to 100%
        - Use realistic ingredient percentages
        - Include proper preservatives and stabilizers
        - Consider the target skin type and concerns
        - Provide detailed scientific reasoning
        - Include safety considerations
        - Use ingredients appropriate for the product type
        - Suggest sustainable packaging options
        - Create compelling marketing messaging that resonates with the target audience
        """

        user_prompt = f"""
        Create a formulation for: {req.prompt}
        Category: {req.category or 'General'}
        Target cost: {req.target_cost or 'Not specified'}
        
        Please provide a complete, safe, and effective formulation with packaging and marketing inspiration.
        """

        # Call OpenAI
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2500
        )

        # Parse the response
        content = response.choices[0].message.content
        print(f"OpenAI Response: {content}")
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            json_str = content[start_idx:end_idx]
            data = json.loads(json_str)
            
            # Convert to Formulation object
            ingredients = []
            for ing_data in data.get('ingredients', []):
                ingredients.append(Ingredient(
                    name=ing_data.get('name', 'Unknown'),
                    percent=float(ing_data.get('percent', 0)),
                    cost_per_100ml=float(ing_data.get('cost_per_100ml', 0)),
                    function=ing_data.get('function', ''),
                    safety_notes=ing_data.get('safety_notes', '')
                ))
            
            # Extract packaging and marketing data
            packaging_data = data.get('packaging', {})
            marketing_data = data.get('marketing_inspiration', {})
            
            return Formulation(
                product_name=data.get('product_name', f"Custom {req.category or 'Product'}"),
                ingredients=ingredients,
                reasoning=data.get('reasoning', 'No reasoning provided'),
                estimated_cost=float(data.get('estimated_cost', 0)),
                safety_notes=data.get('safety_notes', []),
                instructions=data.get('instructions', 'Follow standard usage guidelines'),
                packaging=packaging_data,
                marketing_inspiration=marketing_data
            )
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Error parsing OpenAI response: {e}")
            # Fallback to mock data if parsing fails
            return _generate_mock_formulation(req)
            
    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Fallback to mock data if OpenAI fails
        return _generate_mock_formulation(req)

def _generate_mock_formulation(req: GenerateRequest) -> Formulation:
    """
    Fallback mock formulation generator.
    """
    ingredients = [
        Ingredient(
            name="Water",
            percent=70.0,
            cost_per_100ml=0.1,
            function="Solvent",
            safety_notes="Safe for all skin types"
        ),
        Ingredient(
            name="Glycerin",
            percent=5.0,
            cost_per_100ml=2.0,
            function="Humectant",
            safety_notes="Generally safe, may cause irritation in sensitive skin"
        ),
        Ingredient(
            name="Preservative",
            percent=1.0,
            cost_per_100ml=5.0,
            function="Preservative",
            safety_notes="Use as directed"
        )
    ]
    
    total_cost = sum(ing.cost_per_100ml * ing.percent / 100 for ing in ingredients)
    
    # Mock packaging data
    packaging = {
        "type": "Airless pump bottle",
        "material": "Recycled PET",
        "size": "30ml",
        "features": ["UV protection", "Airless dispensing", "Travel-friendly"],
        "sustainability": "100% recyclable, made from 30% post-consumer recycled material"
    }
    
    # Mock marketing inspiration
    marketing_inspiration = {
        "tagline": "Transform your skin with science-backed natural ingredients",
        "key_benefits": ["Hydrates for 24 hours", "Suitable for sensitive skin", "Vegan and cruelty-free"],
        "target_audience": "Women aged 25-45 with sensitive, dry skin",
        "brand_positioning": "Luxury natural skincare that combines science with sustainability",
        "social_media_hooks": ["#CleanBeauty", "#SustainableSkincare", "#SensitiveSkinSolutions"]
    }
    
    return Formulation(
        product_name=f"Custom {req.category or 'Product'}",
        ingredients=ingredients,
        reasoning=f"Formulation generated based on request: {req.prompt}. This is a basic formulation that can be customized further.",
        estimated_cost=total_cost,
        safety_notes=[
            "Patch test before use",
            "Keep away from eyes",
            "Store in cool, dry place"
        ],
        instructions="Apply to clean skin as needed",
        packaging=packaging,
        marketing_inspiration=marketing_inspiration
    ) 