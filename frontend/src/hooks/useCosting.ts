import { useState } from 'react'
import apiClient from '../services/apiClient'
export function useCosting() {
  const [loading, setLoading] = useState(false)
  const [cost, setCost]       = useState(null)
  async function fetchCost(formulation: any) {
    setLoading(true)
    const res = await apiClient.post('/formulation/cost', formulation)
    setCost(res.data)
    setLoading(false)
  }
  return { fetchCost, cost, loading }
}
