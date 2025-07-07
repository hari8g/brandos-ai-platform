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