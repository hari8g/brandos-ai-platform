import os
import base64
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.models.multimodal import ImageAnalysisResponse, ImageUploadResponse
from app.services.intent_classifier_service import IntentClassifierService
import io
from PIL import Image
import json
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

class ImageAnalysisService:
    """Service for analyzing images and extracting product insights"""
    
    def __init__(self):
        self.client = None
        self.intent_classifier = IntentClassifierService()
        try:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and api_key != "your_openai_api_key_here" and api_key.strip():
                self.client = OpenAI(api_key=api_key)
                print("✅ Enhanced Image Analysis Service: OpenAI client initialized")
            else:
                print("⚠️ Enhanced Image Analysis Service: OpenAI API key not found")
        except Exception as e:
            print(f"⚠️ Enhanced Image Analysis Service: Failed to initialize OpenAI client: {e}")
    
    def analyze_image_with_intent(self, image_data: bytes, user_text: str, category: Optional[str] = None) -> ImageAnalysisResponse:
        """Analyze image and classify user intent, then create integrated prompt"""
        try:
            # First, classify user intent
            intent_data = self.intent_classifier.classify_intent(user_text, category)
            print(f"🔍 Intent classification result: {intent_data}")
            
            # Then analyze the image
            image_analysis = self.analyze_image(image_data, user_text, category)
            
            # Create integrated prompt combining intent and image analysis
            integrated_prompt = self._create_integrated_prompt(intent_data, image_analysis.image_analysis, user_text)
            
            # Update the response with the integrated prompt and intent classification
            image_analysis.enhanced_prompt = integrated_prompt
            image_analysis.intent_classification = intent_data
            
            return image_analysis
            
        except Exception as e:
            print(f"❌ Integrated analysis error: {e}")
            return self._generate_mock_analysis(user_text, category)
    
    def analyze_image(self, image_data: bytes, prompt: str, category: Optional[str] = None) -> ImageAnalysisResponse:
        """Analyze an image and extract product insights"""
        try:
            if not self.client:
                return self._generate_mock_analysis(prompt, category)
            
            # Convert image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Create analysis prompt
            analysis_prompt = self._create_analysis_prompt(prompt, category)
            
            # Call OpenAI Vision API
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert product formulation analyst. Analyze the image and provide detailed insights about the product, packaging, target audience, and formulation requirements."
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": analysis_prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            # Parse the response
            analysis_text = response.choices[0].message.content
            analysis_data = self._parse_analysis_response(analysis_text)
            
            # Create enhanced prompt in the specific format
            enhanced_prompt = self._create_enhanced_prompt(prompt, analysis_data)
            
            return ImageAnalysisResponse(
                success=True,
                image_analysis=analysis_data,
                enhanced_prompt=enhanced_prompt,
                product_insights=analysis_data.get("product_insights", []),
                visual_elements=analysis_data.get("visual_elements", []),
                color_scheme=analysis_data.get("color_scheme"),
                packaging_style=analysis_data.get("packaging_style"),
                target_audience_hints=analysis_data.get("target_audience_hints", []),
                brand_name=analysis_data.get("brand_name"),
                # New fields for the 5 specific areas
                product_category=analysis_data.get("product_category"),
                intended_use=analysis_data.get("intended_use"),
                key_ingredients=analysis_data.get("key_ingredients", []),
                claims=analysis_data.get("claims", []),
                packaging_type=analysis_data.get("packaging_type"),
                packaging_size=analysis_data.get("packaging_size"),
                packaging_material=analysis_data.get("packaging_material"),
                target_audience=analysis_data.get("target_audience"),
                brand_style=analysis_data.get("brand_style"),
                competitor_positioning=analysis_data.get("competitor_positioning")
            )
            
        except Exception as e:
            print(f"❌ Image analysis error: {e}")
            
            # Check if it's a model-specific error
            if "model" in str(e).lower() or "deprecated" in str(e).lower():
                print("⚠️ Model error detected, using fallback analysis")
                return self._generate_mock_analysis(prompt, category)
            
            return ImageAnalysisResponse(
                success=False,
                image_analysis={},
                enhanced_prompt=prompt,
                product_insights=[],
                visual_elements=[],
                target_audience_hints=[],
                error=str(e)
            )
    
    def _create_analysis_prompt(self, prompt: str, category: Optional[str] = None) -> str:
        """Create a detailed prompt for comprehensive image analysis"""
        base_prompt = f"""
        Analyze this product image comprehensively and extract detailed information for product formulation. Provide rich, actionable insights.

        User's text prompt: "{prompt}"
        Product category: {category or "general"}

        Please analyze the image and provide detailed information in these areas:

        1. PRODUCT CATEGORY & INTENDED USE:
        - Exact product type and subcategory
        - Primary and secondary intended benefits/effects
        - Target skin/health concerns (if applicable)
        - Usage instructions or application method
        - Seasonal or occasion-specific positioning

        2. KEY INGREDIENTS & CLAIMS:
        - All visible ingredients listed on packaging
        - Active ingredients and their concentrations (if visible)
        - Key functional ingredients and their benefits
        - Certifications and claims (organic, vegan, cruelty-free, etc.)
        - Allergen information and warnings
        - Expiry date and storage requirements

        3. PACKAGING TYPE & SIZE:
        - Exact packaging type (bottle, jar, tube, pump, etc.)
        - Precise size/volume/weight
        - Material composition (glass, plastic type, etc.)
        - Packaging features (airless pump, dropper, spray, etc.)
        - Sustainability aspects (recyclable, refillable, etc.)
        - Travel-friendly features

        4. TARGET MARKET & AUDIENCE:
        - Specific demographic (age, gender, lifestyle)
        - Income level and price positioning
        - Geographic market (local, regional, global)
        - Seasonal or occasion targeting
        - Lifestyle indicators (active, luxury, eco-conscious, etc.)
        - Cultural or regional preferences

        5. COMPETITOR POSITIONING & BRAND STYLE:
        - Visual brand identity and style
        - Price positioning (budget, mid-range, premium, luxury)
        - Competitive landscape positioning
        - Brand personality and values
        - Marketing messaging and tone
        - Distribution channels (retail, online, specialty, etc.)

        6. FORMULATION INSIGHTS:
        - Texture and consistency indicators
        - Scent/fragrance notes (if applicable)
        - Color and appearance characteristics
        - Application method and user experience
        - Formulation complexity and sophistication
        - Manufacturing considerations

        7. MARKET POSITIONING DETAILS:
        - Brand positioning statement
        - Unique selling propositions
        - Competitive advantages
        - Market gaps being addressed
        - Brand story and heritage
        - Innovation and technology claims

        8. CONSUMER INSIGHTS:
        - Pain points being solved
        - Desired outcomes and benefits
        - User experience expectations
        - Trust and credibility factors
        - Social proof and testimonials
        - Word-of-mouth potential

        Format your response as JSON with these exact keys:
        {{
            "product_category": "detailed product category",
            "intended_use": "comprehensive intended use and benefits",
            "key_ingredients": ["detailed list of all visible ingredients"],
            "claims": ["all certifications, claims, and benefits"],
            "packaging_type": "detailed packaging description",
            "packaging_size": "exact size/volume/weight",
            "packaging_material": "detailed material composition",
            "target_audience": "comprehensive target audience description",
            "brand_style": "detailed brand identity and style",
            "competitor_positioning": "detailed competitive positioning",
            "formulation_insights": ["detailed formulation characteristics"],
            "market_positioning": "comprehensive market positioning",
            "consumer_insights": ["detailed consumer pain points and desires"],
            "price_positioning": "detailed price positioning",
            "distribution_channels": ["detailed distribution information"],
            "sustainability_aspects": ["detailed sustainability features"],
            "innovation_claims": ["detailed innovation and technology claims"],
            "brand_story": "detailed brand story and heritage",
            "usage_instructions": "detailed usage and application instructions",
            "storage_requirements": "detailed storage and handling requirements"
        }}

        Be extremely detailed and comprehensive. Extract every piece of information visible on the packaging.
        """
        return base_prompt
    
    def _parse_analysis_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the OpenAI response into structured data"""
        try:
            # Try to extract JSON from the response
            if "{" in response_text and "}" in response_text:
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                json_str = response_text[start:end]
                return json.loads(json_str)
            else:
                # Fallback parsing
                return self._fallback_parse(response_text)
        except Exception as e:
            print(f"⚠️ Failed to parse analysis response: {e}")
            return self._fallback_parse(response_text)
    
    def _fallback_parse(self, response_text: str) -> Dict[str, Any]:
        """Fallback parsing for non-JSON responses"""
        lines = response_text.split('\n')
        result = {
            "product_insights": [],
            "visual_elements": [],
            "target_audience_hints": [],
            "formulation_hints": []
        }
        
        for line in lines:
            line = line.strip()
            if "brand" in line.lower() and "name" in line.lower():
                result["brand_name"] = line.split(":")[-1].strip()
            elif "product" in line.lower() and "type" in line.lower():
                result["product_type"] = line.split(":")[-1].strip()
            elif "color" in line.lower():
                result["color_scheme"] = line.split(":")[-1].strip()
            elif "packaging" in line.lower():
                result["packaging_style"] = line.split(":")[-1].strip()
            elif "target" in line.lower() and "audience" in line.lower():
                result["target_audience_hints"].append(line.split(":")[-1].strip())
            elif "ingredient" in line.lower():
                result["formulation_hints"].append(line)
            elif "insight" in line.lower():
                result["product_insights"].append(line)
        
        return result
    
    def _create_enhanced_prompt(self, original_prompt: str, analysis_data: Dict[str, Any]) -> str:
        """Create enhanced prompt in the specific format requested"""
        # Extract the 5 key pieces of information
        product_category = analysis_data.get("product_category", "product")
        target_audience = analysis_data.get("target_audience", "target audience")
        intended_use = analysis_data.get("intended_use", "intended benefit")
        claims = analysis_data.get("claims", [])
        key_ingredients = analysis_data.get("key_ingredients", [])
        packaging_type = analysis_data.get("packaging_type", "")
        packaging_size = analysis_data.get("packaging_size", "")
        packaging_material = analysis_data.get("packaging_material", "")
        brand_style = analysis_data.get("brand_style", "")
        competitor_positioning = analysis_data.get("competitor_positioning", "")
        
        # Combine packaging details
        packaging_details = []
        if packaging_type:
            packaging_details.append(packaging_type)
        if packaging_size:
            packaging_details.append(packaging_size)
        if packaging_material:
            packaging_details.append(packaging_material)
        packaging_info = ", ".join(packaging_details) if packaging_details else "standard packaging"
        
        # Combine claims
        claims_text = ", ".join(claims) if claims else "standard claims"
        
        # Combine ingredients
        ingredients_text = ", ".join(key_ingredients) if key_ingredients else "standard ingredients"
        
        # Combine brand positioning
        positioning_parts = []
        if brand_style:
            positioning_parts.append(brand_style)
        if competitor_positioning:
            positioning_parts.append(competitor_positioning)
        positioning_text = " and ".join(positioning_parts) if positioning_parts else "competitive positioning"
        
        # Create the enhanced prompt in the requested format
        enhanced_prompt = f"Generate a formulation for a {product_category} targeting {target_audience} that provides {intended_use}. The product claims to be {claims_text}, uses {ingredients_text}, and comes in {packaging_info}. Position it as a {positioning_text} with suggestions for {original_prompt}."
        
        return enhanced_prompt
    
    def _enhance_prompt_with_analysis(self, original_prompt: str, analysis_data: Dict[str, Any]) -> str:
        """Enhance the original prompt with image analysis insights"""
        return self._create_enhanced_prompt(original_prompt, analysis_data)
    
    def _create_integrated_prompt(self, intent_data: Dict[str, Any], image_analysis: Dict[str, Any], user_text: str) -> str:
        """Create integrated prompt combining intent and comprehensive image analysis in concise 5 lines"""
        # Extract intent information
        product_type_intent = intent_data.get("product_type_intent", "product")
        target_audience_intent = intent_data.get("target_audience_intent", "target audience")
        benefit_intent = intent_data.get("benefit_intent", "intended benefit")
        ingredient_intent = intent_data.get("ingredient_intent", [])
        market_positioning_intent = intent_data.get("market_positioning_intent", "competitive positioning")
        
        # Extract comprehensive image analysis information
        product_category = image_analysis.get("product_category", product_type_intent)
        target_audience = image_analysis.get("target_audience", target_audience_intent)
        intended_use = image_analysis.get("intended_use", benefit_intent)
        claims: List[str] = image_analysis.get("claims", [])
        key_ingredients: List[str] = image_analysis.get("key_ingredients", [])
        packaging_type = image_analysis.get("packaging_type", "")
        packaging_size = image_analysis.get("packaging_size", "")
        packaging_material = image_analysis.get("packaging_material", "")
        brand_style = image_analysis.get("brand_style", "")
        competitor_positioning = image_analysis.get("competitor_positioning", market_positioning_intent)
        
        # Extract rich additional information
        formulation_insights: List[str] = image_analysis.get("formulation_insights", [])
        consumer_insights: List[str] = image_analysis.get("consumer_insights", [])
        price_positioning = image_analysis.get("price_positioning", "")
        distribution_channels: List[str] = image_analysis.get("distribution_channels", [])
        sustainability_aspects: List[str] = image_analysis.get("sustainability_aspects", [])
        innovation_claims: List[str] = image_analysis.get("innovation_claims", [])
        brand_story = image_analysis.get("brand_story", "")
        usage_instructions = image_analysis.get("usage_instructions", "")
        storage_requirements = image_analysis.get("storage_requirements", "")
        market_positioning = image_analysis.get("market_positioning", "")
        
        # Clean user text - remove instruction phrases and extract actual requirements
        cleaned_user_text = user_text.strip()
        instruction_phrases = [
            "analyze this cosmetics image",
            "analyze this image",
            "provide detailed insights for formulation development",
            "provide insights for formulation",
            "analyze this product image",
            "examine this image",
            "study this image"
        ]
        
        for phrase in instruction_phrases:
            cleaned_user_text = cleaned_user_text.replace(phrase, "").replace(phrase.capitalize(), "")
        
        cleaned_user_text = cleaned_user_text.strip()
        
        # If cleaned text is empty or just instruction text, use analyzed insights instead
        if not cleaned_user_text or len(cleaned_user_text) < 10:
            # Use key insights from analysis as user requirements
            user_requirements = []
            if product_category:
                user_requirements.append(f"create a {product_category}")
            if target_audience:
                user_requirements.append(f"for {target_audience.split(',')[0].strip()}")
            if intended_use:
                use_parts = intended_use.split('.')
                user_requirements.append(f"that {use_parts[0].strip()}")
            if key_ingredients:
                user_requirements.append(f"using {', '.join(key_ingredients[:2])}")
            
            cleaned_user_text = " ".join(user_requirements) if user_requirements else "create a premium product"
        
        # Line 1: Product and target audience (concise)
        line1 = f"I want to create a {product_category}"
        if target_audience and target_audience != "target audience":
            # Simplify target audience if too long
            audience_parts = target_audience.split(',')
            simplified_audience = audience_parts[0].strip()
            line1 += f" for {simplified_audience}"
        if intended_use and intended_use != "intended benefit":
            # Take first part of intended use if too long
            use_parts = intended_use.split('.')
            simplified_use = use_parts[0].strip()
            line1 += f" that {simplified_use}"
        line1 += "."
        
        # Line 2: Key features and ingredients (concise)
        all_claims = claims + innovation_claims
        all_ingredients = ingredient_intent + key_ingredients
        unique_ingredients = []
        for ingredient in all_ingredients:
            if ingredient.lower() not in [i.lower() for i in unique_ingredients]:
                unique_ingredients.append(ingredient)
        
        line2 = "The product should feature "
        if all_claims:
            line2 += f"{', '.join(all_claims[:2]).lower()}"
        if unique_ingredients:
            line2 += f" using {', '.join(unique_ingredients[:2]).lower()}"
        line2 += "."
        
        # Line 3: Packaging and positioning (concise)
        line3 = "It should be packaged in "
        packaging_details = []
        if packaging_type:
            packaging_details.append(packaging_type)
        if packaging_size and packaging_size != "Not specified on visible packaging":
            packaging_details.append(packaging_size)
        if packaging_material:
            packaging_details.append(packaging_material)
        if packaging_details:
            line3 += f"{', '.join(packaging_details)}"
        else:
            line3 += "appropriate packaging"
        
        positioning_parts = []
        if brand_style:
            positioning_parts.append(brand_style)
        if competitor_positioning:
            positioning_parts.append(competitor_positioning)
        if positioning_parts:
            line3 += f" and positioned as {', '.join(positioning_parts[:1])}"
        line3 += "."
        
        # Line 4: Formulation and market (concise)
        line4 = "The formulation should be "
        formulation_details = []
        if formulation_insights:
            formulation_details.extend(formulation_insights[:1])
        if usage_instructions:
            # Simplify usage instructions
            usage_parts = usage_instructions.split(',')
            simplified_usage = usage_parts[0].strip()
            formulation_details.append(f"with {simplified_usage}")
        if formulation_details:
            line4 += f"{', '.join(formulation_details)}"
        else:
            line4 += "suitable for the target market"
        
        if market_positioning:
            line4 += f" and {market_positioning}"
        line4 += "."
        
        # Line 5: User requirements (concise) - use cleaned text or analyzed insights
        line5 = f"My specific requirements: {cleaned_user_text}"
        if sustainability_aspects:
            line5 += f" I want to emphasize {', '.join(sustainability_aspects[:1])}"
        if consumer_insights:
            line5 += f" and address {', '.join(consumer_insights[:1])}"
        line5 += "."
        
        # Combine all lines
        integrated_prompt = f"{line1}\n{line2}\n{line3}\n{line4}\n{line5}"
        
        return integrated_prompt
    
    def _generate_mock_analysis(self, prompt: str, category: Optional[str] = None) -> ImageAnalysisResponse:
        """Generate mock analysis when OpenAI is not available"""
        
        # Generate category-specific mock data
        if category == "cosmetics":
            mock_data = {
                "brand_name": "Luxe Beauty",
                "product_type": "anti-aging serum",
                "visual_elements": ["elegant glass bottle", "premium branding", "gold accents", "minimalist design"],
                "color_scheme": "gold and white with black text",
                "packaging_style": "premium glass dropper bottle with metallic cap",
                "target_audience_hints": ["affluent consumers", "beauty enthusiasts", "anti-aging focused"],
                "product_insights": ["hyaluronic acid formulation", "vitamin C complex", "peptide technology"],
                "formulation_hints": ["hyaluronic acid", "vitamin C", "peptides", "niacinamide"]
            }
        elif category == "pet food":
            mock_data = {
                "brand_name": "Pawsome Nutrition",
                "product_type": "premium dog food",
                "visual_elements": ["natural ingredients", "grain-free packaging", "premium branding"],
                "color_scheme": "earth tones with green accents",
                "packaging_style": "premium resealable bag with window",
                "target_audience_hints": ["premium pet owners", "health-conscious", "natural product seekers"],
                "product_insights": ["grain-free formula", "real meat first", "natural preservatives"],
                "formulation_hints": ["chicken", "sweet potato", "peas", "natural vitamins"]
            }
        elif category == "wellness":
            mock_data = {
                "brand_name": "Vital Health",
                "product_type": "immune support supplement",
                "visual_elements": ["natural ingredients", "organic certification", "clean design"],
                "color_scheme": "green and white with natural imagery",
                "packaging_style": "glass bottle with dropper",
                "target_audience_hints": ["health-conscious consumers", "natural product seekers", "immune support focused"],
                "product_insights": ["vitamin C and D", "zinc formulation", "natural extracts"],
                "formulation_hints": ["vitamin C", "vitamin D", "zinc", "elderberry"]
            }
        else:
            # Default mock data
            mock_data = {
                "brand_name": "Premium Brand",
                "product_type": "premium product",
                "visual_elements": ["elegant packaging", "premium branding", "natural colors"],
                "color_scheme": "earth tones with gold accents",
                "packaging_style": "premium glass container with metallic cap",
                "target_audience_hints": ["affluent consumers", "quality seekers", "natural product enthusiasts"],
                "product_insights": ["premium formulation", "natural ingredients", "luxury positioning"],
                "formulation_hints": ["natural extracts", "premium ingredients", "quality assurance"]
            }
        
        return ImageAnalysisResponse(
            success=True,
            image_analysis=mock_data,
            enhanced_prompt=f"{prompt} | Product type: {mock_data['product_type']} | Visual elements: {', '.join(mock_data['visual_elements'])}",
            product_insights=mock_data["product_insights"],
            visual_elements=mock_data["visual_elements"],
            color_scheme=mock_data["color_scheme"],
            packaging_style=mock_data["packaging_style"],
            target_audience_hints=mock_data["target_audience_hints"],
            brand_name=mock_data.get("brand_name")
        )

# Global instance
image_analysis_service = ImageAnalysisService() 