import os
import json
from dotenv import load_dotenv
from typing import List, Optional
from openai import OpenAI
from app.models.query import SuggestionRequest, SuggestionResponse, Suggestion, RecommendedSuggestion

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
    elif category == "desi masala":
        return f'''
        You are an Indian spice and masala formulation expert.
        From this user input:
          "{user_prompt}"
        Return strict JSON with keys:
          - product_type (e.g. "traditional garam masala blend")
          - form (e.g. "powder", "paste", "whole spices")
          - concern (e.g. "authentic flavor", "heat level", "shelf life")
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
        
        CRITICAL REQUIREMENTS:
        - 100% of ingredients must be clean (no artificial preservatives, colors, or harmful additives)
        - At least 80% of total ingredients must be natural/organic
        - Prioritize whole food ingredients and natural preservatives
        - Avoid synthetic chemicals, artificial flavors, and processed ingredients
        
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
        
        CRITICAL REQUIREMENTS:
        - 100% of ingredients must be clean (no artificial preservatives, colors, or harmful additives)
        - At least 80% of total ingredients must be natural/organic
        - Prioritize whole food ingredients and natural preservatives
        - Avoid synthetic chemicals, artificial flavors, and processed ingredients
        
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
        
        CRITICAL REQUIREMENTS:
        - 100% of ingredients must be clean (no artificial preservatives, colors, or harmful additives)
        - At least 80% of total ingredients must be natural/organic
        - Prioritize whole food ingredients and natural preservatives
        - Avoid synthetic chemicals, artificial flavors, and processed ingredients
        
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
        
        CRITICAL REQUIREMENTS:
        - 100% of materials must be clean (no harmful chemicals, dyes, or toxic substances)
        - At least 80% of total materials must be natural/organic
        - Prioritize natural fibers and eco-friendly materials
        - Avoid synthetic chemicals, harmful dyes, and non-biodegradable materials
        
        Return valid JSON array of objects:
          – prompt: string
          – why: explanation
          – how: usage tip
        '''
    elif request.category == "desi masala":
        return f'''
        You are an Indian spice and masala formulation expert.
        Given:
          • product_type: {info['product_type']}
          • form: {info['form']}
          • concern: {info['concern']}
          • original_query: "{request.prompt}"
        Craft exactly 3 fully-detailed AI prompts for a masala formulation engine.
        Each must include key spices, target cuisine, flavor profile, and be ready to send to /formulation/generate without edits.
        
        CRITICAL REQUIREMENTS:
        - 100% of ingredients must be clean (no artificial preservatives, colors, or harmful additives)
        - At least 80% of total ingredients must be natural/organic
        - Prioritize whole spices and natural preservatives
        - Avoid synthetic chemicals, artificial flavors, and processed ingredients
        
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
        
        CRITICAL REQUIREMENTS:
        - 100% of ingredients must be clean (no artificial preservatives, colors, or harmful additives)
        - At least 80% of total ingredients must be natural/organic
        - Prioritize whole food ingredients and natural preservatives
        - Avoid synthetic chemicals, artificial fragrances, and processed ingredients
        
        Return valid JSON array of objects:
          – prompt: string
          – why: explanation
          – how: usage tip
        '''

def get_scoring_prompt(suggestions: List[Suggestion], category: str, original_query: str) -> str:
    """Generate prompt for AI to score all suggestions"""
    suggestions_text = ""
    for i, s in enumerate(suggestions, 1):
        suggestions_text += f"\nSuggestion {i}:\n{s.prompt}\n"
    
    return f'''
    You are an expert product formulation consultant with deep knowledge of Indian market trends, manufacturing processes, and product efficacy.
    
    Given these 3 formulation suggestions for category "{category}" based on query "{original_query}":
    {suggestions_text}
    
    Analyze and score EACH suggestion (1-10) based on:
    1. Manufacturing Ease (equipment availability, process complexity, scalability in India)
    2. Indian Market Trends (current consumer preferences, trending ingredients, market demand)
    3. Efficacy Performance (ingredient effectiveness, synergy, proven results)
    4. Shelf Life (stability, preservation, storage requirements)
    
    Return scores and assessments for all 3 suggestions.
    '''

