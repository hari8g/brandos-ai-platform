import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

export interface KeyComponent {
  name: string;
  why: string;
}

export interface DemographicInfo {
  age_range: string;
  income_level: string;
  lifestyle: string;
  purchase_behavior: string;
}

export interface PsychographicInfo {
  values: string[];
  preferences: string[];
  motivations: string[];
}

export interface ScientificReasoningData {
  keyComponents: KeyComponent[];
  impliedDesire: string;
  psychologicalDrivers: string[];
  valueProposition: string[];
  targetAudience: string;
  indiaTrends: string[];
  regulatoryStandards: string[];
  demographicBreakdown?: DemographicInfo;
  psychographicProfile?: PsychographicInfo;
}

export interface ScientificReasoningRequest {
  category?: string;
  product_description?: string;
  target_concerns?: string[];
}

export const useScientificReasoning = (request?: ScientificReasoningRequest | null) => {
  const [data, setData] = useState<ScientificReasoningData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScientificReasoning = async () => {
    if (!request) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<ScientificReasoningData>(
        '/scientific-reasoning/',
        request
      );

      setData(response.data);
    } catch (err) {
      console.error('Error fetching scientific reasoning:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scientific reasoning data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (request && (request.category || request.product_description)) {
      fetchScientificReasoning();
    }
  }, [request?.category, request?.product_description]);

  return {
    data,
    loading,
    error,
    refetch: fetchScientificReasoning
  };
}; 