export interface SupplierInfo {
  name: string;
  contact: string;
  location: string;
  price_per_unit: number;
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
} 