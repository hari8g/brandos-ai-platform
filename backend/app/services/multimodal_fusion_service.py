import os
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.models.multimodal import MultiModalRequest, MultiModalResponse, ImageAnalysisResponse
from app.services.image_analysis_service import image_analysis_service
from app.services.generate.generate_service import generate_formulation
from app.models.generate import GenerateRequest, GenerateResponse
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

class MultiModalFusionService:
    """Service for fusing text and image data for enhanced formulation generation"""
    
    def __init__(self):
        self.client = None
        try:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and api_key != "your_openai_api_key_here" and api_key.strip():
                self.client = OpenAI(api_key=api_key)
                print("✅ Multi-Modal Fusion Service: OpenAI client initialized")
            else:
                print("⚠️ Multi-Modal Fusion Service: OpenAI API key not found")
        except Exception as e:
            print(f"⚠️ Multi-Modal Fusion Service: Failed to initialize OpenAI client: {e}")
    
    def fuse_text_and_image(self, request: MultiModalRequest) -> MultiModalResponse:
        """Fuse text prompt with image analysis for enhanced formulation"""
        try:
            # Extract image insights if available
            image_insights = {}
            text_enhancements = []
            
            if request.image_analysis:
                image_insights = request.image_analysis
                text_enhancements = self._extract_text_enhancements(image_insights)
            
            # Create fused prompt
            fused_prompt = self._create_fused_prompt(
                request.text_prompt,
                image_insights,
                request.fusion_strategy
            )
            
            # Generate formulation using the fused prompt
            generate_request = GenerateRequest(
                prompt=fused_prompt,
                category=request.category,
                target_cost=request.target_cost
            )
            
            formulation = generate_formulation(generate_request)
            
            return MultiModalResponse(
                success=True,
                fused_prompt=fused_prompt,
                image_insights=image_insights,
                text_enhancements=text_enhancements,
                formulation=formulation.dict() if formulation else None
            )
            
        except Exception as e:
            print(f"❌ Multi-modal fusion error: {e}")
            return MultiModalResponse(
                success=False,
                fused_prompt=request.text_prompt,
                image_insights={},
                text_enhancements=[],
                error=str(e)
            )
    
    def _create_fused_prompt(self, text_prompt: str, image_insights: Dict[str, Any], strategy: str) -> str:
        """Create a fused prompt combining text and image insights"""
        if not image_insights:
            return text_prompt
        
        # Extract key insights from image analysis
        product_type = image_insights.get("product_type", "")
        visual_elements = image_insights.get("visual_elements", [])
        color_scheme = image_insights.get("color_scheme", "")
        packaging_style = image_insights.get("packaging_style", "")
        formulation_hints = image_insights.get("formulation_hints", [])
        target_audience = image_insights.get("target_audience_hints", [])
        
        # Build enhanced prompt based on strategy
        if strategy == "enhanced":
            enhanced_parts = [text_prompt]
            
            if product_type:
                enhanced_parts.append(f"Product type from image: {product_type}")
            
            if visual_elements:
                enhanced_parts.append(f"Visual elements: {', '.join(visual_elements)}")
            
            if color_scheme:
                enhanced_parts.append(f"Color scheme: {color_scheme}")
            
            if packaging_style:
                enhanced_parts.append(f"Packaging style: {packaging_style}")
            
            if formulation_hints:
                enhanced_parts.append(f"Formulation hints: {', '.join(formulation_hints)}")
            
            if target_audience:
                enhanced_parts.append(f"Target audience indicators: {', '.join(target_audience)}")
            
            return " | ".join(enhanced_parts)
        
        elif strategy == "balanced":
            # Equal weight to text and image
            image_context = f"Based on image analysis: {product_type} with {', '.join(visual_elements)} styling"
            return f"{text_prompt} | {image_context}"
        
        elif strategy == "image_primary":
            # Prioritize image insights
            image_context = f"Product: {product_type} | Style: {', '.join(visual_elements)} | Colors: {color_scheme} | Packaging: {packaging_style}"
            return f"{image_context} | Additional requirements: {text_prompt}"
        
        else:
            return text_prompt
    
    def _extract_text_enhancements(self, image_insights: Dict[str, Any]) -> List[str]:
        """Extract text enhancements from image insights"""
        enhancements = []
        
        if image_insights.get("product_type"):
            enhancements.append(f"Product type: {image_insights['product_type']}")
        
        if image_insights.get("visual_elements"):
            enhancements.append(f"Visual elements: {', '.join(image_insights['visual_elements'])}")
        
        if image_insights.get("color_scheme"):
            enhancements.append(f"Color scheme: {image_insights['color_scheme']}")
        
        if image_insights.get("packaging_style"):
            enhancements.append(f"Packaging style: {image_insights['packaging_style']}")
        
        if image_insights.get("formulation_hints"):
            enhancements.append(f"Formulation hints: {', '.join(image_insights['formulation_hints'])}")
        
        if image_insights.get("target_audience_hints"):
            enhancements.append(f"Target audience: {', '.join(image_insights['target_audience_hints'])}")
        
        return enhancements
    
    def analyze_and_fuse(self, text_prompt: str, image_data: bytes, category: Optional[str] = None, 
                        target_cost: Optional[str] = None, strategy: str = "enhanced") -> MultiModalResponse:
        """Analyze image and fuse with text prompt in one operation"""
        try:
            # First analyze the image
            image_analysis = image_analysis_service.analyze_image(image_data, text_prompt, category)
            
            if not image_analysis.success:
                return MultiModalResponse(
                    success=False,
                    fused_prompt=text_prompt,
                    image_insights={},
                    text_enhancements=[],
                    error=image_analysis.error
                )
            
            # Create multi-modal request
            multimodal_request = MultiModalRequest(
                text_prompt=text_prompt,
                category=category,
                target_cost=target_cost,
                image_analysis=image_analysis.image_analysis,
                fusion_strategy=strategy
            )
            
            # Fuse the data
            return self.fuse_text_and_image(multimodal_request)
            
        except Exception as e:
            print(f"❌ Analyze and fuse error: {e}")
            return MultiModalResponse(
                success=False,
                fused_prompt=text_prompt,
                image_insights={},
                text_enhancements=[],
                error=str(e)
            )

# Global instance
multimodal_fusion_service = MultiModalFusionService() 