def score_all_suggestions(suggestions: List[Suggestion], category: str, original_query: str) -> List[Suggestion]:
    """Score all suggestions with AI assessment"""
    if not client:
        return generate_mock_scored_suggestions(suggestions, category)
    
    scoring_prompt = get_scoring_prompt(suggestions, category, original_query)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": scoring_prompt}],
            temperature=0,
            max_tokens=800,
            tools=get_scoring_function_definitions(),
            tool_choice={"type": "function", "function": {"name": "score_suggestions"}}
        )
        
        message = response.choices[0].message
        if message.tool_calls and len(message.tool_calls) > 0:
            tool_call = message.tool_calls[0]
            if tool_call.function.name == "score_suggestions":
                try:
                    data = json.loads(tool_call.function.arguments)
                    scores_data = data.get('suggestions', [])
                    
                    # Update suggestions with scores
                    scored_suggestions = []
                    for i, suggestion in enumerate(suggestions):
                        if i < len(scores_data):
                            score_info = scores_data[i]
                            scored_suggestions.append(Suggestion(
                                prompt=suggestion.prompt,
                                why=suggestion.why,
                                how=suggestion.how,
                                score=score_info.get('score', 0.0),
                                manufacturing_ease=score_info.get('manufacturing_ease', ''),
                                indian_market_trends=score_info.get('indian_market_trends', ''),
                                efficacy_performance=score_info.get('efficacy_performance', ''),
                                shelf_life=score_info.get('shelf_life', '')
                            ))
                        else:
                            scored_suggestions.append(suggestion)
                    
                    # Sort suggestions by score in descending order
                    scored_suggestions.sort(key=lambda x: x.score or 0, reverse=True)
                    return scored_suggestions
                except json.JSONDecodeError:
                    pass
        
        return generate_mock_scored_suggestions(suggestions, category)
    except Exception as e:
        print("score_all_suggestions error:", e)
        return generate_mock_scored_suggestions(suggestions, category)

def generate_recommendation(suggestions: List[Suggestion], category: str, user_prompt: str) -> Optional[RecommendedSuggestion]:
    """Generate a model recommendation from scored suggestions"""
    if not suggestions:
        return None
    
    # Find the highest scoring suggestion
    best_suggestion = max(suggestions, key=lambda x: x.score or 0)
    
    # Generate recommendation reason based on category and scores
    if category == "pet food":
        reason = f"This formulation excels in pet safety and nutrition with a score of {best_suggestion.score:.1f}/10. It balances manufacturing feasibility with Indian market preferences for natural pet food."
        strengths = [
            "High safety profile for pets",
            "Excellent manufacturing ease in India",
            "Strong market alignment with natural trends",
            "Optimal nutritional balance"
        ]
    elif category == "wellness":
        reason = f"This wellness formulation achieves the highest overall score of {best_suggestion.score:.1f}/10 by combining proven efficacy with market-ready manufacturing. It aligns perfectly with Indian consumer preferences for natural wellness solutions."
        strengths = [
            "Proven efficacy and performance",
            "Strong Indian market appeal",
            "Excellent manufacturing feasibility",
            "Superior shelf life characteristics"
        ]
    elif category == "beverages":
        reason = f"This beverage formulation scores {best_suggestion.score:.1f}/10 by optimizing taste, nutrition, and production efficiency. It's designed specifically for the Indian beverage market with clean, natural ingredients."
        strengths = [
            "Optimal taste and mouthfeel",
            "Clean label appeal",
            "Efficient production process",
            "Strong market positioning"
        ]
    elif category == "cosmetics":
        reason = f"This cosmetic formulation achieves {best_suggestion.score:.1f}/10 by balancing efficacy with safety and market appeal. It uses clean, natural ingredients preferred by Indian consumers."
        strengths = [
            "Excellent skin compatibility",
            "Clean and natural formulation",
            "Strong market differentiation",
            "Reliable manufacturing process"
        ]
    else:
        reason = f"This formulation scores {best_suggestion.score:.1f}/10 by optimizing manufacturing ease, market trends, efficacy, and shelf life for the Indian market."
        strengths = [
            "Optimal manufacturing efficiency",
            "Strong market alignment",
            "Proven performance",
            "Excellent stability"
        ]
    
    return RecommendedSuggestion(
        suggestion=best_suggestion,
        recommendation_reason=reason,
        confidence_score=best_suggestion.score or 0,
        key_strengths=strengths
    )

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
                    
                    # Score all suggestions
                    scored_suggestions = suggestions
                    if len(suggestions) >= 3:
                        try:
                            scored_suggestions = score_all_suggestions(suggestions, request.category or "general", request.prompt)
                        except Exception as score_error:
                            print(f"Scoring generation error: {score_error}")
                    
                    # Generate recommendation
                    recommendation = None
                    if scored_suggestions and any(s.score for s in scored_suggestions):
                        try:
                            recommendation = generate_recommendation(scored_suggestions, request.category or "general", request.prompt)
                        except Exception as rec_error:
                            print(f"Recommendation generation error: {rec_error}")
                    
                    return SuggestionResponse(
                        suggestions=scored_suggestions, 
                        recommended_suggestion=recommendation,
                        success=True, 
                        message="Enriched suggestions generated with scores and recommendation"
                    )
                except json.JSONDecodeError:
                    return generate_mock_suggestions(request)
        
        return generate_mock_suggestions(request)
    except Exception as e:
        print("generate_suggestions error:", e)
        return generate_mock_suggestions(request)

