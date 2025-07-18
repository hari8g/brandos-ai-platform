import React, { useState } from 'react';
import { getCategoryColors } from '@/lib/colorUtils';
import type { MarketResearchData } from '@/types/formulation';

interface MarketResearchProps {
  tam: string;
  sam: string;
  som: string;
  marketSize: string;
  growthRate: string;
  keyTrends: string[];
  competitiveLandscape: string[];
  selectedCategory?: string | null;
  marketResearchData?: MarketResearchData;
  marketOpportunitySummary?: string;
  currentMarketSizeData?: {
    current_market_size?: string;
    growth_rate?: string;
    market_drivers?: string[];
    competitive_landscape?: string[];
    pricing_analysis?: {
      average_price_range: string;
      premium_segment_percentage: string;
      price_drivers: string[];
    };
    distribution_channels?: string[];
    methodology?: string;
    data_sources?: string[];
    confidence_level?: string;
    product_segment?: string;
    ingredient_premium_factor?: string;
    unique_selling_points?: string[];
  };
  productName: string;
  ingredients: Array<{ name: string; percent: number }>;
}

interface MetricInfo {
  title: string;
  description: string;
  explanation: string;
  calculation: string;
  example: string;
  significance: string;
  icon: string;
  detailedCalculation?: any;
  methodology?: string;
  insights?: string[];
}

// Information content for each metric
const getMetricInfo = (metric: string, detailedData?: any, category?: string): MetricInfo => {
  const getCategorySpecificExample = (metric: string, category?: string): string => {
    const categoryLower = category?.toLowerCase() || 'cosmetics';
    
    const examples = {
      'TAM': {
        'pet food': 'For pet food: All pet owners in India × Average annual pet food spending',
        'wellness': 'For wellness supplements: All adults in India × Average annual supplement spending',
        'cosmetics': 'For cosmetics: All women in India × Average annual beauty product spending'
      },
      'SAM': {
        'pet food': 'For premium pet food: Urban pet owners in Tier 1-2 cities × Premium segment percentage',
        'wellness': 'For premium wellness: Health-conscious urban adults × Premium supplement segment',
        'cosmetics': 'For premium cosmetics: Beauty-conscious urban women × Premium beauty segment'
      },
      'SOM': {
        'pet food': 'For premium pet food: SAM × 5-10% market share (realistic for new entrant)',
        'wellness': 'For premium wellness: SAM × 4-8% market share (realistic for new supplement brand)',
        'cosmetics': 'For premium cosmetics: SAM × 6-12% market share (realistic for new beauty brand)'
      },
      'Market Size': {
        'pet food': 'Current annual sales of premium pet food in India',
        'wellness': 'Current annual sales of wellness supplements in India',
        'cosmetics': 'Current annual sales of premium beauty products in India'
      },
      'Growth Rate': {
        'pet food': 'If pet food market grew from ₹1000 Cr to ₹1500 Cr in 5 years: CAGR = 8.4%',
        'wellness': 'If wellness market grew from ₹2000 Cr to ₹3000 Cr in 5 years: CAGR = 8.4%',
        'cosmetics': 'If beauty market grew from ₹2500 Cr to ₹4000 Cr in 5 years: CAGR = 9.8%'
      }
    };
    
    return examples[metric as keyof typeof examples]?.[categoryLower as keyof typeof examples[keyof typeof examples]] || 
           examples[metric as keyof typeof examples]?.['cosmetics'] || 
           'Example not available for this category';
  };

  const baseInfoMap = {
    'TAM': {
      title: 'Total Addressable Market (TAM)',
      description: 'The total market demand for a product or service, representing the maximum revenue opportunity available.',
      explanation: 'TAM is calculated by identifying the total number of potential customers and multiplying by the average revenue per customer. It represents the entire market size if you had 100% market share.',
      calculation: 'TAM = Total Potential Customers × Average Revenue Per Customer',
      example: getCategorySpecificExample('TAM', category),
      significance: 'Helps understand the maximum market potential and guides long-term strategic planning.',
      icon: 'T'
    },
    'SAM': {
      title: 'Serviceable Addressable Market (SAM)',
      description: 'The portion of TAM that your business can realistically reach with your current business model and resources.',
      explanation: 'SAM narrows down TAM by considering geographic limitations, distribution channels, and target customer segments that your business can actually serve.',
      calculation: 'SAM = TAM × Addressable Market Percentage',
      example: getCategorySpecificExample('SAM', category),
      significance: 'Represents the realistic market opportunity given your current capabilities and constraints.',
      icon: 'S'
    },
    'SOM': {
      title: 'Serviceable Obtainable Market (SOM)',
      description: 'The portion of SAM that you can realistically capture within 3-5 years with your current strategy.',
      explanation: 'SOM is your realistic market share target based on competitive analysis, resource constraints, and market entry strategy.',
      calculation: 'SOM = SAM × Target Market Share Percentage',
      example: getCategorySpecificExample('SOM', category),
      significance: 'Your actual revenue target and the basis for financial projections and business planning.',
      icon: 'O'
    },
    'Market Size': {
      title: 'Current Market Size',
      description: 'The current total market value for the specific product category or segment.',
      explanation: 'Represents the actual market value today, based on current sales, pricing, and market penetration levels.',
      calculation: 'Market Size = Current Sales Volume × Average Market Price',
      example: getCategorySpecificExample('Market Size', category),
      significance: 'Shows the current market opportunity and baseline for growth projections.',
      icon: 'M'
    },
    'Growth Rate': {
      title: 'Market Growth Rate (CAGR)',
      description: 'Compound Annual Growth Rate showing how fast the market is expanding year-over-year.',
      explanation: 'CAGR measures the consistent growth rate over a specific period, smoothing out year-to-year fluctuations.',
      calculation: 'CAGR = (End Value / Start Value)^(1/Years) - 1',
      example: getCategorySpecificExample('Growth Rate', category),
      significance: 'Indicates market momentum and helps forecast future market size and revenue potential.',
      icon: 'G'
    }
  };
  
  const baseInfo = baseInfoMap[metric as keyof typeof baseInfoMap] || {
    title: metric,
    description: 'Information not available',
    explanation: '',
    calculation: '',
    example: '',
    significance: '',
          icon: 'I'
  };

  // If we have detailed calculation data, enhance the info
  if (detailedData && detailedData[metric]) {
    const detail = detailedData[metric];
    return {
      ...baseInfo,
      detailedCalculation: detail.calculation,
      methodology: detail.methodology,
      insights: detail.insights
    };
  }

  return baseInfo;
};

