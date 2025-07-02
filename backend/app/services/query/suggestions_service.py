import os
import json
from openai import OpenAI
from app.models.query import SuggestionRequest, SuggestionResponse, Suggestion

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
        suggestions = [
            Suggestion(prompt=s["prompt"], why=s["why"], how=s["how"]) for s in data
        ]
        return SuggestionResponse(suggestions=suggestions, success=True, message="Enriched suggestions generated")
    except Exception as e:
        print("generate_suggestions error:", e)
        fallback = [
            Suggestion(prompt="Formulate a hydrating face cream for dry skin with ceramides, squalane, and hyaluronic acid. Target a rich, non-greasy texture and airless pump packaging.", why="Addresses hydration and barrier repair for dry skin.", how="Use for users seeking deep moisturization."),
            Suggestion(prompt="Create a lightweight anti-aging serum for wrinkle reduction, featuring retinol, peptides, and vitamin C. Ensure fast absorption and stability.", why="Targets visible signs of aging with proven actives.", how="Ideal for users wanting a potent, non-heavy serum."),
            Suggestion(prompt="Develop a soothing gel for sensitive skin with niacinamide, panthenol, and green tea extract. Focus on calming, non-irritating formula.", why="Soothes irritation and strengthens skin barrier.", how="Best for users with redness or sensitivity.")
        ]
        return SuggestionResponse(suggestions=fallback, success=False, message="Fallback suggestions due to error")

def generate_mock_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    """Generate mock suggestions as fallback"""
    base_prompt = request.prompt
    
    suggestions = [
        Suggestion(
            text=f"Create a {request.category or 'skincare'} product with specific focus on {base_prompt}. Include detailed ingredient specifications, target skin type, and desired performance characteristics.",
            why="Adding specific ingredient and performance details helps create more targeted formulations",
            how="Specify exact ingredients, concentrations, and performance expectations in your prompt"
        ),
        Suggestion(
            text=f"Develop a premium {request.category or 'skincare'} solution for {base_prompt}. Consider packaging, pricing, and target demographic preferences.",
            why="Market positioning and packaging details help create commercially viable products",
            how="Include target audience, price point, and packaging preferences in your formulation request"
        ),
        Suggestion(
            text=f"Formulate a {request.category or 'skincare'} product optimized for {base_prompt}. Focus on stability, safety, and regulatory compliance.",
            why="Technical considerations ensure the formulation is safe, stable, and compliant",
            how="Mention stability requirements, safety concerns, and regulatory considerations in your prompt"
        )
    ]
    
    return SuggestionResponse(
        suggestions=suggestions,
        success=True,
        message="Mock suggestions generated (AI service unavailable)"
    ) 