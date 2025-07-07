"""
Adaptive Prompt Service for Phase 2 Optimization
Dynamically optimizes prompts based on context and usage patterns.
"""

import json
import hashlib
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class PromptType(Enum):
    FORMULATION = "formulation"
    MARKET_RESEARCH = "market_research"
    BRANDING = "branding"
    COSTING = "costing"
    SCIENTIFIC = "scientific"

class OptimizationLevel(Enum):
    LIGHT = "light"
    MEDIUM = "medium"
    AGGRESSIVE = "aggressive"

@dataclass
class PromptContext:
    query: str
    product_type: Optional[str] = None
    category: Optional[str] = None
    requirements: Optional[List[str]] = None
    constraints: Optional[List[str]] = None
    target_audience: Optional[str] = None
    region: Optional[str] = None

@dataclass
class OptimizedPrompt:
    prompt: str
    token_count: int
    optimization_techniques: List[str]
    confidence_score: float

class AdaptivePromptService:
    """
    Service for adaptive prompt optimization
    """
    
    def __init__(self, optimization_level: OptimizationLevel = OptimizationLevel.MEDIUM):
        self.optimization_level = optimization_level
        self.prompt_templates = self._load_prompt_templates()
        self.usage_patterns = {}
        self.success_metrics = {}
        
    def _load_prompt_templates(self) -> Dict:
        """
        Load optimized prompt templates
        """
        return {
            PromptType.FORMULATION: {
                "base": "Create {product_type} formulation with {key_requirements}",
                "detailed": "Develop comprehensive {product_type} formulation including ingredients, percentages, and manufacturing steps. Focus on {key_requirements}",
                "minimal": "Formulate {product_type} with {key_requirements}"
            },
            PromptType.MARKET_RESEARCH: {
                "base": "Analyze market for {product_type} in {region}",
                "detailed": "Conduct comprehensive market research for {product_type} including TAM, SAM, TM analysis, competitive landscape, and growth projections in {region}",
                "minimal": "Market analysis for {product_type}"
            },
            PromptType.BRANDING: {
                "base": "Create branding strategy for {product_type} targeting {audience}",
                "detailed": "Develop comprehensive branding strategy including brand name suggestions, visual identity, social media strategy, and marketing messaging for {product_type} targeting {audience}",
                "minimal": "Brand strategy for {product_type}"
            },
            PromptType.COSTING: {
                "base": "Calculate costs for {product_type} at {scale} scale",
                "detailed": "Provide detailed cost analysis including CAPEX, OPEX, margins, and pricing strategy for {product_type} at {scale} scale in {region}",
                "minimal": "Cost analysis for {product_type}"
            },
            PromptType.SCIENTIFIC: {
                "base": "Analyze scientific basis for {product_type}",
                "detailed": "Conduct comprehensive scientific analysis including ingredient rationale, consumer psychology, regulatory compliance, and safety assessment for {product_type}",
                "minimal": "Scientific analysis for {product_type}"
            }
        }
    
    def optimize_prompt(self, prompt_type: PromptType, context: PromptContext) -> OptimizedPrompt:
        """
        Optimize prompt based on context and usage patterns
        """
        # Determine template level based on optimization level
        template_level = self._get_template_level()
        
        # Get base template
        template = self.prompt_templates[prompt_type][template_level]
        
        # Fill template with context
        filled_prompt = self._fill_template(template, context)
        
        # Apply additional optimizations
        optimized_prompt = self._apply_optimizations(filled_prompt, context)
        
        # Calculate metrics
        token_count = len(optimized_prompt.split())
        confidence_score = self._calculate_confidence(context)
        techniques = self._get_optimization_techniques()
        
        # Track usage
        self._track_usage(prompt_type, context)
        
        return OptimizedPrompt(
            prompt=optimized_prompt,
            token_count=token_count,
            optimization_techniques=techniques,
            confidence_score=confidence_score
        )
    
    def _get_template_level(self) -> str:
        """
        Get template level based on optimization level
        """
        if self.optimization_level == OptimizationLevel.AGGRESSIVE:
            return "minimal"
        elif self.optimization_level == OptimizationLevel.LIGHT:
            return "detailed"
        else:
            return "base"
    
    def _fill_template(self, template: str, context: PromptContext) -> str:
        """
        Fill template with context data
        """
        # Extract key requirements (limit to 3 for token optimization)
        key_requirements = context.requirements[:3] if context.requirements else ["quality", "efficiency"]
        requirements_text = ", ".join(key_requirements)
        
        # Build context mapping
        context_map = {
            "product_type": context.product_type or "product",
            "key_requirements": requirements_text,
            "region": context.region or "India",
            "audience": context.target_audience or "general consumers",
            "scale": "medium",  # Default scale
            "category": context.category or "cosmetics"
        }
        
        # Fill template
        filled = template
        for key, value in context_map.items():
            filled = filled.replace(f"{{{key}}}", str(value))
        
        return filled
    
    def _apply_optimizations(self, prompt: str, context: PromptContext) -> str:
        """
        Apply additional optimizations based on level
        """
        optimized = prompt
        
        if self.optimization_level == OptimizationLevel.AGGRESSIVE:
            # Remove redundant words
            redundant_words = ["comprehensive", "detailed", "thorough", "extensive"]
            for word in redundant_words:
                optimized = optimized.replace(word, "")
            
            # Shorten common phrases
            phrase_replacements = {
                "including": "with",
                "consisting of": "with",
                "comprising": "with",
                "targeting": "for",
                "focusing on": "for"
            }
            for old, new in phrase_replacements.items():
                optimized = optimized.replace(old, new)
        
        # Remove excessive whitespace
        optimized = " ".join(optimized.split())
        
        return optimized
    
    def _calculate_confidence(self, context: PromptContext) -> float:
        """
        Calculate confidence score based on context completeness
        """
        score = 0.5  # Base score
        
        if context.product_type:
            score += 0.2
        if context.requirements:
            score += 0.15
        if context.category:
            score += 0.1
        if context.target_audience:
            score += 0.05
        
        return min(score, 1.0)
    
    def _get_optimization_techniques(self) -> List[str]:
        """
        Get list of optimization techniques used
        """
        techniques = ["template_optimization", "context_filling"]
        
        if self.optimization_level == OptimizationLevel.AGGRESSIVE:
            techniques.extend(["redundant_word_removal", "phrase_shortening"])
        
        return techniques
    
    def _track_usage(self, prompt_type: PromptType, context: PromptContext):
        """
        Track usage patterns for adaptive optimization
        """
        key = f"{prompt_type.value}_{context.product_type}"
        if key not in self.usage_patterns:
            self.usage_patterns[key] = 0
        self.usage_patterns[key] += 1
    
    def get_optimization_stats(self) -> Dict:
        """
        Get optimization statistics
        """
        return {
            "optimization_level": self.optimization_level.value,
            "usage_patterns": self.usage_patterns,
            "success_metrics": self.success_metrics
        }

