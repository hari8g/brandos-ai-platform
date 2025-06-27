"""
Formulation generation endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import openai
import os
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/formulation", tags=["formulation"])

class FormulationRequest(BaseModel):
    text: str
    category: Optional[str] = None
    location: Optional[str] = None
    skip_quality_check: Optional[bool] = False

class Supplier(BaseModel):
    name: str
    location: str
    url: Optional[str] = None
    price_per_100ml: float

class Alternative(BaseModel):
    name: str
    price_impact: float
    reasoning: str

class Ingredient(BaseModel):
    name: str
    percent: float
    cost_per_100ml: float
    suppliers: List[Supplier] = []
    alternatives: List[Alternative] = []

class Pricing(BaseModel):
    small_batch: float
    medium_scale: float
    reasoning: str

class FormulationResponse(BaseModel):
    product_name: str
    ingredients: List[Ingredient]
    estimated_cost: float
    predicted_ph: float
    reasoning: str
    safety_notes: List[str]
    category: Optional[str] = None
    pricing: Pricing
    query_quality_score: Optional[int] = None
    query_quality_feedback: Optional[str] = None
    quality_warnings: List[str] = []
    improvement_suggestions: List[str] = []

def assess_query_quality_simple(query: str, category: str = None) -> Dict[str, Any]:
    """Simple query quality assessment without external dependencies."""
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
    
    formulation_warnings = []
    if score < 4:
        formulation_warnings.append("⚠️ This formulation is based on limited information. Consider refining your query for more targeted results.")
        formulation_warnings.append("⚠️ The formulation may be generic due to vague query details.")
    
    return {
        "score": score,
        "feedback": f"Query scored {score}/7. {'Needs improvement' if needs_improvement else 'Good quality'}. We can still generate a formulation, but more details would help create a more targeted product.",
        "needs_improvement": needs_improvement,
        "suggestions": suggestions,
        "formulation_warnings": formulation_warnings
    }

class FormulationGenerator:
    def __init__(self):
        self.openai_client = None
    
    def _get_openai_client(self):
        """Lazy initialization of OpenAI client."""
        if self.openai_client is None:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                logger.warning("OPENAI_API_KEY not set, using fallback formulations")
                return None
            self.openai_client = openai.OpenAI(api_key=api_key)
        return self.openai_client
    
    def generate_formulation(self, query: str, category: str = None, location: str = None, skip_quality_check: bool = False) -> FormulationResponse:
        """
        Generate a comprehensive formulation using OpenAI API with query quality assessment.
        """
        
        # Assess query quality first (unless skipped)
        quality_score = None
        quality_feedback = None
        quality_warnings = []
        improvement_suggestions = []
        
        if not skip_quality_check:
            try:
                quality_assessment = assess_query_quality_simple(query, category)
                quality_score = quality_assessment["score"]
                quality_feedback = quality_assessment["feedback"]
                quality_warnings = quality_assessment["formulation_warnings"]
                improvement_suggestions = quality_assessment["suggestions"]
                
                logger.info(f"Query quality assessment: {quality_score}/7")
                    
            except Exception as e:
                logger.warning(f"Failed to assess query quality: {e}")
        
        # Try OpenAI first
        client = self._get_openai_client()
        if client:
            # Enhance prompt with quality context
            quality_context = ""
            if quality_score and quality_score < 4:
                quality_context = f"""
                IMPORTANT: The user's query scored {quality_score}/7 for quality. 
                The query may be vague or missing important details. 
                Generate a safe, general formulation that covers common use cases.
                Include warnings about the limitations of the formulation due to limited query information.
                """
            
            prompt = f'''
            You are an expert cosmetic formulator and supply chain analyst.
            Generate a complete formulation based on this request: "{query}"
            Category: {category or "General"}
            Location: {location or "India"}
            {quality_context}

            For each ingredient, provide:
            - name
            - percent
            - cost_per_100ml (INR)
            - suppliers: list of up to 3 suppliers (name, location, url, price_per_100ml)
            - alternatives: up to 2 alternatives (name, price_impact, reasoning)

            Also provide:
            - pricing: expected product price for small_batch (100 units) and medium_scale (10,000 units), with reasoning

            In the 'reasoning' field, provide a step-by-step, detailed explanation of the formulation process, including:
            - Why each ingredient was chosen
            - The order and method of mixing
            - Any temperature, solubility, or pH considerations
            - Safety and quality control steps
            - Packaging and finishing advice
            Make this section as detailed and practical as possible, suitable for a professional formulator.

            Respond in this exact JSON format:
            {{{{
              "product_name": "<string>",
              "ingredients": [
                {{{{
                  "name": "<ingredient name>",
                  "percent": <percentage>,
                  "cost_per_100ml": <float>,
                  "suppliers": [
                    {{{{"name": "<supplier name>", "location": "<location>", "url": "<url>", "price_per_100ml": <float>}}}}
                  ],
                  "alternatives": [
                    {{{{"name": "<alt name>", "price_impact": <float>, "reasoning": "<string>"}}}}
                  ]
                }}}}
              ],
              "estimated_cost": <float>,
              "predicted_ph": <float>,
              "reasoning": "<string>",
              "safety_notes": ["<string>", ...],
              "category": "<string>",
              "pricing": {{{{
                "small_batch": <float>,
                "medium_scale": <float>,
                "reasoning": "<string>"
              }}}}
            }}}}
            '''
            try:
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a senior cosmetic formulator and supply chain expert."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=1500
                )
                content = response.choices[0].message.content
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    formulation_data = json.loads(json_match.group())
                    # Parse ingredients
                    if "ingredients" in formulation_data:
                        ingredients = []
                        for ing in formulation_data["ingredients"]:
                            suppliers = [
                                Supplier(**sup) for sup in ing.get("suppliers", [])
                            ]
                            alternatives = [
                                Alternative(**alt) for alt in ing.get("alternatives", [])
                            ]
                            ingredients.append(Ingredient(
                                name=ing["name"],
                                percent=float(ing["percent"]),
                                cost_per_100ml=float(ing.get("cost_per_100ml", 0)),
                                suppliers=suppliers,
                                alternatives=alternatives
                            ))
                        formulation_data["ingredients"] = ingredients
                    # Parse pricing
                    if "pricing" in formulation_data:
                        pricing = formulation_data["pricing"]
                        formulation_data["pricing"] = Pricing(
                            small_batch=float(pricing.get("small_batch", 0)),
                            medium_scale=float(pricing.get("medium_scale", 0)),
                            reasoning=pricing.get("reasoning", "")
                        )
                    
                    # Add quality assessment data
                    formulation_data["query_quality_score"] = quality_score
                    formulation_data["query_quality_feedback"] = quality_feedback
                    formulation_data["quality_warnings"] = quality_warnings
                    formulation_data["improvement_suggestions"] = improvement_suggestions
                    
                    return FormulationResponse(**formulation_data)
            except Exception as e:
                logger.error(f"Error generating formulation with OpenAI: {e}")
        
        # Fallback with quality warnings
        fallback_suppliers = [
            Supplier(name="Acme Chemicals", location=location or "India", url="https://acmechem.com", price_per_100ml=50.0),
            Supplier(name="Global Ingredients", location="Singapore", url="https://globalingredients.com", price_per_100ml=55.0),
            Supplier(name="LocalMart", location=location or "India", url=None, price_per_100ml=48.0)
        ]
        fallback_alternatives = [
            Alternative(name="Glycerin", price_impact=-5.0, reasoning="Cheaper but less moisturizing."),
            Alternative(name="Propylene Glycol", price_impact=-3.0, reasoning="Similar texture, slightly lower cost.")
        ]
        fallback_ingredients = [
            Ingredient(
                name="Water",
                percent=70.0,
                cost_per_100ml=10.0,
                suppliers=fallback_suppliers,
                alternatives=fallback_alternatives
            ),
            Ingredient(
                name="Glycerin",
                percent=5.0,
                cost_per_100ml=30.0,
                suppliers=fallback_suppliers,
                alternatives=fallback_alternatives
            )
        ]
        fallback_pricing = Pricing(
            small_batch=250.0,
            medium_scale=120.0,
            reasoning="Small batch has higher per-unit cost due to less bulk purchasing and higher overhead. Medium scale benefits from economies of scale."
        )
        
        # Add quality warnings to fallback
        if not quality_warnings:
            quality_warnings = ["⚠️ Using fallback formulation due to API limitations"]
        
        return FormulationResponse(
            product_name="Fallback Moisturizer",
            ingredients=fallback_ingredients,
            estimated_cost=200.0,
            predicted_ph=5.5,
            reasoning="A simple, safe moisturizer with cost-effective ingredients.",
            safety_notes=["Patch test before use", "Store in a cool place"],
            category=category,
            pricing=fallback_pricing,
            query_quality_score=quality_score,
            query_quality_feedback=quality_feedback,
            quality_warnings=quality_warnings,
            improvement_suggestions=improvement_suggestions
        )

# Initialize the generator
generator = FormulationGenerator()

@router.post("/generate", response_model=FormulationResponse)
async def generate_formulation(request: FormulationRequest):
    """
    Generate a formulation based on the input text and category using OpenAI API.
    """
    try:
        logger.info(f"Generating formulation for: {request.text[:50]}...")
        
        formulation = generator.generate_formulation(
            query=request.text,
            category=request.category or "General",
            location=request.location or "India",
            skip_quality_check=request.skip_quality_check or False
        )
        
        logger.info(f"Formulation generated successfully: {formulation.product_name}")
        return formulation
        
    except Exception as e:
        logger.error(f"Error in formulation generation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate formulation: {str(e)}")
