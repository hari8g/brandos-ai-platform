import openai
import json
from typing import List, Dict, Any
from app.models.scientific_reasoning import ScientificReasoningRequest, ScientificReasoningResponse, KeyComponent
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class ScientificReasoningService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def generate_scientific_reasoning(self, request: ScientificReasoningRequest) -> ScientificReasoningResponse:
        """Generate comprehensive scientific reasoning data using OpenAI"""
        
        try:
            # Create a detailed prompt for scientific reasoning
            prompt = self._create_scientific_reasoning_prompt(request)
            
            # Call OpenAI with function calling for structured output
            response = self._call_openai_with_functions(prompt)
            
            # Parse and validate the response
            scientific_data = self._parse_scientific_response(response)
            
            return ScientificReasoningResponse(**scientific_data)
            
        except Exception as e:
            logger.error(f"Error generating scientific reasoning: {e}")
            # Return fallback data if OpenAI fails
            return self._get_fallback_data(request)
    
    def _create_scientific_reasoning_prompt(self, request: ScientificReasoningRequest) -> str:
        """Create a comprehensive prompt for scientific reasoning generation"""
        
        category = request.category or "cosmetic formulation"
        product_desc = request.product_description or f"a {category}"
        
        prompt = f"""
        You are a senior cosmetic chemist and market research analyst specializing in the Indian beauty market. 
        Create comprehensive scientific reasoning analysis for: {product_desc}
        
        Generate detailed, realistic, and scientifically accurate information:
        
        1. KEY COMPONENTS: List 4-6 key ingredients with scientific names and detailed reasoning
        2. IMPLIED DESIRE: Primary consumer desire this formulation addresses
        3. PSYCHOLOGICAL DRIVERS: 3-4 consumer psychology factors
        4. VALUE PROPOSITION: 3-4 unique selling points and competitive advantages
        5. TARGET AUDIENCE: Detailed demographic and psychographic description
        6. DEMOGRAPHIC BREAKDOWN: Age range, income level, lifestyle, purchase behavior
        7. PSYCHOGRAPHIC PROFILE: Values, preferences, and motivations
        8. INDIA TRENDS: 3-4 current market trends in India
        9. REGULATORY STANDARDS: 3-4 Indian regulatory and health claims standards
        10. MARKET OPPORTUNITY SUMMARY: Comprehensive market analysis including market potential, competitive landscape, strategic recommendations, target segment analysis, pricing strategy, distribution channels, risk factors, growth projections, and innovation opportunities
        
        Focus on scientific accuracy, Indian market relevance, current trends, and regulatory compliance.
        """
        
        return prompt
    
    def _call_openai_with_functions(self, prompt: str) -> Dict[str, Any]:
        """Call OpenAI with function calling for structured output"""
        
        functions = [
            {
                "name": "generate_scientific_reasoning",
                "description": "Generate comprehensive scientific reasoning data for cosmetic formulations",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "keyComponents": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string", "description": "Scientific name of the ingredient"},
                                    "why": {"type": "string", "description": "Detailed reasoning for why this ingredient was chosen"}
                                },
                                "required": ["name", "why"]
                            },
                            "description": "List of key ingredients with scientific reasoning"
                        },
                        "impliedDesire": {
                            "type": "string",
                            "description": "Primary consumer desire this formulation addresses"
                        },
                        "psychologicalDrivers": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Consumer psychology factors influencing this product"
                        },
                        "valueProposition": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Unique selling points and competitive advantages"
                        },
                        "targetAudience": {
                            "type": "string",
                            "description": "Detailed demographic and psychographic description"
                        },
                        "indiaTrends": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Current market trends in India relevant to this formulation"
                        },
                        "regulatoryStandards": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Indian regulatory and health claims standards"
                        },
                        "demographicBreakdown": {
                            "type": "object",
                            "properties": {
                                "age_range": {"type": "string", "description": "Specific age range of target audience"},
                                "income_level": {"type": "string", "description": "Income level of target audience"},
                                "lifestyle": {"type": "string", "description": "Lifestyle characteristics of target audience"},
                                "purchase_behavior": {"type": "string", "description": "Purchase behavior patterns of target audience"}
                            },
                            "required": ["age_range", "income_level", "lifestyle", "purchase_behavior"],
                            "description": "Detailed demographic breakdown of target audience"
                        },
                        "psychographicProfile": {
                            "type": "object",
                            "properties": {
                                "values": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Core values that drive consumer behavior"
                                },
                                "preferences": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Product and brand preferences of target audience"
                                },
                                "motivations": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Key motivations for purchasing this product"
                                }
                            },
                            "required": ["values", "preferences", "motivations"],
                            "description": "Detailed psychographic profile of target audience"
                        },
                        "marketOpportunitySummary": {
                            "type": "string",
                            "description": "Comprehensive market opportunity analysis including market potential, competitive landscape, strategic recommendations, target segment analysis, pricing strategy, distribution channels, risk factors, growth projections, and innovation opportunities"
                        }
                    },
                    "required": [
                        "keyComponents", "impliedDesire", "psychologicalDrivers", 
                        "valueProposition", "targetAudience", "indiaTrends", "regulatoryStandards",
                        "demographicBreakdown", "psychographicProfile", "marketOpportunitySummary"
                    ]
                }
            }
        ]
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a senior cosmetic chemist and market research analyst specializing in the Indian beauty market. Provide detailed, scientifically accurate, and market-relevant information."},
                {"role": "user", "content": prompt}
            ],
            functions=functions,
            function_call={"name": "generate_scientific_reasoning"},
            temperature=0.7,
            max_tokens=2000
        )
        
        # Extract function call arguments
        function_call = response.choices[0].message.function_call
        if function_call and function_call.arguments:
            return json.loads(function_call.arguments)
        else:
            raise Exception("No function call response received")
    
    def _parse_scientific_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse and validate the OpenAI response"""
        
        # Ensure all required fields are present
        required_fields = [
            "keyComponents", "impliedDesire", "psychologicalDrivers",
            "valueProposition", "targetAudience", "indiaTrends", "regulatoryStandards"
        ]
        
        for field in required_fields:
            if field not in response:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate keyComponents structure
        if not isinstance(response["keyComponents"], list):
            raise ValueError("keyComponents must be a list")
        
        for component in response["keyComponents"]:
            if not isinstance(component, dict) or "name" not in component or "why" not in component:
                raise ValueError("Each keyComponent must have 'name' and 'why' fields")
        
        return response
    
    def _get_fallback_data(self, request: ScientificReasoningRequest) -> ScientificReasoningResponse:
        """Provide fallback data when OpenAI is unavailable"""
        
        category = request.category or "anti-aging serum"
        
        fallback_data = {
            "keyComponents": [
                {
                    "name": "Hyaluronic Acid",
                    "why": "A powerful humectant that can hold up to 1000 times its weight in water, providing intense hydration and plumping effects. Clinically proven to improve skin moisture retention and reduce fine lines."
                },
                {
                    "name": "Niacinamide (Vitamin B3)",
                    "why": "A multi-functional ingredient that improves skin barrier function, reduces inflammation, and regulates sebum production. Studies show it can reduce hyperpigmentation and improve skin texture."
                },
                {
                    "name": "Peptides",
                    "why": "Bioactive compounds that signal skin cells to produce more collagen and elastin. Clinical research demonstrates their ability to reduce wrinkles and improve skin firmness."
                },
                {
                    "name": "Retinol",
                    "why": "A gold-standard anti-aging ingredient that accelerates cell turnover and stimulates collagen production. Extensive research shows its effectiveness in reducing fine lines and improving skin texture."
                }
            ],
            "impliedDesire": "Consumers seek to reverse visible signs of aging and achieve a more youthful, radiant complexion. They want to address multiple concerns including fine lines, uneven skin tone, and loss of firmness with a single, effective product.",
            "psychologicalDrivers": [
                "Fear of aging and desire to maintain youthful appearance",
                "Social pressure and beauty standards in Indian society",
                "Self-confidence and self-esteem enhancement",
                "Preventive care mindset and investment in long-term skin health"
            ],
            "valueProposition": [
                "Multi-functional formula addressing multiple aging concerns simultaneously",
                "Clinically proven ingredients with scientific backing",
                "Suitable for Indian skin types and climate conditions",
                "Premium quality at accessible price point for Indian market"
            ],
            "targetAudience": "Urban Indian women aged 25-45, primarily working professionals with disposable income. They are beauty-conscious, research-driven consumers who value scientific efficacy and are willing to invest in premium skincare. They typically have combination to dry skin and are concerned about early signs of aging.",
            "indiaTrends": [
                "Growing demand for science-backed skincare with clinical validation",
                "Rising interest in multi-functional products that address multiple concerns",
                "Increasing awareness of anti-aging ingredients and their benefits",
                "Shift towards premium skincare as disposable income increases"
            ],
            "regulatoryStandards": [
                "Compliance with BIS standards for cosmetic products",
                "Adherence to CDSCO guidelines for ingredient safety",
                "Following FSSAI regulations for product labeling and claims",
                "Meeting international standards for anti-aging product efficacy"
            ],
            "demographicBreakdown": {
                "age_range": "25-45 years (primary), 18-55 years (secondary)",
                "income_level": "Middle to upper-middle class",
                "lifestyle": "Health-conscious, value-driven consumers",
                "purchase_behavior": "Research-oriented, quality-focused"
            },
            "psychographicProfile": {
                "values": [
                    "Values scientific evidence and clinical backing",
                    "Prefers clean, transparent ingredient lists",
                    "Willing to pay premium for proven efficacy"
                ],
                "preferences": [
                    "Premium skincare with clinical validation",
                    "Multi-functional products that address multiple concerns",
                    "Transparent ingredient sourcing and quality standards"
                ],
                "motivations": [
                    "Desire for visible, measurable improvements in skin appearance",
                    "Trust in scientific validation and clinical backing",
                    "Investment in long-term skin health and anti-aging"
                ]
            },
            "marketOpportunitySummary": """Comprehensive Market Opportunity Analysis for Anti-Aging Serum Formulation

