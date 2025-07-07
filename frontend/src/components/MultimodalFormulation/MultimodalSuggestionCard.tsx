import React from 'react';
import { getCategoryColors, type CategoryColors } from '@/lib/colorUtils';

export interface MultimodalSuggestion {
  prompt: string;
  why: string;
  how: string;
}

interface Props {
  suggestion: MultimodalSuggestion;
  onUse: (suggestion: MultimodalSuggestion) => void;
  index: number;
  selectedCategory?: string | null;
}

export default function MultimodalSuggestionCard({ suggestion, onUse, index, selectedCategory }: Props) {
  const colors = getCategoryColors(selectedCategory || null);

  return (
    <div className={`transition-all duration-300 border ${colors.border} rounded-2xl p-6 mb-6 bg-white shadow-sm hover:shadow-xl focus-within:shadow-xl group hover:scale-[1.02]`}>
      <h4 className={`text-lg font-bold ${colors.text} mb-2`}>Suggestion {index + 1}</h4>
      <div className={`${colors.cardBg} p-4 rounded-xl text-base font-sans ${colors.text} whitespace-pre-wrap mb-4 border ${colors.border} group-hover:border-${colors.primary}-300 transition-colors duration-200`}>
        {suggestion.prompt}
      </div>
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