class PromptOptimizer:
    """
    High-level prompt optimizer for easy integration
    """
    
    def __init__(self):
        self.adaptive_service = AdaptivePromptService()
    
    def create_formulation_prompt(self, query: str, **kwargs) -> str:
        """
        Create optimized formulation prompt
        """
        context = PromptContext(
            query=query,
            product_type=kwargs.get("product_type"),
            category=kwargs.get("category"),
            requirements=kwargs.get("requirements", []),
            region=kwargs.get("region", "India")
        )
        
        optimized = self.adaptive_service.optimize_prompt(PromptType.FORMULATION, context)
        return optimized.prompt
    
    def create_market_research_prompt(self, query: str, **kwargs) -> str:
        """
        Create optimized market research prompt
        """
        context = PromptContext(
            query=query,
            product_type=kwargs.get("product_type"),
            category=kwargs.get("category"),
            region=kwargs.get("region", "India")
        )
        
        optimized = self.adaptive_service.optimize_prompt(PromptType.MARKET_RESEARCH, context)
        return optimized.prompt
    
    def create_branding_prompt(self, query: str, **kwargs) -> str:
        """
        Create optimized branding prompt
        """
        context = PromptContext(
            query=query,
            product_type=kwargs.get("product_type"),
            target_audience=kwargs.get("target_audience", "general consumers"),
            region=kwargs.get("region", "India")
        )
        
        optimized = self.adaptive_service.optimize_prompt(PromptType.BRANDING, context)
        return optimized.prompt
    
    def create_costing_prompt(self, query: str, **kwargs) -> str:
        """
        Create optimized costing prompt
        """
        context = PromptContext(
            query=query,
            product_type=kwargs.get("product_type"),
            region=kwargs.get("region", "India")
        )
        
        optimized = self.adaptive_service.optimize_prompt(PromptType.COSTING, context)
        return optimized.prompt
    
    def create_scientific_prompt(self, query: str, **kwargs) -> str:
        """
        Create optimized scientific analysis prompt
        """
        context = PromptContext(
            query=query,
            product_type=kwargs.get("product_type"),
            category=kwargs.get("category"),
            region=kwargs.get("region", "India")
        )
        
        optimized = self.adaptive_service.optimize_prompt(PromptType.SCIENTIFIC, context)
        return optimized.prompt

# Global prompt optimizer instance
prompt_optimizer = PromptOptimizer() 