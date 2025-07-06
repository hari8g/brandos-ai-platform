import { useState, useEffect } from 'react';

interface CachedDataHook<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  dependencies: any[] = []
): CachedDataHook<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      setData(result);
      // Cache the result in sessionStorage
      sessionStorage.setItem(key, JSON.stringify(result));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Cached data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    sessionStorage.removeItem(key);
    setData(null);
    setError(null);
  };

  useEffect(() => {
    // Check if we have cached data
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        setData(parsedData);
        return; // Don't fetch if we have cached data
      } catch (err) {
        console.warn('Failed to parse cached data:', err);
        sessionStorage.removeItem(key); // Remove invalid cache
      }
    }
    
    // Fetch data if no cache or invalid cache
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    clearCache
  };
} 