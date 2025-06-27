"""
Query quality assessment endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import openai
import os
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["query"])

class QueryAssessmentRequest(BaseModel):
    text: str
    category: Optional[str] = None

class QueryAssessmentResponse(BaseModel):
    score: int
    feedback: str
    needs_improvement: bool
    suggestions: List[str]
    improvement_examples: List[str]
    missing_elements: List[str]
    confidence_level: str
    can_generate_formulation: bool
    formulation_warnings: List[str]

class QueryQualityAssessor:
    def __init__(self):
        self.openai_client = None
    
    def _get_openai_client(self):
        """Lazy initialization of OpenAI client."""
        if self.openai_client is None:
            api_key = os.getenv("OPENAI_API_KEY")
            logger.info(f"OpenAI API key loaded: {'Yes' if api_key else 'No'}")
            if not api_key:
                logger.warning("OPENAI_API_KEY not set, using fallback assessment")
                return None
            try:
                self.openai_client = openai.OpenAI(api_key=api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing OpenAI client: {e}")
                return None
        return self.openai_client
    
    def assess_query_quality(self, query: str, category: str = None) -> QueryAssessmentResponse:
        """
        Assess query quality using a 7-point grading system with enhanced guidance.
        
        Grading Criteria:
        1. Clarity and specificity
        2. Technical detail level
        3. Safety considerations mentioned
        4. Target audience specified
        5. Performance goals stated
        6. Ingredient preferences/restrictions
        7. Formulation type clarity
        """
        
        # Try OpenAI first
        client = self._get_openai_client()
        if client:
            prompt = f"""
            You are a formulation expert assessing the quality of a product development query.
            
            Query: "{query}"
            Category: {category or "General"}
            
            Rate this query on a 7-point scale where:
            1 = Very poor (vague, lacks essential details)
            2 = Poor (missing most important details)
            3 = Below average (some details but insufficient)
            4 = Average (adequate but could be better)
            5 = Good (most details present)
            6 = Very good (comprehensive and clear)
            7 = Excellent (detailed, specific, and actionable)
            
            Consider these factors:
            - Clarity and specificity of the request
            - Technical detail level appropriate for formulation
            - Safety considerations mentioned
            - Target audience specified
            - Performance goals stated
            - Ingredient preferences or restrictions
            - Formulation type clarity (serum, cream, gel, etc.)
            
            Provide your response in this exact JSON format:
            {{
                "score": <1-7>,
                "feedback": "<detailed feedback explaining the score and what's good/bad>",
                "needs_improvement": <true if score < 5, false otherwise>,
                "suggestions": [
                    "<specific actionable suggestion 1>",
                    "<specific actionable suggestion 2>",
                    "<specific actionable suggestion 3>"
                ],
                "improvement_examples": [
                    "<example of how to improve the query>",
                    "<another example>"
                ],
                "missing_elements": [
                    "<missing element 1>",
                    "<missing element 2>"
                ],
                "confidence_level": "<low/medium/high based on query clarity>",
                "can_generate_formulation": <true/false - can we still generate something useful>,
                "formulation_warnings": [
                    "<warning about what might be missing in formulation>",
                    "<another warning>"
                ]
            }}
            
            Focus on actionable suggestions that would help improve the query for better formulation results.
            Be encouraging and constructive in your feedback.
            """
            
            try:
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a formulation expert with deep knowledge of cosmetic and pharmaceutical product development. Be encouraging and helpful in your feedback."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=800
                )
                
                # Parse the response
                content = response.choices[0].message.content
                import re
                
                # Extract JSON from the response
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    assessment_data = json.loads(json_match.group())
                    return QueryAssessmentResponse(**assessment_data)
                else:
                    logger.warning("Could not parse JSON from OpenAI response")
                    
            except Exception as e:
                logger.error(f"Error assessing query quality with OpenAI: {e}")
                logger.error(f"Error details: {str(e)}")
        
        # Fallback assessment
        return self._generate_fallback_assessment(query, category)
    
    def _generate_fallback_assessment(self, query: str, category: str = None) -> QueryAssessmentResponse:
        """Generate a fallback assessment when OpenAI is unavailable."""
        
        # Simple heuristic-based assessment
        query_lower = query.lower()
        score = 3  # Default to below average
        
        # Basic scoring logic
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
        
        improvement_examples = [
            f"Instead of '{query}', try: 'I need a lightweight serum for oily, acne-prone skin that contains salicylic acid and niacinamide for blemish control'",
            f"Or: 'Create a rich anti-aging night cream for mature, dry skin with retinol and hyaluronic acid, suitable for sensitive skin'"
        ]
        
        missing_elements = []
        if not any(word in query_lower for word in ['serum', 'cream', 'gel', 'lotion']):
            missing_elements.append("Product type")
        if not any(word in query_lower for word in ['skin', 'face', 'body']):
            missing_elements.append("Target area")
        if not any(word in query_lower for word in ['oily', 'dry', 'sensitive', 'normal']):
            missing_elements.append("Skin type")
        
        confidence_level = "medium" if score >= 4 else "low"
        can_generate_formulation = True  # Always try to generate something
        
        formulation_warnings = []
        if score < 4:
            formulation_warnings.append("Formulation may be generic due to limited query details")
            formulation_warnings.append("Consider refining your query for more specific results")
        
        if category == "skincare":
            suggestions.extend([
                "Specify skin concerns (acne, aging, dryness, hyperpigmentation, etc.)",
                "Mention skin type (oily, dry, combination, sensitive, normal)",
                "Include any allergies or sensitivities"
            ])
        
        return QueryAssessmentResponse(
            score=score,
            feedback=f"Query scored {score}/7. {'Needs improvement' if needs_improvement else 'Good quality'}. We can still generate a formulation, but more details would help create a more targeted product.",
            needs_improvement=needs_improvement,
            suggestions=suggestions,
            improvement_examples=improvement_examples,
            missing_elements=missing_elements,
            confidence_level=confidence_level,
            can_generate_formulation=can_generate_formulation,
            formulation_warnings=formulation_warnings
        )

# Initialize the assessor
assessor = QueryQualityAssessor()

@router.post("/assess", response_model=QueryAssessmentResponse)
async def assess_query_quality(request: QueryAssessmentRequest):
    """
    Assess the quality of a formulation query using a 7-point grading system with enhanced guidance.
    """
    try:
        logger.info(f"Assessing query quality for: {request.text[:50]}...")
        
        assessment = assessor.assess_query_quality(
            query=request.text,
            category=request.category
        )
        
        logger.info(f"Query assessment completed. Score: {assessment.score}/7")
        return assessment
        
    except Exception as e:
        logger.error(f"Error in query assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to assess query quality: {str(e)}") 