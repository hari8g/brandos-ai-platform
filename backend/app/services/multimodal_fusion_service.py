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
        """Create a natural language fused prompt combining text and image insights"""
        if not image_insights:
            return text_prompt
        
        # Extract key insights from image analysis
        product_type = image_insights.get("product_type", "")
        visual_elements = image_insights.get("visual_elements", [])
        color_scheme = image_insights.get("color_scheme", "")
        packaging_style = image_insights.get("packaging_style", "")
        formulation_hints = image_insights.get("formulation_hints", [])
        target_audience = image_insights.get("target_audience_hints", [])
        product_insights = image_insights.get("product_insights", [])
        brand_name = image_insights.get("brand_name", "")
        market_positioning = image_insights.get("market_positioning", "")
        
        # Create natural language components
        def create_natural_context():
            context_parts = []
            
            if product_type:
                context_parts.append(f"this appears to be a {product_type}")
            
            if brand_name:
                context_parts.append(f"from {brand_name}")
            
            if visual_elements:
                visual_desc = ", ".join(visual_elements[:3])  # Limit to first 3 elements
                context_parts.append(f"featuring {visual_desc}")
            
            if color_scheme:
                context_parts.append(f"with a {color_scheme} aesthetic")
            
            if packaging_style:
                context_parts.append(f"packaged in {packaging_style}")
            
            if target_audience:
                audience_desc = ", ".join(target_audience[:2])  # Limit to first 2 hints
                context_parts.append(f"aimed at {audience_desc}")
            
            if market_positioning:
                context_parts.append(f"positioned as {market_positioning}")
            
            return " ".join(context_parts) if context_parts else ""
        
        def create_formulation_guidance():
            if formulation_hints:
                ingredients = ", ".join(formulation_hints[:3])  # Limit to first 3 hints
                return f"Consider incorporating {ingredients} to match the product's visual identity and market positioning."
            return ""
        
        def create_product_insights():
            if product_insights:
                insights = ". ".join(product_insights[:2])  # Limit to first 2 insights
                return f"The image suggests {insights.lower()}"
            return ""
        
        # Build natural language prompt based on strategy
        if strategy == "enhanced":
            # Comprehensive natural language fusion
            natural_context = create_natural_context()
            formulation_guidance = create_formulation_guidance()
            product_insights = create_product_insights()
            
            enhanced_parts = []
            
            # Start with natural observation
            if natural_context:
                enhanced_parts.append(f"Looking at this product image, I can see {natural_context}.")
            
            # Add product insights if available
            if product_insights:
                enhanced_parts.append(product_insights + ".")
            
            # Add user's requirements
            if text_prompt.strip():
                enhanced_parts.append(f"Your requirements include: {text_prompt.strip()}")
            
            # Add formulation guidance
            if formulation_guidance:
                enhanced_parts.append(formulation_guidance)
            
            # Add strategic direction
            enhanced_parts.append("Please develop a formulation that harmonizes your specifications with these visual and market insights to create a compelling product that resonates with the target audience.")
            
            return " ".join(enhanced_parts)
        
        elif strategy == "balanced":
            # Balanced natural language fusion
            natural_context = create_natural_context()
            formulation_guidance = create_formulation_guidance()
            
            enhanced_parts = []
            
            # Start with user's requirements
            if text_prompt.strip():
                enhanced_parts.append(f"Your product requirements: {text_prompt.strip()}")
            
            # Add balanced image context
            if natural_context:
                enhanced_parts.append(f"Combined with visual analysis showing {natural_context}.")
            
            # Add formulation guidance
            if formulation_guidance:
                enhanced_parts.append(formulation_guidance)
            
            # Add balanced direction
            enhanced_parts.append("Please create a formulation that balances your requirements with the visual insights for optimal product development.")
            
            return " ".join(enhanced_parts)
        
        elif strategy == "image_primary":
            # Image-first natural language fusion
            natural_context = create_natural_context()
            formulation_guidance = create_formulation_guidance()
            product_insights = create_product_insights()
            
            enhanced_parts = []
            
            # Start with image-driven context
            if natural_context:
                enhanced_parts.append(f"Based on the image analysis, {natural_context}.")
            
            # Add product insights
            if product_insights:
                enhanced_parts.append(product_insights + ".")
            
            # Add formulation guidance
            if formulation_guidance:
                enhanced_parts.append(formulation_guidance)
            
            # Add user requirements as additional considerations
            if text_prompt.strip():
                enhanced_parts.append(f"Additionally, please incorporate these requirements: {text_prompt.strip()}")
            
            # Add strategic direction
            enhanced_parts.append("Develop a formulation that builds upon the visual identity while addressing your specific needs.")
            
            return " ".join(enhanced_parts)
        
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
            print(f"🔍 analyze_and_fuse called with text_prompt length: {len(text_prompt)}")
            print(f"🔍 text_prompt preview: {text_prompt[:100]}...")
            
            # Check if this is a direct formulation request (from selected suggestion)
            # If the text_prompt is already a comprehensive prompt, use it directly
            is_comprehensive_prompt = (
                len(text_prompt) > 200 and (
                    "Looking at this product image" in text_prompt or 
                    "Based on the image analysis" in text_prompt or
                    "Formulate a" in text_prompt or
                    "Create a" in text_prompt or
                    "Develop a" in text_prompt
                )
            )
            
            if is_comprehensive_prompt:
                print("🎯 Using direct formulation with selected prompt")
                print(f"🎯 Prompt content: {text_prompt}")
                # Generate formulation directly using the provided prompt
                generate_request = GenerateRequest(
                    prompt=text_prompt,
                    category=category,
                    target_cost=target_cost
                )
                
                formulation = generate_formulation(generate_request)
                
                return MultiModalResponse(
                    success=True,
                    fused_prompt=text_prompt,
                    image_insights={},
                    text_enhancements=[],
                    formulation=formulation.dict() if formulation else None
                )
            
            # Otherwise, proceed with normal fusion process
            print("🔄 Using fusion process")
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
            
            # Create multi-modal request with the enhanced prompt from image analysis
            multimodal_request = MultiModalRequest(
                text_prompt=image_analysis.enhanced_prompt if image_analysis.enhanced_prompt else text_prompt,
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