const MarketResearch: React.FC<MarketResearchProps> = ({
  tam,
  sam,
  som,
  marketSize,
  growthRate,
  keyTrends,
  competitiveLandscape,
  selectedCategory,
  marketResearchData,
  marketOpportunitySummary,
  currentMarketSizeData,
  productName,
  ingredients,
}) => {
  const colors = getCategoryColors(selectedCategory || null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const MetricCard = ({ metric, value, label }: { metric: string; value: string; label: string }) => {
    const info = getMetricInfo(metric, marketResearchData?.detailed_calculations, selectedCategory || undefined);
    const isExpanded = expandedMetric === metric;

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
          onClick={() => setExpandedMetric(isExpanded ? null : metric)}
        >
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
                  w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-sm md:text-base font-bold
                  ${colors.lightBg} ${colors.border} border
                  group-hover:scale-110 transition-transform duration-200
                `}>
                  <span className={colors.text}>{info.icon}</span>
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} text-sm md:text-base`}>{label}</h4>
                  <p className={`text-xs ${colors.text} opacity-70`}>Click to learn more</p>
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
            <div className={`${colors.text} text-lg md:text-xl font-bold mb-2 md:mb-3`}>{value}</div>
            
            {/* Quick Description */}
            <p className={`${colors.text} text-xs md:text-sm opacity-80 leading-relaxed`}>
              {info.description}
            </p>
          </div>
        </div>

        {/* Expanded Content Panel */}
        {isExpanded && (
          <div className={`
            mt-3 md:mt-4 rounded-xl border overflow-hidden
            ${colors.border} ${colors.lightBg}
            animate-in slide-in-from-top-3 duration-300 ease-out
            shadow-xl shadow-blue-500/10
          `}>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Section Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs`}>
                  {info.icon}
                </div>
                <h5 className={`font-semibold ${colors.text} text-sm md:text-base`}>{info.title}</h5>
              </div>
              
              {/* Information Sections */}
              <div className="space-y-4 md:space-y-6">
                {/* Description */}
                <div className="bg-white/50 rounded-lg p-3 md:p-4 border border-gray-100">
                  <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-2 flex items-center`}>
                    <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                    Overview
                  </h6>
                  <p className={`${colors.text} text-xs md:text-sm leading-relaxed`}>{info.description}</p>
                </div>

                {/* Detailed Calculation (if available) */}
                {info.detailedCalculation && (
                  <div className="bg-white/50 rounded-lg p-3 md:p-4 border border-gray-100">
                    <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-2 flex items-center`}>
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                      Detailed Calculation
                    </h6>
                    
                    {/* Formula */}
                    <div className="mb-3">
                      <p className={`${colors.text} text-xs md:text-sm font-mono bg-gray-50 p-2 md:p-3 rounded border`}>
                        {info.detailedCalculation.formula}
                      </p>
                    </div>

                    {/* Variables */}
                    <div className="mb-3">
                      <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-1 block`}>Variables:</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(info.detailedCalculation.variables).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between text-xs md:text-sm">
                            <span className={`${colors.text} opacity-70`}>{key.replace(/_/g, ' ')}:</span>
                            <span className={`${colors.text} font-mono`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Calculation Steps */}
                    <div className="mb-3">
                      <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-1 block`}>Calculation Steps:</h6>
                      <div className="space-y-1">
                        {info.detailedCalculation.calculation_steps.map((step: string, index: number) => (
                          <div key={index} className={`${colors.text} text-xs md:text-sm leading-relaxed`}>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assumptions */}
                    <div className="mb-3">
                      <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-1 block`}>Key Assumptions:</h6>
                      <ul className="space-y-1">
                        {info.detailedCalculation.assumptions.map((assumption: string, index: number) => (
                          <li key={index} className={`${colors.text} text-xs md:text-sm leading-relaxed flex items-start`}>
                            <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Data Sources */}
                    <div className="mb-3">
                      <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-1 block`}>Data Sources:</h6>
                      <ul className="space-y-1">
                        {info.detailedCalculation.data_sources.map((source: string, index: number) => (
                          <li key={index} className={`${colors.text} text-xs md:text-sm leading-relaxed flex items-start`}>
                            <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            {source}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Confidence Level */}
                    <div>
                      <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-1 block`}>Confidence Level:</h6>
                      <span className={`text-xs md:text-sm px-2 py-1 rounded-full ${
                        info.detailedCalculation.confidence_level.includes('High') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {info.detailedCalculation.confidence_level}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Basic Calculation (fallback) */}
                {!info.detailedCalculation && (
                  <div className="bg-white/50 rounded-lg p-3 md:p-4 border border-gray-100">
                    <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-2 flex items-center`}>
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                      How it's calculated
                    </h6>
                    <p className={`${colors.text} text-xs md:text-sm leading-relaxed mb-2`}>{info.explanation}</p>
                    <div className={`p-2 md:p-3 bg-gray-50 rounded text-xs md:text-sm font-mono ${colors.text} border border-gray-200`}>
                      {info.calculation}
                    </div>
                  </div>
                )}

                {/* Calculation Inputs & Rationale for Market Size */}
                {metric === "Market Size" && currentMarketSizeData && (
                  <div className="bg-white/50 rounded-lg p-3 md:p-4 border border-gray-100">
                    <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-2 flex items-center`}>
                      <span className="w-2 h-2 rounded-full bg-orange-400 mr-2"></span>
                      Calculation Inputs & Rationale
                    </h6>
                    <div className="space-y-3">
                      {/* Product Name & Category */}
                      {productName && (
                        <div className="text-xs md:text-sm">
                          <span className={`font-medium ${colors.text}`}>Product Name:</span>
                          <span className={`${colors.text} ml-2`}>{productName}</span>
                        </div>
                      )}
                      {selectedCategory && (
                        <div className="text-xs md:text-sm">
                          <span className={`font-medium ${colors.text}`}>Product Category:</span>
                          <span className={`${colors.text} ml-2`}>{selectedCategory}</span>
                        </div>
                      )}
                      {/* Ingredient List */}
                      {ingredients && Array.isArray(ingredients) && ingredients.length > 0 && (
                        <div className="text-xs md:text-sm">
                          <span className={`font-medium ${colors.text}`}>Ingredients:</span>
                          <ul className="ml-4 mt-1 space-y-1">
                            {ingredients.map((ing, idx) => (
                              <li key={idx} className={`${colors.text} flex items-start`}>
                                <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-2 flex-shrink-0"></span>
                                <span>{ing.name} ({ing.percent}%)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Market Segment */}
                      {currentMarketSizeData.product_segment && (
                        <div className="text-xs md:text-sm">
                          <span className={`font-medium ${colors.text}`}>Market Segment:</span>
                          <span className={`${colors.text} ml-2`}>{currentMarketSizeData.product_segment}</span>
                        </div>
                      )}
                      {/* Methodology */}
                      {currentMarketSizeData.methodology && (
                        <div className="text-xs md:text-sm">
                          <span className={`font-medium ${colors.text}`}>Methodology:</span>
                          <p className={`${colors.text} mt-1 leading-relaxed`}>{currentMarketSizeData.methodology}</p>
                        </div>
                      )}
                      {/* Unique Selling Points */}
                      {currentMarketSizeData.unique_selling_points && currentMarketSizeData.unique_selling_points.length > 0 && (
                        <div className="text-xs md:text-sm">
                          <span className={`font-medium ${colors.text}`}>Unique Selling Points:</span>
                          <ul className="ml-4 mt-1 space-y-1">
                            {currentMarketSizeData.unique_selling_points.map((usp, idx) => (
                              <li key={idx} className={`${colors.text} flex items-start`}>
                                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                                <span>{usp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Example */}
                <div className="bg-white/50 rounded-lg p-3 md:p-4 border border-gray-100">
                  <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-2 flex items-center`}>
                    <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                    Example
                  </h6>
                  <p className={`${colors.text} text-xs md:text-sm leading-relaxed italic`}>{info.example}</p>
                </div>
                
                {/* Significance */}
                <div className="bg-white/50 rounded-lg p-3 md:p-4 border border-gray-100">
                  <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-2 flex items-center`}>
                    <span className="w-2 h-2 rounded-full bg-orange-400 mr-2"></span>
                    Why it matters
                  </h6>
                  <p className={`${colors.text} text-xs md:text-sm leading-relaxed`}>{info.significance}</p>
                </div>

                {/* Insights (if available) */}
                {info.insights && info.insights.length > 0 && (
                  <div className="bg-white/50 rounded-lg p-3 md:p-4 border border-gray-100">
                    <h6 className={`font-medium ${colors.text} text-xs md:text-sm mb-2 flex items-center`}>
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
                      Key Insights
                    </h6>
                    <ul className="space-y-1">
                      {info.insights.map((insight, index) => (
                        <li key={index} className={`${colors.text} text-xs md:text-sm leading-relaxed flex items-start`}>
                          <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 mr-2 flex-shrink-0"></span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Modern Gradient Header */}
      <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 rounded-t-3xl px-8 py-6 text-white shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h3 className="text-xl font-bold">Customer Segments & Market Analysis</h3>
            <p className="text-blue-100 text-sm">Dynamic segmentation, revenue, and market size insights for your product</p>
          </div>
        </div>
      </div>

      {/* Main content remains unchanged, starting with the white card */}
      <div className="bg-white rounded-b-3xl shadow-sm border border-gray-200">
        <div className="p-4">
          {/* Local market data functionality moved to LocalMarketAnalysis component */}
        </div>

        {/* High-Value Customers */}
        {/* ... rest of the component remains unchanged ... */}

        {/* Market Size Analysis */}
        <div>
                      <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-blue-600">M</span>
              </div>
              <h4 className={`text-lg md:text-xl font-semibold ${colors.text}`}>Market Size Analysis</h4>
            </div>
          <div className="space-y-4">
            <MetricCard metric="TAM" value={tam} label="TAM (Total Addressable Market)" />
            <MetricCard metric="SAM" value={sam} label="SAM (Serviceable Addressable Market)" />
            <MetricCard metric="SOM" value={som} label="SOM (Serviceable Obtainable Market)" />
          </div>
        </div>

        {/* Market Metrics & Growth */}
        <div>
                      <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-green-600">G</span>
              </div>
              <h4 className={`text-lg md:text-xl font-semibold ${colors.text}`}>Market Metrics & Growth</h4>
            </div>
          <div className="space-y-4">
            <MetricCard 
              metric="Market Size" 
              value={currentMarketSizeData?.current_market_size || marketSize} 
              label="Current Market Size" 
            />
            <MetricCard 
              metric="Growth Rate" 
              value={currentMarketSizeData?.growth_rate || growthRate} 
              label="Growth Rate (CAGR)" 
            />
          </div>
        </div>

        {/* Key Market Trends */}
        {keyTrends && keyTrends.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-purple-600">T</span>
              </div>
              <h4 className={`text-lg font-semibold ${colors.text}`}>Key Market Trends</h4>
            </div>
            <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-4 md:p-6`}>
              <div className="space-y-4">
                {keyTrends.map((trend, index) => (
                  <div 
                    key={index} 
                    className={`
                      relative group p-4 rounded-lg border transition-all duration-300 ease-out
                      ${colors.cardBg} ${colors.border}
                      hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]
                      hover:border-blue-200
                    `}
                  >
                    {/* Trend Number Badge */}
                    <div className={`
                      absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${colors.bg} ${colors.text} border-2 border-white shadow-sm
                    `}>
                      {index + 1}
                    </div>
                    
                    {/* Trend Content */}
                    <div className="pt-2">
                      <div className={`${colors.text} text-sm leading-relaxed`}>
                        {trend}
                      </div>
                    </div>
                    
                    {/* Hover Effect Overlay */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/20 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg
                    `}></div>
                  </div>
                ))}
              </div>
              
              {/* Trends Summary */}
              <div className={`mt-6 p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
                <div className="flex items-center space-x-2 mb-3">
                                <div className={`w-5 h-5 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-blue-600">S</span>
              </div>
              <h5 className={`font-semibold ${colors.text} text-sm`}>Trends Summary</h5>
                </div>
                <p className={`${colors.text} text-xs leading-relaxed opacity-80`}>
                  These {keyTrends.length} key trends represent the most significant market drivers and opportunities 
                  for the {selectedCategory?.toLowerCase() || 'product'} category in the Indian market.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Competitive Landscape */}
        {competitiveLandscape && competitiveLandscape.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-orange-600">C</span>
              </div>
              <h4 className={`text-lg font-semibold ${colors.text}`}>Competitive Landscape</h4>
            </div>
            <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-4 md:p-6`}>
              {/* Competitors Grid */}
              <div className="space-y-4 mb-6">
                {competitiveLandscape.map((competitor, index) => (
                  <div 
                    key={index} 
                    className={`
                      relative group p-4 rounded-lg border transition-all duration-300 ease-out
                      ${colors.cardBg} ${colors.border}
                      hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]
                      hover:border-blue-200 cursor-pointer
                    `}
                  >

                    {/* Competitor Name */}
                    <div className={`font-medium ${colors.text} text-sm leading-tight`}>
                      {competitor}
                    </div>
                    
                    {/* Hover Effect Overlay */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/20 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg
                    `}></div>
                  </div>
                ))}
              </div>
              
              {/* Competitive Analysis Summary */}
              <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
                <div className="flex items-center space-x-2 mb-3">
                  <div className={`w-5 h-5 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
                    <span className="text-green-600">A</span>
                  </div>
                  <h5 className={`font-semibold ${colors.text} text-sm`}>Competitive Analysis</h5>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Market Position */}
                  <div className="space-y-2">
                    <h6 className={`font-medium ${colors.text} text-xs`}>Market Position</h6>
                    <p className={`${colors.text} text-xs leading-relaxed opacity-80`}>
                      {selectedCategory?.toLowerCase() === 'pet food' 
                        ? 'Established players dominate with premium positioning opportunities'
                        : selectedCategory?.toLowerCase() === 'wellness'
                        ? 'Growing market with room for innovative formulations'
                        : 'Competitive landscape with strong brand loyalty factors'
                      }
                    </p>
                  </div>
                  
                  {/* Differentiation Opportunities */}
                  <div className="space-y-2">
                    <h6 className={`font-medium ${colors.text} text-xs`}>Differentiation Opportunities</h6>
                    <p className={`${colors.text} text-xs leading-relaxed opacity-80`}>
                      {selectedCategory?.toLowerCase() === 'pet food'
                        ? 'Focus on scientific formulation and transparent ingredient sourcing'
                        : selectedCategory?.toLowerCase() === 'wellness'
                        ? 'Emphasize clinical validation and health benefits'
                        : 'Highlight premium ingredients and proven results'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Target Audience Analysis */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
              <span className="text-indigo-600">👥</span>
            </div>
            <h4 className={`text-lg font-semibold ${colors.text}`}>Target Audience Analysis</h4>
          </div>
          <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-6`}>
            <div className="space-y-6">
              {/* Primary Target Audience */}
              <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
                <h5 className={`font-semibold ${colors.text} text-base mb-3 flex items-center`}>
                  <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                  Primary Target Audience
                </h5>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className={`font-medium ${colors.text} text-sm`}>Demographics:</span>
                      <p className={`${colors.text} text-sm mt-1`}>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Urban pet owners aged 25-45, primarily women (70%), with household income ₹8-15 lakhs annually'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Health-conscious adults aged 25-55, primarily women (65%), with household income ₹10-20 lakhs annually'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Health-conscious adults aged 18-45, balanced gender distribution, with household income ₹6-15 lakhs annually'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Fashion-conscious adults aged 20-50, primarily women (75%), with household income ₹8-18 lakhs annually'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Cooking enthusiasts aged 25-60, primarily women (80%), with household income ₹6-12 lakhs annually'
                          : 'Beauty-conscious women aged 18-45, with household income ₹8-20 lakhs annually'
                        }
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium ${colors.text} text-sm`}>Psychographics:</span>
                      <p className={`${colors.text} text-sm mt-1`}>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Pet humanization trend followers, health-conscious, premium product seekers, social media active'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Health and wellness focused, preventive healthcare believers, premium quality seekers'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Health-conscious, functional food enthusiasts, convenience seekers, social media active'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Sustainability conscious, fashion-forward, quality seekers, social media influencers'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Traditional cooking enthusiasts, authentic flavor seekers, health-conscious, family-oriented'
                          : 'Beauty and skincare enthusiasts, premium product seekers, social media active, trend followers'
                        }
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`font-medium ${colors.text} text-sm`}>Behavioral Patterns:</span>
                    <ul className={`${colors.text} text-sm mt-1 space-y-1`}>
                      <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Research products thoroughly before purchase, read reviews, prefer premium brands'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Research ingredients and benefits, read clinical studies, prefer science-backed products'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Look for functional benefits, read nutrition labels, prefer natural ingredients'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Research fabric quality, check sustainability credentials, prefer ethical brands'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Seek authentic recipes, research traditional methods, prefer natural ingredients'
                          : 'Research ingredients and reviews, follow beauty trends, prefer premium formulations'
                        }
                      </li>
                      <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Shop online frequently, use mobile apps, engage with pet communities'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Shop online for supplements, use health apps, engage with wellness communities'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Shop online and offline, use food delivery apps, engage with health communities'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Shop online for fashion, use social commerce, engage with fashion communities'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Shop at local markets and online, use cooking apps, engage with food communities'
                          : 'Shop online for beauty products, use beauty apps, engage with beauty communities'
                        }
                      </li>
                      <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Willing to pay premium for quality, value transparency, seek expert recommendations'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Willing to pay premium for proven benefits, value clinical validation, seek expert advice'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Willing to pay premium for health benefits, value natural ingredients, seek expert recommendations'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Willing to pay premium for quality and sustainability, value ethical production, seek expert advice'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Willing to pay premium for authenticity, value traditional methods, seek expert recommendations'
                          : 'Willing to pay premium for quality, value proven results, seek expert recommendations'
                        }
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Secondary Target Audience */}
              <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
                <h5 className={`font-semibold ${colors.text} text-base mb-3 flex items-center`}>
                  <span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                  Secondary Target Audience
                </h5>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className={`font-medium ${colors.text} text-sm`}>Demographics:</span>
                      <p className={`${colors.text} text-sm mt-1`}>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Young professionals aged 22-30, urban dwellers, early adopters of premium pet products'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Young professionals aged 22-35, fitness enthusiasts, early adopters of wellness trends'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Students and young professionals aged 18-30, health-conscious, trend followers'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Young professionals aged 22-35, fashion-forward, sustainability conscious'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Young adults aged 20-35, cooking enthusiasts, traditional food lovers'
                          : 'Young professionals aged 22-35, beauty enthusiasts, early adopters of beauty trends'
                        }
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium ${colors.text} text-sm`}>Characteristics:</span>
                      <p className={`${colors.text} text-sm mt-1`}>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'First-time pet owners, social media influencers, trend followers'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Fitness enthusiasts, social media influencers, trend followers'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Health-conscious students, social media active, trend followers'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Fashion influencers, sustainability advocates, trend followers'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Cooking enthusiasts, food bloggers, traditional food advocates'
                          : 'Beauty influencers, social media active, trend followers'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Likely Buyers & Average Order Value */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
              <span className="text-purple-600">💰</span>
            </div>
            <h4 className={`text-lg font-semibold ${colors.text}`}>Likely Buyers & Average Order Value</h4>
          </div>
          <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-6`}>
            <div className="space-y-6">
              {/* Customer Segments */}
              <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
                <h5 className={`font-semibold ${colors.text} text-base mb-3 flex items-center`}>
                  <span className="w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                  Customer Segments & Purchase Behavior
                </h5>
                <div className="space-y-4">
                  {/* High-Value Customers */}
                  <div className="border-l-4 border-purple-400 pl-4">
                    <h6 className={`font-semibold ${colors.text} text-sm mb-2`}>High-Value Customers (20% of buyers)</h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${colors.text}`}>Average Order Value:</span>
                        <p className={`${colors.text} font-bold`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? '₹2,500 - ₹4,000'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? '₹3,000 - ₹5,000'
                            : selectedCategory?.toLowerCase() === 'beverages'
                            ? '₹1,500 - ₹3,000'
                            : selectedCategory?.toLowerCase() === 'textiles'
                            ? '₹2,000 - ₹4,500'
                            : selectedCategory?.toLowerCase() === 'desi masala'
                            ? '₹800 - ₹1,500'
                            : '₹2,000 - ₹4,000'
                          }
                        </p>
                      </div>
                      <div>
                        <span className={`font-medium ${colors.text}`}>Purchase Frequency:</span>
                        <p className={`${colors.text}`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Monthly to bi-monthly'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Monthly'
                            : selectedCategory?.toLowerCase() === 'beverages'
                            ? 'Weekly to bi-weekly'
                            : selectedCategory?.toLowerCase() === 'textiles'
                            ? 'Seasonal (3-4 times/year)'
                            : selectedCategory?.toLowerCase() === 'desi masala'
                            ? 'Weekly to monthly'
                            : 'Monthly to bi-monthly'
                          }
                        </p>
                      </div>
                      <div>
                        <span className={`font-medium ${colors.text}`}>Characteristics:</span>
                        <p className={`${colors.text}`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Premium seekers, brand loyal, high disposable income'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Health-focused, quality conscious, high disposable income'
                            : selectedCategory?.toLowerCase() === 'beverages'
                            ? 'Health-conscious, convenience seekers, moderate-high income'
                            : selectedCategory?.toLowerCase() === 'textiles'
                            ? 'Fashion-forward, sustainability conscious, high disposable income'
                            : selectedCategory?.toLowerCase() === 'desi masala'
                            ? 'Traditional food lovers, quality conscious, moderate income'
                            : 'Beauty enthusiasts, premium seekers, high disposable income'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mid-Value Customers */}
                  <div className="border-l-4 border-blue-400 pl-4">
                    <h6 className={`font-semibold ${colors.text} text-sm mb-2`}>Mid-Value Customers (50% of buyers)</h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${colors.text}`}>Average Order Value:</span>
                        <p className={`${colors.text} font-bold`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? '₹1,200 - ₹2,500'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? '₹1,500 - ₹3,000'
                            : selectedCategory?.toLowerCase() === 'beverages'
                            ? '₹800 - ₹1,500'
                            : selectedCategory?.toLowerCase() === 'textiles'
                            ? '₹1,200 - ₹2,500'
                            : selectedCategory?.toLowerCase() === 'desi masala'
                            ? '₹400 - ₹800'
                            : '₹1,200 - ₹2,500'
                          }
                        </p>
                      </div>
                      <div>
                        <span className={`font-medium ${colors.text}`}>Purchase Frequency:</span>
                        <p className={`${colors.text}`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Bi-monthly to quarterly'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Bi-monthly'
                            : selectedCategory?.toLowerCase() === 'beverages'
                            ? 'Bi-weekly to monthly'
                            : selectedCategory?.toLowerCase() === 'textiles'
                            ? 'Quarterly (2-3 times/year)'
                            : selectedCategory?.toLowerCase() === 'desi masala'
                            ? 'Bi-weekly to monthly'
                            : 'Bi-monthly to quarterly'
                          }
                        </p>
                      </div>
                      <div>
                        <span className={`font-medium ${colors.text}`}>Characteristics:</span>
                        <p className={`${colors.text}`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Value-conscious, quality seekers, moderate income'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Health-conscious, value seekers, moderate income'
                            : selectedCategory?.toLowerCase() === 'beverages'
                            ? 'Health-conscious, convenience seekers, moderate income'
                            : selectedCategory?.toLowerCase() === 'textiles'
                            ? 'Fashion-conscious, value seekers, moderate income'
                            : selectedCategory?.toLowerCase() === 'desi masala'
                            ? 'Traditional food lovers, value seekers, moderate income'
                            : 'Beauty-conscious, value seekers, moderate income'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Entry-Level Customers */}
                  <div className="border-l-4 border-green-400 pl-4">
                    <h6 className={`font-semibold ${colors.text} text-sm mb-2`}>Entry-Level Customers (30% of buyers)</h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${colors.text}`}>Average Order Value:</span>
                        <p className={`${colors.text} font-bold`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? '₹500 - ₹1,200'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? '₹800 - ₹1,500'
                            : selectedCategory?.toLowerCase() === 'beverages'
                            ? '₹400 - ₹800'
                            : selectedCategory?.toLowerCase() === 'textiles'
                            ? '₹600 - ₹1,200'
                            : selectedCategory?.toLowerCase() === 'desi masala'
                            ? '₹200 - ₹400'
                            : '₹600 - ₹1,200'
                          }
                        </p>
                      </div>
                      <div>
                        <span className={`font-medium ${colors.text}`}>Purchase Frequency:</span>
                        <p className={`${colors.text}`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Quarterly to semi-annually'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Quarterly'
                            : selectedCategory?.toLowerCase() === 'beverages'
                            ? 'Monthly to bi-monthly'
                            : selectedCategory?.toLowerCase() === 'textiles'
                            ? 'Semi-annually (1-2 times/year)'
                            : selectedCategory?.toLowerCase() === 'desi masala'
                            ? 'Monthly to bi-monthly'
                            : 'Quarterly to semi-annually'
                          }
                        </p>
                      </div>
                      <div>
                        <span className={`font-medium ${colors.text}`}>Characteristics:</span>
                        <p className={`${colors.text}`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Price-sensitive, trial seekers, lower income'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Price-sensitive, trial seekers, lower income'
                            : selectedCategory?.toLowerCase() === 'beverages'
                            ? 'Price-sensitive, convenience seekers, lower income'
                            : selectedCategory?.toLowerCase() === 'textiles'
                            ? 'Price-sensitive, basic needs, lower income'
                            : selectedCategory?.toLowerCase() === 'desi masala'
                            ? 'Price-sensitive, basic needs, lower income'
                            : 'Price-sensitive, trial seekers, lower income'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Drivers */}
              <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
                <h5 className={`font-semibold ${colors.text} text-base mb-3 flex items-center`}>
                  <span className="w-3 h-3 rounded-full bg-orange-400 mr-2"></span>
                  Key Purchase Drivers
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className={`font-medium ${colors.text} text-sm`}>Primary Drivers:</span>
                    <ul className={`${colors.text} text-sm mt-1 space-y-1`}>
                      <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 mr-2 flex-shrink-0"></span>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Pet health and nutrition concerns'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Health and wellness goals'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Health benefits and convenience'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Fashion trends and sustainability'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Authentic taste and traditional cooking'
                          : 'Beauty and skincare concerns'
                        }
                      </li>
                      <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 mr-2 flex-shrink-0"></span>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Premium quality and ingredients'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Clinical validation and proven benefits'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Natural ingredients and functional benefits'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Quality and ethical production'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Traditional methods and natural ingredients'
                          : 'Proven results and premium ingredients'
                        }
                      </li>
                      <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 mr-2 flex-shrink-0"></span>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Brand reputation and reviews'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Brand reputation and expert recommendations'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Brand reputation and user reviews'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Brand reputation and sustainability credentials'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Traditional reputation and user reviews'
                          : 'Brand reputation and user reviews'
                        }
                      </li>
                    </ul>
                  </div>
                  <div>
                    <span className={`font-medium ${colors.text} text-sm`}>Secondary Drivers:</span>
                    <ul className={`${colors.text} text-sm mt-1 space-y-1`}>
                      <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Convenience and availability'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Convenience and ease of use'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Taste and variety'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Style and design'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Convenience and variety'
                          : 'Convenience and variety'
                        }
                      </li>
                      <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Social media influence'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Social media influence'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Social media trends'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Social media influence'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Traditional recommendations'
                          : 'Social media influence'
                        }
                      </li>
                      <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Price and value for money'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Price and value for money'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Price and value for money'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Price and value for money'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Price and value for money'
                          : 'Price and value for money'
                        }
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Revenue Projections */}
              <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
                <h5 className={`font-semibold ${colors.text} text-base mb-3 flex items-center`}>
                  <span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                  Revenue Projections by Segment
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                    <h6 className={`font-semibold ${colors.text} mb-2`}>High-Value (20%)</h6>
                    <p className={`${colors.text} font-bold text-lg`}>
                      {selectedCategory?.toLowerCase() === 'pet food'
                        ? '₹3,000 AOV'
                        : selectedCategory?.toLowerCase() === 'wellness'
                        ? '₹4,000 AOV'
                        : selectedCategory?.toLowerCase() === 'beverages'
                        ? '₹2,000 AOV'
                        : selectedCategory?.toLowerCase() === 'textiles'
                        ? '₹3,500 AOV'
                        : selectedCategory?.toLowerCase() === 'desi masala'
                        ? '₹1,200 AOV'
                        : '₹3,000 AOV'
                      }
                    </p>
                    <p className={`${colors.text} text-xs opacity-70`}>40% of revenue</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
                    <h6 className={`font-semibold ${colors.text} mb-2`}>Mid-Value (50%)</h6>
                    <p className={`${colors.text} font-bold text-lg`}>
                      {selectedCategory?.toLowerCase() === 'pet food'
                        ? '₹1,800 AOV'
                        : selectedCategory?.toLowerCase() === 'wellness'
                        ? '₹2,200 AOV'
                        : selectedCategory?.toLowerCase() === 'beverages'
                        ? '₹1,200 AOV'
                        : selectedCategory?.toLowerCase() === 'textiles'
                        ? '₹1,800 AOV'
                        : selectedCategory?.toLowerCase() === 'desi masala'
                        ? '₹600 AOV'
                        : '₹1,800 AOV'
                      }
                    </p>
                    <p className={`${colors.text} text-xs opacity-70`}>45% of revenue</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg">
                    <h6 className={`font-semibold ${colors.text} mb-2`}>Entry-Level (30%)</h6>
                    <p className={`${colors.text} font-bold text-lg`}>
                      {selectedCategory?.toLowerCase() === 'pet food'
                        ? '₹800 AOV'
                        : selectedCategory?.toLowerCase() === 'wellness'
                        ? '₹1,200 AOV'
                        : selectedCategory?.toLowerCase() === 'beverages'
                        ? '₹600 AOV'
                        : selectedCategory?.toLowerCase() === 'textiles'
                        ? '₹900 AOV'
                        : selectedCategory?.toLowerCase() === 'desi masala'
                        ? '₹300 AOV'
                        : '₹900 AOV'
                      }
                    </p>
                    <p className={`${colors.text} text-xs opacity-70`}>15% of revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Opportunity Summary */}
        <div>
                      <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-red-600">O</span>
              </div>
              <h4 className={`text-lg font-semibold ${colors.text}`}>Market Opportunity Summary</h4>
            </div>
          <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-4`}>
            {marketOpportunitySummary ? (
              <div className="space-y-4">
                <div className={`${colors.text} text-sm leading-relaxed whitespace-pre-line`}>
                  {marketOpportunitySummary}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`${colors.text} text-sm leading-relaxed`}>
                  <strong className={`${colors.text}`}>Market Potential:</strong>
                  <p className="mt-2">
                    Based on the TAM of {tam}, SAM of {sam}, and SOM of {som}, this {selectedCategory?.toLowerCase() || 'product'} market presents significant opportunities for growth and market penetration.
                  </p>
                </div>
                
                <div className={`border-t ${colors.border} pt-4`}>
                  <strong className={`${colors.text}`}>Key Opportunities:</strong>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                      <span className={`${colors.text}`}>
                        {selectedCategory?.toLowerCase() === 'pet food' 
                          ? 'Growing pet humanization trend with premium pet food demand increasing'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Rising health consciousness driving premium wellness supplement demand'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Rising health consciousness driving premium functional beverage demand'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Rising sustainability consciousness driving premium textile demand'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Growing demand for authentic Indian spice blends and traditional flavors'
                          : 'Growing beauty consciousness driving premium cosmetic product demand'
                        }
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                      <span className={`${colors.text}`}>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Opportunity to capture market share through premium pet nutrition innovation'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Opportunity to capture market share through clinically proven supplement formulations'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Opportunity to capture market share through functional beverage innovation'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Opportunity to capture market share through sustainable textile innovation'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Opportunity to capture market share through authentic spice blend innovation'
                          : 'Opportunity to capture market share through innovative beauty formulations'
                        }
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                      <span className={`${colors.text}`}>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Potential for premium positioning with high-quality pet food ingredients'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Potential for premium positioning with science-backed wellness ingredients'
                          : selectedCategory?.toLowerCase() === 'beverages'
                          ? 'Potential for premium positioning with functional beverage ingredients'
                          : selectedCategory?.toLowerCase() === 'textiles'
                          ? 'Potential for premium positioning with sustainable textile materials'
                          : selectedCategory?.toLowerCase() === 'desi masala'
                          ? 'Potential for premium positioning with authentic Indian spice blends'
                          : 'Potential for premium positioning with high-quality beauty ingredients'
                        }
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                      <span className={`${colors.text}`}>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Room for differentiation in competitive pet food landscape'
                          : selectedCategory?.toLowerCase() === 'wellness'
                          ? 'Room for differentiation in competitive wellness supplement landscape'
                          : 'Room for differentiation in competitive beverage landscape'
                        }
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Strategic Advice Section */}
                <div className={`border-t ${colors.border} pt-4`}>
                  <div className="flex items-center space-x-2 mb-3">
                                      <div className={`w-5 h-5 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
                    <span className="text-blue-600">S</span>
                  </div>
                  <strong className={`${colors.text} text-base`}>Strategic Advice for {selectedCategory?.toLowerCase() || 'Product'} Market:</strong>
                  </div>
                  <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-3`}>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                        <span className={`${colors.text}`}>
                          <strong>Target Segment:</strong> {' '}
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Focus on health-conscious pet owners in urban areas who prioritize premium nutrition for their pets'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Focus on health-conscious adults aged 25-55 who prioritize preventive healthcare and wellness'
                            : 'Focus on beauty-conscious women aged 18-45 who prioritize premium skincare and beauty products'
                          }
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                        <span className={`${colors.text}`}>
                          <strong>Competitive Strategy:</strong> {' '}
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Differentiate through premium ingredients, scientific formulations, and transparent pet nutrition education'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Differentiate through clinically proven ingredients, transparent labeling, and health education content'
                            : 'Differentiate through premium ingredients, scientific formulations, and beauty education content'
                          }
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                        <span className={`${colors.text}`}>
                          <strong>Market Entry:</strong> {' '}
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Start with premium pet food targeting specific health concerns, then expand to broader pet nutrition'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Start with targeted wellness supplements for specific health goals, then expand to broader wellness'
                            : 'Start with targeted functional beverages for specific health goals, then expand to broader beverage portfolio'
                          }
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                        <span className={`${colors.text}`}>
                          <strong>Pricing Strategy:</strong> {' '}
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Premium pricing (₹500-800/kg) justified by high-quality ingredients and scientific formulation'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'Premium pricing (₹1000-2000/month) justified by clinically proven ingredients and health benefits'
                            : 'Premium pricing (₹1000-3000/unit) justified by high-quality ingredients and proven results'
                          }
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                        <span className={`${colors.text}`}>
                          <strong>Distribution:</strong> {' '}
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'E-commerce platforms, specialty pet stores, veterinary clinics, and direct-to-consumer channels'
                            : selectedCategory?.toLowerCase() === 'wellness'
                            ? 'E-commerce platforms, pharmacies, specialty health stores, and direct-to-consumer channels'
                            : 'E-commerce platforms, specialty beauty stores, department stores, and direct-to-consumer channels'
                          }
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Market Research Insights */}
            {marketResearchData?.tam?.insights && marketResearchData.tam.insights.length > 0 && (
              <div className={`border-t ${colors.border} pt-4`}>
                <strong className={`${colors.text}`}>Market Insights:</strong>
                <ul className="mt-2 space-y-2 text-sm">
                  {marketResearchData.tam.insights.slice(0, 3).map((insight, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                      <span className={`${colors.text}`}>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Competitive Landscape */}
            {marketResearchData?.tam?.competitors && marketResearchData.tam.competitors.length > 0 && (
              <div className={`border-t ${colors.border} pt-4`}>
                <strong className={`${colors.text}`}>Key Competitors:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {marketResearchData.tam.competitors.slice(0, 5).map((competitor, index) => (
                    <span key={index} className={`text-xs px-2 py-1 rounded-full ${colors.lightBg} ${colors.border} border`}>
                      {competitor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketResearch;