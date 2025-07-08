export interface ImageAnalysisRequest {
  prompt: string;
  category?: string;
  target_cost?: string;
  image_description?: string;
  image_analysis?: Record<string, any>;
}

export interface ImageAnalysisResponse {
  success: boolean;
  image_analysis: Record<string, any>;
  enhanced_prompt: string;
  product_insights: string[];
  visual_elements: string[];
  color_scheme?: string;
  packaging_style?: string;
  target_audience_hints: string[];
  brand_name?: string;
  product_type?: string;
  market_positioning?: string;
  formulation_hints?: string[];
  error?: string;
  
  // Enhanced fields for comprehensive analysis
  product_category?: string;
  intended_use?: string;
  key_ingredients: string[];
  claims: string[];
  packaging_type?: string;
  packaging_size?: string;
  packaging_material?: string;
  target_audience?: string;
  brand_style?: string;
  competitor_positioning?: string;
  
  // New rich fields for comprehensive analysis
  formulation_insights: string[];
  consumer_insights: string[];
  price_positioning?: string;
  distribution_channels: string[];
  sustainability_aspects: string[];
  innovation_claims: string[];
  brand_story?: string;
  usage_instructions?: string;
  storage_requirements?: string;
  
  // Intent classification fields
  intent_classification?: {
    product_type_intent?: string;
    target_audience_intent?: string;
    benefit_intent?: string;
    ingredient_intent: string[];
    formulation_intent?: string;
    market_positioning_intent?: string;
    packaging_intent?: string;
    budget_intent?: string;
    competitor_intent?: string;
    sustainability_intent?: string;
    confidence_score?: number;
    primary_intent?: string;
  };
}

export interface MultiModalRequest {
  text_prompt: string;
  category?: string;
  target_cost?: string;
  image_analysis?: Record<string, any>;
  fusion_strategy: 'enhanced' | 'balanced' | 'image_primary';
}

export interface MultiModalResponse {
  success: boolean;
  fused_prompt: string;
  image_insights: Record<string, any>;
  text_enhancements: string[];
  formulation?: Record<string, any>;
  error?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  image_url?: string;
  analysis?: Record<string, any>;
  error?: string;
}

export interface ImageAnalysisResult {
  product_type?: string;
  visual_elements: string[];
  color_scheme?: string;
  packaging_style?: string;
  target_audience_hints: string[];
  product_insights: string[];
  formulation_hints: string[];
  market_positioning?: string;
}

export interface FusionStrategy {
  id: 'enhanced' | 'balanced' | 'image_primary';
  name: string;
  description: string;
}

export const FUSION_STRATEGIES: FusionStrategy[] = [
  {
    id: 'enhanced',
    name: 'Enhanced Fusion',
    description: 'Combine text and image insights with equal weight for comprehensive analysis'
  },
  {
    id: 'balanced',
    name: 'Balanced Approach',
    description: 'Balance text requirements with visual elements from the image'
  },
  {
    id: 'image_primary',
    name: 'Image-First',
    description: 'Prioritize visual elements and styling from the image'
  }
]; 