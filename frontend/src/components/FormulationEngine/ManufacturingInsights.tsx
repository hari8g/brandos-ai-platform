import React, { useState } from 'react';
import { getCategoryColors } from '@/lib/colorUtils';

interface CostingBreakdown {
  capex: number;
  opex: number;
  total_cost: number;
  cost_per_unit: number;
  retail_price: number;
  wholesale_price: number;
  profit_margin: number;
  revenue_potential: number;
  break_even_customers: number;
  currency: string;
}

interface ManufacturingScenario {
  customer_scale: string;
  batch_size: number;
  total_customers: number;
  costing_breakdown: CostingBreakdown;
  capex_details: Record<string, number>;
  opex_details: Record<string, number>;
  pricing_strategy: Record<string, string>;
  margin_analysis: Record<string, number>;
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

  // Component for displaying detailed breakdowns
  const BreakdownCard = ({ 
    title, 
    icon, 
    data, 
    colorClass, 
    details 
  }: { 
    title: string; 
    icon: string; 
    data: number; 
    colorClass: string;
    details?: Record<string, number>;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className={`relative group`}>
        {/* Main Card */}
        <div 
          className={`
            relative overflow-hidden rounded-xl border transition-all duration-300 ease-out
            ${colors.border} ${colors.cardBg}
            hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]
            ${isExpanded ? 'shadow-xl shadow-blue-500/20 ring-2 ring-blue-200' : ''}
            cursor-pointer
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Animated color blob on hover */}
          <div className={`
            absolute -inset-1 rounded-xl bg-gradient-to-r ${colors.gradient} opacity-60 blur-lg animate-glow z-0 
            group-hover:opacity-80 transition opacity-0 group-hover:opacity-60
          `}></div>
          
          {/* Gradient overlay on hover */}
          <div className={`
            absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/30 
            opacity-0 group-hover:opacity-100 transition-opacity duration-300
            ${isExpanded ? 'opacity-100' : ''}
          `}></div>
          
          {/* Content */}
          <div className="relative p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-sm md:text-base
                  ${colorClass} ${colors.border} border
                  group-hover:scale-110 transition-transform duration-200
                `}>
                  {icon}
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} text-sm md:text-base`}>{title}</h4>
                  <p className={`text-xs ${colors.text} opacity-70`}>Click to see details</p>
                </div>
              </div>
              
              {/* Expand/Collapse Icon */}
              <div className={`
                w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center
                ${colors.lightBg} ${colors.border} border
                transition-all duration-300 ease-out
                ${isExpanded ? 'rotate-180 bg-blue-50 border-blue-200' : 'group-hover:bg-blue-50 group-hover:border-blue-200'}
              `}>
                <svg 
                  className={`w-3 h-3 md:w-4 md:h-4 ${colors.text} transition-transform duration-300`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Value Display */}
            <div className={`${colors.text} text-lg md:text-xl font-bold mb-2 md:mb-3`}>
              {formatCurrency(data)}
            </div>
            
            {/* Quick Description */}
            <p className={`${colors.text} text-xs md:text-sm opacity-80 leading-relaxed`}>
              {title === 'CAPEX' ? 'Capital expenditure for equipment and facilities' :
               title === 'OPEX' ? 'Operational costs for production and materials' :
               title === 'Pricing' ? 'Revenue potential and pricing strategy' :
               'Profit margins and financial analysis'}
            </p>
          </div>
        </div>

        {/* Expanded Content Panel */}
        {isExpanded && details && (
          <div className={`
            mt-3 md:mt-4 rounded-xl border overflow-hidden
            ${colors.border} ${colors.lightBg}
            animate-in slide-in-from-top-3 duration-300 ease-out
            shadow-xl shadow-blue-500/10
          `}>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Section Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-6 h-6 rounded-lg ${colorClass} flex items-center justify-center text-xs`}>
                  {icon}
                </div>
                <h5 className={`font-semibold ${colors.text} text-sm md:text-base`}>{title} Breakdown</h5>
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(details).map(([key, value]) => (
                  <div key={key} className="bg-white/50 rounded-lg p-3 md:p-4 border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${colors.text} opacity-70 capitalize`}>
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-sm font-bold ${colors.text}`}>
                        {formatCurrency(value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
              Manufacturing Cost Analysis
            </h3>
            <p className={`text-sm ${colors.text} opacity-70 mt-1 font-medium break-words`}>
              CAPEX, OPEX, pricing, and margin analysis for different scales
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 flex-shrink-0">
          <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase whitespace-nowrap`}>
            AI-Powered Costing
          </span>
        </div>
      </div>

      {/* Enhanced Scale Selector - Single Column Layout */}
      <div className="space-y-3">
        {[
          { key: 'small', label: '1K', description: '1,000 Customers', icon: '🏠' },
          { key: 'medium', label: '10K', description: '10,000 Customers', icon: '🏢' },
          { key: 'large', label: '50K+', description: '50,000+ Customers', icon: '🏭' }
        ].map((scale) => (
          <div key={scale.key} className="relative group">
            <button
              onClick={() => setSelectedScale(scale.key as 'small' | 'medium' | 'large')}
              className={`
                relative w-full p-4 sm:p-6 rounded-xl border transition-all duration-300 transform hover:scale-[1.02]
                ${selectedScale === scale.key 
                  ? `${colors.bg} text-white shadow-lg` 
                  : `${colors.cardBg} border ${colors.border} hover:${colors.lightBg}`
                }
              `}
            >
            <div className="flex items-center space-x-4">
              <div className={`text-2xl sm:text-3xl ${selectedScale === scale.key ? 'text-white' : colors.text}`}>
                {scale.icon}
              </div>
              <div className="flex-1 text-left">
                <div className={`text-lg sm:text-xl font-bold ${selectedScale === scale.key ? 'text-white' : colors.text} tracking-tight break-words`}>
                  {scale.label}
                </div>
                <div className={`text-xs font-semibold ${selectedScale === scale.key ? 'text-white opacity-80' : `${colors.text} opacity-70`} mt-1 tracking-wide uppercase break-words`}>
                  {scale.description}
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedScale === scale.key ? 'bg-white/20' : colors.lightBg}`}>
                <svg 
                  className={`w-4 h-4 ${selectedScale === scale.key ? 'text-white' : colors.text}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
          </div>
        ))}
      </div>

