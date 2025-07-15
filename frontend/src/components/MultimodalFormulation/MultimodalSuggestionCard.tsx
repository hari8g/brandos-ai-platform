import React from 'react';
import { getCategoryColors, type CategoryColors } from '@/lib/colorUtils';

export interface MultimodalSuggestion {
  prompt: string;
  why: string;
  how: string;
  score?: number;
  manufacturing_ease?: string;
  indian_market_trends?: string;
  efficacy_performance?: string;
  shelf_life?: string;
}

interface Props {
  suggestion: MultimodalSuggestion;
  onUse: (suggestion: MultimodalSuggestion) => void;
  index: number;
  selectedCategory?: string | null;
}

export default function MultimodalSuggestionCard({ suggestion, onUse, index, selectedCategory }: Props) {
  const colors = getCategoryColors(selectedCategory || null);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const isTopSuggestion = index === 0 && suggestion.score && suggestion.score >= 8;

  return (
    <div className={`transition-all duration-300 border ${isTopSuggestion ? 'border-2 border-yellow-400' : colors.border} rounded-2xl p-6 mb-6 ${isTopSuggestion ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-white'} shadow-sm hover:shadow-xl focus-within:shadow-xl group hover:scale-[1.02] relative`}>
      {/* Top Rated Badge */}
      {isTopSuggestion && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
          🏆 TOP RATED
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-lg font-bold ${colors.text}`}>Multimodal Suggestion {index + 1}</h4>
        {suggestion.score && (
          <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColor(suggestion.score)}`}>
            Score: {suggestion.score.toFixed(1)}
          </div>
        )}
      </div>

      <div className={`${colors.cardBg} p-4 rounded-xl text-base font-sans ${colors.text} whitespace-pre-wrap mb-4 border ${colors.border} group-hover:border-${colors.primary}-300 transition-colors duration-200`}>
        {suggestion.prompt}
      </div>

      {/* Assessment Grid */}
      {suggestion.manufacturing_ease && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className={`${colors.lightBg} rounded-lg p-3 border ${colors.border}`}>
            <h5 className={`font-semibold ${colors.text} text-sm mb-2`}>🏭 Manufacturing Ease</h5>
            <p className="text-gray-700 text-xs">{suggestion.manufacturing_ease}</p>
          </div>
          <div className={`${colors.lightBg} rounded-lg p-3 border ${colors.border}`}>
            <h5 className={`font-semibold ${colors.text} text-sm mb-2`}>📈 Indian Market Trends</h5>
            <p className="text-gray-700 text-xs">{suggestion.indian_market_trends}</p>
          </div>
          <div className={`${colors.lightBg} rounded-lg p-3 border ${colors.border}`}>
            <h5 className={`font-semibold ${colors.text} text-sm mb-2`}>⚡ Efficacy Performance</h5>
            <p className="text-gray-700 text-xs">{suggestion.efficacy_performance}</p>
          </div>
          <div className={`${colors.lightBg} rounded-lg p-3 border ${colors.border}`}>
            <h5 className={`font-semibold ${colors.text} text-sm mb-2`}>📦 Shelf Life</h5>
            <p className="text-gray-700 text-xs">{suggestion.shelf_life}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-3">
        <details className={`w-full ${colors.lightBg} rounded-lg p-3 border ${colors.border}`}>
          <summary className={`font-semibold ${colors.text} cursor-pointer`}>Why?</summary>
          <p className="mt-2 text-gray-700 text-sm">{suggestion.why}</p>
        </details>
        <details className={`w-full ${colors.lightBg} rounded-lg p-3 border ${colors.border}`}>
          <summary className={`font-semibold ${colors.text} cursor-pointer`}>How?</summary>
          <p className="mt-2 text-gray-700 text-sm">{suggestion.how}</p>
        </details>
      </div>
      <button
        className={`mt-2 w-full py-3 px-6 bg-gradient-to-r ${colors.buttonGradient} text-white rounded-xl font-semibold shadow-md hover:${colors.buttonHoverGradient} focus:outline-none focus:ring-2 focus:ring-${colors.primary}-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105`}
        onClick={() => onUse(suggestion)}
      >
        <span className="inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Use this prompt
        </span>
      </button>
    </div>
  );
} 