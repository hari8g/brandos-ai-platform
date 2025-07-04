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

interface ScaleInfo {
  scale: string;
  equipment_cost: number;
  annual_batches: number;
  capex_per_batch: number;
}

interface CostEstimate {
  raw_materials: number;
  labor_cost: number;
  packaging_cost: number;
  overhead_cost: number;
  quality_control_cost?: number;
  capex_amortization?: number;
  total_production_cost: number;
  margin: number;
  total: number;
  breakdown?: {
    ingredients: number;
    labor: number;
    packaging: number;
    overhead: number;
    quality_control?: number;
    capex?: number;
  };
  currency: string;
  batch_pricing?: BatchPricing[];
  premium_factors?: string[];
  cost_optimization_suggestions?: string[];
  scale_info?: ScaleInfo;
  pricing_strategy?: string;
  market_positioning?: string;
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyWithDecimals = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: cost.currency || 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getScaleColor = (scale: string) => {
    switch (scale) {
      case 'small': return 'orange';
      case 'medium': return 'blue';
      case 'large': return 'purple';
      default: return 'gray';
    }
  };

  const getScaleIcon = (scale: string) => {
    switch (scale) {
      case 'small': return '🏠';
      case 'medium': return '🏢';
      case 'large': return '🏭';
      default: return '📊';
    }
  };

  const getScaleLabel = (scale: string) => {
    switch (scale) {
      case 'small': return 'Small Scale (Artisanal)';
      case 'medium': return 'Medium Scale (Growing Business)';
      case 'large': return 'Large Scale (Established Business)';
      default: return 'Custom Scale';
    }
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">💰</div>
            <div className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Retail Price
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-900">{formatCurrency(cost.total)}</div>
          <div className="text-sm text-blue-700">50ml bottle</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">📈</div>
            <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Profit Margin
            </div>
          </div>
          <div className="text-2xl font-bold text-green-700">{cost.margin.toFixed(1)}%</div>
          <div className="text-sm text-green-600">Gross margin</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">🏭</div>
            <div className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              Production Cost
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{formatCurrency(cost.total_production_cost)}</div>
          <div className="text-sm text-purple-600">Total COGS</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">{getScaleIcon(cost.scale_info?.scale || 'medium')}</div>
            <div className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Scale
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-700 capitalize">{cost.scale_info?.scale || 'medium'}</div>
          <div className="text-sm text-orange-600">Production scale</div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">📊</span>
          Detailed Cost Breakdown
        </h3>
        
        <div className="space-y-3">
          {[
            { key: 'raw_materials', label: 'Raw Materials', icon: '🌿', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
            { key: 'capex_amortization', label: 'Equipment', icon: '⚙️', color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
            { key: 'labor_cost', label: 'Labor', icon: '👷', color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
            { key: 'packaging_cost', label: 'Packaging', icon: '📦', color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
            { key: 'overhead_cost', label: 'Overhead', icon: '🏢', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
            { key: 'quality_control_cost', label: 'Quality Control', icon: '🔬', color: 'teal', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' }
          ].map(({ key, label, icon, color, bgColor, borderColor }) => {
            const value = cost[key as keyof CostEstimate] as number;
            if (!value || value <= 0) return null;
            
            const percentage = (value / cost.total_production_cost) * 100;
            
            return (
              <div key={key} className={`flex items-center justify-between p-4 ${bgColor} border ${borderColor} rounded-lg hover:shadow-sm transition-shadow`}>
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{icon}</div>
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500">{percentage.toFixed(1)}% of total cost</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(value)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Pricing Comparison */}
      {cost.batch_pricing && cost.batch_pricing.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Production Scale Comparison</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cost.batch_pricing.map((batch, index) => {
              const isBestMargin = batch.profit_margin === Math.max(...cost.batch_pricing!.map(b => b.profit_margin));
              const isLowestUnitCost = batch.unit_cost === Math.min(...cost.batch_pricing!.map(b => b.unit_cost));
              
              return (
                <div key={index} className={`border rounded-xl p-6 transition-all duration-200 ${
                  isBestMargin 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900 capitalize">{batch.batch_size}</h4>
                      {isBestMargin && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Best Margin
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      {batch.batch_size === 'small' && '250 units • Artisanal'}
                      {batch.batch_size === 'medium' && '2,500 units • Growing Business'}
                      {batch.batch_size === 'large' && '20,000 units • Established Business'}
                      {batch.batch_size.startsWith('custom_') && `${batch.batch_size.replace('custom_', '')} units • Custom Scale`}
                    </div>
                    
                    <div className={`text-3xl font-bold mb-1 ${
                      isBestMargin ? 'text-green-600' : 'text-gray-700'
                    }`}>
                      {batch.profit_margin.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Profit Margin</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unit Cost:</span>
                      <span className="font-medium">{formatCurrencyWithDecimals(batch.unit_cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium">{formatCurrency(batch.total_cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Wholesale:</span>
                      <span className="font-medium text-green-600">{formatCurrency(batch.wholesale_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Retail:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(batch.retail_price)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strategic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Differentiators */}
        {cost.premium_factors && cost.premium_factors.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <span className="mr-2">⭐</span>
              Key Differentiators
            </h3>
            <div className="space-y-3">
              {cost.premium_factors.map((factor, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white/70 rounded-lg border border-blue-200">
                  <span className="text-blue-500 text-lg">•</span>
                  <span className="text-blue-800 text-sm leading-relaxed">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimization Suggestions */}
        {cost.cost_optimization_suggestions && cost.cost_optimization_suggestions.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Optimization Suggestions
            </h3>
            <div className="space-y-3">
              {cost.cost_optimization_suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white/70 rounded-lg border border-green-200">
                  <span className="text-green-500 text-lg">💡</span>
                  <span className="text-green-800 text-sm leading-relaxed">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Final Summary */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-xl p-8 shadow-sm">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl mr-3">🎯</span>
            <h3 className="text-2xl font-bold text-indigo-900">Recommended Pricing Strategy</h3>
          </div>
          <p className="text-indigo-700 mb-6 text-lg">{cost.market_positioning || 'Optimized for your target market'}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-indigo-200">
              <div className="text-3xl font-bold text-indigo-600 mb-1">{formatCurrency(cost.total)}</div>
              <div className="text-sm text-indigo-700 font-medium">Retail Price (50ml)</div>
            </div>
            <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-1">{cost.margin.toFixed(1)}%</div>
              <div className="text-sm text-green-700 font-medium">Profit Margin</div>
            </div>
            <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-1">{formatCurrency(cost.total_production_cost)}</div>
              <div className="text-sm text-purple-700 font-medium">Production Cost</div>
            </div>
          </div>
          
          <div className="inline-flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-full border border-indigo-200">
            <span className="text-lg">💰</span>
            <span className="text-indigo-700 font-medium">
              Ready to scale from {cost.scale_info?.scale || 'medium'} scale operations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