      {/* Selected Scale Info */}
      <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-4 sm:p-8 shadow-lg w-full overflow-hidden`}>
        <div className="mb-6 sm:mb-8">
          <h4 className={`text-lg sm:text-xl font-bold ${colors.text} tracking-tight mb-2 break-words`}>
            {getScaleLabel(selectedScale)}
          </h4>
          <p className={`text-sm ${colors.text} opacity-70 font-medium break-words`}>
            {getScaleDescription(selectedScale)}
          </p>
        </div>

        {/* Four Main Costing Containers - Single Column Layout */}
        <div className="space-y-6 mb-8">
          {/* CAPEX Container */}
          <BreakdownCard
            title="CAPEX"
            icon="🏗️"
            data={scenario.costing_breakdown.capex}
            colorClass="bg-blue-100 text-blue-700"
            details={scenario.capex_details}
          />

          {/* OPEX Container */}
          <BreakdownCard
            title="OPEX"
            icon="⚙️"
            data={scenario.costing_breakdown.opex}
            colorClass="bg-green-100 text-green-700"
            details={scenario.opex_details}
          />

          {/* Pricing Container */}
          <BreakdownCard
            title="Pricing"
            icon="💰"
            data={scenario.costing_breakdown.revenue_potential}
            colorClass="bg-purple-100 text-purple-700"
            details={{
              "Retail Price": scenario.costing_breakdown.retail_price,
              "Wholesale Price": scenario.costing_breakdown.wholesale_price,
              "Cost per Unit": scenario.costing_breakdown.cost_per_unit,
              "Total Revenue": scenario.costing_breakdown.revenue_potential
            }}
          />

          {/* Margins Container */}
          <BreakdownCard
            title="Margins"
            icon="📈"
            data={scenario.costing_breakdown.profit_margin}
            colorClass="bg-orange-100 text-orange-700"
            details={{
              "Gross Margin": scenario.margin_analysis.gross_margin || scenario.costing_breakdown.profit_margin,
              "Operating Margin": scenario.margin_analysis.operating_margin || scenario.costing_breakdown.profit_margin * 0.8,
              "Net Margin": scenario.margin_analysis.net_margin || scenario.costing_breakdown.profit_margin * 0.7,
              "Break-even Customers": scenario.costing_breakdown.break_even_customers
            }}
          />
        </div>

        {/* Key Metrics Summary - Single Column Layout */}
        <div className="space-y-4 mb-8">
          <div className={`bg-white/80 border ${colors.border} rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center space-x-4">
              <div className="text-2xl sm:text-3xl">📦</div>
              <div className="flex-1">
                <div className={`font-bold ${colors.text} text-lg sm:text-xl tracking-tight break-words`}>
                  {formatNumber(scenario.batch_size)}
                </div>
                <div className={`text-xs ${colors.text} opacity-70 font-semibold tracking-wide uppercase mt-1 break-words`}>Batch Size</div>
              </div>
            </div>
          </div>
          
