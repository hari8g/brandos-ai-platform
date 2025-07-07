import os
import json
from dotenv import load_dotenv
from typing import List, Optional
from openai import OpenAI
from app.models.query import SuggestionRequest, SuggestionResponse, Suggestion

# Load environment variables from the root .env file
# Navigate from backend/app/services/query/ to project root
project_root = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')
load_dotenv(os.path.join(project_root, '.env'))

# Initialize OpenAI client only if API key is available
client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here" and api_key.strip():
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client initialized successfully")
    else:
        print("⚠️ OpenAI API key not found or invalid, will use fallback mock data")
except Exception as e:
    print(f"⚠️ Failed to initialize OpenAI client: {e}")

from app.models.query import SuggestionRequest, SuggestionResponse, Suggestion

def get_extraction_prompt(user_prompt: str, category: Optional[str] = None) -> str:
    category = category or ""
    if category == "pet food":
        return f'''
        You are a pet food formulation expert.
        From this user input:
          "{user_prompt}"
        Return strict JSON with keys:
          - product_type (e.g. "grain-free dog food")
          - form (e.g. "kibble", "wet food", "treat")
          - concern (e.g. "allergies", "sensitive stomach")
        '''
    elif category == "wellness":
        return f'''
        You are a wellness supplement formulation expert.
        From this user input:
          "{user_prompt}"
        Return strict JSON with keys:
          - product_type (e.g. "adaptogen blend powder")
          - form (e.g. "capsule", "powder", "gummy")
          - concern (e.g. "stress resilience", "immune support")
        '''
    elif category == "beverages":
        return f'''
        You are a beverage formulation expert.
        From this user input:
          "{user_prompt}"
        Return strict JSON with keys:
          - product_type (e.g. "functional wellness drink")
          - form (e.g. "ready-to-drink", "powder mix", "concentrate")
          - concern (e.g. "energy boost", "immune support", "hydration")
        '''
    elif category == "textiles":
        return f'''
        You are a textile and material science expert.
        From this user input:
          "{user_prompt}"
        Return strict JSON with keys:
          - product_type (e.g. "sustainable activewear fabric")
          - form (e.g. "woven", "knit", "non-woven")
          - concern (e.g. "moisture-wicking", "sustainability", "comfort")
        '''
    else:
        return f'''
        You are a cosmetic formulation expert.
        From this user input:
          "{user_prompt}"
        Return strict JSON with keys:
          - product_type (e.g. "anti-aging face cream")
          - form (e.g. "cream", "serum", "gel")
          - concern (e.g. "wrinkle reduction", "hydration")
        '''

def extract_product_info(user_prompt: str, category: Optional[str] = None) -> dict:
    extraction_prompt = get_extraction_prompt(user_prompt, category)
    try:
        if not client:
            return {"product_type": "<product>", "form": "<form>", "concern": "<concern>"}
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": extraction_prompt}],
            temperature=0,
            max_tokens=200,
            tools=get_extraction_function_definitions(),
            tool_choice={"type": "function", "function": {"name": "extract_product_info"}}
        )
        
        message = response.choices[0].message
        if message.tool_calls and len(message.tool_calls) > 0:
            tool_call = message.tool_calls[0]
            if tool_call.function.name == "extract_product_info":
                try:
                    return json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    return {"product_type": "<product>", "form": "<form>", "concern": "<concern>"}
        
        return {"product_type": "<product>", "form": "<form>", "concern": "<concern>"}
    except Exception as e:
        print("extract_product_info error:", e)
        return {"product_type": "<product>", "form": "<form>", "concern": "<concern>"}

