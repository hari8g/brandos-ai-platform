import os
import json
from dotenv import load_dotenv
from typing import List, Optional
from openai import OpenAI
from app.models.multimodal import MultimodalSuggestionRequest, MultimodalSuggestionResponse, MultimodalSuggestion

# Load environment variables from the root .env file
project_root = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')
load_dotenv(os.path.join(project_root, '.env'))

# Initialize OpenAI client only if API key is available
client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here" and api_key.strip():
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client initialized successfully for multimodal suggestions")
    else:
        print("⚠️ OpenAI API key not found or invalid, will use fallback mock data")
except Exception as e:
    print(f"⚠️ Failed to initialize OpenAI client: {e}")

def get_multimodal_suggestion_prompt(request: MultimodalSuggestionRequest) -> str:
    category = request.category or "cosmetics"
    enhanced_prompt = request.enhanced_prompt
    image_analysis = request.image_analysis
    
    # Extract key insights from image analysis
    product_insights = image_analysis.get('product_insights', [])
    visual_elements = image_analysis.get('visual_elements', [])
    color_scheme = image_analysis.get('color_scheme', 'Not specified')
    packaging_style = image_analysis.get('packaging_style', 'Not specified')
    target_audience = image_analysis.get('target_audience_hints', [])
    formulation_hints = image_analysis.get('formulation_hints', [])
    product_type = image_analysis.get('product_type', 'product')
    
    # Create natural context descriptions
    visual_context = f"with {', '.join(visual_elements[:3])} styling" if visual_elements else ""
    color_context = f"in a {color_scheme} color palette" if color_scheme != 'Not specified' else ""
    packaging_context = f"using {packaging_style} packaging" if packaging_style != 'Not specified' else ""
    audience_context = f"targeting {', '.join(target_audience[:2])}" if target_audience else ""
    
    if category == "pet food":
        return f'''
        You are a pet food formulation expert. Based on the image analysis and user requirements, generate exactly 3 ready-to-use, context-rich prompts for pet food formulation.
        
        IMAGE ANALYSIS CONTEXT:
        - Product Type: {product_type}
        - Visual Elements: {', '.join(visual_elements) if visual_elements else 'Not specified'}
        - Color Scheme: {color_scheme}
        - Packaging Style: {packaging_style}
        - Target Audience: {', '.join(target_audience) if target_audience else 'Not specified'}
        - Key Insights: {', '.join(product_insights) if product_insights else 'Not specified'}
        - Formulation Hints: {', '.join(formulation_hints) if formulation_hints else 'Not specified'}
        
        USER REQUIREMENTS:
        {enhanced_prompt}
        
        Generate 3 natural, flowing prompts that combine the visual insights with user requirements. Each prompt should be:
        - Ready to use immediately for formulation generation
        - Rich in context and natural language
        - Specific to pet nutrition and safety
        - Incorporating visual elements, target audience, and formulation hints
        - Free-flowing and conversational, not structured
        
        Examples of the style you should use:
        - "Create a premium pet food formula for [specific need] that matches the [visual style] aesthetic with [color scheme] packaging, targeting [audience] who value [benefits]..."
        - "Develop a [product type] formulation that incorporates [ingredients] for [benefits], designed with [visual elements] styling and [packaging] for [target audience]..."
        - "Formulate a [product type] that addresses [specific concerns] while maintaining the [visual style] and [color scheme] that appeals to [audience]..."
        
        Return valid JSON array of objects:
        - prompt: A complete, ready-to-use formulation prompt with rich context
        - why: Business benefits including market positioning, competitive advantages, target audience appeal, unique selling propositions, ease of marketing, and potential for premium pricing that make this formulation attractive to consumers and profitable for the brand
        - how: Strategic implementation guidance covering sales potential, brand differentiation, market penetration strategies, and how to leverage the formulation's unique attributes for maximum market impact and customer acquisition
        '''
    elif category == "wellness":
        return f'''
        You are a wellness supplement formulation expert. Based on the image analysis and user requirements, generate exactly 3 ready-to-use, context-rich prompts for wellness supplement formulation.
        
        IMAGE ANALYSIS CONTEXT:
        - Product Type: {product_type}
        - Visual Elements: {', '.join(visual_elements) if visual_elements else 'Not specified'}
        - Color Scheme: {color_scheme}
        - Packaging Style: {packaging_style}
        - Target Audience: {', '.join(target_audience) if target_audience else 'Not specified'}
        - Key Insights: {', '.join(product_insights) if product_insights else 'Not specified'}
        - Formulation Hints: {', '.join(formulation_hints) if formulation_hints else 'Not specified'}
        
        USER REQUIREMENTS:
        {enhanced_prompt}
        
        Generate 3 natural, flowing prompts that combine the visual insights with user requirements. Each prompt should be:
        - Ready to use immediately for formulation generation
        - Rich in context and natural language
        - Specific to wellness benefits and efficacy
        - Incorporating visual elements, target audience, and formulation hints
        - Free-flowing and conversational, not structured
        
        Examples of the style you should use:
        - "Create a wellness supplement for [specific health goal] that embodies the [visual style] aesthetic with [color scheme] presentation, designed for [audience] who prioritize [benefits]..."
        - "Develop a [product type] formulation featuring [ingredients] for [health benefits], packaged with [visual elements] styling and [packaging] for [target audience]..."
        - "Formulate a [product type] that supports [specific wellness needs] while maintaining the [visual style] and [color scheme] that resonates with [audience]..."
        
        Return valid JSON array of objects:
        - prompt: A complete, ready-to-use formulation prompt with rich context
        - why: Business benefits including market positioning, competitive advantages, target audience appeal, unique selling propositions, ease of marketing, and potential for premium pricing that make this formulation attractive to consumers and profitable for the brand
        - how: Strategic implementation guidance covering sales potential, brand differentiation, market penetration strategies, and how to leverage the formulation's unique attributes for maximum market impact and customer acquisition
        '''
    else:
        return f'''
        You are a cosmetic formulation expert. Based on the image analysis and user requirements, generate exactly 3 ready-to-use, context-rich prompts for cosmetic formulation.
        
        IMAGE ANALYSIS CONTEXT:
        - Product Type: {product_type}
        - Visual Elements: {', '.join(visual_elements) if visual_elements else 'Not specified'}
        - Color Scheme: {color_scheme}
        - Packaging Style: {packaging_style}
        - Target Audience: {', '.join(target_audience) if target_audience else 'Not specified'}
        - Key Insights: {', '.join(product_insights) if product_insights else 'Not specified'}
        - Formulation Hints: {', '.join(formulation_hints) if formulation_hints else 'Not specified'}
        
        USER REQUIREMENTS:
        {enhanced_prompt}
        
        Generate 3 natural, flowing prompts that combine the visual insights with user requirements. Each prompt should be:
        - Ready to use immediately for formulation generation
        - Rich in context and natural language
        - Specific to skin benefits and beauty efficacy
        - Incorporating visual elements, target audience, and formulation hints
        - Free-flowing and conversational, not structured
        
        Examples of the style you should use:
        - "Create a premium skincare formula for [specific skin concern] that matches the [visual style] aesthetic with [color scheme] packaging, targeting [audience] who value [benefits]..."
        - "Develop a [product type] formulation featuring [ingredients] for [skin benefits], designed with [visual elements] styling and [packaging] for [target audience]..."
        - "Formulate a [product type] that addresses [specific skin needs] while maintaining the [visual style] and [color scheme] that appeals to [audience]..."
        
        Return valid JSON array of objects:
        - prompt: A complete, ready-to-use formulation prompt with rich context
        - why: Business benefits including market positioning, competitive advantages, target audience appeal, unique selling propositions, ease of marketing, and potential for premium pricing that make this formulation attractive to consumers and profitable for the brand
        - how: Strategic implementation guidance covering sales potential, brand differentiation, market penetration strategies, and how to leverage the formulation's unique attributes for maximum market impact and customer acquisition
        '''

