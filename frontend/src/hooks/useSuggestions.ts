import { useState } from 'react';
import apiClient from '../services/apiClient';

interface Suggestion {
  prompt: string;
  why: string;
  how: string;
  score?: number;
  manufacturing_ease?: string;
  indian_market_trends?: string;
  efficacy_performance?: string;
  shelf_life?: string;
}

interface SuggestionRequest {
  prompt: string;
  category?: string;
}

interface SuggestionResponse {
  suggestions: Suggestion[];
  success: boolean;
  message: string;
  error?: string;
}

export const useSuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const generateSuggestions = async (request: SuggestionRequest): Promise<Suggestion[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<SuggestionResponse>('/query/suggestions', request);
      
      if (response.data.success && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
        return response.data.suggestions;
      } else {
        throw new Error(response.data.error || 'Failed to generate suggestions');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate suggestions';
      setError(errorMessage);
      console.error('Suggestions error:', err);
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
    generateSuggestions,
    clearSuggestions
  };
}; 