          <div className={`bg-white/80 border ${colors.border} rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center space-x-4">
              <div className="text-2xl sm:text-3xl">💰</div>
              <div className="flex-1">
                <div className={`font-bold ${colors.text} text-lg sm:text-xl tracking-tight break-words`}>
                  {formatCurrency(scenario.costing_breakdown.total_cost)}
                </div>
                <div className={`text-xs ${colors.text} opacity-70 font-semibold tracking-wide uppercase mt-1 break-words`}>Total Cost</div>
              </div>
            </div>
          </div>
          
          <div className={`bg-white/80 border ${colors.border} rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center space-x-4">
              <div className="text-2xl sm:text-3xl">🏪</div>
              <div className="flex-1">
                <div className={`font-bold ${colors.text} text-lg sm:text-xl tracking-tight break-words`}>
                  {formatCurrency(scenario.costing_breakdown.retail_price)}
                </div>
                <div className={`text-xs ${colors.text} opacity-70 font-semibold tracking-wide uppercase mt-1 break-words`}>Retail Price</div>
              </div>
            </div>
          </div>
          
          <div className={`bg-white/80 border ${colors.border} rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center space-x-4">
              <div className="text-2xl sm:text-3xl">📈</div>
              <div className="flex-1">
                <div className={`font-bold ${colors.text} text-lg sm:text-xl tracking-tight break-words`}>
                  {formatCurrency(scenario.costing_breakdown.revenue_potential)}
                </div>
                <div className={`text-xs ${colors.text} opacity-70 font-semibold tracking-wide uppercase mt-1 break-words`}>Revenue Potential</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Strategy Details */}
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className="flex items-center space-x-2 mb-3">
            <div className={`w-5 h-5 rounded-lg ${colors.bg} flex items-center justify-center text-xs`}>
              🎯
            </div>
            <h5 className={`font-semibold ${colors.text} text-sm`}>Pricing Strategy</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scenario.pricing_strategy).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-white/50 rounded">
                <span className={`font-medium ${colors.text} text-xs capitalize`}>
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className={`font-bold ${colors.text} text-sm`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Scaling Insights - Single Column Layout */}
      <div className="space-y-6 sm:space-y-8">
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
              <p className={`text-sm ${colors.text} opacity-70 mt-1 font-medium break-words`}>
                Advantages of scaling up production
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {scaling_benefits.map((benefit, index) => (
              <div 
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${colors.lightBg} ${colors.border} hover:scale-[1.02]`}
              >
                <div className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${colors.text} text-sm sm:text-base leading-relaxed break-words`}>
                    {benefit}
                  </p>
                </div>
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
              <p className={`text-sm ${colors.text} opacity-70 mt-1 font-medium break-words`}>
                Considerations when scaling up
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {risk_factors.map((risk, index) => (
              <div 
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-300 hover:shadow-md bg-red-50 border-red-200 hover:scale-[1.02]`}
              >
                <div className={`w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${colors.text} text-sm sm:text-base leading-relaxed break-words`}>
                    {risk}
                  </p>
                </div>
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