import React from 'react';
import { getCategoryColors } from '@/lib/colorUtils';

interface ScientificReasoningProps {
  keyComponents: { name: string; why: string }[];
  impliedDesire: string;
  psychologicalDrivers: string[];
  valueProposition: string[];
  targetAudience: string;
  indiaTrends: string[];
  regulatoryStandards: string[];
  selectedCategory?: string | null;
}

const ScientificReasoning: React.FC<ScientificReasoningProps> = ({
  keyComponents,
  impliedDesire,
  psychologicalDrivers,
  valueProposition,
  targetAudience,
  indiaTrends,
  regulatoryStandards,
  selectedCategory,
}) => {
  const colors = getCategoryColors(selectedCategory || null);



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
              
              <div className={`border-t ${colors.border} pt-3`}>
                <strong className={`${colors.text} text-base`}>Demographic Breakdown:</strong>
                <ul className="mt-1 space-y-1 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className={`${colors.text}`}><strong>Age Range:</strong> 25-45 years (primary), 18-55 years (secondary)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className={`${colors.text}`}><strong>Income Level:</strong> Middle to upper-middle class</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className={`${colors.text}`}><strong>Lifestyle:</strong> Health-conscious, value-driven consumers</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className={`${colors.text}`}><strong>Purchase Behavior:</strong> Research-oriented, quality-focused</span>
                  </li>
                </ul>
              </div>
              
              <div className={`border-t ${colors.border} pt-3`}>
                <strong className={`${colors.text} text-base`}>Psychographic Profile:</strong>
                <ul className="mt-1 space-y-1 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className={`${colors.text}`}>Values scientific evidence and clinical backing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className={`${colors.text}`}>Prefers clean, transparent ingredient lists</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className={`${colors.icon} mt-1`}>•</span>
                    <span className={`${colors.text}`}>Willing to pay premium for proven efficacy</span>
                  </li>
                </ul>
              </div>
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