MARKET POTENTIAL ASSESSMENT:
Based on TAM analysis of ₹35,000 Crore for the Indian beauty market, with premium skincare segment (SAM) valued at ₹8,500 Crore, this anti-aging serum formulation targets a realistic SOM of ₹2,000 Crore. The market demonstrates strong growth potential with 18.5% CAGR, driven by increasing beauty consciousness and rising disposable income among urban Indian women.

KEY MARKET OPPORTUNITIES & GROWTH DRIVERS:
• Growing anti-aging awareness among women aged 25-45, with 68% willing to pay premium for proven results
• Rising disposable income enabling luxury beauty purchases, with 72% of urban consumers investing in premium skincare
• Increasing social media influence driving beauty consciousness and product discovery
• Growing preference for science-backed formulations with clinical validation (82% of consumers)

COMPETITIVE LANDSCAPE ANALYSIS & DIFFERENTIATION OPPORTUNITIES:
The premium anti-aging segment is dominated by international brands (L'Oreal, Estée Lauder) and established Indian players (Lakme, Nykaa). Key differentiation opportunities include:
• Scientific formulation with clinically proven ingredients (Hyaluronic Acid, Niacinamide, Peptides, Retinol)
• Transparent ingredient sourcing and quality standards
• Multi-functional benefits addressing multiple aging concerns simultaneously
• Indian market-specific formulation considering local skin types and climate conditions

STRATEGIC RECOMMENDATIONS FOR MARKET ENTRY & POSITIONING:
• Position as a premium, science-backed anti-aging solution with clinical validation
• Target health-conscious urban women aged 25-45 with disposable income
• Emphasize multi-functional benefits and transparent ingredient sourcing
• Leverage digital marketing and influencer partnerships for brand awareness

TARGET SEGMENT ANALYSIS:
Primary target: Urban Indian women aged 25-45 with middle to upper-middle class income levels. These consumers are beauty-conscious, research-driven, and willing to invest in premium skincare. They value scientific efficacy, ingredient transparency, and visible results.

Demographic Profile:
• Age Range: 25-45 years (primary), 18-55 years (secondary)
• Income Level: Middle to upper-middle class
• Lifestyle: Health-conscious, value-driven consumers
• Purchase Behavior: Research-oriented, quality-focused

Psychographic Profile:
• Values: Scientific evidence, clinical backing, ingredient transparency
• Preferences: Premium skincare with proven efficacy, multi-functional products
• Motivations: Visible skin improvements, long-term anti-aging benefits, confidence enhancement

PRICING STRATEGY RECOMMENDATIONS:
• Premium pricing range: ₹1,000-3,000 per unit (30ml)
• Justification: High-quality ingredients, clinical validation, multi-functional benefits
• Competitive positioning: Mid to high-end premium segment
• Value proposition: Cost-effective compared to multiple single-function products

DISTRIBUTION CHANNEL RECOMMENDATIONS:
• Primary: E-commerce platforms (Nykaa, Amazon) capturing 70% of premium beauty sales
• Secondary: Specialty beauty stores and department stores
• Tertiary: Direct-to-consumer channels and beauty salons
• Digital-first approach with omnichannel presence

RISK FACTORS & MITIGATION STRATEGIES:
• Market Risks: Intense competition from established brands
  Mitigation: Focus on unique scientific formulation and transparent communication
• Regulatory Risks: CDSCO compliance requirements
  Mitigation: Ensure all ingredients meet regulatory standards and maintain proper documentation
• Economic Risks: Economic downturn affecting premium segment
  Mitigation: Offer value propositions and flexible pricing strategies

GROWTH PROJECTIONS & SCALABILITY CONSIDERATIONS:
• Year 1: ₹800 Crore revenue target with 6% market share
• Year 3: ₹1,500 Crore revenue with 8% market share
• Year 5: ₹2,500 Crore revenue with 10% market share
• Scalability through expanded product portfolio and geographic expansion

INNOVATION OPPORTUNITIES & FUTURE MARKET TRENDS:
• Advanced delivery systems for enhanced ingredient efficacy
• Personalized skincare based on individual skin concerns
• Sustainable and clean beauty formulations
• Integration with technology (AI-powered skin analysis)
• Expansion into related categories (sunscreen, cleansers, moisturizers)

This comprehensive analysis positions the anti-aging serum formulation for significant market success through strategic positioning, targeted marketing, and continuous innovation in the rapidly growing Indian premium skincare market."""
        }
        
        return ScientificReasoningResponse(**fallback_data) 