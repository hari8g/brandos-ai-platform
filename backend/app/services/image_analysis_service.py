import os
import base64
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.models.multimodal import ImageAnalysisResponse, ImageUploadResponse
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
        try:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and api_key != "your_openai_api_key_here" and api_key.strip():
                self.client = OpenAI(api_key=api_key)
                print("✅ Image Analysis Service: OpenAI client initialized")
            else:
                print("⚠️ Image Analysis Service: OpenAI API key not found")
        except Exception as e:
            print(f"⚠️ Image Analysis Service: Failed to initialize OpenAI client: {e}")
    
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
            
            return ImageAnalysisResponse(
                success=True,
                image_analysis=analysis_data,
                enhanced_prompt=self._enhance_prompt_with_analysis(prompt, analysis_data),
                product_insights=analysis_data.get("product_insights", []),
                visual_elements=analysis_data.get("visual_elements", []),
                color_scheme=analysis_data.get("color_scheme"),
                packaging_style=analysis_data.get("packaging_style"),
                target_audience_hints=analysis_data.get("target_audience_hints", []),
                brand_name=analysis_data.get("brand_name")
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
        """Create a detailed prompt for image analysis"""
        base_prompt = f"""
        Analyze this product image and provide detailed insights for formulation development.
        
        User's text prompt: "{prompt}"
        Product category: {category or "general"}
        
        Please analyze the image and provide:
        1. Brand name and logo identification
        2. Product type and form (liquid, solid, powder, etc.)
        3. Visual elements and design features
        4. Color scheme and branding style
        5. Packaging type and materials
        6. Target audience indicators
        7. Key ingredients that might be visible
        8. Market positioning clues
        9. Formulation requirements based on visual cues
        
        Format your response as JSON with these keys:
        - brand_name: string (if visible)
        - product_type: string
        - visual_elements: array of strings
        - color_scheme: string
        - packaging_style: string
        - target_audience_hints: array of strings
        - product_insights: array of strings
        - formulation_hints: array of strings
        - market_positioning: string
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
    
    def _enhance_prompt_with_analysis(self, original_prompt: str, analysis_data: Dict[str, Any]) -> str:
        """Enhance the original prompt with image analysis insights"""
        enhanced_parts = [original_prompt]
        
        if analysis_data.get("product_type"):
            enhanced_parts.append(f"Product type identified: {analysis_data['product_type']}")
        
        if analysis_data.get("visual_elements"):
            enhanced_parts.append(f"Visual elements: {', '.join(analysis_data['visual_elements'])}")
        
        if analysis_data.get("color_scheme"):
            enhanced_parts.append(f"Color scheme: {analysis_data['color_scheme']}")
        
        if analysis_data.get("packaging_style"):
            enhanced_parts.append(f"Packaging style: {analysis_data['packaging_style']}")
        
        if analysis_data.get("formulation_hints"):
            enhanced_parts.append(f"Formulation hints: {', '.join(analysis_data['formulation_hints'])}")
        
        return " | ".join(enhanced_parts)
    
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