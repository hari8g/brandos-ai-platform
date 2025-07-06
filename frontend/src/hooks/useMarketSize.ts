import { useState } from 'react'
import apiClient from '../services/apiClient'

interface MarketSizeRequest {
  product_name: string;
  category: string;
  ingredients: Array<{
    name: string;
    percent: number;
  }>;
}

interface MarketSizeResponse {
  success: boolean;
  message: string;
  current_market_size?: string;
  growth_rate?: string;
  market_drivers?: string[];
  competitive_landscape?: string[];
  pricing_analysis?: {
    average_price_range: string;
    premium_segment_percentage: string;
    price_drivers: string[];
  };
  distribution_channels?: string[];
  methodology?: string;
  data_sources?: string[];
  confidence_level?: string;
  product_segment?: string;
  ingredient_premium_factor?: string;
  unique_selling_points?: string[];
  error?: string;
}

export const useMarketSize = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marketSizeData, setMarketSizeData] = useState<MarketSizeResponse | null>(null)

  const fetchCurrentMarketSize = async (request: MarketSizeRequest): Promise<MarketSizeResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Fetching current market size:', JSON.stringify(request, null, 2))
      const response = await apiClient.post<MarketSizeResponse>('/market-research/current-market-size', request)
      
      console.log('📥 Received market size response:', response.data)
      
      if (response.data.success) {
        setMarketSizeData(response.data)
        return response.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch current market size')
      }
    } catch (err: any) {
      console.error('❌ Market size fetch error details:', err.response?.data || err.message)
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch current market size'
      setError(errorMessage)
      console.error('Market size fetch error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const clearMarketSizeData = () => {
    setMarketSizeData(null)
    setError(null)
  }

  return {
    loading,
    error,
    marketSizeData,
    fetchCurrentMarketSize,
    clearMarketSizeData
  }
} 