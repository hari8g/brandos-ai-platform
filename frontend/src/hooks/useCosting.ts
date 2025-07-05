import { useState } from 'react'
import apiClient from '../services/apiClient'

interface BatchPricing {
  batch_size: string;
  units: number;
  unit_cost: number;
  total_cost: number;
  retail_price_30ml: number;
  retail_price_50ml: number;
  retail_price_100ml: number;
  wholesale_price: number;
  profit_margin: number;
  currency: string;
}

interface SimpleCostEstimate {
  batch_pricing: BatchPricing[];
  total_ingredient_cost: number;
  manufacturing_cost: number;
  packaging_cost: number;
  overhead_cost: number;
  currency: string;
  pricing_strategy: string;
  market_positioning: string;
}

interface CostingRequest {
  formulation: any;
  batch_sizes: (string | number)[];
  target_market?: string;
  region?: string;
}

interface CostingResponse {
  success: boolean;
  message: string;
  cost_estimate?: SimpleCostEstimate;
  error?: string;
}

export const useCosting = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [costEstimate, setCostEstimate] = useState<SimpleCostEstimate | null>(null)

  const estimateCost = async (request: CostingRequest): Promise<SimpleCostEstimate | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.post<CostingResponse>('/costing/estimate', request)
      
      if (response.data.success && response.data.cost_estimate) {
        setCostEstimate(response.data.cost_estimate)
        return response.data.cost_estimate
      } else {
        throw new Error(response.data.error || 'Failed to estimate cost')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to estimate cost'
      setError(errorMessage)
      console.error('Costing error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const clearCostEstimate = () => {
    setCostEstimate(null)
    setError(null)
  }

  return {
    loading,
    error,
    costEstimate,
    estimateCost,
    clearCostEstimate
  }
}
