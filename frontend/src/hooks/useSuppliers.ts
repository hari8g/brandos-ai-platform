import { useState } from 'react'
import apiClient from '../services/apiClient'
export function useSuppliers() {
  const [loading, setLoading]    = useState(false)
  const [suppliers, setSuppliers]= useState(null)
  async function fetchSuppliers(formulation: any) {
    setLoading(true)
    const res = await apiClient.post('/formulation/suppliers', formulation)
    setSuppliers(res.data)
    setLoading(false)
  }
  return { fetchSuppliers, suppliers, loading }
}