def generate_mock_scored_suggestions(suggestions: List[Suggestion], category: str) -> List[Suggestion]:
    """Generate mock scored suggestions as fallback"""
    mock_scores = [8.5, 7.2, 6.8]  # Decreasing scores for variety
    mock_assessments = [
        {
            "manufacturing_ease": "High - Uses readily available equipment and standard processes in India",
            "indian_market_trends": "Excellent - Aligns with current consumer preference for natural and clean products",
            "efficacy_performance": "Very Good - Proven ingredient combinations with synergistic effects",
            "shelf_life": "Good - 18-24 months with proper natural preservation"
        },
        {
            "manufacturing_ease": "Medium - Requires specialized equipment but manageable in India",
            "indian_market_trends": "Good - Matches emerging market trends with some innovation",
            "efficacy_performance": "Good - Effective ingredients with moderate synergy",
            "shelf_life": "Fair - 12-18 months with careful preservation"
        },
        {
            "manufacturing_ease": "Medium - Standard manufacturing with some complexity",
            "indian_market_trends": "Fair - Traditional approach with limited market appeal",
            "efficacy_performance": "Fair - Basic effectiveness with room for improvement",
            "shelf_life": "Good - 15-20 months with standard preservation"
        }
    ]
    
    scored_suggestions = []
    for i, suggestion in enumerate(suggestions):
        assessment = mock_assessments[i] if i < len(mock_assessments) else mock_assessments[0]
        scored_suggestions.append(Suggestion(
            prompt=suggestion.prompt,
            why=suggestion.why,
            how=suggestion.how,
            score=mock_scores[i] if i < len(mock_scores) else 6.0,
            manufacturing_ease=assessment["manufacturing_ease"],
            indian_market_trends=assessment["indian_market_trends"],
            efficacy_performance=assessment["efficacy_performance"],
            shelf_life=assessment["shelf_life"]
        ))
    
    # Sort suggestions by score in descending order
    scored_suggestions.sort(key=lambda x: x.score or 0, reverse=True)
    return scored_suggestions

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
    elif category == "desi masala":
        suggestions = [
            Suggestion(
                prompt=f"Create a {category} blend for {base_prompt}. Include key spices, target cuisine type, and desired flavor profile.",
                why="Adding specific spice combinations and flavor details helps create authentic formulations",
                how="Specify exact spices, ratios, and flavor expectations in your prompt"
            ),
            Suggestion(
                prompt=f"Develop a premium {category} solution for {base_prompt}. Consider packaging, shelf life, and target market preferences.",
                why="Market positioning and shelf life details help create commercially viable products",
                how="Include target audience, packaging preferences, and shelf life requirements in your formulation request"
            ),
            Suggestion(
                prompt=f"Formulate a {category} product optimized for {base_prompt}. Focus on authenticity, safety, and food-grade compliance.",
                why="Technical considerations ensure the formulation is authentic, safe, and compliant",
                how="Mention authenticity requirements, safety concerns, and food-grade considerations in your prompt"
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
    # Generate mock scored suggestions
    scored_suggestions = generate_mock_scored_suggestions(suggestions, category)
    
    # Generate mock recommendation
    recommendation = None
    if scored_suggestions:
        try:
            recommendation = generate_recommendation(scored_suggestions, category, request.prompt)
        except Exception as rec_error:
            print(f"Mock recommendation generation error: {rec_error}")
    
    return SuggestionResponse(
        suggestions=scored_suggestions,
        recommended_suggestion=recommendation,
        success=True,
        message=f"Mock suggestions generated for {category} with recommendation (AI service unavailable)"
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

def get_scoring_function_definitions():
    """Define the function schema for scoring all suggestions"""
    return [
        {
            "type": "function",
            "function": {
                "name": "score_suggestions",
                "description": "Score all suggestions based on manufacturing ease, Indian market trends, efficacy, and shelf life",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "suggestions": {
                            "type": "array",
                            "description": "Array of scored suggestions",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "score": {
                                        "type": "number",
                                        "description": "Overall score (0-10)"
                                    },
                                    "manufacturing_ease": {
                                        "type": "string",
                                        "description": "Assessment of manufacturing ease in India"
                                    },
                                    "indian_market_trends": {
                                        "type": "string",
                                        "description": "Alignment with current Indian market trends"
                                    },
                                    "efficacy_performance": {
                                        "type": "string",
                                        "description": "Expected efficacy and performance"
                                    },
                                    "shelf_life": {
                                        "type": "string",
                                        "description": "Shelf life assessment"
                                    }
                                },
                                "required": ["score", "manufacturing_ease", "indian_market_trends", "efficacy_performance", "shelf_life"]
                            }
                        }
                    },
                    "required": ["suggestions"]
                }
            }
        }
    ] 