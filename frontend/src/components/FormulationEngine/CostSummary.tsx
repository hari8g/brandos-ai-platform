import React from 'react';

interface BatchPricing {
  batch_size: string;
  unit_cost: number;
  total_cost: number;
  retail_price: number;
  wholesale_price: number;
  profit_margin: number;
  currency: string;
}

interface CostEstimate {
  raw_materials: number;
  labor_cost: number;
  packaging_cost: number;
  overhead_cost: number;
  quality_control_cost?: number;
  total_production_cost: number;
  margin: number;
  total: number;
  breakdown?: {
    ingredients: number;
    labor: number;
    packaging: number;
    overhead: number;
    quality_control?: number;
  };
  currency: string;
  batch_pricing?: BatchPricing[];
  premium_factors?: string[];
  cost_optimization_suggestions?: string[];
}

interface CostSummaryProps {
  cost: CostEstimate;
}

export default function CostSummary({ cost }: CostSummaryProps) {
  if (!cost) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: cost.currency || 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Premium Cost Analysis</h3>
      
      {/* Cost Breakdown */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-700">Cost Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Premium Active Ingredients:</span>
            <span className="font-medium">{formatCurrency(cost.raw_materials)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Skilled Labor & Clean Room Operations:</span>
            <span className="font-medium">{formatCurrency(cost.labor_cost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Luxury Packaging & Design:</span>
            <span className="font-medium">{formatCurrency(cost.packaging_cost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Facility & Utilities:</span>
            <span className="font-medium">{formatCurrency(cost.overhead_cost)}</span>
          </div>
          {cost.quality_control_cost && (
            <div className="flex justify-between">
              <span className="text-gray-600">Quality Control & Testing:</span>
              <span className="font-medium">{formatCurrency(cost.quality_control_cost)}</span>
            </div>
          )}
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span className="text-gray-800">Total Production Cost:</span>
            <span className="text-blue-600">{formatCurrency(cost.total_production_cost)}</span>
          </div>
        </div>
      </div>

      {/* Premium Factors */}
      {cost.premium_factors && cost.premium_factors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">Premium Factors</h4>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <ul className="space-y-2">
              {cost.premium_factors.map((factor, index) => (
                <li key={index} className="flex items-start space-x-2 text-purple-700 text-sm">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Batch Pricing */}
      {cost.batch_pricing && cost.batch_pricing.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">Premium Batch Pricing</h4>
          <div className="space-y-4">
            {cost.batch_pricing.map((batch, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <h5 className="font-medium text-blue-800 capitalize mb-2">
                  {batch.batch_size} Batch - Premium Production
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Unit Cost:</span>
                    <span className="ml-2 font-medium text-blue-900">{formatCurrency(batch.unit_cost)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Cost:</span>
                    <span className="ml-2 font-medium text-blue-900">{formatCurrency(batch.total_cost)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Wholesale Price:</span>
                    <span className="ml-2 font-medium text-green-600">{formatCurrency(batch.wholesale_price)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Retail Price:</span>
                    <span className="ml-2 font-medium text-blue-600">{formatCurrency(batch.retail_price)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-700">Profit Margin:</span>
                    <span className="ml-2 font-medium text-green-600">{batch.profit_margin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Optimization Suggestions */}
      {cost.cost_optimization_suggestions && cost.cost_optimization_suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">Cost Optimization Suggestions</h4>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <ul className="space-y-2">
              {cost.cost_optimization_suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2 text-green-700 text-sm">
                  <span className="text-green-500 mt-1">💡</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-blue-800">Recommended Premium Retail Price:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(cost.total)}
          </span>
        </div>
        <div className="mt-2 text-sm text-blue-700">
          Premium Profit Margin: {cost.margin.toFixed(1)}%
        </div>
        <div className="mt-1 text-xs text-blue-600">
          Positioned for luxury market segment
        </div>
      </div>
    </div>
  );
}
