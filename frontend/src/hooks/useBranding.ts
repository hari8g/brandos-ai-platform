import { useState } from 'react';
import apiClient from '@/services/apiClient';

export interface BrandNameSuggestion {
  name: string;
  meaning: string;
  category: string;
  reasoning: string;
  availability_check: string;
}

export interface SocialMediaChannel {
  platform: string;
  content_strategy: string;
  target_audience: string;
  post_frequency: string;
  content_ideas: string[];
  hashtag_strategy: string[];
  engagement_tips: string[];
}

export interface BrandingStrategy {
  brand_name_suggestions: BrandNameSuggestion[];
  social_media_channels: SocialMediaChannel[];
  overall_branding_theme: string;
  brand_personality: string;
  visual_identity_guidelines: string[];
  marketing_messaging: string[];
}

export interface BrandingRequest {
  formulation: any; // GenerateResponse type
  target_audience?: string;
  brand_tone?: string;
  region?: string;
}

export interface BrandingResponse {
  success: boolean;
  message: string;
  branding_strategy?: BrandingStrategy;
  error?: string;
}

export const useBranding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandingStrategy, setBrandingStrategy] = useState<BrandingStrategy | null>(null);

  const analyzeBranding = async (request: BrandingRequest): Promise<BrandingStrategy | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<BrandingResponse>('/branding/analyze', request);
      
      if (response.data.success && response.data.branding_strategy) {
        setBrandingStrategy(response.data.branding_strategy);
        return response.data.branding_strategy;
      } else {
        throw new Error(response.data.error || 'Failed to analyze branding');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while analyzing branding';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setBrandingStrategy(null);
  };

  return {
    loading,
    error,
    brandingStrategy,
    analyzeBranding,
    reset
  };
}; 