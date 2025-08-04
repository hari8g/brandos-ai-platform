import React from 'react';
import { getCategoryColors } from '@/lib/colorUtils';
import type { MarketResearchData } from '../types/formulation';

interface MarketResearchProps {
  selectedCategory: string | null;
  selectedCity?: string;
  localMarketData?: MarketResearchData | null;
  marketResearchData?: MarketResearchData | null;
}

const MarketResearch: React.FC<MarketResearchProps> = ({
  selectedCategory,
  selectedCity = 'Mumbai',
  localMarketData,
  marketResearchData
}) => {
  const colors = getCategoryColors(selectedCategory || null);

  if (!marketResearchData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Generate a formulation first to see market research data.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white font-bold text-sm`}>
              📊
          </div>
          <div>
              <h3 className={`text-xl font-bold ${colors.text}`}>Market Research & Analysis</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive market insights for {selectedCategory} in {selectedCity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Size & Opportunity */}
        <div>
                      <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
            <span className="text-blue-600">📈</span>
          </div>
          <h4 className={`text-lg font-semibold ${colors.text}`}>Market Size & Opportunity</h4>
        </div>
        <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Local Market Size */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>
                  {selectedCity} Market
                </span>
                <span className="text-xs text-blue-600">📍</span>
              </div>
              <div className={`text-2xl font-bold ${colors.text}`}>
                {marketResearchData.tam.marketSize}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Total addressable market
              </p>
                    </div>
                    
            {/* Serviceable Addressable Market */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>
                  SAM
                </span>
                <span className="text-xs text-green-600">🎯</span>
              </div>
              <div className={`text-2xl font-bold ${colors.text}`}>
                {marketResearchData.sam.marketSize}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Serviceable addressable market
              </p>
            </div>

            {/* Target Market */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>
                  Target Market
                </span>
                <span className="text-xs text-purple-600">📊</span>
          </div>
              <div className={`text-2xl font-bold ${colors.text}`}>
                {marketResearchData.tm.marketSize}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Target market size
              </p>
                    </div>
                    
            {/* Target Users */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>
                  Target Users
                </span>
                <span className="text-xs text-orange-600">👥</span>
              </div>
              <div className={`text-sm font-bold ${colors.text}`}>
                {marketResearchData.tm.targetUsers}
                  </div>
              <p className="text-xs text-gray-600 mt-1">
                Primary audience
                    </p>
                  </div>
                </div>
              </div>
            </div>

      {/* Target Demographics */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
              <span className="text-indigo-600">👥</span>
            </div>
          <h4 className={`text-lg font-semibold ${colors.text}`}>Target Demographics</h4>
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
                          : 'Beauty-conscious women aged 18-45, with household income ₹8-20 lakhs annually'
                        }
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium ${colors.text} text-sm`}>Psychographics:</span>
                      <p className={`${colors.text} text-sm mt-1`}>
                        {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Pet humanization trend followers, health-conscious, premium product seekers, social media active'
                          : 'Beauty and skincare enthusiasts, premium product seekers, social media active, trend followers'
                        }
                      </p>
                  </div>
                </div>
              </div>
            </div>
                  </div>
                </div>
              </div>

      {/* Competitive Landscape */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
            <span className="text-red-600">⚔️</span>
          </div>
          <h4 className={`text-lg font-semibold ${colors.text}`}>Competitive Landscape</h4>
        </div>
        <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-6`}>
          <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Market Position */}
              <div className="space-y-2">
                <h6 className={`font-medium ${colors.text} text-xs`}>Market Position</h6>
                <p className={`${colors.text} text-xs leading-relaxed opacity-80`}>
                        {selectedCategory?.toLowerCase() === 'pet food'
                    ? 'Established players dominate with premium positioning opportunities'
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
                    : 'Highlight premium ingredients and proven results'
                        }
                      </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Customer Insights */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-xs font-bold`}>
              <span className="text-purple-600">💰</span>
            </div>
          <h4 className={`text-lg font-semibold ${colors.text}`}>Customer Insights & Purchase Behavior</h4>
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
                          : '₹3,500 - ₹6,000'
                          }
                        </p>
                      </div>
                      <div>
                        <span className={`font-medium ${colors.text}`}>Purchase Frequency:</span>
                      <p className={`${colors.text} font-bold`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                            ? 'Monthly'
                          : 'Quarterly'
                          }
                        </p>
                      </div>
                      <div>
                      <span className={`font-medium ${colors.text}`}>Customer Profile:</span>
                        <p className={`${colors.text} font-bold`}>
                          {selectedCategory?.toLowerCase() === 'pet food'
                          ? 'Premium pet parents'
                          : 'Beauty enthusiasts'
                          }
                        </p>
                    </div>
                  </div>
                </div>
              </div>
                  </div>
                  </div>
                </div>
              </div>

      {/* Summary & Recommendations */}
      <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-6`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white text-xs font-bold`}>
            💡
          </div>
          <h4 className={`text-lg font-semibold ${colors.text}`}>Key Insights & Strategic Recommendations</h4>
        </div>

              <div className="space-y-4">
          <div className={`bg-white border ${colors.border} rounded-lg p-4`}>
            <h5 className={`font-semibold ${colors.text} mb-3`}>Market Entry Strategy</h5>
            <p className={`${colors.text} text-sm leading-relaxed`}>
              Based on our analysis of the {selectedCategory} market in {selectedCity}, we recommend focusing on 
                        {selectedCategory?.toLowerCase() === 'pet food' 
                ? ' premium positioning with transparent ingredient sourcing and scientific formulation to capture the growing pet humanization trend.'
                : ' premium beauty positioning with clinically-proven ingredients and targeted social media marketing to beauty-conscious consumers.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketResearch;