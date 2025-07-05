import React from 'react';
import { getCategoryColors } from '@/lib/colorUtils';

interface MarketResearchProps {
  tam: string;
  sam: string;
  som: string;
  marketSize: string;
  growthRate: string;
  keyTrends: string[];
  competitiveLandscape: string[];
  selectedCategory?: string | null;
}

const MarketResearch: React.FC<MarketResearchProps> = ({
  tam,
  sam,
  som,
  marketSize,
  growthRate,
  keyTrends,
  competitiveLandscape,
  selectedCategory,
}) => {
  const colors = getCategoryColors(selectedCategory || null);

  return (
    <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
      <div className="space-y-6">
        {/* Market Size Analysis */}
        <div>
          <h4 className={`text-md font-semibold ${colors.text} mb-3 flex items-center`}>
            <span className="mr-2">📊</span>
            Market Size Analysis
          </h4>
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`border ${colors.border} rounded-lg p-3`}>
                <div className={`text-sm font-semibold ${colors.text} mb-1`}>TAM (Total Addressable Market)</div>
                <div className="text-gray-700 text-sm">{tam}</div>
              </div>
              <div className={`border ${colors.border} rounded-lg p-3`}>
                <div className={`text-sm font-semibold ${colors.text} mb-1`}>SAM (Serviceable Addressable Market)</div>
                <div className="text-gray-700 text-sm">{sam}</div>
              </div>
              <div className={`border ${colors.border} rounded-lg p-3`}>
                <div className={`text-sm font-semibold ${colors.text} mb-1`}>SOM (Serviceable Obtainable Market)</div>
                <div className="text-gray-700 text-sm">{som}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Metrics */}
        <div>
          <h4 className={`text-md font-semibold ${colors.text} mb-3 flex items-center`}>
            <span className="mr-2">📈</span>
            Market Metrics & Growth
          </h4>
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border ${colors.border} rounded-lg p-3`}>
                <div className={`text-sm font-semibold ${colors.text} mb-1`}>Current Market Size</div>
                <div className="text-gray-700 text-sm">{marketSize}</div>
              </div>
              <div className={`border ${colors.border} rounded-lg p-3`}>
                <div className={`text-sm font-semibold ${colors.text} mb-1`}>Growth Rate</div>
                <div className="text-gray-700 text-sm">{growthRate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Market Trends */}
        {keyTrends && keyTrends.length > 0 && (
          <div>
            <h4 className={`text-md font-semibold ${colors.text} mb-3 flex items-center`}>
              <span className="mr-2">🔍</span>
              Key Market Trends
            </h4>
            <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
              <div className="space-y-3">
                {keyTrends.map((trend, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className={`${colors.icon} mt-1 flex-shrink-0`}>•</span>
                    <div className="flex-1">
                      <div className="text-gray-700 text-sm leading-relaxed">{trend}</div>
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
            <h4 className={`text-md font-semibold ${colors.text} mb-3 flex items-center`}>
              <span className="mr-2">🏢</span>
              Competitive Landscape
            </h4>
            <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
              <div className="space-y-3">
                {competitiveLandscape.map((competitor, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className={`${colors.icon} mt-1 flex-shrink-0`}>•</span>
                    <div className="flex-1">
                      <div className="text-gray-700 text-sm leading-relaxed">{competitor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Market Opportunity Summary */}
        <div>
          <h4 className={`text-md font-semibold ${colors.text} mb-3 flex items-center`}>
            <span className="mr-2">🎯</span>
            Market Opportunity Summary
          </h4>
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
            <div className="space-y-3">
              <div className="text-gray-700 text-sm leading-relaxed">
                <strong className={`${colors.text}`}>Market Potential:</strong>
                <p className="mt-1">
                  Based on the TAM, SAM, and SOM analysis, this market presents significant opportunities for growth and market penetration.
                </p>
              </div>
              
              <div className={`border-t ${colors.border} pt-3`}>
                <strong className={`${colors.text}`}>Key Opportunities:</strong>
                <ul className="mt-1 space-y-1 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className="text-gray-700">Growing market demand with positive growth trajectory</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className="text-gray-700">Opportunity to capture market share through innovation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className="text-gray-700">Potential for premium positioning and pricing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className="text-gray-700">Room for differentiation in competitive landscape</span>
                  </li>
                </ul>
              </div>
              
              <div className={`border-t ${colors.border} pt-3`}>
                <strong className={`${colors.text}`}>Strategic Recommendations:</strong>
                <ul className="mt-1 space-y-1 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className="text-gray-700">Focus on underserved market segments</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className="text-gray-700">Leverage emerging trends for competitive advantage</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className="text-gray-700">Build strong brand positioning and differentiation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketResearch; 