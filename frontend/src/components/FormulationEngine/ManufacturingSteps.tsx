import React from 'react';
import { getCategoryColors } from '@/lib/colorUtils';

interface ManufacturingStepsProps {
  steps: string[];
  selectedCategory?: string | null;
}

const ManufacturingSteps: React.FC<ManufacturingStepsProps> = ({ steps, selectedCategory }) => {
  const colors = getCategoryColors(selectedCategory || null);

  return (
    <div className="space-y-6">
      {/* Header with Progress Overview */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-white font-bold text-lg`}>
            ⚙️
          </div>
          <div>
            <h3 className={`text-lg font-bold ${colors.text}`}>Manufacturing Process</h3>
            <p className={`text-sm ${colors.text} opacity-70`}>
              {steps.length} sequential steps for production
            </p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < steps.length ? colors.icon : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className={`text-xs font-medium ${colors.text} opacity-70`}>
            {steps.length} steps
          </span>
        </div>
      </div>

      {/* Manufacturing Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`relative group transition-all duration-300 hover:scale-[1.02]`}
          >
            {/* Step Container */}
            <div className={`
              relative overflow-hidden rounded-xl border transition-all duration-300
              ${colors.border} ${colors.cardBg}
              hover:shadow-lg hover:shadow-blue-500/10
              group-hover:border-blue-300
            `}>
              
              {/* Gradient overlay on hover */}
              <div className={`
                absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/30 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
              `}></div>
              
              {/* Content */}
              <div className="relative p-6">
                <div className="flex items-start space-x-4">
                  {/* Step Number Circle */}
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${colors.bg} text-white font-bold text-lg
                    group-hover:scale-110 transition-transform duration-300
                    shadow-lg
                  `}>
                    {index + 1}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    {/* Step Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${colors.text} text-base`}>
                        Step {index + 1}
                      </h4>
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${colors.lightBg} ${colors.text}
                        group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors duration-300
                      `}>
                        {index === 0 ? 'Preparation' : 
                         index === steps.length - 1 ? 'Final' : 
                         'Process'}
                      </div>
                    </div>
                    
                    {/* Step Description */}
                    <p className={`${colors.text} text-sm leading-relaxed`}>
                      {step}
                    </p>
                    
                    {/* Step Progress Indicator */}
                    <div className="mt-3 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-500 ${colors.bg}`}
                          style={{ width: `${((index + 1) / steps.length) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${colors.text} opacity-70`}>
                        {Math.round(((index + 1) / steps.length) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Step Status */}
                <div className="mt-4 flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${colors.icon}`}></div>
                    <span className={`text-xs ${colors.text} opacity-70`}>
                      {index === 0 ? 'Ready to start' : 
                       index === steps.length - 1 ? 'Final step' : 
                       'In sequence'}
                    </span>
                  </div>
                  
                  {/* Estimated Time */}
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-xs ${colors.text} opacity-70`}>
                      {index === 0 ? '5-10 min' : 
                       index === steps.length - 1 ? '10-15 min' : 
                       '15-30 min'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Connection Line (except for last step) */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-blue-400 to-transparent opacity-50"></div>
            )}
          </div>
        ))}
      </div>

      {/* Manufacturing Summary */}
      <div className={`mt-8 p-4 ${colors.lightBg} border ${colors.border} rounded-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-semibold ${colors.text} text-sm mb-1`}>
              Manufacturing Summary
            </h4>
            <p className={`text-xs ${colors.text} opacity-70`}>
              Total estimated time: {Math.round(steps.length * 20)}-{Math.round(steps.length * 30)} minutes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${colors.icon}`}></div>
            <span className={`text-xs font-medium ${colors.text}`}>
              {steps.length} steps completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingSteps; 