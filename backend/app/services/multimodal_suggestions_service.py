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
    product_insights = "\n".join([f"• {insight}" for insight in image_analysis.get('product_insights', [])])
    visual_elements = "\n".join([f"• {element}" for element in image_analysis.get('visual_elements', [])])
    color_scheme = image_analysis.get('color_scheme', 'Not specified')
    packaging_style = image_analysis.get('packaging_style', 'Not specified')
    target_audience = "\n".join([f"• {hint}" for hint in image_analysis.get('target_audience_hints', [])])
    
    if category == "pet food":
        return f'''
        You are a pet food formulation expert with expertise in image analysis.
        
        Based on the following image analysis and enhanced prompt, generate exactly 3 detailed AI prompts for pet food formulation.
        
        IMAGE ANALYSIS:
        Product Insights:
        {product_insights}
        
        Visual Elements:
        {visual_elements}
        
        Color Scheme: {color_scheme}
        Packaging Style: {packaging_style}
        Target Audience: {target_audience}
        
        ENHANCED PROMPT:
        {enhanced_prompt}
        
        Generate 3 comprehensive prompts that combine the visual insights with the enhanced prompt. Each prompt should:
        - Include specific ingredients based on visual cues
        - Consider the target audience from image analysis
        - Incorporate packaging and color preferences
        - Be ready for immediate formulation generation
        - Focus on pet nutrition, safety, and palatability
        
        Return valid JSON array of objects:
        - prompt: detailed AI prompt for formulation
        - why: explanation of why this suggestion is valuable
        - how: usage tip for this suggestion
        '''
    elif category == "wellness":
        return f'''
        You are a wellness supplement formulation expert with expertise in image analysis.
        
        Based on the following image analysis and enhanced prompt, generate exactly 3 detailed AI prompts for wellness supplement formulation.
        
        IMAGE ANALYSIS:
        Product Insights:
        {product_insights}
        
        Visual Elements:
        {visual_elements}
        
        Color Scheme: {color_scheme}
        Packaging Style: {packaging_style}
        Target Audience: {target_audience}
        
        ENHANCED PROMPT:
        {enhanced_prompt}
        
        Generate 3 comprehensive prompts that combine the visual insights with the enhanced prompt. Each prompt should:
        - Include specific ingredients based on visual cues
        - Consider the target audience from image analysis
        - Incorporate packaging and color preferences
        - Be ready for immediate formulation generation
        - Focus on wellness benefits, safety, and efficacy
        
        Return valid JSON array of objects:
        - prompt: detailed AI prompt for formulation
        - why: explanation of why this suggestion is valuable
        - how: usage tip for this suggestion
        '''
    else:
        return f'''
        You are a cosmetic formulation expert with expertise in image analysis.
        
        Based on the following image analysis and enhanced prompt, generate exactly 3 detailed AI prompts for cosmetic formulation.
        
        IMAGE ANALYSIS:
        Product Insights:
        {product_insights}
        
        Visual Elements:
        {visual_elements}
        
        Color Scheme: {color_scheme}
        Packaging Style: {packaging_style}
        Target Audience: {target_audience}
        
        ENHANCED PROMPT:
        {enhanced_prompt}
        
        Generate 3 comprehensive prompts that combine the visual insights with the enhanced prompt. Each prompt should:
        - Include specific ingredients based on visual cues
        - Consider the target audience from image analysis
        - Incorporate packaging and color preferences
        - Be ready for immediate formulation generation
        - Focus on skin benefits, safety, and efficacy
        
        Return valid JSON array of objects:
        - prompt: detailed AI prompt for formulation
        - why: explanation of why this suggestion is valuable
        - how: usage tip for this suggestion
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
    """Generate mock multimodal suggestions as fallback"""
    category = request.category or 'cosmetics'
    enhanced_prompt = request.enhanced_prompt
    
    if category == "pet food":
        suggestions = [
            MultimodalSuggestion(
                prompt=f"Create a premium {category} product based on visual analysis: {enhanced_prompt}. Include specific ingredients for target audience, consider packaging preferences, and ensure nutritional balance.",
                why="Combining visual insights with enhanced prompt creates more targeted formulations",
                how="Use the visual cues to inform ingredient selection and packaging decisions"
            ),
            MultimodalSuggestion(
                prompt=f"Develop a {category} formulation optimized for visual appeal: {enhanced_prompt}. Focus on ingredients that match the color scheme and packaging style identified in the image.",
                why="Visual consistency between ingredients and packaging enhances product appeal",
                how="Match ingredient colors and textures to the visual elements from the image"
            ),
            MultimodalSuggestion(
                prompt=f"Formulate a {category} product for the identified target audience: {enhanced_prompt}. Incorporate visual insights to create a product that meets specific demographic needs and preferences.",
                why="Target audience insights from image analysis improve product-market fit",
                how="Use visual cues to understand and address specific audience preferences"
            )
        ]
    elif category == "wellness":
        suggestions = [
            MultimodalSuggestion(
                prompt=f"Create a {category} supplement based on visual analysis: {enhanced_prompt}. Include ingredients that align with the visual elements and target audience identified in the image.",
                why="Visual analysis provides insights into user preferences and product positioning",
                how="Use color schemes and packaging styles to inform ingredient and delivery form choices"
            ),
            MultimodalSuggestion(
                prompt=f"Develop a premium {category} blend considering visual cues: {enhanced_prompt}. Focus on ingredients that complement the identified color scheme and packaging aesthetic.",
                why="Visual consistency enhances user experience and brand perception",
                how="Align ingredient presentation with the visual style identified in the image"
            ),
            MultimodalSuggestion(
                prompt=f"Formulate a {category} product for the target demographic: {enhanced_prompt}. Use visual insights to create formulations that appeal to the identified audience segment.",
                why="Understanding target audience from visual analysis improves product relevance",
                how="Incorporate visual preferences into ingredient selection and product positioning"
            )
        ]
    else:
        suggestions = [
            MultimodalSuggestion(
                prompt=f"Create a {category} product based on visual analysis: {enhanced_prompt}. Include ingredients that match the color scheme, packaging style, and target audience identified in the image.",
                why="Visual analysis provides valuable insights for formulation decisions",
                how="Use color schemes and packaging elements to guide ingredient selection"
            ),
            MultimodalSuggestion(
                prompt=f"Develop a premium {category} solution considering visual cues: {enhanced_prompt}. Focus on ingredients that complement the identified aesthetic and target demographic.",
                why="Visual consistency enhances product appeal and user experience",
                how="Align formulation with the visual style and audience preferences from the image"
            ),
            MultimodalSuggestion(
                prompt=f"Formulate a {category} product optimized for the target audience: {enhanced_prompt}. Use visual insights to create formulations that meet specific demographic needs and preferences.",
                why="Understanding target audience from visual analysis improves product-market fit",
                how="Incorporate visual preferences into ingredient selection and product positioning"
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