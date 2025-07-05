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
      icon: '🌍'
    },
    'SAM': {
      title: 'Serviceable Addressable Market (SAM)',
      description: 'The portion of TAM that your business can realistically reach with your current business model and resources.',
      explanation: 'SAM narrows down TAM by considering geographic limitations, distribution channels, and target customer segments that your business can actually serve.',
      calculation: 'SAM = TAM × Addressable Market Percentage',
      example: getCategorySpecificExample('SAM', category),
      significance: 'Represents the realistic market opportunity given your current capabilities and constraints.',
      icon: '🎯'
    },
    'SOM': {
      title: 'Serviceable Obtainable Market (SOM)',
      description: 'The portion of SAM that you can realistically capture within 3-5 years with your current strategy.',
      explanation: 'SOM is your realistic market share target based on competitive analysis, resource constraints, and market entry strategy.',
      calculation: 'SOM = SAM × Target Market Share Percentage',
      example: getCategorySpecificExample('SOM', category),
      significance: 'Your actual revenue target and the basis for financial projections and business planning.',
      icon: '💰'
    },
    'Market Size': {
      title: 'Current Market Size',
      description: 'The current total market value for the specific product category or segment.',
      explanation: 'Represents the actual market value today, based on current sales, pricing, and market penetration levels.',
      calculation: 'Market Size = Current Sales Volume × Average Market Price',
      example: getCategorySpecificExample('Market Size', category),
      significance: 'Shows the current market opportunity and baseline for growth projections.',
      icon: '📊'
    },
    'Growth Rate': {
      title: 'Market Growth Rate (CAGR)',
      description: 'Compound Annual Growth Rate showing how fast the market is expanding year-over-year.',
      explanation: 'CAGR measures the consistent growth rate over a specific period, smoothing out year-to-year fluctuations.',
      calculation: 'CAGR = (End Value / Start Value)^(1/Years) - 1',
      example: getCategorySpecificExample('Growth Rate', category),
      significance: 'Indicates market momentum and helps forecast future market size and revenue potential.',
      icon: '📈'
    }
  };
  
  const baseInfo = baseInfoMap[metric as keyof typeof baseInfoMap] || {
    title: metric,
    description: 'Information not available',
    explanation: '',
    calculation: '',
    example: '',
    significance: '',
    icon: '📋'
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
          <div className="relative p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-sm
                  ${colors.lightBg} ${colors.border} border
                  group-hover:scale-110 transition-transform duration-200
                `}>
                  {info.icon}
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} text-sm`}>{label}</h4>
                  <p className={`text-xs ${colors.text} opacity-70`}>Click to learn more</p>
                </div>
              </div>
              
              {/* Expand/Collapse Icon */}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center
                ${colors.lightBg} ${colors.border} border
                transition-all duration-300 ease-out
                ${isExpanded ? 'rotate-180 bg-blue-50 border-blue-200' : 'group-hover:bg-blue-50 group-hover:border-blue-200'}
              `}>
                <svg 
                  className={`w-3 h-3 ${colors.text} transition-transform duration-300`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Value Display */}
            <div className={`${colors.text} text-lg font-bold mb-2`}>{value}</div>
            
            {/* Quick Description */}
            <p className={`${colors.text} text-xs opacity-80 leading-relaxed`}>
              {info.description}
            </p>
          </div>
        </div>

        {/* Expanded Content Panel */}
        {isExpanded && (
          <div className={`
            mt-3 rounded-xl border overflow-hidden
            ${colors.border} ${colors.lightBg}
            animate-in slide-in-from-top-3 duration-300 ease-out
            shadow-xl shadow-blue-500/10
          `}>
            <div className="p-4 space-y-4">
              {/* Section Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs`}>
                  {info.icon}
                </div>
                <h5 className={`font-semibold ${colors.text} text-sm`}>{info.title}</h5>
              </div>
              
              {/* Information Sections */}
              <div className="space-y-4">
                {/* Description */}
                <div className="bg-white/50 rounded-lg p-3 border border-gray-100">
                  <h6 className={`font-medium ${colors.text} text-xs mb-2 flex items-center`}>
                    <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                    Overview
                  </h6>
                  <p className={`${colors.text} text-xs leading-relaxed`}>{info.description}</p>
                </div>

                {/* Detailed Calculation (if available) */}
                {info.detailedCalculation && (
                  <div className="bg-white/50 rounded-lg p-3 border border-gray-100">
                    <h6 className={`font-medium ${colors.text} text-xs mb-2 flex items-center`}>
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                      Detailed Calculation
                    </h6>
                    
                    {/* Formula */}
                    <div className="mb-3">
                      <p className={`${colors.text} text-xs font-mono bg-gray-50 p-2 rounded border`}>
                        {info.detailedCalculation.formula}
                      </p>
                    </div>

                    {/* Variables */}
                    <div className="mb-3">
                      <h6 className={`font-medium ${colors.text} text-xs mb-1 block`}>Variables:</h6>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(info.detailedCalculation.variables).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className={`${colors.text} opacity-70`}>{key.replace(/_/g, ' ')}:</span>
                            <span className={`${colors.text} font-mono`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Calculation Steps */}
                    <div className="mb-3">
                      <h6 className={`font-medium ${colors.text} text-xs mb-1 block`}>Calculation Steps:</h6>
                      <div className="space-y-1">
                        {info.detailedCalculation.calculation_steps.map((step: string, index: number) => (
                          <div key={index} className={`${colors.text} text-xs leading-relaxed`}>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assumptions */}
                    <div className="mb-3">
                      <h6 className={`font-medium ${colors.text} text-xs mb-1 block`}>Key Assumptions:</h6>
                      <ul className="space-y-1">
                        {info.detailedCalculation.assumptions.map((assumption: string, index: number) => (
                          <li key={index} className={`${colors.text} text-xs leading-relaxed flex items-start`}>
                            <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Data Sources */}
                    <div className="mb-3">
                      <h6 className={`font-medium ${colors.text} text-xs mb-1 block`}>Data Sources:</h6>
                      <ul className="space-y-1">
                        {info.detailedCalculation.data_sources.map((source: string, index: number) => (
                          <li key={index} className={`${colors.text} text-xs leading-relaxed flex items-start`}>
                            <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            {source}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Confidence Level */}
                    <div>
                      <h6 className={`font-medium ${colors.text} text-xs mb-1 block`}>Confidence Level:</h6>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
                  <div className="bg-white/50 rounded-lg p-3 border border-gray-100">
                    <h6 className={`font-medium ${colors.text} text-xs mb-2 flex items-center`}>
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                      How it's calculated
                    </h6>
                    <p className={`${colors.text} text-xs leading-relaxed mb-2`}>{info.explanation}</p>
                    <div className={`p-2 bg-gray-50 rounded text-xs font-mono ${colors.text} border border-gray-200`}>
                      {info.calculation}
                    </div>
                  </div>
                )}
                
                {/* Example */}
                <div className="bg-white/50 rounded-lg p-3 border border-gray-100">
                  <h6 className={`font-medium ${colors.text} text-xs mb-2 flex items-center`}>
                    <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                    Example
                  </h6>
                  <p className={`${colors.text} text-xs leading-relaxed italic`}>{info.example}</p>
                </div>
                
                {/* Significance */}
                <div className="bg-white/50 rounded-lg p-3 border border-gray-100">
                  <h6 className={`font-medium ${colors.text} text-xs mb-2 flex items-center`}>
                    <span className="w-2 h-2 rounded-full bg-orange-400 mr-2"></span>
                    Why it matters
                  </h6>
                  <p className={`${colors.text} text-xs leading-relaxed`}>{info.significance}</p>
                </div>

                {/* Insights (if available) */}
                {info.insights && info.insights.length > 0 && (
                  <div className="bg-white/50 rounded-lg p-3 border border-gray-100">
                    <h6 className={`font-medium ${colors.text} text-xs mb-2 flex items-center`}>
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
                      Key Insights
                    </h6>
                    <ul className="space-y-1">
                      {info.insights.map((insight, index) => (
                        <li key={index} className={`${colors.text} text-xs leading-relaxed flex items-start`}>
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
    <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-6`}>
      {/* Header with Instructions */}
      <div className={`mb-6 p-4 ${colors.lightBg} rounded-xl border ${colors.border} border-dashed`}>
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-sm`}>
            💡
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${colors.text} text-sm mb-1`}>Interactive Market Metrics</h3>
            <p className={`${colors.text} text-xs leading-relaxed`}>
              Click on any metric card below to see detailed explanations of how these market measurements are calculated and their strategic importance for your business planning.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Market Size Analysis */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs`}>
              📊
            </div>
            <h4 className={`text-lg font-semibold ${colors.text}`}>Market Size Analysis</h4>
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
            <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs`}>
              📈
            </div>
            <h4 className={`text-lg font-semibold ${colors.text}`}>Market Metrics & Growth</h4>
          </div>
          <div className="space-y-4">
            <MetricCard metric="Market Size" value={marketSize} label="Current Market Size" />
            <MetricCard metric="Growth Rate" value={growthRate} label="Growth Rate (CAGR)" />
          </div>
        </div>

        {/* Key Market Trends */}
        {keyTrends && keyTrends.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs`}>
                🔍
              </div>
              <h4 className={`text-lg font-semibold ${colors.text}`}>Key Market Trends</h4>
            </div>
            <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-4`}>
              <div className="space-y-3">
                {keyTrends.map((trend, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                    <div className="flex-1">
                      <div className={`${colors.text} text-sm leading-relaxed`}>{trend}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Competitive Landscape */}
        {competitiveLandscape && competitiveLandscape.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs`}>
                🏢
              </div>
              <h4 className={`text-lg font-semibold ${colors.text}`}>Competitive Landscape</h4>
            </div>
            <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-4`}>
              <div className="space-y-3">
                {competitiveLandscape.map((competitor, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                    <div className="flex-1">
                      <div className={`${colors.text} text-sm leading-relaxed`}>{competitor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Market Opportunity Summary */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs`}>
              🎯
            </div>
            <h4 className={`text-lg font-semibold ${colors.text}`}>Market Opportunity Summary</h4>
          </div>
          <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-4`}>
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
                        : 'Room for differentiation in competitive beauty product landscape'
                      }
                    </span>
                  </li>
                </ul>
              </div>

              {/* Strategic Advice Section */}
              <div className={`border-t ${colors.border} pt-4`}>
                <div className="flex items-center space-x-2 mb-3">
                  <div className={`w-5 h-5 rounded-lg ${colors.bg} flex items-center justify-center text-xs`}>
                    💡
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
                          : 'Start with targeted beauty products for specific skin concerns, then expand to broader beauty'
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
    </div>
  );
};

export default MarketResearch;