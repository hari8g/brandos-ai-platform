"""
Formulation generation endpoints with intelligent prompt processing.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import openai
import os
import logging
import json
import re
try:
    import jsonfix
    HAS_JSONFIX = True
except ImportError:
    HAS_JSONFIX = False

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
    reasoning: str = ""

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
    packaging_marketing_inspiration: Optional[str] = None
    market_trends: Optional[List[str]] = None
    packaging_design_ideas: Optional[List[str]] = None
    marketing_strategies: Optional[List[str]] = None
    competitive_landscape: Optional[dict] = None
    seasonal_trends: Optional[List[dict]] = None

class PromptGrades(BaseModel):
    clarity: int
    specificity: int
    constraints: int
    completeness: int
    redundancy: int
    parse_ability: int
    query_readiness: int
    overall_score: int

class ParsedFields(BaseModel):
    product_type: Optional[str] = None
    function: List[str] = []
    target_concern: Optional[str] = None
    skin_type: Optional[str] = None
    hair_type: Optional[str] = None
    constraints: List[str] = []
    environment: Optional[str] = None
    demographics: Optional[str] = None
    include: List[str] = []
    exclude: List[str] = []

class PromptProcessor:
    """Intelligent prompt processing with 7-point grading system."""
    
    def __init__(self):
        # Define product types and their variations
        self.product_types = {
            'shampoo': ['shampoo', 'hair wash', 'hair cleanser'],
            'conditioner': ['conditioner', 'hair conditioner', 'leave-in'],
            'serum': ['serum', 'face serum', 'hair serum'],
            'cream': ['cream', 'moisturizer', 'lotion'],
            'cleanser': ['cleanser', 'face wash', 'facial cleanser'],
            'mask': ['mask', 'face mask', 'hair mask'],
            'oil': ['oil', 'face oil', 'hair oil'],
            'gel': ['gel', 'face gel', 'hair gel']
        }
        
        # Define skin/hair types
        self.skin_types = ['dry', 'oily', 'combination', 'sensitive', 'normal', 'acne-prone']
        self.hair_types = ['curly', 'straight', 'wavy', 'frizzy', 'dry', 'oily', 'damaged', 'color-treated']
        
        # Define common functions
        self.functions = {
            'cleansing': ['clean', 'wash', 'remove', 'purify'],
            'moisturizing': ['moisturize', 'hydrate', 'nourish', 'condition'],
            'anti_aging': ['anti-aging', 'anti aging', 'wrinkle', 'firming'],
            'brightening': ['brighten', 'whiten', 'glow', 'radiance'],
            'acne_treatment': ['acne', 'pimple', 'breakout', 'blemish'],
            'soothing': ['soothe', 'calm', 'gentle', 'sensitive'],
            'anti_frizz': ['frizz', 'smooth', 'tame', 'control']
        }
        
        # Define constraints
        self.constraints = {
            'vegan': ['vegan', 'plant-based'],
            'sulfate_free': ['sulfate-free', 'sulfate free', 'no sulfates'],
            'paraben_free': ['paraben-free', 'paraben free', 'no parabens'],
            'fragrance_free': ['fragrance-free', 'fragrance free', 'unscented'],
            'natural': ['natural', 'organic', 'botanical'],
            'budget': ['cheap', 'affordable', 'budget', 'inexpensive'],
            'luxury': ['luxury', 'premium', 'high-end', 'expensive']
        }
    
    def grade_prompt(self, prompt: str) -> PromptGrades:
        """Grade prompt on 7-point system."""
        prompt_lower = prompt.lower()
        words = prompt_lower.split()
        
        # 1. Clarity (1-5): Is the request clearly expressed?
        clarity = 3  # Default
        if len(words) >= 5 and len(words) <= 20:
            clarity = 4
        elif len(words) > 20:
            clarity = 5
        elif len(words) < 3:
            clarity = 2
        
        # 2. Specificity (1-5): Does it mention product type, function, or traits?
        specificity = 1
        if any(pt in prompt_lower for pt_list in self.product_types.values() for pt in pt_list):
            specificity += 1
        if any(func in prompt_lower for func_list in self.functions.values() for func in func_list):
            specificity += 1
        if any(st in prompt_lower for st in self.skin_types + self.hair_types):
            specificity += 1
        if any(const in prompt_lower for const_list in self.constraints.values() for const in const_list):
            specificity += 1
        
        # 3. Constraints (1-5): Are constraints like pH, budget, vegan, etc. provided?
        constraints_score = 1
        constraint_count = sum(1 for const_list in self.constraints.values() 
                             for const in const_list if const in prompt_lower)
        constraints_score = min(5, 1 + constraint_count)
        
        # 4. Completeness (1-5): Does it cover what, why, who (demographic)?
        completeness = 1
        if any(pt in prompt_lower for pt_list in self.product_types.values() for pt in pt_list):
            completeness += 1  # What
        if any(func in prompt_lower for func_list in self.functions.values() for func in func_list):
            completeness += 1  # Why
        if any(st in prompt_lower for st in self.skin_types + self.hair_types):
            completeness += 1  # Who
        if any(word in prompt_lower for word in ['for', 'target', 'suitable']):
            completeness += 1
        
        # 5. Redundancy (1-5): Is there repetition or fluff? (Reverse scored)
        redundancy = 5  # Start with best score
        unique_words = len(set(words))
        if len(words) > 0:
            word_ratio = unique_words / len(words)
            if word_ratio < 0.7:
                redundancy -= 2
            elif word_ratio < 0.8:
                redundancy -= 1
        
        # 6. Parse-ability (1-5): Can it be mapped to structured fields?
        parse_ability = 1
        if any(pt in prompt_lower for pt_list in self.product_types.values() for pt in pt_list):
            parse_ability += 1
        if any(func in prompt_lower for func_list in self.functions.values() for func in func_list):
            parse_ability += 1
        if any(st in prompt_lower for st in self.skin_types + self.hair_types):
            parse_ability += 1
        if any(const in prompt_lower for const_list in self.constraints.values() for const in const_list):
            parse_ability += 1
        if len(words) >= 3:
            parse_ability += 1
        
        # 7. Query Readiness (1-5): How ready is this for backend querying?
        query_readiness = min(5, (specificity + constraints_score + parse_ability) // 3)
        
        overall_score = clarity + specificity + constraints_score + completeness + redundancy + parse_ability + query_readiness
        
        return PromptGrades(
            clarity=clarity,
            specificity=specificity,
            constraints=constraints_score,
            completeness=completeness,
            redundancy=redundancy,
            parse_ability=parse_ability,
            query_readiness=query_readiness,
            overall_score=overall_score
        )
    
    def parse_prompt(self, prompt: str) -> ParsedFields:
        """Parse prompt into structured fields."""
        prompt_lower = prompt.lower()
        
        # Extract product type
        product_type = None
        for pt, variations in self.product_types.items():
            if any(var in prompt_lower for var in variations):
                product_type = pt
                break
        
        # Extract functions
        functions = []
        for func, variations in self.functions.items():
            if any(var in prompt_lower for var in variations):
                functions.append(func)
        
        # Extract target concern
        target_concern = None
        for st in self.skin_types + self.hair_types:
            if st in prompt_lower:
                target_concern = st
                break
        
        # Determine if it's skin or hair product
        skin_type = None
        hair_type = None
        if target_concern in self.skin_types:
            skin_type = target_concern
        elif target_concern in self.hair_types:
            hair_type = target_concern
        
        # Extract constraints
        constraints = []
        for const, variations in self.constraints.items():
            if any(var in prompt_lower for var in variations):
                constraints.append(const)
        
        # Extract environment
        environment = None
        env_keywords = ['humid', 'dry', 'cold', 'hot', 'winter', 'summer']
        for env in env_keywords:
            if env in prompt_lower:
                environment = env
                break
        
        # Extract demographics
        demographics = None
        demo_keywords = ['teen', 'adult', 'elderly', 'baby', 'child']
        for demo in demo_keywords:
            if demo in prompt_lower:
                demographics = demo
                break
        
        return ParsedFields(
            product_type=product_type,
            function=functions,
            target_concern=target_concern,
            skin_type=skin_type,
            hair_type=hair_type,
            constraints=constraints,
            environment=environment,
            demographics=demographics,
            include=[],
            exclude=[]
        )
    
    def generate_structured_prompt(self, fields: ParsedFields, location: str = "India") -> str:
        """Generate token-efficient structured prompt."""
        parts = []
        
        if fields.product_type:
            parts.append(f"Product: {fields.product_type}")
        
        if fields.skin_type:
            parts.append(f"Target: {fields.skin_type} skin")
        elif fields.hair_type:
            parts.append(f"Target: {fields.hair_type} hair")
        
        if fields.function:
            func_str = ", ".join(fields.function)
            parts.append(f"Function: {func_str}")
        
        if fields.constraints:
            const_str = ", ".join(fields.constraints)
            parts.append(f"Constraints: {const_str}")
        
        if fields.environment:
            parts.append(f"Environment: {fields.environment}")
        
        if fields.demographics:
            parts.append(f"Demographics: {fields.demographics}")
        
        parts.append(f"Location: {location}")
        parts.append("Output: ingredients list with % and usage notes")
        
        return "\n".join(parts)
    
    def auto_improve(self, fields: ParsedFields) -> ParsedFields:
        """Auto-improve fields using ontologies."""
        # Add common functions based on target
        if fields.skin_type == 'sensitive' and 'soothing' not in fields.function:
            fields.function.append('soothing')
        elif fields.hair_type == 'curly' and 'moisturizing' not in fields.function:
            fields.function.append('moisturizing')
        elif fields.hair_type == 'frizzy' and 'anti_frizz' not in fields.function:
            fields.function.append('anti_frizz')
        
        # Add common constraints for sensitive types
        if fields.skin_type == 'sensitive' and 'fragrance_free' not in fields.constraints:
            fields.constraints.append('fragrance_free')
        
        return fields

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

def get_competitive_landscape(category: str, query: str) -> dict:
    cat = (category or '').lower()
    q = (query or '').lower()
    if 'serum' in cat or 'serum' in q:
        if 'luxury' in q or 'high-end' in q:
            return {
                "price_range": "₹2,000 - ₹10,000",
                "target_demographics": "35-60 years, affluent, urban",
                "distribution_channels": "Luxury retail, exclusive online stores",
                "key_competitors": "Estee Lauder, La Mer, SK-II"
            }
        else:
            return {
                "price_range": "₹800 - ₹2,500",
                "target_demographics": "25-45 years, urban",
                "distribution_channels": "Online, specialty stores",
                "key_competitors": "The Ordinary, Minimalist, Plum"
            }
    elif 'shampoo' in cat or 'shampoo' in q:
        if 'budget' in q or 'mass-market' in q:
            return {
                "price_range": "₹100 - ₹500",
                "target_demographics": "18-45 years, mass market",
                "distribution_channels": "Supermarkets, online, pharmacies",
                "key_competitors": "Clinic Plus, Head & Shoulders, Dove"
            }
        else:
            return {
                "price_range": "₹300 - ₹1,200",
                "target_demographics": "18-45 years, urban",
                "distribution_channels": "Online, specialty stores",
                "key_competitors": "WOW, Mamaearth, L'Oreal"
            }
    elif 'cream' in cat or 'moisturizer' in cat or 'cream' in q or 'moisturizer' in q:
        return {
            "price_range": "₹250 - ₹1,500",
            "target_demographics": "20-50 years, all genders",
            "distribution_channels": "Pharmacies, online, supermarkets",
            "key_competitors": "Nivea, Cetaphil, Pond's"
        }
    elif 'face wash' in cat or 'cleanser' in cat or 'face wash' in q or 'cleanser' in q:
        return {
            "price_range": "₹150 - ₹800",
            "target_demographics": "15-40 years, all genders",
            "distribution_channels": "Supermarkets, online, pharmacies",
            "key_competitors": "Clean & Clear, Himalaya, Neutrogena"
        }
    elif 'conditioner' in cat or 'conditioner' in q:
        return {
            "price_range": "₹200 - ₹1,000",
            "target_demographics": "18-45 years, urban",
            "distribution_channels": "Online, specialty stores",
            "key_competitors": "Tresemme, Dove, L'Oreal"
        }
    elif 'mask' in cat or 'face mask' in q or 'hair mask' in q:
        return {
            "price_range": "₹300 - ₹2,000",
            "target_demographics": "20-45 years, urban",
            "distribution_channels": "Online, salons, specialty stores",
            "key_competitors": "Mamaearth, The Body Shop, L'Oreal"
        }
    # Default case - always return a valid object
    else:
        return {
            "price_range": "₹800 - ₹2,500",
            "target_demographics": "25-45 years, urban",
            "distribution_channels": "Online, specialty stores",
            "key_competitors": "The Ordinary, Minimalist, Plum"
        }

def get_market_trends(category: str, query: str) -> list:
    cat = (category or '').lower()
    q = (query or '').lower()
    if 'serum' in cat or 'serum' in q:
        return [
            "Premiumization of serums in skincare routines",
            "Rise of multi-functional serums (anti-aging, brightening)",
            "Minimalist, science-backed branding",
            "Glass dropper bottles for luxury appeal"
        ]
    elif 'shampoo' in cat or 'shampoo' in q:
        return [
            "Demand for sulfate-free and natural shampoos",
            "Eco-friendly packaging in mass-market haircare",
            "Anti-dandruff and scalp health focus",
            "Affordable family-size bottles"
        ]
    elif 'cream' in cat or 'moisturizer' in cat or 'cream' in q or 'moisturizer' in q:
        return [
            "Hydration and barrier repair as key claims",
            "Lightweight, fast-absorbing textures",
            "Sensitive skin and dermatologist-tested positioning",
            "Refillable and recyclable jars"
        ]
    else:
        return [
            "Minimalist packaging with eco-friendly materials",
            "Transparent bottles showing product texture",
            "Bold typography with clean geometric shapes",
            "Glass packaging for premium positioning"
        ]

def get_packaging_design_ideas(category: str, query: str) -> list:
    cat = (category or '').lower()
    q = (query or '').lower()
    if 'serum' in cat or 'serum' in q:
        return [
            "Glass dropper bottle with frosted finish",
            "Gold-accented label for luxury positioning",
            "Airless pump for sensitive actives",
            "Minimalist, science-inspired graphics"
        ]
    elif 'shampoo' in cat or 'shampoo' in q:
        return [
            "Large recyclable PET bottle with flip-top cap",
            "Bold, family-friendly label design",
            "Eco-refill pouch for sustainability",
            "Clear bottle to show product texture"
        ]
    elif 'cream' in cat or 'moisturizer' in cat or 'cream' in q or 'moisturizer' in q:
        return [
            "Refillable glass jar with bamboo lid",
            "Soft-touch squeeze tube for travel",
            "Pastel color palette for calming effect",
            "Embossed logo for premium feel"
        ]
    else:
        return [
            "Premium Glass Bottle: Frosted glass with gold accents, pump dispenser",
            "Eco-Friendly Tube: Recycled aluminum with minimalist label design",
            "Airless Pump: White plastic with transparent window, modern typography",
            "Jar Container: Ceramic jar with bamboo lid, luxury positioning"
        ]

def get_marketing_strategies(category: str, query: str) -> list:
    cat = (category or '').lower()
    q = (query or '').lower()
    if 'serum' in cat or 'serum' in q:
        return [
            "Influencer campaigns with dermatologists and skincare experts",
            "Instagram Reels showing before/after results",
            "Luxury unboxing experiences for PR",
            "Educational blog posts on serum science"
        ]
    elif 'shampoo' in cat or 'shampoo' in q:
        return [
            "TV and radio ads for mass-market reach",
            "Discounted family packs in supermarkets",
            "YouTube tutorials on haircare routines",
            "Partnerships with salons for sampling"
        ]
    elif 'cream' in cat or 'moisturizer' in cat or 'cream' in q or 'moisturizer' in q:
        return [
            "Sensitive skin testimonials on social media",
            "Dermatologist endorsements",
            "Seasonal campaigns for winter/summer hydration",
            "In-store testers and mini samples"
        ]
    else:
        return [
            "Social Media Campaign: Instagram Reels showing application process, TikTok challenges",
            "Influencer Partnerships: Beauty influencers, dermatologists, skincare experts",
            "Content Marketing: Blog posts about ingredients, YouTube tutorials"
        ]

def get_seasonal_trends(category: str, query: str) -> list:
    cat = (category or '').lower()
    q = (query or '').lower()
    if 'serum' in cat or 'serum' in q:
        return [
            {"season": "Spring/Summer", "trend": "Lightweight, hydrating serums with vitamin C and hyaluronic acid"},
            {"season": "Fall/Winter", "trend": "Rich, nourishing serums with ceramides and peptides"}
        ]
    elif 'shampoo' in cat or 'shampoo' in q:
        return [
            {"season": "Spring/Summer", "trend": "Clarifying and anti-dandruff formulas for sweat and humidity"},
            {"season": "Fall/Winter", "trend": "Moisturizing and anti-static shampoos for dry scalp"}
        ]
    elif 'cream' in cat or 'moisturizer' in cat or 'cream' in q or 'moisturizer' in q:
        return [
            {"season": "Spring/Summer", "trend": "Gel creams with aloe and cucumber for cooling"},
            {"season": "Fall/Winter", "trend": "Thick creams with shea butter for deep hydration"}
        ]
    else:
        return [
            {"season": "Spring/Summer", "trend": "Light textures, citrus scents, SPF integration"},
            {"season": "Fall/Winter", "trend": "Rich textures, warm tones, intensive hydration"}
        ]

class FormulationGenerator:
    def __init__(self):
        self.openai_client = None
        self.prompt_processor = PromptProcessor()
    
    def _get_openai_client(self):
        """Lazy initialization of OpenAI client."""
        if self.openai_client is None:
            api_key = os.getenv("OPENAI_API_KEY")
            logger.info(f"API key check: {'Found' if api_key else 'Not found'}")
            if api_key:
                logger.info(f"API key length: {len(api_key)}")
                logger.info(f"API key starts with: {api_key[:10]}...")
            if not api_key:
                logger.warning("OPENAI_API_KEY not set, using fallback formulations")
                return None
            self.openai_client = openai.OpenAI(api_key=api_key)
            logger.info("OpenAI client created successfully")
        return self.openai_client
    
    def process_user_prompt(self, prompt: str, location: str = "India") -> Dict[str, Any]:
        """Process user prompt using intelligent grading and parsing."""
        logger.info(f"Processing user prompt: {prompt[:50]}...")
        
        # Step 1: Grade the prompt
        grades = self.prompt_processor.grade_prompt(prompt)
        logger.info(f"Prompt grades: {grades.overall_score}/35")
        
        # Step 2: Parse into structured fields
        fields = self.prompt_processor.parse_prompt(prompt)
        logger.info(f"Parsed fields: {fields.product_type}, {fields.function}, {fields.target_concern}")
        
        # Step 3: Auto-improve if needed
        if grades.overall_score < 24:
            logger.info("Auto-improving prompt fields")
            fields = self.prompt_processor.auto_improve(fields)
        
        # Step 4: Generate structured prompt
        structured_prompt = self.prompt_processor.generate_structured_prompt(fields, location)
        logger.info(f"Structured prompt: {structured_prompt}")
        
        return {
            "grades": grades,
            "parsed_fields": fields,
            "final_prompt": structured_prompt,
            "token_reduction": len(prompt) - len(structured_prompt)
        }
    
    def generate_formulation(self, query: str, category: str = None, location: str = None, skip_quality_check: bool = False) -> FormulationResponse:
        """
        Generate a comprehensive formulation using OpenAI API with intelligent prompt processing.
        """
        
        # Process the user prompt intelligently
        prompt_analysis = self.process_user_prompt(query, location or "India")
        grades = prompt_analysis["grades"]
        structured_prompt = prompt_analysis["final_prompt"]
        token_reduction = prompt_analysis["token_reduction"]
        
        # Fix token reduction display (show as positive when we're actually reducing)
        actual_reduction = max(0, token_reduction)  # Don't show negative values
        reduction_percent = (actual_reduction / len(query)) * 100 if len(query) > 0 else 0
        logger.info(f"Token optimization: {actual_reduction} characters saved ({reduction_percent:.1f}% reduction)")
        
        # Assess query quality using the new grading system
        quality_score = grades.overall_score
        quality_feedback = f"Query scored {grades.overall_score}/35. "
        
        if grades.overall_score >= 28:
            quality_feedback += "Excellent quality with comprehensive details."
        elif grades.overall_score >= 24:
            quality_feedback += "Good quality with sufficient information."
        elif grades.overall_score >= 20:
            quality_feedback += "Fair quality, some details could be improved."
        else:
            quality_feedback += "Basic quality, consider adding more specific details."
        
        quality_warnings = []
        improvement_suggestions = []
        
        # Generate improvement suggestions based on grades
        if grades.clarity < 4:
            improvement_suggestions.append("Be more specific about what you want")
        if grades.specificity < 3:
            improvement_suggestions.append("Mention product type, skin/hair type, or specific concerns")
        if grades.constraints < 2:
            improvement_suggestions.append("Add any preferences (vegan, natural, budget, etc.)")
        if grades.completeness < 3:
            improvement_suggestions.append("Include target audience or usage context")
        
        if grades.overall_score < 20:
            quality_warnings.append("⚠️ This formulation is based on limited information. Consider refining your query for more targeted results.")
        
        # Try OpenAI with the structured prompt
        client = self._get_openai_client()
        if client:
            logger.info("OpenAI client initialized successfully")
            
            # Create a much more concise prompt for the AI
            ai_prompt = f'''
Generate a cosmetic formulation based on:
{structured_prompt}

Provide ingredients with percentages, costs, suppliers, and alternatives.
Include pricing for small batch (100 units) and medium scale (10,000 units).
Add detailed reasoning for formulation choices including manufacturing steps.
\nNEW: Also provide a creative, brandable Packaging & Marketing Inspiration (1-2 sentences) for this product, suitable for a product label or ad campaign.\n
Respond in JSON format:
{{
  "product_name": "string",
              "ingredients": [
    {{
      "name": "string",
      "percent": number,
      "cost_per_100ml": number,
      "suppliers": [{{"name": "string", "location": "string", "url": "string", "price_per_100ml": number}}],
      "alternatives": [{{"name": "string", "price_impact": number, "reasoning": "string"}}]
    }}
              ],
  "estimated_cost": number,
  "predicted_ph": number,
  "reasoning": "string",
  "safety_notes": ["string"],
  "category": "string",
  "pricing": {{
    "small_batch": number,
    "medium_scale": number,
    "reasoning": "string"
  }},
  "packaging_marketing_inspiration": "string"
}}

CRITICAL REQUIREMENTS:
1. PRICING: Ingredient costs must be realistic - surfactants (50-200 INR/100ml), humectants (30-100 INR/100ml), extracts (100-500 INR/100ml), preservatives (50-150 INR/100ml)
2. TOTAL COST: estimated_cost should be 150-500 INR per 100ml for quality formulations
3. BATCH PRICING: small_batch = 3-5x estimated_cost, medium_scale = 1.5-2.5x estimated_cost
4. REASONING: Must include detailed manufacturing steps as follows:

MANUFACTURING PROCESS (include in reasoning):
1. PREPARATION PHASE:
   - Equipment sanitization and calibration
   - Ingredient weighing and preparation
   - Temperature monitoring setup

2. MIXING PHASE:
   - Water phase preparation (70-75°C)
   - Ingredient addition order and timing
   - Agitation speed and duration
   - Temperature control throughout

3. COOLING PHASE:
   - Controlled cooling to 40-45°C
   - Heat-sensitive ingredient addition
   - Final cooling to room temperature

4. QUALITY CONTROL:
   - pH testing and adjustment
   - Viscosity measurement
   - Microbial testing protocols
   - Stability assessment

5. PACKAGING:
   - Filling procedures
   - Labeling requirements
   - Storage conditions

Make the reasoning comprehensive and professional for formulators.
All costs in INR (Indian Rupees).
'''
            
            try:
                logger.info("Making OpenAI API call with structured prompt...")
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": ai_prompt}],
                    max_tokens=4000,  # Increased from 2000 to allow for detailed reasoning
                    temperature=0.7,
                    timeout=30
                )
                content = response.choices[0].message.content
                logger.info(f"Raw OpenAI response received, length: {len(content)}")
                logger.info(f"Raw OpenAI response: {content}")
                
                # Log the response to a file for debugging
                with open("openai_debug.log", "w") as f:
                    f.write(content)
                
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    logger.info("JSON pattern found in response")
                    try:
                        json_str = json_match.group()
                        # Sanitize + and - signs in numbers (e.g., +50, -20) to just numbers
                        json_str = re.sub(r':\s*\+([0-9]+)', r': \1', json_str)
                        json_str = re.sub(r':\s*\-([0-9]+)', r': -\1', json_str)
                        # Try to parse JSON
                        try:
                            formulation_data = json.loads(json_str)
                            logger.info("JSON parsed successfully")
                        except json.JSONDecodeError as e:
                            logger.error(f"JSON parsing error: {e}")
                            logger.error(f"JSON string length: {len(json_str)}")
                            logger.error(f"JSON string ends with: {json_str[-100:]}")
                            # Try to fix common JSON issues
                            fixed_json = json_str
                            # 1. Replace single quotes with double quotes
                            fixed_json = fixed_json.replace("'", '"')
                            # 2. Remove trailing commas before closing braces/brackets
                            fixed_json = re.sub(r',([ \t\r\n]*[}\]])', r'\1', fixed_json)
                            # 3. Ensure property names are in double quotes
                            fixed_json = re.sub(r'([,{]\s*)([a-zA-Z0-9_]+)(\s*:)','\1"\2"\3', fixed_json)
                            # 4. Use jsonfix if available
                            if HAS_JSONFIX:
                                try:
                                    formulation_data = jsonfix.loads(fixed_json)
                                    logger.info("JSON fixed with jsonfix and parsed successfully")
                                except Exception as fix_error:
                                    logger.error(f"jsonfix failed: {fix_error}")
                                    raise
                            else:
                                formulation_data = json.loads(fixed_json)
                                logger.info("JSON fixed with regex and parsed successfully")
                    except Exception as e:
                        logger.error(f"Other JSON error: {e}")
                        raise
                    
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
                        if "reasoning" not in pricing or pricing["reasoning"] is None:
                            pricing["reasoning"] = ""
                        formulation_data["pricing"] = Pricing(
                            small_batch=float(pricing.get("small_batch", 0)),
                            medium_scale=float(pricing.get("medium_scale", 0)),
                            reasoning=pricing.get("reasoning", "")
                        )
                    
                    # Parse packaging_marketing_inspiration
                    packaging_marketing_inspiration = formulation_data.get("packaging_marketing_inspiration") or ""
                    formulation_data["packaging_marketing_inspiration"] = packaging_marketing_inspiration
                    
                    # Add quality assessment data
                    formulation_data["query_quality_score"] = quality_score
                    formulation_data["query_quality_feedback"] = quality_feedback
                    formulation_data["quality_warnings"] = quality_warnings
                    formulation_data["improvement_suggestions"] = improvement_suggestions
                    
                    # Populate market trends, packaging design ideas, marketing strategies, and competitive landscape
                    market_trends = get_market_trends(category, query)
                    packaging_design_ideas = get_packaging_design_ideas(category, query)
                    marketing_strategies = get_marketing_strategies(category, query)
                    seasonal_trends = get_seasonal_trends(category, query)
                    
                    formulation_data["market_trends"] = market_trends
                    formulation_data["packaging_design_ideas"] = packaging_design_ideas
                    formulation_data["marketing_strategies"] = marketing_strategies
                    formulation_data["seasonal_trends"] = seasonal_trends
                    formulation_data["competitive_landscape"] = get_competitive_landscape(category, query)
                    
                    logger.info("Returning OpenAI-generated formulation")
                    return FormulationResponse(**formulation_data)
                else:
                    logger.error("No JSON pattern found in OpenAI response")
                    raise Exception("No valid JSON found in OpenAI response")
            except Exception as e:
                logger.error(f"Error generating formulation with OpenAI: {e}")
                logger.error(f"Exception type: {type(e)}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
        else:
            logger.warning("OpenAI client is None - API key not available")
        
        # Fallback with quality warnings
        logger.info("Using fallback formulation")
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
        
        # Calculate realistic pricing
        estimated_cost = 200.0  # Total cost per 100ml
        small_batch_price = estimated_cost * 4.0  # 4x for small batch (100 units)
        medium_scale_price = estimated_cost * 2.0  # 2x for medium scale (10,000 units)
        
        fallback_pricing = Pricing(
            small_batch=small_batch_price,
            medium_scale=medium_scale_price,
            reasoning="Small batch pricing includes higher per-unit costs due to minimum order quantities, packaging costs, and overhead. Medium scale benefits from economies of scale, bulk purchasing, and reduced overhead per unit."
        )
        
        # Enhanced fallback reasoning with manufacturing steps
        fallback_reasoning = """
        A simple, safe moisturizer with cost-effective ingredients suitable for general use.
        
        MANUFACTURING STEPS:
        1. Preparation Phase:
           - Clean and sanitize all equipment and containers
           - Weigh all ingredients accurately using calibrated scales
           - Prepare water phase ingredients (water, glycerin)
        
        2. Mixing Phase:
           - Heat water to 70-75°C in main vessel
           - Add glycerin slowly while stirring at 300-500 RPM
           - Maintain temperature for 10-15 minutes to ensure proper dissolution
        
        3. Cooling Phase:
           - Cool mixture to 40-45°C while maintaining gentle agitation
           - Add any heat-sensitive ingredients at this stage
           - Continue cooling to room temperature (25-30°C)
        
        4. Quality Control:
           - Check pH (target: 5.5-6.5)
           - Verify viscosity and appearance
           - Conduct microbial testing
           - Perform stability testing
        
        5. Packaging:
           - Fill into clean, sanitized containers
           - Label with batch number and expiry date
           - Store in cool, dry place
        
        SAFETY NOTES:
        - Always wear appropriate PPE during manufacturing
        - Follow GMP guidelines
        - Conduct patch testing before full production
        - Monitor for any adverse reactions
        """
        
        # Add quality warnings to fallback
        if not quality_warnings:
            quality_warnings = ["⚠️ Using fallback formulation due to API limitations"]
        
        # For fallback response
        market_trends = get_market_trends(category, query)
        packaging_design_ideas = get_packaging_design_ideas(category, query)
        marketing_strategies = get_marketing_strategies(category, query)
        seasonal_trends = get_seasonal_trends(category, query)
        
        return FormulationResponse(
            product_name="Fallback Moisturizer",
            ingredients=fallback_ingredients,
            estimated_cost=estimated_cost,
            predicted_ph=5.5,
            reasoning=fallback_reasoning.strip(),
            safety_notes=["Patch test before use", "Store in a cool place", "Follow GMP guidelines"],
            category=category,
            pricing=fallback_pricing,
            query_quality_score=quality_score,
            query_quality_feedback=quality_feedback,
            quality_warnings=quality_warnings,
            improvement_suggestions=improvement_suggestions,
            packaging_marketing_inspiration="A gentle, everyday moisturizer for radiant, healthy skin. Packaged in eco-friendly, minimalist bottles with a fresh, modern look.",
            market_trends=market_trends,
            packaging_design_ideas=packaging_design_ideas,
            marketing_strategies=marketing_strategies,
            competitive_landscape=get_competitive_landscape(category, query),
            seasonal_trends=seasonal_trends
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
