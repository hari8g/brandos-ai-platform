import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

interface MarketData {
  location: string;
  category: string;
  market_size: string;
  population: string;
  internet_users: string;
  confidence_level: string;
  search_terms: string[];
  data_sources: string[];
  search_volume: Record<string, number>;
  methodology: string;
  assumptions: string[];
  analysis_summary: string;
}

interface LocalMarketRequest {
  location: string;
  category: string;
  product_name?: string;
  ingredients?: string[];
}

interface LocalMarketResponse {
  success: boolean;
  data?: MarketData;
  error?: string;
}

export const useLocalMarket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const analyzeLocalMarket = useCallback(async (request: LocalMarketRequest): Promise<LocalMarketResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/local-market/analyze', request);
      
      if (response.data.success) {
        setMarketData(response.data.data);
        return { success: true, data: response.data.data };
      } else {
        setError(response.data.error || 'Failed to analyze local market');
        return { success: false, error: response.data.error };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze local market';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableCities = useCallback(async () => {
    try {
      const response = await apiClient.get('/local-market/cities');
      setAvailableCities(response.data.cities || []);
    } catch (err: any) {
      console.error('Failed to fetch available cities:', err);
      setAvailableCities([]);
    }
  }, []);

  const getAvailableCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/local-market/categories');
      setAvailableCategories(response.data.categories || []);
    } catch (err: any) {
      console.error('Failed to fetch available categories:', err);
      setAvailableCategories([]);
    }
  }, []);

  const reset = useCallback(() => {
    setMarketData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    marketData,
    availableCities,
    availableCategories,
    analyzeLocalMarket,
    getAvailableCities,
    getAvailableCategories,
    reset
  };
}; 