import { useState } from 'react';
import apiClient from '../services/apiClient';

interface MultimodalSuggestion {
  prompt: string;
  why: string;
  how: string;
}

interface MultimodalSuggestionRequest {
  enhanced_prompt: string;
  image_analysis: any;
  category?: string;
}

interface MultimodalSuggestionResponse {
  suggestions: MultimodalSuggestion[];
  success: boolean;
  message: string;
  error?: string;
}

export const useMultimodalSuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MultimodalSuggestion[]>([]);

  const generateMultimodalSuggestions = async (request: MultimodalSuggestionRequest): Promise<MultimodalSuggestion[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<MultimodalSuggestionResponse>('/multimodal/suggestions', request);
      
      if (response.data.success && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
        return response.data.suggestions;
      } else {
        throw new Error(response.data.error || 'Failed to generate multimodal suggestions');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate multimodal suggestions';
      setError(errorMessage);
      console.error('Multimodal suggestions error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setError(null);
  };

  return {
    loading,
    error,
    suggestions,
    generateMultimodalSuggestions,
    clearSuggestions
  };
}; 