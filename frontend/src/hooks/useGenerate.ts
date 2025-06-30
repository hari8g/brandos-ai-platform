import { useState } from 'react'
import apiClient from '../services/apiClient'
import { GenerateRequest, GenerateResponse } from '../types/formulation'

export function useGenerate() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  async function generate(prompt: string, category?: string, targetCost?: number) {
    setLoading(true)
    setError(null)
    
    try {
      const request: GenerateRequest = { prompt, category, target_cost: targetCost }
      const res = await apiClient.post<GenerateResponse>('/formulation/generate', request)
      setData(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate formulation')
      console.error('Generate error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  return { generate, data, loading, error }
}
