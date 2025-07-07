import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';
import { useMultimodal } from '../hooks/useMultimodal';
import { useMultimodalSuggestions } from '../hooks/useMultimodalSuggestions';
import { FUSION_STRATEGIES, type FusionStrategy } from '../types/multimodal';
import { getCategoryColors } from '../lib/colorUtils';
import MultimodalSuggestionCard, { type MultimodalSuggestion } from './MultimodalFormulation/MultimodalSuggestionCard';

interface MultimodalFormulationProps {
  onResult: (data: any) => void;
  selectedCategory: string | null;
}

type Stage = 'input' | 'analysis' | 'suggestions' | 'ready';

export const MultimodalFormulation: React.FC<MultimodalFormulationProps> = ({
  onResult,
  selectedCategory
}) => {
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<FusionStrategy['id']>('enhanced');
  const [showFusionHelp, setShowFusionHelp] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>('input');
  const [selectedSuggestion, setSelectedSuggestion] = useState<MultimodalSuggestion | null>(null);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingType, setLoadingType] = useState<'analysis' | 'suggestions' | 'formulation'>('analysis');
  const [editableEnhancedPrompt, setEditableEnhancedPrompt] = useState('');

  // Refs to store interval and timeout IDs for cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const {
    loading,
    error,
    imageAnalysis,
    multimodalResult,
    analyzeImage,
    analyzeAndFuse,
    reset
  } = useMultimodal();

  const {
    loading: suggestionsLoading,
    error: suggestionsError,
    suggestions,
    generateMultimodalSuggestions,
    clearSuggestions
  } = useMultimodalSuggestions();

  const colors = getCategoryColors(selectedCategory);

  // Cleanup function for intervals and timeouts
  const cleanupTimers = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    stepTimeoutsRef.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    stepTimeoutsRef.current = [];
  };

  // Reset loading state
  const resetLoadingState = () => {
    setLoadingProgress(0);
    setLoadingStep('');
    setLoadingType('analysis');
    cleanupTimers();
  };

  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, []);

  // Reset loading state when category changes
  useEffect(() => {
    if (loadingProgress > 0 || loadingStep) {
      resetLoadingState();
    }
  }, [selectedCategory]);

  const handleImageSelect = (file: File) => {
    // Clean up any ongoing operations
    cleanupTimers();
    resetLoadingState();
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowAnalysis(false);
    setCurrentStage('input');
    clearSuggestions();
    setSelectedSuggestion(null);
    setFinalPrompt('');
    setEditableEnhancedPrompt('');
  };

  const handleImageRemove = () => {
    // Clean up any ongoing operations
    cleanupTimers();
    resetLoadingState();
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowAnalysis(false);
    setCurrentStage('input');
    clearSuggestions();
    setSelectedSuggestion(null);
    setFinalPrompt('');
    setEditableEnhancedPrompt('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleAnalyzeImage = async () => {
    console.log('🔍 handleAnalyzeImage called', { selectedFile: selectedFile?.name, textPrompt, selectedCategory });
    
    if (!selectedFile) {
      console.log('❌ No file selected');
      return;
    }

    // Clean up any existing timers
    cleanupTimers();
    resetLoadingState();

    setLoadingType('analysis');
    setLoadingProgress(0);
    setLoadingStep('Starting image analysis...');

    // Simulate progress for analysis
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const stepTimeout1 = setTimeout(() => setLoadingStep('Analyzing visual elements...'), 1000);
    const stepTimeout2 = setTimeout(() => setLoadingStep('Extracting product insights...'), 3000);
    const stepTimeout3 = setTimeout(() => setLoadingStep('Generating enhanced prompt...'), 5000);
    
    stepTimeoutsRef.current = [stepTimeout1, stepTimeout2, stepTimeout3];

    try {
      console.log('📤 Calling analyzeImage...');
      const result = await analyzeImage(
        selectedFile,
        textPrompt.trim() || `Analyze this ${selectedCategory || 'product'} image and provide detailed insights for formulation development`,
        selectedCategory || undefined
      );

      console.log('analyzeImage result:', result);

      if (result) {
        setShowAnalysis(true);
        setCurrentStage('analysis');
        setLoadingProgress(100);
        setLoadingStep('Analysis complete!');
        setEditableEnhancedPrompt(result.enhanced_prompt || '');
        console.log('✅ Analysis completed, showing results');
        
        setTimeout(() => {
          setLoadingProgress(0);
          setLoadingStep('');
        }, 1000);
      } else {
        console.log('❌ Analysis failed');
        setLoadingProgress(0);
        setLoadingStep('Analysis failed. Please try again.');
        setTimeout(() => {
          setLoadingStep('');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Analysis error:', error);
      setLoadingProgress(0);
      setLoadingStep('Analysis failed. Please try again.');
      setTimeout(() => {
        setLoadingStep('');
      }, 2000);
    } finally {
      cleanupTimers();
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!imageAnalysis) return;

    // Clean up any existing timers
    cleanupTimers();
    resetLoadingState();

    setLoadingType('suggestions');
    setLoadingProgress(0);
    setLoadingStep('Generating suggestions...');

    // Simulate progress for suggestions
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    const stepTimeout1 = setTimeout(() => setLoadingStep('Analyzing image insights...'), 1000);
    const stepTimeout2 = setTimeout(() => setLoadingStep('Creating enhanced prompts...'), 3000);
    const stepTimeout3 = setTimeout(() => setLoadingStep('Finalizing suggestions...'), 5000);
    
    stepTimeoutsRef.current = [stepTimeout1, stepTimeout2, stepTimeout3];

    try {
      console.log('📤 Generating multimodal suggestions...');
      const suggestionsResult = await generateMultimodalSuggestions({
        enhanced_prompt: editableEnhancedPrompt || imageAnalysis.enhanced_prompt,
        image_analysis: imageAnalysis,
        category: selectedCategory || undefined
      });

      if (suggestionsResult && suggestionsResult.length > 0) {
        setCurrentStage('suggestions');
        setLoadingProgress(100);
        setLoadingStep('Suggestions ready!');
        console.log('✅ Suggestions generated successfully');
        
        setTimeout(() => {
          setLoadingProgress(0);
          setLoadingStep('');
        }, 1000);
      } else {
        console.log('❌ Failed to generate suggestions');
        setLoadingProgress(0);
        setLoadingStep('Failed to generate suggestions. Please try again.');
        setTimeout(() => {
          setLoadingStep('');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Suggestions error:', error);
      setLoadingProgress(0);
      setLoadingStep('Failed to generate suggestions. Please try again.');
      setTimeout(() => {
        setLoadingStep('');
      }, 2000);
    } finally {
      cleanupTimers();
    }
  };

  const handleUseSuggestion = (suggestion: MultimodalSuggestion) => {
    console.log('🎯 handleUseSuggestion called with:', suggestion);
    setSelectedSuggestion(suggestion);
    setFinalPrompt(suggestion.prompt);
    setCurrentStage('ready');
    console.log('✅ Suggestion selected, ready for formulation generation');
    console.log('📝 Final prompt set to:', suggestion.prompt);
  };

  const handleAnalyzeAndFuse = async () => {
    console.log('🔍 handleAnalyzeAndFuse called', { selectedFile: selectedFile?.name, finalPrompt, selectedCategory });
    
    if (!selectedFile) {
      console.log('❌ No file selected');
      return;
    }

    // Clean up any existing timers
    cleanupTimers();
    resetLoadingState();

    setLoadingType('formulation');
    setLoadingProgress(0);
    setLoadingStep('Starting formulation generation...');

    // Simulate progress for formulation
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return 90;
        }
        return prev + 8;
      });
    }, 400);

    const stepTimeout1 = setTimeout(() => setLoadingStep('Analyzing ingredients...'), 2000);
    const stepTimeout2 = setTimeout(() => setLoadingStep('Calculating proportions...'), 5000);
    const stepTimeout3 = setTimeout(() => setLoadingStep('Generating formulation...'), 8000);
    
    stepTimeoutsRef.current = [stepTimeout1, stepTimeout2, stepTimeout3];

    try {
      // If a suggestion is selected, use it directly; otherwise use the fusion process
      let promptToUse;
      if (selectedSuggestion && finalPrompt) {
        // Use the selected suggestion directly for formulation
        promptToUse = finalPrompt;
        console.log('📤 Using selected suggestion directly:', promptToUse);
        console.log('📤 Selected suggestion details:', selectedSuggestion);
      } else {
        // Use the fusion process with original text prompt
        promptToUse = textPrompt.trim() || "Generate a formulation based on this product image";
        console.log('📤 Using fusion process with prompt:', promptToUse);
      }
      
      console.log('📤 Final prompt value:', finalPrompt);
      console.log('📤 Text prompt value:', textPrompt.trim());
      
      const result = await analyzeAndFuse(
        selectedFile,
        promptToUse,
        selectedCategory || undefined,
        undefined,
        selectedStrategy
      );

      console.log('📤 analyzeAndFuse result:', result);

      if (result && result.formulation) {
        setLoadingProgress(100);
        setLoadingStep('Formulation complete!');
        console.log('✅ Formulation generated successfully');
        
        setTimeout(() => {
          onResult(result.formulation);
          setLoadingProgress(0);
          setLoadingStep('');
        }, 1000);
      } else {
        console.log('❌ Formulation generation failed');
        setLoadingProgress(0);
        setLoadingStep('Formulation generation failed. Please try again.');
        setTimeout(() => {
          setLoadingStep('');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Formulation error:', error);
      setLoadingProgress(0);
      setLoadingStep('Formulation generation failed. Please try again.');
      setTimeout(() => {
        setLoadingStep('');
      }, 2000);
    } finally {
      cleanupTimers();
    }
  };

  const handleReset = () => {
    // Clean up any ongoing operations
    cleanupTimers();
    resetLoadingState();
    
    setTextPrompt('');
    handleImageRemove();
    setShowAnalysis(false);
    setSelectedStrategy('enhanced');
    setCurrentStage('input');
    clearSuggestions();
    setSelectedSuggestion(null);
    setFinalPrompt('');
    setEditableEnhancedPrompt('');
    reset();
  };

  const getCategoryIcon = () => {
    switch (selectedCategory) {
      case 'cosmetics': return '💄';
      case 'pet food': return '🐾';
      case 'wellness': return '🌱';
      case 'beverages': return '🥤';
      case 'textiles': return '🧵';
      case 'desi masala': return '🌶️';
      default: return '🔬';
    }
  };

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'cosmetics': return 'Beauty & Cosmetics';
      case 'pet food': return 'Pet Nutrition';
      case 'wellness': return 'Health & Wellness';
      case 'beverages': return 'Beverages & Drinks';
      case 'textiles': return 'Textiles & Materials';
      case 'desi masala': return 'Desi Masala & Spices';
      default: return 'Product Formulation';
    }
  };

  const getDynamicPlaceholder = () => {
    const basePrompts = [
      "Describe your product idea, target audience, and key requirements...",
      "What are the main benefits and features you want in this product?",
      "Who is your target audience and what problems does this solve?",
      "What ingredients or formulations are important to you?",
      "Describe the desired texture, scent, or appearance...",
      "What's your budget range and market positioning?"
    ];

    const categorySpecificPrompts = {
      cosmetics: [
        "Describe your beauty product: skin type, concerns, ingredients preferences...",
        "What skin benefits are you targeting? (anti-aging, hydration, brightening...)",
        "Describe your target audience: age, skin concerns, lifestyle...",
        "Any specific ingredients you want to include or avoid?",
        "What's your desired texture and application method?"
      ],
      "pet food": [
        "Describe your pet food: pet type, age, health needs...",
        "What nutritional benefits are you targeting? (digestive health, energy, coat...)",
        "Any dietary restrictions or special requirements?",
        "What's your target pet parent demographic?",
        "Describe desired texture, flavor, or packaging preferences..."
      ],
      wellness: [
        "Describe your wellness product: health goals, target benefits...",
        "What health concerns are you addressing? (immunity, energy, sleep...)",
        "Who is your target audience? (age, lifestyle, health focus...)",
        "Any specific ingredients or formulations you prefer?",
        "What's your desired format? (capsules, powder, liquid...)"
      ],
      beverages: [
        "Describe your beverage: type, target benefits, flavor preferences...",
        "What functional benefits are you targeting? (energy, immunity, hydration...)",
        "Who is your target audience? (age, lifestyle, consumption habits...)",
        "Any specific ingredients or flavors you want to include?",
        "What's your desired format? (ready-to-drink, powder, concentrate...)"
      ],
      textiles: [
        "Describe your textile: application, performance requirements, sustainability goals...",
        "What performance benefits are you targeting? (moisture-wicking, durability, comfort...)",
        "Who is your target audience? (age, lifestyle, fashion preferences...)",
        "Any specific materials or properties you want to include?",
        "What's your desired construction? (woven, knit, non-woven...)"
      ],
      "desi masala": [
        "Describe your masala blend: cuisine type, flavor profile, heat level...",
        "What traditional dishes are you targeting? (biryani, tandoori, chaat...)",
        "Who is your target audience? (home cooks, restaurants, food manufacturers...)",
        "Any specific spices or ingredients you want to include?",
        "What's your desired format? (powder, paste, whole spices...)"
      ]
    };

    const prompts = categorySpecificPrompts[selectedCategory as keyof typeof categorySpecificPrompts] || basePrompts;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    return `${randomPrompt} (Optional - AI will use default analysis if left empty)`;
  };

  const getFusionStrategyDetails = () => {
    return {
      enhanced: {
        title: "Enhanced Fusion",
        description: "Comprehensive natural language with strategic insights",
        details: "Creates flowing, conversational prompts that naturally combine your requirements with detailed visual and market insights. Uses natural language like 'Looking at this product image, I can see...' and 'Your requirements include...' to create compelling, strategic prompts that harmonize user needs with visual identity.",
        example: "Natural observation + Your requirements + Formulation guidance + Strategic direction",
        recommended: true
      },
      balanced: {
        title: "Balanced Approach", 
        description: "Balanced natural language with equal weight to text and image",
        details: "Creates natural language prompts that give equal importance to your requirements and key visual insights. Uses conversational language to create balanced, readable prompts that don't overwhelm while maintaining natural flow and strategic focus.",
        example: "Your requirements + Visual analysis + Formulation guidance + Balanced direction",
        recommended: false
      },
      image_primary: {
        title: "Image-First",
        description: "Image-driven natural language with requirements as context",
        details: "Starts with image analysis as the primary guide using natural language like 'Based on the image analysis...' and incorporates your requirements as additional considerations. Creates flowing prompts that prioritize visual identity while naturally addressing your specific needs.",
        example: "Image-driven context + Product insights + Formulation guidance + Your requirements",
        recommended: false
      }
    };
  };

  const renderLoadingState = () => {
    if (!loading && !suggestionsLoading && loadingProgress === 0) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 bg-gradient-to-r ${colors.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {loadingType === 'analysis' && 'Analyzing Image...'}
                {loadingType === 'suggestions' && 'Generating Suggestions...'}
                {loadingType === 'formulation' && 'Creating Formulation...'}
              </h3>
              <p className="text-gray-600 text-sm">{loadingStep}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${colors.text}`}>Progress</span>
                <span className={`text-sm font-bold ${colors.text}`}>{Math.round(loadingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-500 ease-out relative`}
                  style={{ width: `${loadingProgress}%` }}
                >
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Current Step */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center px-4 py-2 ${colors.bg} rounded-full`}>
                <div className={`w-2 h-2 ${colors.icon} rounded-full mr-2 animate-pulse`}></div>
                <span className={`text-sm font-medium ${colors.text}`}>{loadingStep}</span>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="text-center mb-4">
              <div className={`inline-flex items-center ${colors.text} text-sm`}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Estimated time: {loadingProgress < 30 ? '10-15 seconds' : loadingProgress < 70 ? '5-8 seconds' : 'Just few more ticks...'}</span>
              </div>
            </div>

            {/* Loading Animation */}
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 ${colors.icon} rounded-full animate-bounce`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Cancel Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  cleanupTimers();
                  resetLoadingState();
                }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel Operation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Text Input with Category Styling */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <label className={`block text-lg font-semibold ${colors.text}`}>
          Product Description
        </label>
        <textarea
          value={textPrompt}
          onChange={(e) => setTextPrompt(e.target.value)}
          placeholder={getDynamicPlaceholder()}
          className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 transition-all resize-none text-sm ${
            colors.focus
          } ${colors.border} ${loading ? 'opacity-50' : ''}`}
          rows={4}
          disabled={loading}
        />
      </motion.div>

      {/* Image Preview (if available) */}
      {previewUrl && (
        <div className="flex justify-center mb-4">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="max-h-56 rounded-xl border-2 border-gray-200 shadow-md object-contain"
          />
        </div>
      )}

      {/* Image Upload with Enhanced Styling */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <label className={`block text-lg font-semibold ${colors.text}`}>
          Product Image (Optional)
        </label>
        <div className={`p-6 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
          <ImageUpload
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            disabled={loading}
          />
        </div>
      </motion.div>

      {/* Enhanced Fusion Strategy with Category Styling */}
      {selectedFile && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <label className={`block text-lg font-semibold ${colors.text}`}>
              Fusion Strategy
            </label>
            <button
              onClick={() => setShowFusionHelp(true)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
              title="Learn about fusion strategies"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FUSION_STRATEGIES.map((strategy) => {
              const strategyDetails = getFusionStrategyDetails()[strategy.id];
              return (
                <motion.button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl border-2 transition-all relative ${
                    selectedStrategy === strategy.id
                      ? `${colors.border} ${colors.bg} shadow-lg`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  disabled={loading}
                >
                  {strategyDetails.recommended && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Recommended
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className={`font-bold text-lg mb-2 ${selectedStrategy === strategy.id ? colors.text : 'text-gray-900'}`}>
                      {strategy.name}
                    </h3>
                    <p className="text-sm text-gray-600">{strategy.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Enhanced Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {selectedFile && currentStage === 'input' && (
          <motion.button
            onClick={(e) => {
              console.log('🔘 Analyze Image button clicked', { loading, selectedFile: selectedFile?.name });
              handleAnalyzeImage();
            }}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform
                       ${loading
                         ? 'bg-gray-300 cursor-not-allowed' 
                         : `bg-gradient-to-r ${colors.gradient} hover:${colors.hoverGradient} hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl`
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
                <span>Analyze Image</span>
              </div>
            )}
          </motion.button>
        )}

        <motion.button
          onClick={handleReset}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:text-gray-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Loading State */}
      {renderLoadingState()}

      {/* Enhanced Error Display */}
      {(error || suggestionsError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <p className="text-red-700 font-medium">{error || suggestionsError}</p>
          </div>
        </motion.div>
      )}

      {/* Enhanced Image Analysis Results UI/UX */}
      <AnimatePresence>
        {showAnalysis && imageAnalysis && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 shadow-lg`}
          >
            {/* Enhanced Summary Section */}
            {(imageAnalysis.product_type || imageAnalysis.brand_name || imageAnalysis.market_positioning) && (
              <div className="mb-6 p-4 bg-white/80 rounded-xl border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className={`w-3 h-3 ${colors.icon} rounded-full mr-3`}></div>
                  <h3 className="text-sm font-semibold text-gray-800">Image Analysis Summary</h3>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  {imageAnalysis.brand_name && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 mr-2">Brand:</span>
                      <span>{imageAnalysis.brand_name}</span>
                    </div>
                  )}
                  {imageAnalysis.product_type && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 mr-2">Product Type:</span>
                      <span>{imageAnalysis.product_type}</span>
                    </div>
                  )}
                  {imageAnalysis.market_positioning && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 mr-2">Market Positioning:</span>
                      <span>{imageAnalysis.market_positioning}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Confidence/Uncertainty Note */}
            {(!imageAnalysis.product_type || !imageAnalysis.visual_elements?.length) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-amber-700 text-xs font-medium">Some details could not be confidently determined from the image. Results may be incomplete or uncertain.</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Product Insights */}
              {imageAnalysis.product_insights && imageAnalysis.product_insights.length > 0 && (
                <div className="p-4 rounded-xl bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className={`w-2 h-2 ${colors.icon} rounded-full mr-2`}></div>
                    <h5 className="text-xs font-semibold text-gray-800">Product Insights</h5>
                  </div>
                  <ul className="space-y-1">
                    {imageAnalysis.product_insights.map((insight, index) => (
                      <li key={index} className="text-xs text-gray-600 leading-relaxed">• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Visual Elements */}
              {imageAnalysis.visual_elements && imageAnalysis.visual_elements.length > 0 && (
                <div className="p-4 rounded-xl bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className={`w-2 h-2 ${colors.icon} rounded-full mr-2`}></div>
                    <h5 className="text-xs font-semibold text-gray-800">Visual Elements</h5>
                  </div>
                  <ul className="space-y-1">
                    {imageAnalysis.visual_elements.map((element, index) => (
                      <li key={index} className="text-xs text-gray-600 leading-relaxed">• {element}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color Scheme */}
              {imageAnalysis.color_scheme && (
                <div className="p-4 rounded-xl bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className={`w-2 h-2 ${colors.icon} rounded-full mr-2`}></div>
                    <h5 className="text-xs font-semibold text-gray-800">Color Scheme</h5>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{imageAnalysis.color_scheme}</p>
                </div>
              )}

              {/* Packaging Style */}
              {imageAnalysis.packaging_style && (
                <div className="p-4 rounded-xl bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className={`w-2 h-2 ${colors.icon} rounded-full mr-2`}></div>
                    <h5 className="text-xs font-semibold text-gray-800">Packaging Style</h5>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{imageAnalysis.packaging_style}</p>
                </div>
              )}

              {/* Key Ingredients */}
              {imageAnalysis.formulation_hints && imageAnalysis.formulation_hints.length > 0 && (
                <div className="p-4 rounded-xl bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className={`w-2 h-2 ${colors.icon} rounded-full mr-2`}></div>
                    <h5 className="text-xs font-semibold text-gray-800">Key Ingredients</h5>
                  </div>
                  <ul className="space-y-1">
                    {imageAnalysis.formulation_hints.map((ingredient: string, index: number) => (
                      <li key={index} className="text-xs text-gray-600 leading-relaxed">• {ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Market Positioning */}
              {imageAnalysis.market_positioning && (
                <div className="p-4 rounded-xl bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className={`w-2 h-2 ${colors.icon} rounded-full mr-2`}></div>
                    <h5 className="text-xs font-semibold text-gray-800">Market Positioning</h5>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{imageAnalysis.market_positioning}</p>
                </div>
              )}

              {/* Target Audience - Full Width */}
              {imageAnalysis.target_audience_hints && imageAnalysis.target_audience_hints.length > 0 && (
                <div className="p-4 rounded-xl bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
                  <div className="flex items-center mb-3">
                    <div className={`w-2 h-2 ${colors.icon} rounded-full mr-2`}></div>
                    <h5 className="text-xs font-semibold text-gray-800">Target Audience</h5>
                  </div>
                  <ul className="space-y-1">
                    {imageAnalysis.target_audience_hints.map((hint, index) => (
                      <li key={index} className="text-xs text-gray-600 leading-relaxed">• {hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Natural Language Prompt Display */}
      {imageAnalysis && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-r from-green-50 to-emerald-50 p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 ${colors.icon} rounded-full mr-3`}></div>
              <h5 className="text-sm font-semibold text-green-800"> Enhanced Prompt</h5>
            </div>
            <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {selectedStrategy === 'enhanced' ? 'Comprehensive' : 
               selectedStrategy === 'balanced' ? 'Balanced' : 'Image-First'} Fusion
            </div>
          </div>
          
          {/* Fusion Preview */}
          <div className="mb-4 p-3 bg-white/80 rounded-lg border border-green-200">
            <div className="text-xs text-green-700 mb-2 font-medium">How your text and image analysis are fused:</div>
            <div className="text-xs text-gray-600 space-y-1">
              {textPrompt.trim() && (
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Your input:</strong> "{textPrompt.trim()}"</span>
                </div>
              )}
              {imageAnalysis.product_type && (
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Image analysis:</strong> {imageAnalysis.product_type} with visual insights</span>
                </div>
              )}
              {imageAnalysis.target_audience_hints?.length > 0 && (
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Target audience:</strong> {imageAnalysis.target_audience_hints.slice(0, 2).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white/90 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 leading-relaxed whitespace-pre-wrap">
              {editableEnhancedPrompt || imageAnalysis.enhanced_prompt || "The enhanced prompt will appear here, intelligently combining your text with image analysis..."}
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                const textarea = document.createElement('textarea');
                textarea.value = editableEnhancedPrompt || imageAnalysis.enhanced_prompt || '';
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
              }}
              className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center space-x-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy prompt</span>
            </button>
          </div>
          
          {/* Assess & Query Button */}
          <motion.button
            onClick={handleGenerateSuggestions}
            disabled={suggestionsLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full mt-4 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform shadow-lg hover:shadow-xl
                       ${suggestionsLoading
                         ? 'bg-gray-300 cursor-not-allowed' 
                         : `bg-gradient-to-r ${colors.gradient} hover:${colors.hoverGradient} hover:scale-[1.02] active:scale-[0.98]`
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
                <span>Generate Rich Context Suggestions</span>
              </div>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Multimodal Suggestions */}
      <AnimatePresence>
        {currentStage === 'suggestions' && suggestions.length > 0 && !suggestionsLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Suggested Prompts</h3>
              <p className="text-sm text-gray-500">
                Choose one of these enhanced prompts based on your image analysis
              </p>
            </div>
            
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <MultimodalSuggestionCard
                  key={index}
                  suggestion={suggestion}
                  onUse={handleUseSuggestion}
                  index={index}
                  selectedCategory={selectedCategory}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editable Final Prompt Display */}
      <AnimatePresence>
        {currentStage === 'ready' && selectedSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-medium text-blue-900">Selected Prompt</h3>
              </div>
              <button
                onClick={() => setCurrentStage('suggestions')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Choose different prompt
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Edit your prompt (optional):
              </label>
              <textarea
                value={finalPrompt}
                onChange={(e) => setFinalPrompt(e.target.value)}
                className="w-full p-4 text-sm leading-relaxed bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                rows={8}
                placeholder="Edit your selected prompt here..."
              />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-blue-600">
                Ready to generate formulation with this prompt
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFinalPrompt(selectedSuggestion.prompt)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Reset to original
                </button>
              </div>
            </div>
            
            {/* Generate Formulation Button */}
            <motion.button
              onClick={(e) => {
                console.log('🔘 Generate Formulation button clicked', { loading, selectedFile: selectedFile?.name, finalPrompt });
                handleAnalyzeAndFuse();
              }}
              disabled={loading || !selectedFile}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform shadow-lg hover:shadow-xl
                         ${loading || !selectedFile
                           ? 'bg-gray-300 cursor-not-allowed'
                           : `bg-gradient-to-r ${colors.gradient} hover:${colors.hoverGradient} hover:scale-[1.02] active:scale-[0.98]`
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
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fusion Strategy Help Modal */}
      <AnimatePresence>
        {showFusionHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFusionHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Fusion Strategy Guide</h2>
                  <button
                    onClick={() => setShowFusionHelp(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 MAPS Framework</h3>
                    <p className="text-blue-800 text-sm mb-4">
                      All fusion strategies use the MAPS framework for strategic formulation:
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-blue-900">M - MODEL:</strong> What we're building (product type, visual elements)
                      </div>
                      <div>
                        <strong className="text-blue-900">A - AUDIENCE:</strong> Who we're building for (target demographic)
                      </div>
                      <div>
                        <strong className="text-blue-900">P - PROBLEM:</strong> What we're solving (user needs, market gaps)
                      </div>
                      <div>
                        <strong className="text-blue-900">S - SOLUTION:</strong> How we're solving it (formulation approach)
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-lg">
                    Choose how your text prompt and image analysis should be combined using the MAPS framework for optimal formulation results.
                  </p>

                  {Object.entries(getFusionStrategyDetails()).map(([key, strategy]) => (
                    <div key={key} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-gray-900">{strategy.title}</h3>
                          {strategy.recommended && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{strategy.description}</p>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">How it works:</h4>
                        <p className="text-gray-600 text-sm">{strategy.details}</p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Example output:</h4>
                        <p className="text-blue-800 text-sm font-mono">{strategy.example}</p>
                      </div>
                    </div>
                  ))}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Pro Tip</h3>
                    <p className="text-yellow-700 text-sm">
                      <strong>Enhanced Fusion</strong> is recommended for most cases as it provides the most comprehensive MAPS analysis. 
                      Use <strong>Balanced Approach</strong> if you want a cleaner, more focused MAPS framework, or <strong>Image-First</strong> 
                      when the image contains the main product concept and you want to build the MAPS structure from visual elements first.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 