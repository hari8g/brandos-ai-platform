import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import { categoryPrompts } from "@/utils/rotating-prompts";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/services/apiClient";
import { useSuggestions } from "@/hooks/useSuggestions";
import { GenerateResponse } from "@/types/formulation";

interface QueryQualityResponse {
  score: number;
  feedback: string;
  needs_improvement: boolean;
  suggestions: string[];
  improvement_examples: string[];
  missing_elements: string[];
  confidence_level: string;
  can_generate_formulation: boolean;
  formulation_warnings: string[];
}

interface Suggestion {
  text: string;
  why: string;
  how: string;
}

type Step = 'draft' | 'suggestions' | 'generate';

export default function PromptInput({
  onResult,
  selectedCategory,
}: {
  onResult: (data: GenerateResponse) => void;
  selectedCategory: string | null;
}) {
  const [prompt, setPrompt] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [loading, setLoading] = useState(false);
  const [queryQuality, setQueryQuality] = useState<QueryQualityResponse | null>(null);
  const [showQualityFeedback, setShowQualityFeedback] = useState(false);
  const [location, setLocation] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>('draft');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  
  // Suggestions hook
  const { loading: suggestionsLoading, error: suggestionsError, suggestions, generateSuggestions, clearSuggestions } = useSuggestions();

  const examplePrompts = [
    "A gentle foaming face wash for oily skin, fragrance-free",
    "High-protein vegan snack bar with added vitamins",
    "Grain-free dog food for sensitive stomachs, chicken flavor",
    "Anti-aging night cream with retinol and hyaluronic acid",
    "Low-calorie electrolyte drink for athletes"
  ];
  const [exampleIdx, setExampleIdx] = useState(0);
  const [fade, setFade] = useState(true);

  // Ensure we have a valid example to show
  const currentExample = examplePrompts[exampleIdx] || examplePrompts[0] || "A gentle foaming face wash for oily skin, fragrance-free";

  console.log('PromptInput rendered with example:', currentExample, 'fade:', fade);

  useEffect(() => {
    if (!selectedCategory) {
      setPlaceholder("Enter your product idea...");
      return;
    }
  
    const prompts = categoryPrompts[selectedCategory] || [];
    let current = 0;
    let switchingInterval: any;
    let isCancelled = false;
  
    const typePrompt = async (text: string) => {
      setPlaceholder(""); // clear before typing
      await new Promise((resolve) => setTimeout(resolve, 100)); // wait 100ms
  
      for (let i = 0; i < text.length; i++) {
        if (isCancelled) return;
        setPlaceholder((prev) => prev + text[i]);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    };
  
    const startTypingLoop = async () => {
      await typePrompt(prompts[current]);
      switchingInterval = setInterval(async () => {
        current = (current + 1) % prompts.length;
        await typePrompt(prompts[current]);
      }, 4000);
    };
  
    startTypingLoop();
  
    return () => {
      isCancelled = true;
      clearInterval(switchingInterval);
    };
  }, [selectedCategory]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setExampleIdx((prev) => (prev + 1) % examplePrompts.length);
        setFade(true);
        console.log('Dynamic prompt cycling to:', examplePrompts[(exampleIdx + 1) % examplePrompts.length]);
      }, 400); // fade out duration
    }, 3500);
    return () => clearInterval(interval);
  }, [examplePrompts.length, exampleIdx]);

  const assessQueryQuality = async (query: string): Promise<QueryQualityResponse> => {
    try {
      const response = await apiClient.post("/query/assess", {
        prompt: query,
        category: selectedCategory
      });
      
      const data = response.data;
      
      // Convert backend response to frontend format
      return {
        score: data.score || 1,
        feedback: data.feedback || "Unable to assess query quality",
        needs_improvement: !data.can_generate,
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
        improvement_examples: [],
        missing_elements: [],
        confidence_level: data.score > 0.7 ? "high" : data.score > 0.4 ? "medium" : "low",
        can_generate_formulation: data.can_generate || false,
        formulation_warnings: []
      };
    } catch (error) {
      console.error("Error in assessQueryQuality:", error);
      throw error;
    }
  };

  const generateFormulation = async (query: string): Promise<GenerateResponse> => {
    const response = await apiClient.post("/formulation/generate", {
      prompt: query,
      category: selectedCategory
    });
    
    return response.data;
  };

  const handleGetSuggestions = async () => {
    if (!prompt.trim()) return;
    
    const result = await generateSuggestions({
      prompt: prompt,
      category: selectedCategory || undefined
    });
    
    if (result) {
      setCurrentStep('suggestions');
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setCurrentStep('generate');
  };

  const handleGenerateFormulation = async () => {
    const finalPrompt = selectedSuggestion?.text || prompt;
    
    setLoading(true);
    setShowQualityFeedback(false);
    setQueryQuality(null);
    
    try {
      // Step 1: Assess query quality (for feedback purposes)
      console.log("🔍 Assessing query quality...");
      const qualityAssessment = await assessQueryQuality(finalPrompt);
      setQueryQuality(qualityAssessment);
      
      // Step 2: Generate formulation
      console.log("🚀 Generating formulation...");
      const formulationResponse = await generateFormulation(finalPrompt);
      
      // Pass the response directly to the parent component
      onResult(formulationResponse);
      
      // Step 3: Show quality feedback if query needs improvement
      if (qualityAssessment.needs_improvement) {
        setShowQualityFeedback(true);
      }
      
    } catch (err) {
      console.error("Error in handleGenerateFormulation:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      alert(`🚨 Failed to process your request: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDraft = () => {
    setCurrentStep('draft');
    setSelectedSuggestion(null);
    clearSuggestions();
  };

  const handleBackToSuggestions = () => {
    setCurrentStep('suggestions');
    setSelectedSuggestion(null);
  };

  // Step 1: Draft
  if (currentStep === 'draft') {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <label htmlFor="prompt" className="block text-lg font-medium text-gray-700 mb-2">
            Describe your product idea
          </label>
          {/* Dynamic Example Prompt */}
          <div className={`h-8 mb-3 text-gray-500 text-sm font-medium transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
            aria-live="polite">
            <span className="inline-flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="italic">e.g. {currentExample}</span>
            </span>
          </div>
          <div className="relative">
            <textarea
              className="w-full h-32 p-4 text-md rounded-xl border-2 border-gray-200 bg-white/90 placeholder-gray-400
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200
                         resize-none"
              placeholder={placeholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={5000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {prompt.length}/5000
            </div>
          </div>
        </div>

        {/* Location Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Manufacturing Location (optional)
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-lg border border-gray-200 bg-white/90 placeholder-gray-400
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200"
            placeholder="e.g. Mumbai, Bangalore, Delhi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Get Suggestions Button */}
        <button
          onClick={handleGetSuggestions}
          disabled={suggestionsLoading || !prompt.trim()}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform
                     ${suggestionsLoading || !prompt.trim() 
                       ? 'bg-gray-300 cursor-not-allowed' 
                       : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                     }`}
        >
          {suggestionsLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Suggestions...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Get AI Suggestions</span>
            </div>
          )}
        </button>

        {suggestionsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{suggestionsError}</p>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Suggestions
  if (currentStep === 'suggestions') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">AI-Powered Suggestions</h3>
          <button
            onClick={handleBackToDraft}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ← Back to Draft
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm">
            <strong>Original Query:</strong> {prompt}
          </p>
        </div>

        {suggestionsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating AI suggestions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">Suggestion {index + 1}</h4>
                  <Badge variant="outline" className="text-xs">
                    Click to select
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Refined Prompt:</h5>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{suggestion.text}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Why this helps:</h5>
                    <p className="text-gray-600 text-sm">{suggestion.why}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">How to implement:</h5>
                    <p className="text-gray-600 text-sm">{suggestion.how}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestionsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{suggestionsError}</p>
            <button
              onClick={handleGetSuggestions}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // Step 3: Generate
  if (currentStep === 'generate') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Generate Formulation</h3>
          <button
            onClick={handleBackToSuggestions}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ← Back to Suggestions
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-800 mb-2">Selected Prompt:</h4>
          <p className="text-green-700">{selectedSuggestion?.text || prompt}</p>
          
          {selectedSuggestion && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-green-600 text-sm">
                <strong>Why this refinement helps:</strong> {selectedSuggestion.why}
              </p>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateFormulation}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform
                     ${loading 
                       ? 'bg-gray-300 cursor-not-allowed' 
                       : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                     }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Formulation...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate Formulation</span>
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Quality Feedback Modal */}
      {showQualityFeedback && queryQuality && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Query Quality Assessment</h3>
                <button
                  onClick={() => setShowQualityFeedback(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Score Display */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-orange-800">Quality Score</h4>
                    <Badge variant={queryQuality.score >= 3 ? "default" : "destructive"}>
                      {queryQuality.score}/7
                    </Badge>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-3 mb-3">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(queryQuality.score / 7) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-orange-700">{queryQuality.feedback}</p>
                </div>
                
                {/* Missing Elements */}
                {queryQuality.missing_elements && queryQuality.missing_elements.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Missing Elements</h4>
                    <ul className="space-y-2">
                      {queryQuality.missing_elements.map((element: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2 text-blue-700">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>{element}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Improvement Suggestions */}
                {queryQuality.suggestions && queryQuality.suggestions.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-3">Improvement Suggestions</h4>
                    <ul className="space-y-2">
                      {queryQuality.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2 text-green-700">
                          <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Improvement Examples */}
                {queryQuality.improvement_examples && queryQuality.improvement_examples.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-purple-800 mb-3">Example Improvements</h4>
                    <div className="space-y-3">
                      {queryQuality.improvement_examples.map((example: string, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                          <p className="text-purple-700 text-sm">{example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setShowQualityFeedback(false)}
                    className="flex-1 py-3 px-6 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Continue with Current Query
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
