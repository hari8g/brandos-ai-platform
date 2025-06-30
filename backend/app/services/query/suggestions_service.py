import os
import json
from openai import OpenAI
from app.models.query import SuggestionRequest, SuggestionResponse, Suggestion

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_suggestions(request: SuggestionRequest) -> SuggestionResponse:
    """
    Generate AI-powered suggestions to refine the user's query
    """
    prompt = f"""
    As a cosmetic formulation expert, analyze this user query and provide 3 refined, detailed prompts that would help create better formulations.

    Original Query: "{request.prompt}"
    Category: {request.category or "skincare"}

    For each suggestion, provide:
    1. A refined, detailed prompt text
    2. Why this refinement would help (explanation)
    3. How to implement this approach (specific guidance)

    Please provide a JSON response with the following structure:
    {{
        "suggestions": [
            {{
                "text": "Detailed refined prompt here",
                "why": "Explanation of why this refinement helps",
                "how": "Specific guidance on how to implement"
            }},
            {{
                "text": "Second refined prompt",
                "why": "Why this approach is beneficial",
                "how": "Implementation guidance"
            }},
            {{
                "text": "Third refined prompt",
                "why": "Benefits of this refinement",
                "how": "How to apply this approach"
            }}
        ]
    }}

    Consider:
    - Adding specific ingredient preferences or restrictions
    - Clarifying target skin type and concerns
    - Specifying desired texture and performance
    - Including target audience demographics
    - Adding packaging preferences
    - Mentioning price point or market positioning
    - Including any special requirements (vegan, natural, etc.)
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1500
        )
        
        # Parse the response
        content = response.choices[0].message.content
        print(f"OpenAI Suggestions Response: {content}")
        
        # Extract JSON from response
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        json_str = content[start_idx:end_idx]
        
        data = json.loads(json_str)
        
        # Convert to Suggestion objects
        suggestions = [
            Suggestion(
                text=suggestion["text"],
                why=suggestion["why"],
                how=suggestion["how"]
            )
            for suggestion in data["suggestions"]
        ]
        
        return SuggestionResponse(
            suggestions=suggestions,
            success=True,
            message="Suggestions generated successfully"
        )
        
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        # Fallback to mock suggestions
        return generate_mock_suggestions(request)

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