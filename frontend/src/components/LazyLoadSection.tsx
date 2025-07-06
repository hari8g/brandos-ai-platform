import React, { useState } from 'react';

interface LazyLoadSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  colors: any;
  loadingComponent?: React.ReactNode;
}

const LazyLoadSection: React.FC<LazyLoadSectionProps> = ({
  title,
  children,
  isOpen = false,
  onToggle,
  colors,
  loadingComponent
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isOpen);

  const handleToggle = () => {
    if (!isLoaded) {
      setIsLoaded(true);
    }
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={handleToggle}
        className={`w-full px-6 py-4 text-left font-semibold ${colors.text} bg-gradient-to-r ${colors.cardBg} border-b border-gray-200 hover:${colors.lightBg} transition-colors duration-200 flex items-center justify-between`}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="p-6">
          {isLoaded ? (
            children
          ) : (
            loadingComponent || (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading detailed analysis...</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default LazyLoadSection; 