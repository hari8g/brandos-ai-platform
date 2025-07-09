import { useState } from 'react';
import apiClient from '../services/apiClient';
import type { 
  ImageAnalysisResponse, 
  MultiModalRequest, 
  MultiModalResponse,
  ImageUploadResponse,
  FusionStrategy 
} from '../types/multimodal';

export const useMultimodal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResponse | null>(null);
  const [multimodalResult, setMultimodalResult] = useState<MultiModalResponse | null>(null);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<{
    analysis: string;
    sections: {
      formulation_summary: string;
      formulation_details: string;
      market_research: string;
      manufacturing_considerations: string;
      unit_economics: string;
      packaging_branding: string;
    };
  } | null>(null);

  const analyzeImage = async (
    file: File, 
    prompt: string, 
    category?: string, 
    targetCost?: string
  ): Promise<ImageAnalysisResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Starting image analysis:', { file: file.name, prompt, category });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);
      if (category) formData.append('category', category);
      if (targetCost) formData.append('target_cost', targetCost);

      console.log('📤 Sending request to /multimodal/analyze-image');
      
      const response = await apiClient.post<ImageAnalysisResponse>(
        '/multimodal/analyze-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('📥 Received response:', response.data);

      if (response.data.success) {
        setImageAnalysis(response.data);
        console.log('✅ Image analysis successful');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Image analysis failed');
      }
    } catch (err) {
      console.error('❌ Image analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during image analysis';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fuseTextAndImage = async (request: MultiModalRequest): Promise<MultiModalResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<MultiModalResponse>(
        '/multimodal/fuse-text-image',
        request
      );

      if (response.data.success) {
        setMultimodalResult(response.data);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Multi-modal fusion failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during fusion';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeAndFuse = async (
    file: File,
    textPrompt: string,
    category?: string,
    targetCost?: string,
    fusionStrategy: FusionStrategy['id'] = 'enhanced'
  ): Promise<MultiModalResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Starting analyzeAndFuse:', { file: file.name, textPrompt, category, fusionStrategy });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text_prompt', textPrompt);
      formData.append('fusion_strategy', fusionStrategy);
      if (category) formData.append('category', category);
      if (targetCost) formData.append('target_cost', targetCost);

      console.log('📤 Sending request to /multimodal/analyze-and-fuse');
      
      const response = await apiClient.post<MultiModalResponse>(
        '/multimodal/analyze-and-fuse',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('📥 Received analyzeAndFuse response:', response.data);

      if (response.data.success) {
        setMultimodalResult(response.data);
        console.log('✅ analyzeAndFuse successful');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Analyze and fuse failed');
      }
    } catch (err) {
      console.error('❌ analyzeAndFuse error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analyze and fuse';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<ImageUploadResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ImageUploadResponse>(
        '/multimodal/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Image upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during image upload';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateComprehensiveAnalysis = async (
    enhancedPrompt: string,
    category?: string
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Starting comprehensive analysis:', { enhancedPrompt, category });
      
      const formData = new FormData();
      formData.append('enhanced_prompt', enhancedPrompt);
      if (category) formData.append('category', category);

      console.log('📤 Sending request to /multimodal/comprehensive-analysis');
      
      const response = await apiClient.post(
        '/multimodal/comprehensive-analysis',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('📥 Received comprehensive analysis response:', response.data);

      if (response.data.success) {
        setComprehensiveAnalysis(response.data);
        console.log('✅ Comprehensive analysis successful');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Comprehensive analysis failed');
      }
    } catch (err) {
      console.error('❌ Comprehensive analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during comprehensive analysis';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setImageAnalysis(null);
    setMultimodalResult(null);
    setComprehensiveAnalysis(null);
  };

  return {
    loading,
    error,
    imageAnalysis,
    multimodalResult,
    comprehensiveAnalysis,
    analyzeImage,
    fuseTextAndImage,
    analyzeAndFuse,
    uploadImage,
    generateComprehensiveAnalysis,
    reset
  };
}; 