import React from 'react';

export interface Suggestion {
  prompt: string;
  why: string;
  how: string;
}

interface Props {
  suggestion: Suggestion;
  onUse: (prompt: string) => void;
  index: number;
}

export default function SuggestionCard({ suggestion, onUse, index }: Props) {
  return (
    <div className="transition-shadow duration-200 border border-gray-200 rounded-2xl p-6 mb-6 bg-white shadow-sm hover:shadow-xl focus-within:shadow-xl group">
      <h4 className="text-lg font-bold text-purple-700 mb-2">Suggestion {index + 1}</h4>
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl text-base font-sans text-indigo-700 whitespace-pre-wrap mb-4 border border-indigo-100 group-hover:border-indigo-300 transition-colors duration-200">
        {suggestion.prompt}
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-3">
        <details className="w-full bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <summary className="font-semibold text-indigo-700 cursor-pointer">Why?</summary>
          <p className="mt-2 text-gray-700 text-sm">{suggestion.why}</p>
        </details>
        <details className="w-full bg-purple-50 rounded-lg p-3 border border-purple-100">
          <summary className="font-semibold text-purple-700 cursor-pointer">How?</summary>
          <p className="mt-2 text-gray-700 text-sm">{suggestion.how}</p>
        </details>
      </div>
      <button
        className="mt-2 w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-all duration-200"
        onClick={() => onUse(suggestion.prompt)}
      >
        <span className="inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Use this prompt
        </span>
      </button>
    </div>
  );
}