def get_suggestion_prompt(info, request):
    category = request.category or ""
    if request.category == "pet food":
        return f'''
        You are a pet food formulation expert.
        Given:
          • product_type: {info['product_type']}
          • form: {info['form']}
          • concern: {info['concern']}
          • original_query: "{request.prompt}"
        Craft exactly 3 fully-detailed AI prompts for a pet food formulation engine.
        Each must include key ingredients, target animal, texture, delivery mechanism, performance metrics, and be ready to send to /formulation/generate without edits.
        Return valid JSON array of objects:
          – prompt: string
          – why: explanation
          – how: usage tip
        '''
    elif request.category == "wellness":
        return f'''
        You are a wellness supplement formulation expert.
        Given:
          • product_type: {info['product_type']}
          • form: {info['form']}
          • concern: {info['concern']}
          • original_query: "{request.prompt}"
        Craft exactly 3 fully-detailed AI prompts for a wellness supplement formulation engine.
        Each must include key ingredients, target user, delivery form, performance metrics, and be ready to send to /formulation/generate without edits.
        Return valid JSON array of objects:
          – prompt: string
          – why: explanation
          – how: usage tip
        '''
    elif request.category == "beverages":
        return f'''
        You are a beverage formulation expert.
        Given:
          • product_type: {info['product_type']}
          • form: {info['form']}
          • concern: {info['concern']}
          • original_query: "{request.prompt}"
        Craft exactly 3 fully-detailed AI prompts for a beverage formulation engine.
        Each must include key ingredients, target beverage type, texture, delivery mechanism, performance metrics, and be ready to send to /formulation/generate without edits.
        Return valid JSON array of objects:
          – prompt: string
          – why: explanation
          – how: usage tip
        '''
    elif request.category == "textiles":
        return f'''
        You are a textile and material science expert.
        Given:
          • product_type: {info['product_type']}
          • form: {info['form']}
          • concern: {info['concern']}
          • original_query: "{request.prompt}"
        Craft exactly 3 fully-detailed AI prompts for a textile formulation engine.
        Each must include key ingredients, target textile type, texture, delivery mechanism, performance metrics, and be ready to send to /formulation/generate without edits.
        Return valid JSON array of objects:
          – prompt: string
          – why: explanation
          – how: usage tip
        '''
    else:
        return f'''
        You are a cosmetic formulation expert.
        Given:
          • product_type: {info['product_type']}
          • form: {info['form']}
          • concern: {info['concern']}
          • original_query: "{request.prompt}"
        Craft exactly 3 fully-detailed AI prompts for a formulation engine.
        Each must include key ingredients, target skin type, texture, delivery mechanism, performance metrics, and be ready to send to /formulation/generate without edits.
        Return valid JSON array of objects:
          – prompt: string
          – why: explanation
          – how: usage tip
        '''

def generate_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    # If OpenAI client is not available, use mock suggestions
    if not client:
        return generate_mock_suggestions(request)
    
    info = extract_product_info(request.prompt, request.category)
    suggestion_prompt = get_suggestion_prompt(info, request)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": suggestion_prompt}],
            temperature=0,
            max_tokens=800,
            tools=get_suggestions_function_definitions(),
            tool_choice={"type": "function", "function": {"name": "generate_suggestions"}}
        )
        
        message = response.choices[0].message
        if message.tool_calls and len(message.tool_calls) > 0:
            tool_call = message.tool_calls[0]
            if tool_call.function.name == "generate_suggestions":
                try:
                    data = json.loads(tool_call.function.arguments)
                    suggestions_data = data.get('suggestions', [])
                    
                    # Validate and clean the data before creating Suggestion objects
                    suggestions = []
                    for s in suggestions_data:
                        try:
                            # Ensure all required fields are present and are strings
                            prompt = str(s.get("prompt", ""))
                            why = str(s.get("why", ""))
                            how = str(s.get("how", ""))
                            if prompt and why and how:  # Only add if all fields have content
                                suggestions.append(Suggestion(prompt=prompt, why=why, how=how))
                        except Exception as e:
                            print(f"Error processing suggestion: {e}")
                            continue
                    
                    # If no valid suggestions were created, use fallback
                    if not suggestions:
                        return generate_mock_suggestions(request)
                    
                    return SuggestionResponse(suggestions=suggestions, success=True, message="Enriched suggestions generated")
                except json.JSONDecodeError:
                    return generate_mock_suggestions(request)
        
        return generate_mock_suggestions(request)
    except Exception as e:
        print("generate_suggestions error:", e)
        return generate_mock_suggestions(request)

