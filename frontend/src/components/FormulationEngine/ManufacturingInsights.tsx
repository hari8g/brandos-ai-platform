import React, { useState } from 'react';
import { getCategoryColors } from '@/lib/colorUtils';

interface ManufacturingScenario {
  customer_scale: string;
  batch_size: number;
  total_customers: number;
  manufacturing_cost: number;
  ingredient_cost: number;
  packaging_cost: number;
  overhead_cost: number;
  total_cost: number;
  cost_per_unit: number;
  retail_price: number;
  wholesale_price: number;
  profit_margin: number;
  revenue_potential: number;
  break_even_customers: number;
  currency: string;
}

interface ManufacturingInsightsProps {
  small_scale: ManufacturingScenario;
  medium_scale: ManufacturingScenario;
  large_scale: ManufacturingScenario;
  scaling_benefits: string[];
  risk_factors: string[];
  market_opportunity: string;
  selectedCategory?: string | null;
}

const ManufacturingInsights: React.FC<ManufacturingInsightsProps> = ({
  small_scale,
  medium_scale,
  large_scale,
  scaling_benefits,
  risk_factors,
  market_opportunity,
  selectedCategory,
}) => {
  const colors = getCategoryColors(selectedCategory || null);
  const [selectedScale, setSelectedScale] = useState<'small' | 'medium' | 'large'>('small');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getScenarioData = () => {
    switch (selectedScale) {
      case 'small': return small_scale;
      case 'medium': return medium_scale;
      case 'large': return large_scale;
      default: return small_scale;
    }
  };

  const scenario = getScenarioData();

  const getScaleLabel = (scale: string) => {
    switch (scale) {
      case 'small': return '1,000 Customers';
      case 'medium': return '10,000 Customers';
      case 'large': return '50,000+ Customers';
      default: return scale;
    }
  };

  const getScaleDescription = (scale: string) => {
    switch (scale) {
      case 'small': return 'Small batch manufacturing for initial market entry';
      case 'medium': return 'Medium scale with economies of scale benefits';
      case 'large': return 'Large scale with maximum efficiency and profitability';
      default: return '';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0`}>
            🏭
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-xl sm:text-2xl font-bold ${colors.text} tracking-tight break-words`}>
              Manufacturing Insights
            </h3>
            <p className={`text-sm ${colors.text} opacity-70 mt-1 font-medium break-words`}>
              Cost and pricing analysis for different customer scales
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className={`w-3 h-3 rounded-full ${colors.icon} animate-pulse`}></div>
          <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase whitespace-nowrap`}>
            Scalable Manufacturing
          </span>
        </div>
      </div>

      {/* Enhanced Scale Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { key: 'small', label: '1K', description: '1,000 Customers' },
          { key: 'medium', label: '10K', description: '10,000 Customers' },
          { key: 'large', label: '50K+', description: '50,000+ Customers' }
        ].map((scale) => (
          <button
            key={scale.key}
            onClick={() => setSelectedScale(scale.key as 'small' | 'medium' | 'large')}
            className={`
              p-4 sm:p-6 rounded-xl border transition-all duration-300 transform hover:scale-105
              ${selectedScale === scale.key 
                ? `${colors.bg} text-white shadow-lg` 
                : `${colors.cardBg} border ${colors.border} hover:${colors.lightBg}`
              }
            `}
          >
            <div className="text-center">
              <div className={`text-lg sm:text-xl font-bold ${selectedScale === scale.key ? 'text-white' : colors.text} tracking-tight break-words`}>
                {scale.label}
              </div>
              <div className={`text-xs font-semibold ${selectedScale === scale.key ? 'text-white opacity-80' : `${colors.text} opacity-70`} mt-1 tracking-wide uppercase break-words`}>
                {scale.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Enhanced Selected Scenario Details */}
      <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-4 sm:p-8 shadow-lg w-full overflow-hidden`}>
        <div className="mb-6 sm:mb-8">
          <h4 className={`text-lg sm:text-xl font-bold ${colors.text} tracking-tight mb-2 break-words`}>
            {getScaleLabel(selectedScale)}
          </h4>
          <p className={`text-sm ${colors.text} opacity-70 font-medium break-words`}>
            {getScaleDescription(selectedScale)}
          </p>
        </div>

        {/* Enhanced Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className={`bg-white/80 border ${colors.border} rounded-xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 min-w-0`}>
            <div className="text-xl sm:text-2xl mb-2">📦</div>
            <div className={`font-bold ${colors.text} text-lg sm:text-xl tracking-tight break-words`}>
              {formatNumber(scenario.batch_size)}
            </div>
            <div className={`text-xs ${colors.text} opacity-70 font-semibold tracking-wide uppercase mt-1 break-words`}>Batch Size</div>
          </div>
          
          <div className={`bg-white/80 border ${colors.border} rounded-xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 min-w-0`}>
            <div className="text-xl sm:text-2xl mb-2">💰</div>
            <div className={`font-bold ${colors.text} text-lg sm:text-xl tracking-tight break-words`}>
              {formatCurrency(scenario.total_cost)}
            </div>
            <div className={`text-xs ${colors.text} opacity-70 font-semibold tracking-wide uppercase mt-1 break-words`}>Total Cost</div>
          </div>
          
          <div className={`bg-white/80 border ${colors.border} rounded-xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 min-w-0`}>
            <div className="text-xl sm:text-2xl mb-2">🏪</div>
            <div className={`font-bold ${colors.text} text-lg sm:text-xl tracking-tight break-words`}>
              {formatCurrency(scenario.retail_price)}
            </div>
            <div className={`text-xs ${colors.text} opacity-70 font-semibold tracking-wide uppercase mt-1 break-words`}>Retail Price</div>
          </div>
          
          <div className={`bg-white/80 border ${colors.border} rounded-xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 min-w-0`}>
            <div className="text-xl sm:text-2xl mb-2">📈</div>
            <div className={`font-bold ${colors.text} text-lg sm:text-xl tracking-tight break-words`}>
              {formatCurrency(scenario.revenue_potential)}
            </div>
            <div className={`text-xs ${colors.text} opacity-70 font-semibold tracking-wide uppercase mt-1 break-words`}>Revenue Potential</div>
          </div>
        </div>

        {/* Enhanced Cost Breakdown */}
        <div className="mb-6 sm:mb-8">
          <h5 className={`font-bold ${colors.text} text-lg tracking-tight mb-4 break-words`}>Cost Breakdown</h5>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg min-w-0">
              <span className={`text-sm font-semibold ${colors.text} break-words mr-2`}>Ingredients</span>
              <span className={`font-bold ${colors.text} text-lg flex-shrink-0`}>
                {formatCurrency(scenario.ingredient_cost)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg min-w-0">
              <span className={`text-sm font-semibold ${colors.text} break-words mr-2`}>Manufacturing</span>
              <span className={`font-bold ${colors.text} text-lg flex-shrink-0`}>
                {formatCurrency(scenario.manufacturing_cost)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg min-w-0">
              <span className={`text-sm font-semibold ${colors.text} break-words mr-2`}>Packaging</span>
              <span className={`font-bold ${colors.text} text-lg flex-shrink-0`}>
                {formatCurrency(scenario.packaging_cost)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg min-w-0">
              <span className={`text-sm font-semibold ${colors.text} break-words mr-2`}>Overhead</span>
              <span className={`font-bold ${colors.text} text-lg flex-shrink-0`}>
                {formatCurrency(scenario.overhead_cost)}
              </span>
            </div>
            <div className={`border-t-2 ${colors.border} pt-4`}>
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg min-w-0">
                <span className={`font-bold ${colors.text} text-lg break-words mr-2`}>Total Cost</span>
                <span className={`font-bold text-xl ${colors.text} flex-shrink-0`}>
                  {formatCurrency(scenario.total_cost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Profitability Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className={`bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 min-w-0`}>
            <div className="text-green-600 font-bold text-sm mb-2 tracking-wide uppercase break-words">Profit Margin</div>
            <div className="text-green-700 font-bold text-xl sm:text-2xl tracking-tight break-words">
              {scenario.profit_margin.toFixed(1)}%
            </div>
          </div>
          
          <div className={`bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 min-w-0`}>
            <div className="text-blue-600 font-bold text-sm mb-2 tracking-wide uppercase break-words">Break-even Customers</div>
            <div className="text-blue-700 font-bold text-xl sm:text-2xl tracking-tight break-words">
              {formatNumber(scenario.break_even_customers)}
            </div>
          </div>
          
          <div className={`bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 min-w-0`}>
            <div className="text-purple-600 font-bold text-sm mb-2 tracking-wide uppercase break-words">Cost per Unit</div>
            <div className="text-purple-700 font-bold text-xl sm:text-2xl tracking-tight break-words">
              {formatCurrency(scenario.cost_per_unit)}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scaling Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Enhanced Scaling Benefits */}
        <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-4 sm:p-8 shadow-lg w-full overflow-hidden`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${colors.bg} flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0`}>
              📈
            </div>
            <div className="min-w-0 flex-1">
              <h4 className={`text-lg sm:text-xl font-bold ${colors.text} tracking-tight break-words`}>
                Scaling Benefits
              </h4>
              <p className={`text-sm ${colors.text} opacity-70 mt-1 break-words`}>
                Advantages of scaling your manufacturing
              </p>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {scaling_benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${colors.icon} mt-2 sm:mt-2.5 flex-shrink-0`}></div>
                <span className={`text-sm sm:text-base ${colors.text} leading-relaxed font-medium break-words`}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Risk Factors */}
        <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-4 sm:p-8 shadow-lg w-full overflow-hidden`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0`}>
              ⚠️
            </div>
            <div className="min-w-0 flex-1">
              <h4 className={`text-lg sm:text-xl font-bold ${colors.text} tracking-tight break-words`}>
                Risk Factors
              </h4>
              <p className={`text-sm ${colors.text} opacity-70 mt-1 break-words`}>
                Considerations for scaling decisions
              </p>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {risk_factors.map((risk, index) => (
              <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400 mt-2 sm:mt-2.5 flex-shrink-0"></div>
                <span className={`text-sm sm:text-base ${colors.text} leading-relaxed font-medium break-words`}>
                  {risk}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Market Opportunity */}
      <div className={`${colors.lightBg} border ${colors.border} rounded-2xl p-4 sm:p-8 shadow-lg w-full overflow-hidden`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${colors.bg} flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0`}>
            🎯
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={`text-lg sm:text-xl font-bold ${colors.text} tracking-tight break-words`}>
              Market Opportunity
            </h4>
            <p className={`text-sm ${colors.text} opacity-70 mt-1 break-words`}>
              Strategic insights for your business
            </p>
          </div>
        </div>
        <p className={`${colors.text} text-sm sm:text-base leading-relaxed font-medium break-words`}>
          {market_opportunity}
        </p>
      </div>
    </div>
  );
};

export default ManufacturingInsights; 