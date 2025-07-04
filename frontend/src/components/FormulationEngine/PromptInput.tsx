import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import { categoryPrompts } from "../../utils/rotating-prompts";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/services/apiClient";
import type { GenerateResponse } from "@/types/formulation";
import SuggestionCard, { type Suggestion } from "./SuggestionCard";

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

type Step = 'draft' | 'suggestions' | 'generate';

// Add moreInfoPrompts mapping for additional context suggestions
const moreInfoPrompts: Record<string, string[]> = {
  cosmetics: [
    "I want it to be fragrance-free and suitable for sensitive skin.",
    "Should be vegan and cruelty-free.",
    "No parabens or sulfates, please.",
    "Needs to be safe for daily use.",
    "Should have a lightweight, non-greasy texture."
  ],
  "pet food": [
    "My dog has a chicken allergy.",
    "Needs to be grain-free and easy to digest.",
    "Should support joint health for older pets.",
    "No artificial colors or flavors.",
    "Must be suitable for small breeds."
  ],
  wellness: [
    "I prefer natural sweeteners only.",
    "Should be gluten-free and non-GMO.",
    "Needs to support immune health.",
    "No added sugar or artificial preservatives.",
    "Should be easy to mix in water or smoothies."
  ]
};

export default function PromptInput({
  onResult,
  selectedCategory,
}: {
  onResult: (data: GenerateResponse) => void;
  selectedCategory: string | null;
}) {
  const [stage, setStage] = useState<'input' | 'suggestions' | 'ready'>('input');
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingType, setLoadingType] = useState<'assess' | 'generate'>('assess');
  const [queryQuality, setQueryQuality] = useState<QueryQualityResponse | null>(null);
  const [showQualityFeedback, setShowQualityFeedback] = useState(false);
  const [location, setLocation] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>('draft');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [feedback, setFeedback] = useState("");
  const [moreInfo, setMoreInfo] = useState("");
  
  const [exampleIdx, setExampleIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [moreInfoIdx, setMoreInfoIdx] = useState(0);
  const [moreInfoFade, setMoreInfoFade] = useState(true);

  // Custom rolling prompts based on selectedCategory
  const getPrompts = () => {
    if (selectedCategory && categoryPrompts[selectedCategory]) {
      return categoryPrompts[selectedCategory];
    }
    // fallback default prompts
    return [
      "A gentle foaming face wash for oily skin, fragrance-free",
      "High-protein vegan snack bar with added vitamins",
      "Grain-free dog food for sensitive stomachs, chicken flavor",
      "Anti-aging night cream with retinol and hyaluronic acid",
      "Low-calorie electrolyte drink for athletes"
    ];
  };
  const prompts = getPrompts();
  const currentExample = prompts[exampleIdx] || prompts[0];

  // In the 'ready' stage, add rolling prompt logic for moreInfo
  const moreInfoSuggestions = selectedCategory && moreInfoPrompts[selectedCategory] ? moreInfoPrompts[selectedCategory] : [
    "Add any special requirements or preferences here."
  ];
  const currentMoreInfo = moreInfoSuggestions[moreInfoIdx] || moreInfoSuggestions[0];

  console.log('PromptInput rendered with example:', currentExample, 'fade:', fade);

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }
  
    const prompts = categoryPrompts[selectedCategory] || [];
    let current = 0;
    let switchingInterval: any;
    let isCancelled = false;
  
    const typePrompt = async (text: string) => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // wait 100ms
  
      for (let i = 0; i < text.length; i++) {
        if (isCancelled) return;
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
    setExampleIdx(0); // reset to first prompt on category change
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCategory) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setExampleIdx((prev) => (prev + 1) % prompts.length);
        setFade(true);
      }, 400); // fade out duration
    }, 3500);
    return () => clearInterval(interval);
  }, [prompts.length, exampleIdx, selectedCategory]);

  useEffect(() => {
    setMoreInfoIdx(0);
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCategory) return;
    const interval = setInterval(() => {
      setMoreInfoFade(false);
      setTimeout(() => {
        setMoreInfoIdx((prev) => (prev + 1) % moreInfoSuggestions.length);
        setMoreInfoFade(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [moreInfoSuggestions.length, moreInfoIdx, selectedCategory]);

  const handleAssess = async () => {
    setLoading(true);
    setLoadingType('assess');
    setLoadingProgress(0);
    setLoadingStep('Analyzing your query...');
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Update loading steps
    const stepTimeout1 = setTimeout(() => setLoadingStep('Processing with AI models...'), 800);
    const stepTimeout2 = setTimeout(() => setLoadingStep('Generating personalized suggestions...'), 1600);
    const stepTimeout3 = setTimeout(() => setLoadingStep('Finalizing recommendations...'), 2400);

    try {
      // Always fetch suggestions, regardless of assessment
      const sugResp = await apiClient.post("/query/suggestions", { prompt });
      setSuggestions(sugResp.data.suggestions);
      
      // Complete the progress
      setLoadingProgress(100);
      setLoadingStep('Complete!');
      
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingStep('');
        setStage("suggestions");
      }, 500);
    } catch (error) {
      setLoadingStep('Error occurred. Please try again.');
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingStep('');
      }, 2000);
    } finally {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout1);
      clearTimeout(stepTimeout2);
      clearTimeout(stepTimeout3);
    }
  };

  const handleUse = (s: Suggestion) => {
    setSelectedSuggestion(s);
    setPrompt(s.prompt);
    setStage("ready");
  };

  const handleGenerate = async () => {
    setLoading(true);
    setLoadingType('generate');
    setLoadingProgress(0);
    setLoadingStep('🧪 Mixing up some magic...');
    
    // Formulation-themed puns and steps
    const formulationPuns = [
      { step: '🧪 Mixing up some magic...', pun: 'Why did the chemist go broke? Because he lost his solution!' },
      { step: '⚗️ Brewing the perfect formula...', pun: 'What do you call a chemist who\'s always late? A slow reaction!' },
      { step: '🔬 Analyzing molecular structures...', pun: 'Why are chemists great at solving problems? They have all the solutions!' },
      { step: '🧬 Crafting the DNA of your product...', pun: 'What did the DNA say to the other DNA? Do these genes make me look fat?' },
      { step: '⚡ Adding the secret sauce...', pun: 'Why did the chemist like working with ammonia? Because it was pretty basic!' },
      { step: '🎯 Fine-tuning the formula...', pun: 'What\'s a chemist\'s favorite type of tree? A chemist-tree!' },
      { step: '✨ Adding the final sparkle...', pun: 'Why did the chemist go to the beach? To get a tan-gent!' },
      { step: '🎉 Your formulation is ready!', pun: 'What do you call a chemist who\'s also a comedian? A reaction-ary!' }
    ];
    
    let currentPunIndex = 0;
    
    // Simulate progress updates with puns
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        
        // Update pun every 15% progress
        const newProgress = prev + Math.random() * 12;
        if (newProgress > (currentPunIndex + 1) * 12.5 && currentPunIndex < formulationPuns.length - 1) {
          currentPunIndex++;
          setLoadingStep(formulationPuns[currentPunIndex].step);
        }
        
        return newProgress;
      });
    }, 400);

    try {
      // Combine prompt and moreInfo
      const finalPrompt = moreInfo.trim()
        ? `${prompt}\n\nAdditional context: ${moreInfo}`
        : prompt;
      
      const resp = await apiClient.post("/formulation/generate", { prompt: finalPrompt });
      
      // Complete the progress
      setLoadingProgress(100);
      setLoadingStep('🎉 Your formulation is ready!');
      
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingStep('');
        onResult(resp.data);
      }, 800);
    } catch (error) {
      setLoadingStep('😅 Oops! Something went wrong...');
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingStep('');
      }, 2000);
    } finally {
      clearInterval(progressInterval);
    }
  };

  // Render the main content based on stage
  const renderMainContent = () => {
    // Step 1: Draft
    if (stage === 'input') {
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <label htmlFor="prompt" className="block text-lg font-medium text-indigo-700 mb-2">
              Describe your product idea
            </label>
            {/* Dynamic Example Prompt */}
            <div className={`h-8 mb-3 text-gray-500 text-sm font-medium transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
              aria-live="polite">
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedCategory ? (
                  <span className="italic">e.g. {currentExample}</span>
                ) : (
                  <span className="italic text-purple-700">Select a category to see example prompts</span>
                )}
              </span>
            </div>
            <div className="relative">
              <textarea
                className="w-full h-32 p-4 text-md rounded-xl border-2 border-gray-200 bg-white/90 placeholder-gray-400
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200
                           resize-none"
                placeholder=""
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
            <label className="block text-sm font-medium text-purple-700">
              Location (optional)
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
            onClick={handleAssess}
            disabled={loading || !prompt.trim()}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform
                       ${loading || !prompt.trim() 
                         ? 'bg-gray-300 cursor-not-allowed' 
                         : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                       }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Starting Analysis...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Assess & Improve</span>
              </div>
            )}
          </button>
        </div>
      );
    }

    // Step 2: Suggestions
    if (stage === 'suggestions') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-indigo-600">Suggestions for your Product</h3>
            <button
              onClick={() => setStage('input')}
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

          {loading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Processing your request...</p>
              <p className="text-gray-400 text-sm mt-1">This usually takes 10-15 seconds</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((s, i) => (
                <SuggestionCard key={i} suggestion={s} onUse={() => handleUse(s)} index={i} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Step 3: Generate
    if (stage === 'ready') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Generate Formulation</h3>
            <button
              onClick={() => setStage('suggestions')}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              ← Back to Suggestions
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-800 mb-2">Selected Prompt:</h4>
            <p className="text-green-700">{selectedSuggestion?.prompt || prompt}</p>
            
            {selectedSuggestion && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-green-600 text-sm">
                  <strong>Why this refinement helps:</strong> {selectedSuggestion.how}
                </p>
              </div>
            )}
          </div>

          {/* Edit Prompt and More Info */}
          <div>
            <label className="block font-semibold mb-1">Edit your prompt:</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="mb-2 w-full border rounded p-2"
              rows={4}
            />
            <label className="block font-semibold mb-1">Add more information (optional):</label>
            <textarea
              value={moreInfo}
              onChange={e => setMoreInfo(e.target.value)}
              className="mb-2 w-full border rounded p-2"
              rows={2}
              placeholder="e.g. I want it to be fragrance-free and suitable for sensitive scalp."
            />
            {/* Dynamic More Info Rolling Prompt */}
            <div className={`h-6 mb-2 text-gray-400 text-xs font-medium transition-opacity duration-500 ${moreInfoFade ? 'opacity-100' : 'opacity-0'}`}
              aria-live="polite">
              <span className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="italic">e.g. {currentMoreInfo}</span>
              </span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
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
                <span>Brewing Magic...</span>
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

    return null;
  };

  return (
    <>
      {/* Modern Loading Overlay - Always rendered when loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {loadingType === 'assess' ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {loadingType === 'assess' ? 'Scrtch.AI is scratching it\'s head' : '🧪 Scrtch.AI is brewing magic'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {loadingType === 'assess' 
                    ? 'Don\'t worry, i want to be absolutley sure of what you meant..'
                    : 'Creating your perfect formulation with a dash of chemistry humor!'
                  }
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-blue-600">{Math.round(loadingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${loadingProgress}%` }}
                  >
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Current Step */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">{loadingStep}</span>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center text-gray-500 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Estimated time: {loadingProgress < 30 ? '10-15 seconds' : loadingProgress < 70 ? '5-8 seconds' : 'Just few more ticks...'}</span>
                </div>
              </div>

              {/* Chemistry Puns for Generate */}
              {loadingType === 'generate' && (
                <div className="text-center mb-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-purple-700 text-sm font-medium">
                      💡 Chemistry Pun: {(() => {
                        const puns = [
                          'Why did the chemist go broke? Because he lost his solution!',
                          'What do you call a chemist who\'s always late? A slow reaction!',
                          'Why are chemists great at solving problems? They have all the solutions!',
                          'What did the DNA say to the other DNA? Do these genes make me look fat?',
                          'Why did the chemist like working with ammonia? Because it was pretty basic!',
                          'What\'s a chemist\'s favorite type of tree? A chemist-tree!',
                          'Why did the chemist go to the beach? To get a tan-gent!',
                          'What do you call a chemist who\'s also a comedian? A reaction-ary!'
                        ];
                        return puns[Math.floor((loadingProgress / 100) * puns.length)] || puns[0];
                      })()}
                    </p>
                  </div>
                </div>
              )}

              {/* Loading Animation */}
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Main Content */}
      {renderMainContent()}
    </>
  );
} 