def generate_mock_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    """Generate mock suggestions as fallback"""
    base_prompt = request.prompt
    category = request.category or 'cosmetics'
    if category == "pet food":
        suggestions = [
            Suggestion(
                prompt=f"Create a {category} product for {base_prompt}. Include animal type, dietary restrictions, and key nutrients.",
                why="Specifying animal type and dietary needs ensures the food is safe and beneficial.",
                how="Mention breed, age, allergies, and nutritional goals in your prompt."
            ),
            Suggestion(
                prompt=f"Develop a premium {category} treat for {base_prompt}. Consider flavor, texture, and health benefits.",
                why="Flavor and texture are important for palatability; health benefits add value.",
                how="Include preferred flavors, treat size, and any functional benefits (e.g., dental, joint health)."
            ),
            Suggestion(
                prompt=f"Formulate a {category} diet optimized for {base_prompt}. Focus on ingredient quality and safety.",
                why="High-quality, safe ingredients are critical for pet health.",
                how="List ingredient sources, certifications, and any exclusions (e.g., grain-free, hypoallergenic)."
            )
        ]
    elif category == "wellness":
        suggestions = [
            Suggestion(
                prompt=f"Create a {category} supplement for {base_prompt}. Include delivery form, active ingredients, and target benefit.",
                why="Delivery form and actives determine efficacy and user compliance.",
                how="Specify capsule, powder, or gummy; list actives and intended wellness outcome."
            ),
            Suggestion(
                prompt=f"Develop a premium {category} blend for {base_prompt}. Consider flavor, absorption, and user experience.",
                why="Flavor and absorption impact user satisfaction and results.",
                how="Include preferred flavors, solubility, and any synergistic ingredients."
            ),
            Suggestion(
                prompt=f"Formulate a {category} product optimized for {base_prompt}. Focus on safety, efficacy, and compliance.",
                why="Safe, effective, and compliant products build trust and deliver results.",
                how="Mention certifications, clinical evidence, and regulatory considerations."
            )
        ]
    elif category == "beverages":
        suggestions = [
            Suggestion(
                prompt=f"Create a {category} beverage for {base_prompt}. Include key ingredients, target beverage type, and desired performance characteristics.",
                why="Adding specific ingredient and performance details helps create more targeted formulations",
                how="Specify exact ingredients, concentrations, and performance expectations in your prompt"
            ),
            Suggestion(
                prompt=f"Develop a premium {category} solution for {base_prompt}. Consider packaging, pricing, and target demographic preferences.",
                why="Market positioning and packaging details help create commercially viable products",
                how="Include target audience, price point, and packaging preferences in your formulation request"
            ),
            Suggestion(
                prompt=f"Formulate a {category} product optimized for {base_prompt}. Focus on stability, safety, and regulatory compliance.",
                why="Technical considerations ensure the formulation is safe, stable, and compliant",
                how="Mention stability requirements, safety concerns, and regulatory considerations in your prompt"
            )
        ]
    elif category == "textiles":
        suggestions = [
            Suggestion(
                prompt=f"Create a {category} textile for {base_prompt}. Include key ingredients, target textile type, and desired performance characteristics.",
                why="Adding specific ingredient and performance details helps create more targeted formulations",
                how="Specify exact ingredients, concentrations, and performance expectations in your prompt"
            ),
            Suggestion(
                prompt=f"Develop a premium {category} solution for {base_prompt}. Consider packaging, pricing, and target demographic preferences.",
                why="Market positioning and packaging details help create commercially viable products",
                how="Include target audience, price point, and packaging preferences in your formulation request"
            ),
            Suggestion(
                prompt=f"Formulate a {category} product optimized for {base_prompt}. Focus on stability, safety, and regulatory compliance.",
                why="Technical considerations ensure the formulation is safe, stable, and compliant",
                how="Mention stability requirements, safety concerns, and regulatory considerations in your prompt"
            )
        ]
    else:
        suggestions = [
            Suggestion(
                prompt=f"Create a {category} product with specific focus on {base_prompt}. Include detailed ingredient specifications, target skin type, and desired performance characteristics.",
                why="Adding specific ingredient and performance details helps create more targeted formulations",
                how="Specify exact ingredients, concentrations, and performance expectations in your prompt"
            ),
            Suggestion(
                prompt=f"Develop a premium {category} solution for {base_prompt}. Consider packaging, pricing, and target demographic preferences.",
                why="Market positioning and packaging details help create commercially viable products",
                how="Include target audience, price point, and packaging preferences in your formulation request"
            ),
            Suggestion(
                prompt=f"Formulate a {category} product optimized for {base_prompt}. Focus on stability, safety, and regulatory compliance.",
                why="Technical considerations ensure the formulation is safe, stable, and compliant",
                how="Mention stability requirements, safety concerns, and regulatory considerations in your prompt"
            )
        ]
    return SuggestionResponse(
        suggestions=suggestions,
        success=True,
        message=f"Mock suggestions generated for {category} (AI service unavailable)"
    )

# Function calling definitions
def get_suggestions_function_definitions():
    """Define the function schema for suggestions generation"""
    return [
        {
            "type": "function",
            "function": {
                "name": "generate_suggestions",
                "description": "Generate 3 detailed AI prompts for formulation",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "suggestions": {
                            "type": "array",
                            "description": "Array of 3 detailed suggestions",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "prompt": {
                                        "type": "string",
                                        "description": "Detailed AI prompt for formulation"
                                    },
                                    "why": {
                                        "type": "string",
                                        "description": "Explanation of why this suggestion is valuable"
                                    },
                                    "how": {
                                        "type": "string",
                                        "description": "Usage tip for this suggestion"
                                    }
                                },
                                "required": ["prompt", "why", "how"]
                            }
                        }
                    },
                    "required": ["suggestions"]
                }
            }
        }
    ]

def get_extraction_function_definitions():
    """Define the function schema for product info extraction"""
    return [
        {
            "type": "function",
            "function": {
                "name": "extract_product_info",
                "description": "Extract product type, form, and concern from user input",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "product_type": {
                            "type": "string",
                            "description": "Type of product (e.g., 'anti-aging face cream')"
                        },
                        "form": {
                            "type": "string",
                            "description": "Form of the product (e.g., 'cream', 'serum', 'gel')"
                        },
                        "concern": {
                            "type": "string",
                            "description": "Primary concern or benefit (e.g., 'wrinkle reduction', 'hydration')"
                        }
                    },
                    "required": ["product_type", "form", "concern"]
                }
            }
        }
    ] 