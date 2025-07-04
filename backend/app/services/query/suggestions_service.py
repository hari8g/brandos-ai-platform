import os
import json
from dotenv import load_dotenv

# Load environment variables from the root .env file
# Navigate from backend/app/services/query/ to project root
project_root = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')
load_dotenv(os.path.join(project_root, '.env'))

# Initialize OpenAI client only if API key is available
client = None
try:
    from openai import OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here" and api_key.strip():
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client initialized successfully")
    else:
        print("⚠️ OpenAI API key not found or invalid, will use fallback mock data")
        print(f"🔍 API Key found: {'Yes' if api_key else 'No'}")
        if api_key:
            print(f"🔍 API Key length: {len(api_key)}")
except Exception as e:
    print(f"⚠️ Failed to initialize OpenAI client: {e}")

from app.models.query import SuggestionRequest, SuggestionResponse, Suggestion

def extract_product_info(user_prompt: str) -> dict:
    extraction_prompt = f'''
    You are a cosmetic formulation expert.
    From this user input:
      "{user_prompt}"
    Return strict JSON with keys:
      - product_type (e.g. "anti-aging face cream")
      - form (e.g. "cream", "serum", "gel")
      - concern (e.g. "wrinkle reduction", "hydration")
    '''
    try:
        if not client:
            return {"product_type": "<product>", "form": "<form>", "concern": "<concern>"}
            
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": extraction_prompt}],
            temperature=0,
            max_tokens=200
        )
        content = response.choices[0].message.content
        json_str = content[content.find('{'):content.rfind('}')+1]
        return json.loads(json_str)
    except Exception as e:
        print("extract_product_info error:", e)
        return {"product_type": "<product>", "form": "<form>", "concern": "<concern>"}

def generate_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    # If OpenAI client is not available, use mock suggestions
    if not client:
        return generate_mock_suggestions(request)
        
    info = extract_product_info(request.prompt)
    suggestion_prompt = f'''
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
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": suggestion_prompt}],
            temperature=0,
            max_tokens=800
        )
        content = response.choices[0].message.content
        json_str = content[content.find('['):content.rfind(']')+1]
        data = json.loads(json_str)
        
        # Validate and clean the data before creating Suggestion objects
        suggestions = []
        for s in data:
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
    except Exception as e:
        print("generate_suggestions error:", e)
        return generate_mock_suggestions(request)

def generate_mock_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    """Generate mock suggestions as fallback"""
    base_prompt = request.prompt
    
    suggestions = [
        Suggestion(
            prompt=f"Create a {request.category or 'skincare'} product with specific focus on {base_prompt}. Include detailed ingredient specifications, target skin type, and desired performance characteristics.",
            why="Adding specific ingredient and performance details helps create more targeted formulations",
            how="Specify exact ingredients, concentrations, and performance expectations in your prompt"
        ),
        Suggestion(
            prompt=f"Develop a premium {request.category or 'skincare'} solution for {base_prompt}. Consider packaging, pricing, and target demographic preferences.",
            why="Market positioning and packaging details help create commercially viable products",
            how="Include target audience, price point, and packaging preferences in your formulation request"
        ),
        Suggestion(
            prompt=f"Formulate a {request.category or 'skincare'} product optimized for {base_prompt}. Focus on stability, safety, and regulatory compliance.",
            why="Technical considerations ensure the formulation is safe, stable, and compliant",
            how="Mention stability requirements, safety concerns, and regulatory considerations in your prompt"
        )
    ]
    
    return SuggestionResponse(
        suggestions=suggestions,
        success=True,
        message="Mock suggestions generated (AI service unavailable)"
    ) 