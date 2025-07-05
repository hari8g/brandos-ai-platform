import React from 'react';
import { getCategoryColors } from '@/lib/colorUtils';

interface BatchPricing {
  batch_size: string;
  units: number;
  unit_cost: number;
  total_cost: number;
  retail_price_30ml: number;
  retail_price_50ml: number;
  retail_price_100ml: number;
  wholesale_price: number;
  profit_margin: number;
  currency: string;
}

interface SimpleCostEstimate {
  batch_pricing: BatchPricing[];
  total_ingredient_cost: number;
  manufacturing_cost: number;
  packaging_cost: number;
  overhead_cost: number;
  currency: string;
  pricing_strategy: string;
  market_positioning: string;
}

interface CostSummaryProps {
  costEstimate: SimpleCostEstimate | null;
  loading: boolean;
  selectedCategory?: string | null;
}

const CostSummary: React.FC<CostSummaryProps> = ({
  costEstimate,
  loading,
  selectedCategory,
}) => {
  const colors = getCategoryColors(selectedCategory || null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBatchSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Small Batch';
      case 'medium': return 'Medium Batch';
      case 'large': return 'Large Batch';
      default: return size;
    }
  };

  const getBatchSizeDescription = (size: string) => {
    switch (size) {
      case 'small': return '250 units - Perfect for testing & small businesses';
      case 'medium': return '2,500 units - Ideal for growing businesses';
      case 'large': return '20,000 units - Best for established brands';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className={`ml-3 ${colors.text}`}>Calculating costs...</span>
        </div>
      </div>
    );
  }

  if (!costEstimate) {
    return (
      <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
        <div className="text-center">
          <p className={`${colors.text} text-lg font-semibold`}>Cost Analysis</p>
          <p className="text-gray-600 mt-2">Generate a formulation to see detailed cost breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${colors.text}`}>Cost Analysis & Pricing</h3>
            <p className={`${colors.text} opacity-80 text-sm mt-1`}>{costEstimate.pricing_strategy}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${colors.text}`}>
              {formatCurrency(costEstimate.total_ingredient_cost)}
            </div>
            <div className={`text-sm ${colors.text} opacity-80`}>Base Cost per 100ml</div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3 text-center`}>
            <div className="text-lg mb-1">🌿</div>
            <div className={`font-semibold ${colors.text} text-sm`}>
              {formatCurrency(costEstimate.total_ingredient_cost)}
            </div>
            <div className={`${colors.text} text-xs opacity-80`}>Ingredients</div>
          </div>
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3 text-center`}>
            <div className="text-lg mb-1">⚙️</div>
            <div className={`font-semibold ${colors.text} text-sm`}>
              {formatCurrency(costEstimate.manufacturing_cost)}
            </div>
            <div className={`${colors.text} text-xs opacity-80`}>Manufacturing</div>
          </div>
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3 text-center`}>
            <div className="text-lg mb-1">📦</div>
            <div className={`font-semibold ${colors.text} text-sm`}>
              {formatCurrency(costEstimate.packaging_cost)}
            </div>
            <div className={`${colors.text} text-xs opacity-80`}>Packaging</div>
          </div>
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3 text-center`}>
            <div className="text-lg mb-1">🏢</div>
            <div className={`font-semibold ${colors.text} text-sm`}>
              {formatCurrency(costEstimate.overhead_cost)}
            </div>
            <div className={`${colors.text} text-xs opacity-80`}>Overhead</div>
          </div>
        </div>
      </div>

      {/* Batch Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {costEstimate.batch_pricing.map((batch, index) => (
          <div key={index} className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
            {/* Batch Header */}
            <div className="text-center mb-4">
              <div className={`text-lg font-bold ${colors.text} mb-1`}>
                {getBatchSizeLabel(batch.batch_size)}
              </div>
              <div className={`text-sm ${colors.text} opacity-80`}>
                {getBatchSizeDescription(batch.batch_size)}
              </div>
              <div className={`text-xs ${colors.text} opacity-60 mt-1`}>
                {batch.units.toLocaleString()} units
              </div>
            </div>

            {/* Pricing Table */}
            <div className="space-y-3">
              <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-semibold ${colors.text}`}>Unit Cost</span>
                  <span className={`text-sm ${colors.text}`}>
                    {formatCurrency(batch.unit_cost)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-semibold ${colors.text}`}>Total Cost</span>
                  <span className={`text-sm ${colors.text}`}>
                    {formatCurrency(batch.total_cost)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-semibold ${colors.text}`}>Profit Margin</span>
                  <span className={`text-sm ${colors.text}`}>
                    {batch.profit_margin.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Retail Pricing */}
              <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
                <div className={`text-sm font-semibold ${colors.text} mb-2`}>Retail Pricing</div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">30ml</span>
                    <span className={`text-xs font-semibold ${colors.text}`}>
                      {formatCurrency(batch.retail_price_30ml)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">50ml</span>
                    <span className={`text-xs font-semibold ${colors.text}`}>
                      {formatCurrency(batch.retail_price_50ml)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">100ml</span>
                    <span className={`text-xs font-semibold ${colors.text}`}>
                      {formatCurrency(batch.retail_price_100ml)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wholesale */}
              <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-semibold ${colors.text}`}>Wholesale Price</span>
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {formatCurrency(batch.wholesale_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Positioning */}
      <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-6`}>
        <h4 className={`text-lg font-semibold ${colors.text} mb-3`}>Market Positioning</h4>
        <p className={`${colors.text} text-sm leading-relaxed`}>
          {costEstimate.market_positioning}
        </p>
      </div>
    </div>
  );
};

export default CostSummary;
