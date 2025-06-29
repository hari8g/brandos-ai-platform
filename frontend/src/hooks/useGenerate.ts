import { useState } from 'react'
import apiClient from '../services/apiClient'
export function useGenerate() {
  const [loading, setLoading] = useState(false)
  const [data, setData]       = useState(null)
  async function generate(prompt: string) {
    setLoading(true)
    const res = await apiClient.post('/formulation/generate', { prompt })
    setData(res.data)
    setLoading(false)
  }
  return { generate, data, loading }
}
