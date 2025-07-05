export interface SupplierInfo {
  name: string;
  contact: string;
  location: string;
  price_per_unit: number;
  price_per_100ml?: number;
}

export interface IngredientDetail {
  name: string;
  percent: number;
  cost_per_100ml: number;
  why_chosen: string;
  suppliers: SupplierInfo[];
}

export interface GenerateRequest {
  prompt: string;
  category?: string;
  target_cost?: number;
}

export interface ScientificReasoning {
  keyComponents: { name: string; why: string }[];
  impliedDesire: string;
  psychologicalDrivers: string[];
  valueProposition: string[];
  targetAudience: string;
  indiaTrends: string[];
  regulatoryStandards: string[];
}

export interface MarketResearchData {
  tam: {
    marketSize: string;
    cagr: string;
    methodology: string;
    insights: string[];
    competitors: string[];
  };
  sam: {
    marketSize: string;
    segments: string[];
    methodology: string;
    insights: string[];
    distribution: string[];
  };
  tm: {
    marketSize: string;
    targetUsers: string;
    revenue: string;
    methodology: string;
    insights: string[];
    adoptionDrivers: string[];
  };
}

export interface GenerateResponse {
  product_name: string;
  reasoning: string;
  ingredients: IngredientDetail[];
  manufacturing_steps: string[];
  estimated_cost: number;
  safety_notes: string[];
  packaging_marketing_inspiration?: string;
  market_trends?: string[];
  competitive_landscape?: Record<string, any>;
  scientific_reasoning?: ScientificReasoning;
  market_research?: MarketResearchData;
} 