def generate_multimodal_suggestions(request: MultimodalSuggestionRequest) -> MultimodalSuggestionResponse:
    # If OpenAI client is not available, use mock suggestions
    if not client:
        return generate_mock_multimodal_suggestions(request)
    
    suggestion_prompt = get_multimodal_suggestion_prompt(request)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": suggestion_prompt}],
            temperature=0.7,
            max_tokens=1000,
            tools=get_multimodal_suggestions_function_definitions(),
            tool_choice={"type": "function", "function": {"name": "generate_multimodal_suggestions"}}
        )
        
        message = response.choices[0].message
        if message.tool_calls and len(message.tool_calls) > 0:
            tool_call = message.tool_calls[0]
            if tool_call.function.name == "generate_multimodal_suggestions":
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
                                suggestions.append(MultimodalSuggestion(prompt=prompt, why=why, how=how))
                        except Exception as e:
                            print(f"Error processing multimodal suggestion: {e}")
                            continue
                    
                    # If no valid suggestions were created, use fallback
                    if not suggestions:
                        return generate_mock_multimodal_suggestions(request)
                    
                    return MultimodalSuggestionResponse(suggestions=suggestions, success=True, message="Multimodal suggestions generated")
                except json.JSONDecodeError:
                    return generate_mock_multimodal_suggestions(request)
        
        return generate_mock_multimodal_suggestions(request)
    except Exception as e:
        print("generate_multimodal_suggestions error:", e)
        return generate_mock_multimodal_suggestions(request)

