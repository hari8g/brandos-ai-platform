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

interface AccordionSectionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  colors: any;
  badge?: string;
  badgeColor?: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  colors,
  badge,
  badgeColor = 'bg-blue-100 text-blue-800'
}) => {
  return (
    <div className={`${colors.cardBg} border ${colors.border} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}>
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between ${colors.lightBg} hover:${colors.lightBg} transition-colors duration-200`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg ${colors.primary} flex items-center justify-center`}>
            <span className="text-white text-lg">{icon}</span>
          </div>
          <div className="text-left">
            <h3 className={`text-lg font-semibold ${colors.text}`}>{title}</h3>
            {badge && (
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${badgeColor} mt-1`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6 pt-2 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['formulation', 'psychology']));
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl ${colors.primary} flex items-center justify-center`}>
            <span className="text-white text-xl">🧪</span>
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${colors.text}`}>Scientific Analysis</h2>
            <p className={`text-sm ${colors.text} opacity-60`}>Comprehensive formulation insights</p>
          </div>
        </div>
      </div>

      {/* Formulation Components */}
      <AccordionSection
        title="Formulation Components"
        icon="⚗️"
        isOpen={expandedSections.has('formulation')}
        onToggle={() => toggleSection('formulation')}
        colors={colors}
        badge={`${keyComponents.length} components`}
        badgeColor="bg-green-100 text-green-800"
      >
        <div className="space-y-4">
          {keyComponents.map((component, index) => (
            <div key={index} className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full ${colors.primary} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${colors.text} text-base mb-2`}>
                    {component.name}
                  </h4>
                  <p className={`${colors.text} text-sm leading-relaxed`}>
                    {component.why}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* Psychology & Motivation */}
      <AccordionSection
        title="Psychology & Motivation"
        icon="🧠"
        isOpen={expandedSections.has('psychology')}
        onToggle={() => toggleSection('psychology')}
        colors={colors}
        badge="Consumer insights"
        badgeColor="bg-purple-100 text-purple-800"
      >
        <div className="space-y-4">
          <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
            <h4 className={`font-semibold ${colors.text} text-base mb-2`}>Primary Desire</h4>
            <p className={`${colors.text} text-sm leading-relaxed`}>{impliedDesire}</p>
          </div>
          
          {psychologicalDrivers && psychologicalDrivers.length > 0 && (
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <h4 className={`font-semibold ${colors.text} text-base mb-2`}>Psychological Drivers</h4>
              <ul className="space-y-2">
                {psychologicalDrivers.map((driver, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1 text-sm`}>•</span>
                    <span className={`${colors.text} text-sm`}>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {valueProposition && valueProposition.length > 0 && (
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <h4 className={`font-semibold ${colors.text} text-base mb-2`}>Value Proposition</h4>
              <ul className="space-y-2">
                {valueProposition.map((proposition, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1 text-sm`}>•</span>
                    <span className={`${colors.text} text-sm`}>{proposition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Target Audience */}
      <AccordionSection
        title="Target Audience"
        icon="👥"
        isOpen={expandedSections.has('audience')}
        onToggle={() => toggleSection('audience')}
        colors={colors}
        badge="Persona analysis"
        badgeColor="bg-blue-100 text-blue-800"
      >
        <div className="space-y-4">
          <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
            <h4 className={`font-semibold ${colors.text} text-base mb-2`}>Primary Audience</h4>
            <p className={`${colors.text} text-sm leading-relaxed`}>{targetAudience}</p>
          </div>
          
          {demographicBreakdown && (
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <h4 className={`font-semibold ${colors.text} text-base mb-2`}>Demographic Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className={`text-xs font-medium ${colors.text} opacity-70`}>Age Range</span>
                  <p className={`${colors.text} text-sm`}>{demographicBreakdown.age_range}</p>
                </div>
                <div className="space-y-1">
                  <span className={`text-xs font-medium ${colors.text} opacity-70`}>Income Level</span>
                  <p className={`${colors.text} text-sm`}>{demographicBreakdown.income_level}</p>
                </div>
                <div className="space-y-1">
                  <span className={`text-xs font-medium ${colors.text} opacity-70`}>Lifestyle</span>
                  <p className={`${colors.text} text-sm`}>{demographicBreakdown.lifestyle}</p>
                </div>
                <div className="space-y-1">
                  <span className={`text-xs font-medium ${colors.text} opacity-70`}>Purchase Behavior</span>
                  <p className={`${colors.text} text-sm`}>{demographicBreakdown.purchase_behavior}</p>
                </div>
              </div>
            </div>
          )}
          
          {psychographicProfile && (
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <h4 className={`font-semibold ${colors.text} text-base mb-2`}>Psychographic Profile</h4>
              <div className="space-y-3">
                <div>
                  <span className={`text-xs font-medium ${colors.text} opacity-70`}>Values</span>
                  <ul className="mt-1 space-y-1">
                    {psychographicProfile.values.map((value, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className={`${colors.icon} mt-1 text-xs`}>•</span>
                        <span className={`${colors.text} text-sm`}>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Market Trends */}
      {indiaTrends && indiaTrends.length > 0 && (
        <AccordionSection
          title="Market Trends"
          icon="📈"
          isOpen={expandedSections.has('trends')}
          onToggle={() => toggleSection('trends')}
          colors={colors}
          badge={`${indiaTrends.length} trends`}
          badgeColor="bg-orange-100 text-orange-800"
        >
          <div className="space-y-3">
            {indiaTrends.map((trend, index) => (
              <div key={index} className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full ${colors.primary} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className={`${colors.text} text-sm leading-relaxed`}>{trend}</p>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Regulatory Standards */}
      {regulatoryStandards && regulatoryStandards.length > 0 && (
        <AccordionSection
          title="Regulatory Compliance"
          icon="📋"
          isOpen={expandedSections.has('compliance')}
          onToggle={() => toggleSection('compliance')}
          colors={colors}
          badge={`${regulatoryStandards.length} standards`}
          badgeColor="bg-red-100 text-red-800"
        >
          <div className="space-y-3">
            {regulatoryStandards.map((standard, index) => (
              <div key={index} className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full ${colors.primary} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className={`${colors.text} text-sm leading-relaxed`}>{standard}</p>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}
    </div>
  );
};

export default ScientificReasoning;