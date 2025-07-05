import { useState } from 'react'
import apiClient from '../services/apiClient'

interface ManufacturingScenario {
  customer_scale: string;
  batch_size: number;
  total_customers: number;
  manufacturing_cost: number;
  ingredient_cost: number;
  packaging_cost: number;
  overhead_cost: number;
  total_cost: number;
  cost_per_unit: number;
  retail_price: number;
  wholesale_price: number;
  profit_margin: number;
  revenue_potential: number;
  break_even_customers: number;
  currency: string;
}

interface ManufacturingInsights {
  small_scale: ManufacturingScenario;
  medium_scale: ManufacturingScenario;
  large_scale: ManufacturingScenario;
  scaling_benefits: string[];
  risk_factors: string[];
  market_opportunity: string;
}

interface ManufacturingRequest {
  formulation: any;
  target_market?: string;
  region?: string;
}

interface ManufacturingResponse {
  success: boolean;
  message: string;
  manufacturing_insights?: ManufacturingInsights;
  error?: string;
}

export const useCosting = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [costEstimate, setCostEstimate] = useState<{ manufacturing_insights: ManufacturingInsights } | null>(null)

  const estimateCost = async (request: ManufacturingRequest): Promise<{ manufacturing_insights: ManufacturingInsights } | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.post<ManufacturingResponse>('/costing/estimate', request)
      
      if (response.data.success && response.data.manufacturing_insights) {
        const result = { manufacturing_insights: response.data.manufacturing_insights }
        setCostEstimate(result)
        return result
      } else {
        throw new Error(response.data.error || 'Failed to analyze manufacturing')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze manufacturing'
      setError(errorMessage)
      console.error('Manufacturing analysis error:', err)
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