def generate_mock_multimodal_suggestions(request: MultimodalSuggestionRequest) -> MultimodalSuggestionResponse:
    """Generate mock multimodal suggestions with natural language prompts as fallback"""
    category = request.category or 'cosmetics'
    enhanced_prompt = request.enhanced_prompt
    
    if category == "pet food":
        suggestions = [
            MultimodalSuggestion(
                prompt=f"Create a premium pet food formula that addresses {enhanced_prompt} while incorporating visual elements from the image analysis. Design a formulation that matches the aesthetic and packaging style identified, targeting the specific audience demographics revealed through visual analysis. Include ingredients that align with both nutritional requirements and the visual branding cues.",
                why="This premium positioning strategy enables 30-40% higher pricing while targeting affluent pet parents who prioritize quality. The visual alignment creates instant brand recognition and trust, making it easier to command premium prices and build customer loyalty. The demographic targeting ensures high conversion rates and repeat purchases.",
                how="Leverage the premium packaging and visual elements for influencer marketing and social media campaigns. Use the target demographic insights for precise digital advertising. The unique visual identity allows for strong shelf presence and differentiation from competitors, driving impulse purchases and brand recall."
            ),
            MultimodalSuggestion(
                prompt=f"Develop a {category} formulation that incorporates key ingredients identified through visual analysis while addressing {enhanced_prompt}. Design the product to match the color scheme and packaging style from the image, ensuring it appeals to the target audience while meeting your specific formulation requirements.",
                why="This approach creates a unique market position that combines functional benefits with visual appeal, enabling 25-35% price premium. The ingredient-storytelling potential drives social media engagement and word-of-mouth marketing. The visual consistency builds brand recognition and trust, leading to higher customer lifetime value.",
                how="Use the visual elements for compelling product photography and video content. Leverage the ingredient story for educational marketing campaigns. The packaging design enables premium retail placement and creates opportunities for subscription models and repeat purchases."
            ),
            MultimodalSuggestion(
                prompt=f"Formulate a {category} product that addresses {enhanced_prompt} while maintaining the visual style and target audience appeal identified in the image analysis. Incorporate formulation hints and ingredients that complement the packaging design and color scheme for optimal market positioning.",
                why="This strategic positioning creates a differentiated product that can capture 20-30% market share in the target segment. The visual-branding alignment enables premium pricing while the functional benefits drive customer satisfaction and retention. The unique combination creates barriers to competition and builds brand equity.",
                how="Implement a multi-channel marketing strategy using the visual elements for digital and print campaigns. Leverage the target audience insights for precise customer acquisition. Use the unique positioning for trade show presentations and retail partnerships, driving both online and offline sales growth."
            )
        ]
    elif category == "wellness":
        suggestions = [
            MultimodalSuggestion(
                prompt=f"Create a wellness supplement that addresses {enhanced_prompt} while embodying the visual aesthetic and target audience preferences identified in the image analysis. Design a formulation that incorporates key ingredients and benefits that align with both your requirements and the visual branding elements.",
                why="This premium wellness positioning enables 40-50% higher pricing while targeting health-conscious consumers who value quality. The visual-branding alignment creates trust and credibility in the competitive supplement market. The demographic targeting ensures high conversion rates and subscription potential.",
                how="Leverage the premium visual elements for influencer partnerships and educational content marketing. Use the target demographic insights for precise social media advertising. The unique positioning enables premium retail placement and creates opportunities for subscription models and repeat purchases."
            ),
            MultimodalSuggestion(
                prompt=f"Develop a {category} formulation featuring ingredients and benefits that address {enhanced_prompt} while matching the visual style and packaging design from the image. Ensure the product appeals to the target demographic while delivering the specific wellness benefits you require.",
                why="This approach creates a differentiated wellness product that can capture 25-35% market share in the target segment. The ingredient-benefit storytelling drives social media engagement and word-of-mouth marketing. The visual consistency builds brand recognition and trust, leading to higher customer lifetime value.",
                how="Use the visual elements for compelling product photography and educational video content. Leverage the ingredient story for content marketing campaigns. The packaging design enables premium retail placement and creates opportunities for health practitioner partnerships and direct-to-consumer sales."
            ),
            MultimodalSuggestion(
                prompt=f"Formulate a {category} product that supports {enhanced_prompt} while maintaining the visual aesthetic and target audience appeal identified through image analysis. Incorporate formulation elements that complement the packaging design and color scheme for optimal market positioning.",
                why="This strategic positioning creates a unique wellness offering that can command 30-40% price premium while building strong brand loyalty. The visual-functional alignment enables premium pricing while the health benefits drive customer satisfaction and retention. The unique combination creates barriers to competition.",
                how="Implement a health-focused marketing strategy using the visual elements for digital and print campaigns. Leverage the target audience insights for precise customer acquisition. Use the unique positioning for health practitioner partnerships and retail collaborations, driving both online and offline sales growth."
            )
        ]
    else:
        suggestions = [
            MultimodalSuggestion(
                prompt=f"Create a premium skincare formula that addresses {enhanced_prompt} while matching the visual aesthetic and target audience preferences identified in the image analysis. Design a formulation that incorporates key ingredients and benefits that align with both your requirements and the visual branding elements.",
                why="This luxury beauty positioning enables 50-60% higher pricing while targeting affluent consumers who prioritize quality. The visual-branding alignment creates instant recognition and trust in the competitive beauty market. The demographic targeting ensures high conversion rates and strong brand loyalty.",
                how="Leverage the premium visual elements for influencer partnerships and social media campaigns. Use the target demographic insights for precise digital advertising. The unique positioning enables premium retail placement and creates opportunities for subscription models and repeat purchases."
            ),
            MultimodalSuggestion(
                prompt=f"Develop a {category} formulation featuring ingredients and benefits that address {enhanced_prompt} while matching the visual style and packaging design from the image. Ensure the product appeals to the target demographic while delivering the specific skin benefits you require.",
                why="This approach creates a differentiated beauty product that can capture 30-40% market share in the target segment. The ingredient-benefit storytelling drives social media engagement and word-of-mouth marketing. The visual consistency builds brand recognition and trust, leading to higher customer lifetime value.",
                how="Use the visual elements for compelling product photography and video content. Leverage the ingredient story for educational marketing campaigns. The packaging design enables premium retail placement and creates opportunities for beauty influencer partnerships and direct-to-consumer sales."
            ),
            MultimodalSuggestion(
                prompt=f"Formulate a {category} product that addresses {enhanced_prompt} while maintaining the visual aesthetic and target audience appeal identified through image analysis. Incorporate formulation elements that complement the packaging design and color scheme for optimal market positioning.",
                why="This strategic positioning creates a unique beauty offering that can command 40-50% price premium while building strong brand loyalty. The visual-functional alignment enables premium pricing while the skin benefits drive customer satisfaction and retention. The unique combination creates barriers to competition.",
                how="Implement a beauty-focused marketing strategy using the visual elements for digital and print campaigns. Leverage the target audience insights for precise customer acquisition. Use the unique positioning for beauty retailer partnerships and influencer collaborations, driving both online and offline sales growth."
            )
        ]
    
    return MultimodalSuggestionResponse(
        suggestions=suggestions,
        success=True,
        message=f"Mock multimodal suggestions generated for {category} (AI service unavailable)"
    )

def get_multimodal_suggestions_function_definitions():
    """Define the function schema for multimodal suggestions generation"""
    return [
        {
            "type": "function",
            "function": {
                "name": "generate_multimodal_suggestions",
                "description": "Generate 3 detailed AI prompts for multimodal formulation",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "suggestions": {
                            "type": "array",
                            "description": "Array of 3 detailed multimodal suggestions",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "prompt": {
                                        "type": "string",
                                        "description": "Detailed AI prompt for multimodal formulation"
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