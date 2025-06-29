import { useState } from 'react'
import apiClient from '../services/apiClient'
export function useAssessQuery() {
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  async function assess(prompt: string) {
    setLoading(true)
    const res = await apiClient.post('/query/assess', { prompt })
    setResult(res.data)
    setLoading(false)
  }
  return { assess, result, loading }
}
