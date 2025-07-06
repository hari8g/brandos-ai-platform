import React, { useState, useEffect } from 'react';
import { getCategoryColors } from '@/lib/colorUtils';
import { useScientificReasoning } from '@/hooks/useScientificReasoning';
import type { ScientificReasoningRequest } from '@/hooks/useScientificReasoning';

interface ScientificReasoningProps {
  selectedCategory?: string | null;
  productDescription?: string;
  targetConcerns?: string[];
  // New props for passing data directly
  keyComponents?: Array<{ name: string; why: string }>;
  impliedDesire?: string;
  psychologicalDrivers?: string[];
  valueProposition?: string[];
  targetAudience?: string;
  indiaTrends?: string[];
  regulatoryStandards?: string[];
  demographicBreakdown?: {
    age_range: string;
    income_level: string;
    lifestyle: string;
    purchase_behavior: string;
  };
  psychographicProfile?: {
    values: string[];
    preferences: string[];
    motivations: string[];
  };
}

const ScientificReasoning: React.FC<ScientificReasoningProps> = ({
  selectedCategory,
  productDescription,
  targetConcerns,
  // Direct data props
  keyComponents: propKeyComponents,
  impliedDesire: propImpliedDesire,
  psychologicalDrivers: propPsychologicalDrivers,
  valueProposition: propValueProposition,
  targetAudience: propTargetAudience,
  indiaTrends: propIndiaTrends,
  regulatoryStandards: propRegulatoryStandards,
  demographicBreakdown: propDemographicBreakdown,
  psychographicProfile: propPsychographicProfile,
}) => {
  const colors = getCategoryColors(selectedCategory || null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['components']));
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredComponent, setHoveredComponent] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set());
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Check if we have direct data props
  const hasDirectData = propKeyComponents && propImpliedDesire;

  // Only make API call if we don't have direct data
  const request: ScientificReasoningRequest = {
    category: selectedCategory || undefined,
    product_description: productDescription,
    target_concerns: targetConcerns,
  };

  // Use the scientific reasoning hook only if we don't have direct data
  const { data: apiData, loading, error } = useScientificReasoning(hasDirectData ? null : request);

  // Use direct props if available, otherwise use API data
  const data = hasDirectData ? {
    keyComponents: propKeyComponents,
    impliedDesire: propImpliedDesire,
    psychologicalDrivers: propPsychologicalDrivers || [],
    valueProposition: propValueProposition || [],
    targetAudience: propTargetAudience || '',
    indiaTrends: propIndiaTrends || [],
    regulatoryStandards: propRegulatoryStandards || [],
    demographicBreakdown: propDemographicBreakdown,
    psychographicProfile: propPsychographicProfile,
  } : apiData;

  useEffect(() => {
    // Simulate analysis progress
    const timer = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // Update analysis progress based on loading state or direct data availability
  useEffect(() => {
    if (hasDirectData || (!loading && data)) {
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    }
  }, [loading, data, hasDirectData]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleDetails = (id: string) => {
    const newDetails = new Set(showDetails);
    if (newDetails.has(id)) {
      newDetails.delete(id);
    } else {
      newDetails.add(id);
    }
    setShowDetails(newDetails);
  };

  const getConfidenceScore = (component: { name: string; why: string }) => {
    // Calculate confidence based on explanation length and keywords
    const keywords = ['clinical', 'proven', 'effective', 'scientific', 'research', 'study'];
    const keywordCount = keywords.filter(keyword => 
      component.why.toLowerCase().includes(keyword)
    ).length;
    const lengthScore = Math.min(component.why.length / 100, 1);
    return Math.min((keywordCount * 0.2 + lengthScore * 0.8) * 100, 100);
  };

  const getTrendImpact = (trend: string) => {
    const impactKeywords = ['growing', 'increasing', 'rising', 'surge', 'boom'];
    const hasImpact = impactKeywords.some(keyword => trend.toLowerCase().includes(keyword));
    return hasImpact ? 'high' : 'medium';
  };

  const getComponentCategory = (component: { name: string; why: string }) => {
    const categories = {
      'Active': ['peptide', 'retinol', 'vitamin', 'acid'],
      'Emollient': ['oil', 'butter', 'wax', 'fatty'],
      'Preservative': ['preservative', 'antimicrobial', 'stabilizer'],
      'Emulsifier': ['emulsifier', 'surfactant', 'thickener'],
      'Fragrance': ['fragrance', 'essential', 'aroma']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => component.name.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return 'Other';
  };

  // Show loading state only if we're making an API call and don't have direct data
  if (!hasDirectData && (loading || !data)) {
    return (
      <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-8 shadow-sm`}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">🧪</span>
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${colors.text} tracking-tight`}>
                    Scientific Analysis
                  </h2>
                  <p className={`text-sm ${colors.text} opacity-60 mt-1`}>
                    AI-powered formulation insights
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">Analyzing</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${colors.text}`}>
                Analysis Progress
              </span>
              <span className={`text-sm font-medium ${colors.text}`}>
                {Math.round(analysisProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${analysisProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
              </div>
            </div>
            <p className={`text-sm ${colors.text} opacity-60`}>
              <span>Processing scientific data<span className="loading-dots"></span></span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state only if we're making an API call
  if (!hasDirectData && error) {
    return (
      <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-8 shadow-sm`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>
            Analysis Error
          </h2>
          <p className={`text-sm ${colors.text} opacity-60`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // If we don't have any data, show a message
  if (!data) {
    return (
      <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-8 shadow-sm`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>
            No Scientific Data Available
          </h2>
          <p className={`text-sm ${colors.text} opacity-60`}>
            Scientific reasoning data is not available for this formulation.
          </p>
        </div>
      </div>
    );
  }

  // Extract data from the response
  const {
    keyComponents,
    impliedDesire,
    psychologicalDrivers,
    valueProposition,
    targetAudience,
    indiaTrends,
    regulatoryStandards,
    demographicBreakdown,
    psychographicProfile
  } = data;

  return (
    <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
      <div className="space-y-6">
        {/* What It Delivers - Enhanced Functional Attributes */}
        <div>
          <h4 className={`text-lg font-semibold ${colors.text} mb-3 flex items-center`}>
            <span className="mr-2"></span>
            What did we formulate with ?
          </h4>
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
            <div className="space-y-3">
              {keyComponents.map((component, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <span className={`${colors.icon} mt-1 flex-shrink-0`}>•</span>
                    <div className="flex-1">
                      <div className={`font-semibold ${colors.text} text-base mb-1`}>
                        {component.name}
                      </div>
                      <div className={`${colors.text} text-sm leading-relaxed`}>
                        {component.why}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What It Implies - Enhanced Desire Analysis */}
        <div>
          <h4 className={`text-lg font-semibold ${colors.text} mb-3 flex items-center`}>
            <span className="mr-2"></span>
            Why we think the customer will buy this Product ?
          </h4>
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
            <div className="space-y-3">
              <div className={`${colors.text} leading-relaxed`}>
                <strong className="text-base">Primary Desire:</strong>
                <p className="mt-1 text-sm">{impliedDesire}</p>
              </div>
              
              {psychologicalDrivers && psychologicalDrivers.length > 0 && (
                <div className={`border-t ${colors.border} pt-3`}>
                  <strong className={`${colors.text} text-base`}>Psychological Drivers:</strong>
                  <ul className="mt-1 space-y-1 text-sm">
                    {psychologicalDrivers.map((driver, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className={`${colors.icon} mt-1`}>•</span>
                        <span className={`${colors.text}`}>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {valueProposition && valueProposition.length > 0 && (
                <div className={`border-t ${colors.border} pt-3`}>
                  <strong className={`${colors.text} text-base`}>Value Proposition:</strong>
                  <ul className="mt-1 space-y-1 text-sm">
                    {valueProposition.map((proposition, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className={`${colors.icon} mt-1`}>•</span>
                        <span className={`${colors.text}`}>{proposition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Who It's For - Detailed Target Analysis */}
        <div>
          <h4 className={`text-lg font-semibold ${colors.text} mb-3 flex items-center`}>
            <span className="mr-2"></span>
            Who could be our Ideal customer Persona?
          </h4>
          <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
            <div className="space-y-3">
              <div className={`${colors.text} leading-relaxed`}>
                <strong className="text-base">Primary Audience:</strong>
                <p className="mt-1 text-sm">{targetAudience}</p>
              </div>
              
              {demographicBreakdown && (
                <div className={`border-t ${colors.border} pt-3`}>
                  <strong className={`${colors.text} text-base`}>Demographic Breakdown:</strong>
                  <ul className="mt-1 space-y-1 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className={`${colors.icon} mt-1`}>•</span>
                      <span className={`${colors.text}`}><strong>Age Range:</strong> {demographicBreakdown.age_range}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className={`${colors.icon} mt-1`}>•</span>
                      <span className={`${colors.text}`}><strong>Income Level:</strong> {demographicBreakdown.income_level}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className={`${colors.icon} mt-1`}>•</span>
                      <span className={`${colors.text}`}><strong>Lifestyle:</strong> {demographicBreakdown.lifestyle}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className={`${colors.icon} mt-1`}>•</span>
                      <span className={`${colors.text}`}><strong>Purchase Behavior:</strong> {demographicBreakdown.purchase_behavior}</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {psychographicProfile && (
                <div className={`border-t ${colors.border} pt-3`}>
                  <strong className={`${colors.text} text-base`}>Psychographic Profile:</strong>
                  <ul className="mt-1 space-y-1 text-sm">
                    {psychographicProfile.values.map((value, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className={`${colors.icon} mt-1`}>•</span>
                        <span className={`${colors.text}`}>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Indian Market Trends - Using Real Backend Data */}
        {indiaTrends && indiaTrends.length > 0 && (
          <div>
            <h4 className={`text-lg font-semibold ${colors.text} mb-3 flex items-center`}>
              <span className="mr-2"></span>
              What do we see as a trend nowadays ?
            </h4>
            <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
              <div className="space-y-4">
                {indiaTrends.map((trend, index) => (
                  <div key={index} className={`border-b ${colors.border} pb-3 last:border-b-0`}>
                    <div className="flex items-start space-x-3">
                      <span className={`${colors.icon} mt-1 flex-shrink-0`}>•</span>
                      <div className="flex-1">
                        <div className={`${colors.text} text-sm leading-relaxed`}>{trend}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Regulatory & Compliance - Using Real Backend Data */}
        {regulatoryStandards && regulatoryStandards.length > 0 && (
          <div>
            <h4 className={`text-lg font-semibold ${colors.text} mb-3 flex items-center`}>
              <span className="mr-2"></span>
              What should we comply with ?
            </h4>
            <div className={`bg-white/70 border ${colors.border} rounded-lg p-3`}>
              <div className="space-y-3">
                {regulatoryStandards.map((standard, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className={`${colors.icon} mt-1 flex-shrink-0`}>•</span>
                    <div className="flex-1">
                      <div className={`${colors.text} text-sm leading-relaxed`}>{standard}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScientificReasoning;