import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';
import { useMultimodal } from '../hooks/useMultimodal';
import { useLocalMarket } from '../hooks/useLocalMarket';
import { useMultimodalSuggestions } from '../hooks/useMultimodalSuggestions';
import { useSSEFormulation } from '../hooks/useSSEFormulation';
import { StatusBar } from './StatusBar';
import { getCategoryColors } from '../lib/colorUtils';
import {
  FormulationSummary,
  FormulationDetails,
  MarketResearch,
  ManufacturingConsiderations,
  UnitEconomics,
  PackagingBranding
} from './analysis';

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
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>('input');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingType, setLoadingType] = useState<'analysis' | 'formulation' | 'suggestions'>('analysis');
  const [editableEnhancedPrompt, setEditableEnhancedPrompt] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState('Mumbai');

  // Refs to store interval and timeout IDs for cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const promptIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for scrolling to results
  const imageAnalysisResultsRef = useRef<HTMLDivElement>(null);
  const comprehensiveAnalysisResultsRef = useRef<HTMLDivElement>(null);
  const suggestionsResultsRef = useRef<HTMLDivElement>(null);
  const analyzeButtonRef = useRef<HTMLButtonElement>(null);

  const {
    loading,
    error,
    imageAnalysis,
    comprehensiveAnalysis,
    analyzeImage,
    generateComprehensiveAnalysis,
    reset
  } = useMultimodal();

  // Local market analysis hook
  const {
    loading: localMarketLoading,
    error: localMarketError,
    marketData: localMarketData,
    analyzeLocalMarket
  } = useLocalMarket();

  // Multimodal suggestions hook
  const {
    loading: suggestionsLoading,
    error: suggestionsError,
    suggestions,
    generateTextOnlySuggestions,
    clearSuggestions
  } = useMultimodalSuggestions();

  // SSE Formulation hook
  const {
    isStreaming,
    currentStatus,
    formulation: sseFormulation,
    error: sseError,
    startFormulationStream,
    stopFormulationStream
  } = useSSEFormulation();

  const colors = getCategoryColors(selectedCategory);

  // Cleanup function for intervals and timeouts
  const cleanupTimers = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (promptIntervalRef.current) {
      clearInterval(promptIntervalRef.current);
      promptIntervalRef.current = null;
    }
    stepTimeoutsRef.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    stepTimeoutsRef.current = [];
    // Also stop any active SSE streams
    stopFormulationStream();
  };

  // Reset loading state
  const resetLoadingState = () => {
    setLoadingProgress(0);
    setLoadingStep('');
    setLoadingType('analysis');
    cleanupTimers();
  };

  // Fetch local market data when category or city changes
  useEffect(() => {
    if (selectedCategory) {
      const fetchLocalMarketData = async () => {
        try {
          await analyzeLocalMarket({
            location: selectedCity,
            category: selectedCategory,
            product_name: '',
            ingredients: []
          });
        } catch (error) {
          console.error('Failed to fetch local market data:', error);
        }
      };
      
      fetchLocalMarketData();
    }
  }, [selectedCategory, selectedCity, analyzeLocalMarket]);

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

  // Dynamic prompt cycling effect
  useEffect(() => {
    // Clear any existing interval
    if (promptIntervalRef.current) {
      clearInterval(promptIntervalRef.current);
    }

    // Only start cycling if a category is selected
    if (selectedCategory) {
      // Start new interval for cycling prompts
      promptIntervalRef.current = setInterval(() => {
        setCurrentPromptIndex(prev => (prev + 1) % getDynamicPrompts().length);
      }, 10000); // Changed to 10 seconds
    }

    return () => {
      if (promptIntervalRef.current) {
        clearInterval(promptIntervalRef.current);
      }
    };
  }, [selectedCategory]);

  // Effect to handle SSE formulation completion
  useEffect(() => {
    if (sseFormulation && !isStreaming) {
      // Scroll to the formulation results after a short delay
      setTimeout(() => {
        const sseResultsElement = document.querySelector('[data-sse-results]');
        sseResultsElement?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 1000);
    }
  }, [sseFormulation, isStreaming]);

  const handleImageSelect = (file: File) => {
    // Clean up any ongoing operations
    cleanupTimers();
    resetLoadingState();
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowAnalysis(false);
    setShowSuggestions(false);
    setCurrentStage('input');
    setFinalPrompt('');
    setEditableEnhancedPrompt('');
    
    // Scroll to analyze button after upload
    setTimeout(() => {
      analyzeButtonRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 500);
  };

  const handleImageRemove = () => {
    // Clean up any ongoing operations
    cleanupTimers();
    resetLoadingState();
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowAnalysis(false);
    setShowSuggestions(false);
    setCurrentStage('input');
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
        setFinalPrompt(result.enhanced_prompt || '');
        console.log('✅ Analysis completed, showing results');
        
        setTimeout(() => {
          setLoadingProgress(0);
          setLoadingStep('');
          // Scroll to image analysis results
          setTimeout(() => {
            imageAnalysisResultsRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 500);
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

  const handleAssessTextOnly = async () => {
    console.log('🔍 handleAssessTextOnly called', { textPrompt, selectedCategory });
    
    if (!textPrompt.trim()) {
      console.log('❌ No text prompt provided');
      return;
    }

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

    const stepTimeout1 = setTimeout(() => setLoadingStep('Analyzing requirements...'), 1000);
    const stepTimeout2 = setTimeout(() => setLoadingStep('Generating formulation options...'), 3000);
    const stepTimeout3 = setTimeout(() => setLoadingStep('Creating strategic recommendations...'), 5000);
    
    stepTimeoutsRef.current = [stepTimeout1, stepTimeout2, stepTimeout3];

    try {
      console.log('📤 Calling generateTextOnlySuggestions...');
      const result = await generateTextOnlySuggestions(
        textPrompt.trim(),
        selectedCategory || undefined
      );

      console.log('generateTextOnlySuggestions result:', result);

      if (result && result.length > 0) {
        setShowSuggestions(true);
        setCurrentStage('suggestions');
        setLoadingProgress(100);
        setLoadingStep('Suggestions complete!');
        console.log('✅ Text-only suggestions completed, showing results');
        
        setTimeout(() => {
          setLoadingProgress(0);
          setLoadingStep('');
          // Scroll to suggestions results
          setTimeout(() => {
            suggestionsResultsRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 500);
        }, 1000);
      } else {
        console.log('❌ Suggestions failed');
        setLoadingProgress(0);
        setLoadingStep('Suggestions failed. Please try again.');
        setTimeout(() => {
          setLoadingStep('');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Suggestions error:', error);
      setLoadingProgress(0);
      setLoadingStep('Suggestions failed. Please try again.');
      setTimeout(() => {
        setLoadingStep('');
      }, 2000);
    } finally {
      cleanupTimers();
    }
  };

  const handleGenerateFormulation = async () => {
    console.log('🔍 handleGenerateFormulation called', { selectedFile: selectedFile?.name, finalPrompt, selectedCategory });
    
    // Allow text-only workflow when no file is selected but we have an enhanced prompt
    if (!selectedFile && !editableEnhancedPrompt.trim()) {
      console.log('❌ No file selected and no enhanced prompt available');
      return;
    }

    // Clean up any existing timers
    cleanupTimers();
    resetLoadingState();

    try {
      // Use the enhanced prompt from image analysis or the final prompt
      const enhancedPromptToUse = imageAnalysis?.enhanced_prompt || editableEnhancedPrompt || finalPrompt || textPrompt.trim() || "Generate a comprehensive analysis based on this product image";
      console.log('📤 Using enhanced prompt for formulation stream:', enhancedPromptToUse);
      
      // Start the SSE stream for formulation generation
      startFormulationStream({
        prompt: enhancedPromptToUse,
        category: selectedCategory || undefined
      });

    } catch (error) {
      console.error('❌ Formulation stream error:', error);
      setLoadingProgress(0);
      setLoadingStep('Analysis generation failed. Please try again.');
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
    setShowSuggestions(false);
    setCurrentStage('input');
    setFinalPrompt('');
    setEditableEnhancedPrompt('');
    setCurrentPromptIndex(0);
    reset();
    clearSuggestions();
  };

  const getDynamicPrompts = () => {
    const basePrompts = [
      "I want to create a premium skincare product for mature women that reduces fine lines and wrinkles, using natural ingredients like hyaluronic acid and vitamin C, with a luxury glass packaging and positioned as high-end anti-aging solution.",
      "I need a formulation for a functional beverage targeting health-conscious millennials, with immunity-boosting ingredients like elderberry and vitamin D, in sustainable packaging, positioned as a premium wellness drink.",
      "I'm looking to develop a pet food formula for senior dogs with joint health benefits, using glucosamine and omega-3 fatty acids, in resealable premium packaging, positioned as a premium veterinary-recommended diet."
    ];

    const categorySpecificPrompts = {
      cosmetics: [
        "I want to create a luxury anti-aging serum for women aged 35-55 that targets fine lines and wrinkles, using hyaluronic acid, peptides, and vitamin C, with elegant glass dropper packaging, positioned as a premium dermatologist-recommended solution.",
        "I need a brightening face cream for young professionals with sensitive skin, using niacinamide and licorice root extract, with airless pump packaging, positioned as a gentle yet effective daily moisturizer.",
        "I'm developing a night repair cream for mature skin that boosts collagen production, using retinol and ceramides, with luxurious jar packaging, positioned as a high-end anti-aging treatment."
      ],
      "pet food": [
        "I want to create a grain-free dog food for active adult dogs that supports muscle development, using real chicken as the first ingredient, with premium resealable packaging, positioned as a high-protein performance diet.",
        "I need a senior cat formula that supports kidney health and joint mobility, using low-phosphorus proteins and glucosamine, with easy-open packaging, positioned as a veterinary-recommended health solution.",
        "I'm developing a puppy formula that supports brain development and immune system, using DHA and prebiotics, with portion-controlled packaging, positioned as a premium growth and development diet."
      ],
      wellness: [
        "I want to create a daily immunity supplement for busy professionals, using vitamin C, zinc, and elderberry extract, with convenient capsule packaging, positioned as a premium preventive health solution.",
        "I need a sleep support formula for stressed adults, using melatonin and calming herbs like chamomile, with elegant bottle packaging, positioned as a natural sleep aid.",
        "I'm developing an energy-boosting supplement for athletes, using B-vitamins and natural caffeine from green tea, with travel-friendly packaging, positioned as a clean energy solution."
      ],
      beverages: [
        "I want to create a functional protein shake for fitness enthusiasts, using plant-based proteins and natural sweeteners, with sustainable bottle packaging, positioned as a clean nutrition solution.",
        "I need a detox tea blend for wellness seekers, using organic herbs and natural flavors, with biodegradable tea bag packaging, positioned as a premium wellness beverage.",
        "I'm developing a probiotic drink for gut health, using live cultures and natural fruit flavors, with glass bottle packaging, positioned as a premium digestive health solution."
      ],
      textiles: [
        "I want to create a moisture-wicking athletic fabric for performance wear, using bamboo and spandex blend, with sustainable dyeing process, positioned as a premium eco-friendly sportswear material.",
        "I need a soft, breathable fabric for baby clothing, using organic cotton and bamboo, with hypoallergenic properties, positioned as a premium gentle fabric for sensitive skin.",
        "I'm developing a durable outdoor fabric for adventure gear, using recycled polyester and waterproof coating, with sustainable manufacturing, positioned as a premium outdoor performance material."
      ],
      "desi masala": [
        "I want to create a premium biryani masala blend for home cooks, using whole spices and traditional proportions, with airtight glass packaging, positioned as an authentic restaurant-quality spice mix.",
        "I need a tandoori spice blend for grilling enthusiasts, using smoked paprika and traditional herbs, with resealable packaging, positioned as a premium barbecue seasoning.",
        "I'm developing a chaat masala for street food lovers, using tangy amchur and aromatic spices, with convenient shaker packaging, positioned as a versatile flavor enhancer."
      ]
    };

    return categorySpecificPrompts[selectedCategory as keyof typeof categorySpecificPrompts] || basePrompts;
  };

  const getCurrentPrompt = () => {
    const prompts = getDynamicPrompts();
    return prompts[currentPromptIndex] || prompts[0];
  };

  const renderLoadingState = () => {
    if (!loading && loadingProgress === 0) return null;

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
              <h3 className="text-xl font-bold font-sans text-gray-900 mb-2">
                {loadingType === 'analysis' && 'Analyzing Image...'}
                {loadingType === 'formulation' && 'Creating Comprehensive Analysis...'}
                {loadingType === 'suggestions' && 'Generating Suggestions...'}
              </h3>
              <p className="text-gray-600 text-sm font-sans">{loadingStep}</p>
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
      {/* Status Bar for SSE Streaming */}
      <StatusBar
        isVisible={currentStatus !== null}
        message={currentStatus?.message || ''}
        progress={currentStatus?.progress || 0}
        status={currentStatus?.status || 'loading'}
      />
      
      {/* Text Input with Category Styling */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <label className={`block text-lg font-semibold font-sans ${colors.text}`}>
          Tell us what you want to create
        </label>
        
        {/* Dynamic Example Prompts - Only show when category is selected */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center mb-3">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium font-sans text-gray-700">Example prompts to help you get started:</span>
            </div>
            <motion.div
              key={currentPromptIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-sm text-gray-600 italic leading-relaxed font-sans"
            >
              "{getCurrentPrompt()}"
            </motion.div>
            <div className="flex justify-center mt-3">
              <div className="flex space-x-1">
                {getDynamicPrompts().map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentPromptIndex ? colors.icon : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        <textarea
          value={textPrompt}
          onChange={(e) => setTextPrompt(e.target.value)}
          placeholder="Describe your product idea, target audience, and key requirements..."
          className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 transition-all resize-none text-sm font-sans ${
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
        <label className={`block text-lg font-semibold font-sans ${colors.text}`}>
          Even if you cant describe what you want, just upload an image of the product you want to create
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

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Image Analysis Button - Only show when image is uploaded */}
        {selectedFile && currentStage === 'input' && (
          <motion.button
            ref={analyzeButtonRef}
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
                <span>Analyze</span>
              </div>
            )}
          </motion.button>
        )}

        {/* Text-Only Assess Button - Show when text is provided but no image */}
        {!selectedFile && textPrompt.trim() && currentStage === 'input' && (
          <motion.button
            ref={analyzeButtonRef}
            onClick={(e) => {
              console.log('🔘 Assess Text button clicked', { loading, textPrompt });
              handleAssessTextOnly();
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
                <span>Generating Suggestions...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Assess</span>
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
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Formulation Output Section - Image Analysis */}
          {imageAnalysis && !loading && (
            <motion.div
          ref={imageAnalysisResultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-r from-green-50 to-emerald-50 p-6`}
            >
          <div className="mb-6">
            <h3 className={`text-xl font-bold font-sans ${colors.text} mb-2`}>
              We read your intent and analyzed your upload, and this is what we think you want..
            </h3>
            <p className="text-gray-600 text-sm font-sans">
              Our model combined your requirements with the image analysis to create this comprehensive prompt
            </p>
              </div>
              
              <div className="bg-white/90 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium font-sans text-green-600">Comprehensive Formulation Prompt</span>
              <div className="flex gap-2">
                  <button
                  onClick={() => {
                    setEditableEnhancedPrompt(imageAnalysis.enhanced_prompt || '');
                  }}
                    className="text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                  >
                  Regenerate Prompt
                </button>
                <button
                  onClick={() => {
                    setEditableEnhancedPrompt("");
                  }}
                  className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                >
                  Clear Prompt
                  </button>
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
                <textarea
                value={editableEnhancedPrompt || imageAnalysis.enhanced_prompt || "The comprehensive formulation prompt will appear here..."}
                  onChange={(e) => setEditableEnhancedPrompt(e.target.value)}
                className="w-full text-sm text-green-700 leading-relaxed bg-transparent border-none outline-none resize-none min-h-[200px] font-sans whitespace-pre-wrap"
                placeholder="The comprehensive formulation prompt will appear here..."
              />
                </div>
              </div>
              
          {/* Copy Button */}
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
              className="text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors"
            >
              Copy Prompt
            </button>
            </div>
            
            {/* Generate Formulation Button */}
            <motion.button
            onClick={() => {
              console.log('🔘 Generate Formulation button clicked', { loading, selectedFile: selectedFile?.name, editableEnhancedPrompt });
              handleGenerateFormulation();
              }}
              disabled={loading || isStreaming || (!selectedFile && !editableEnhancedPrompt.trim())}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            className={`w-full mt-4 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform shadow-lg hover:shadow-xl
                         ${loading || isStreaming || (!selectedFile && !editableEnhancedPrompt.trim())
                           ? 'bg-gray-300 cursor-not-allowed'
                           : `bg-gradient-to-r ${colors.gradient} hover:${colors.hoverGradient} hover:scale-[1.02] active:scale-[0.98]`
                         }`}
            >
              {loading || isStreaming ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isStreaming ? 'Streaming Analysis...' : 'Generating Formulation...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Comprehensive Analysis</span>
                </div>
              )}
            </motion.button>
          </motion.div>
        )}

      {/* Formulation Output Section - Text Only */}
      {showAnalysis && !imageAnalysis && !loading && editableEnhancedPrompt.trim() && (
        <motion.div
          ref={imageAnalysisResultsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-r from-blue-50 to-indigo-50 p-6`}
        >
          <div className="mb-6">
            <h3 className={`text-xl font-bold font-sans ${colors.text} mb-2`}>
              Based on your requirements, here's your enhanced formulation prompt
            </h3>
            <p className="text-gray-600 text-sm font-sans">
              You can edit this prompt before proceeding to comprehensive analysis
            </p>
          </div>
          
          <div className="bg-white/90 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium font-sans text-blue-600">Enhanced Formulation Prompt</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditableEnhancedPrompt("");
                  }}
                  className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                >
                  Clear Prompt
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <textarea
                value={editableEnhancedPrompt}
                onChange={(e) => setEditableEnhancedPrompt(e.target.value)}
                className="w-full text-sm text-blue-700 leading-relaxed bg-transparent border-none outline-none resize-none min-h-[200px] font-sans whitespace-pre-wrap"
                placeholder="The enhanced formulation prompt will appear here..."
              />
            </div>
          </div>
          
          {/* Copy Button */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                const textarea = document.createElement('textarea');
                textarea.value = editableEnhancedPrompt;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
            >
              Copy Prompt
            </button>
          </div>
          
          {/* Generate Formulation Button */}
          <motion.button
            onClick={() => {
              console.log('🔘 Generate Formulation button clicked (text-only)', { loading, editableEnhancedPrompt });
              handleGenerateFormulation();
            }}
            disabled={loading || isStreaming || !editableEnhancedPrompt.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full mt-4 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform shadow-lg hover:shadow-xl
                       ${loading || isStreaming || !editableEnhancedPrompt.trim()
                         ? 'bg-gray-300 cursor-not-allowed'
                         : `bg-gradient-to-r ${colors.gradient} hover:${colors.hoverGradient} hover:scale-[1.02] active:scale-[0.98]`
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
                <span>Generate Comprehensive Analysis</span>
              </div>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Text-Only Suggestions Section */}
      {showSuggestions && suggestions.length > 0 && !loading && (
        <motion.div
          ref={suggestionsResultsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-r from-blue-50 to-indigo-50 p-6`}
        >
          <div className="mb-6">
            <h3 className={`text-xl font-bold font-sans ${colors.text} mb-2`}>
              Based on your requirements, here are 3 strategic formulation suggestions
            </h3>
            <p className="text-gray-600 text-sm font-sans">
              Each suggestion includes the formulation approach, business benefits, and implementation strategy
            </p>
          </div>

          <div className="space-y-6">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 border border-blue-200 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className={`text-lg font-semibold font-sans ${colors.text}`}>
                    Suggestion {index + 1}
                  </h4>
                                     <div className="flex gap-2">
                                         <button
                      onClick={() => {
                        setEditableEnhancedPrompt(suggestion.prompt);
                        setFinalPrompt(suggestion.prompt);
                        // Hide suggestions and show the enhanced prompt section (like image analysis results)
                        setShowSuggestions(false);
                        setShowAnalysis(true);
                        setCurrentStage('analysis');
                        // Scroll to the enhanced prompt section
                        setTimeout(() => {
                          imageAnalysisResultsRef.current?.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                          });
                        }, 500);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors cursor-pointer"
                    >
                      Use This
                    </button>
                   </div>
                </div>

                <div className="space-y-4">
                  {/* Formulation Prompt */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Formulation Approach</h5>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded">
                      {suggestion.prompt}
                    </p>
                  </div>

                  {/* Business Benefits */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Business Benefits</h5>
                    <p className="text-sm text-gray-600 leading-relaxed bg-green-50 p-3 rounded">
                      {suggestion.why}
                    </p>
                  </div>

                  {/* Implementation Strategy */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Implementation Strategy</h5>
                    <p className="text-sm text-gray-600 leading-relaxed bg-purple-50 p-3 rounded">
                      {suggestion.how}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={() => {
                if (suggestions.length > 0) {
                  setEditableEnhancedPrompt(suggestions[0].prompt);
                  setFinalPrompt(suggestions[0].prompt);
                  // Hide suggestions and show the enhanced prompt section
                  setShowSuggestions(false);
                  setShowAnalysis(true);
                  setCurrentStage('analysis');
                  // Scroll to the enhanced prompt section
                  setTimeout(() => {
                    imageAnalysisResultsRef.current?.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }, 500);
                }
              }}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform shadow-lg hover:shadow-xl
                         ${loading
                           ? 'bg-gray-300 cursor-not-allowed'
                           : `bg-gradient-to-r ${colors.gradient} hover:${colors.hoverGradient} hover:scale-[1.02] active:scale-[0.98]`
                         }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Comprehensive Analysis</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => {
                setShowSuggestions(false);
                clearSuggestions();
                setCurrentStage('input');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:text-gray-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Different Approach</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 6-Step Analysis Results */}
      {comprehensiveAnalysis && !loading && comprehensiveAnalysis.sections && (
        <div ref={comprehensiveAnalysisResultsRef} className="space-y-6">
          {comprehensiveAnalysis.sections.formulation_summary && (
            <FormulationSummary 
              content={comprehensiveAnalysis.sections.formulation_summary} 
              colors={colors} 
            />
          )}
          {comprehensiveAnalysis.sections.formulation_details && (
            <FormulationDetails 
              content={comprehensiveAnalysis.sections.formulation_details} 
              colors={colors} 
            />
          )}
          {comprehensiveAnalysis.sections.market_research && (
            <MarketResearch 
              selectedCategory={selectedCategory || ''}
              selectedCity={selectedCity}
              localMarketData={localMarketData}
              onCityChange={setSelectedCity}
              productQuery={textPrompt || imageAnalysis?.enhanced_prompt || ''}
            />
          )}
          {comprehensiveAnalysis.sections.manufacturing_considerations && (
            <ManufacturingConsiderations 
              content={comprehensiveAnalysis.sections.manufacturing_considerations} 
              colors={colors} 
            />
          )}
          {comprehensiveAnalysis.sections.unit_economics && (
            <UnitEconomics 
              content={comprehensiveAnalysis.sections.unit_economics} 
              colors={colors} 
              selectedCategory={selectedCategory || undefined} // fix type for prop
            />
          )}
          {comprehensiveAnalysis.sections.packaging_branding && (
            <PackagingBranding 
              content={comprehensiveAnalysis.sections.packaging_branding} 
              colors={colors} 
              selectedCategory={selectedCategory} // <-- pass selectedCategory
            />
          )}
                        </div>
      )}

      {/* SSE Formulation Results */}
      {sseFormulation && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          data-sse-results
        >
          <div className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-r from-green-50 to-emerald-50 p-6`}>
            <div className="mb-6">
              <h3 className={`text-2xl font-bold font-sans ${colors.text} mb-2`}>
                🎉 Your Formulation is Ready!
              </h3>
              <p className="text-gray-600 text-sm font-sans">
                Your comprehensive formulation analysis has been generated successfully.
              </p>
            </div>

            <div className="space-y-6">
              {/* Product Name */}
              <div className="bg-white/90 border border-green-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Product Name</h4>
                <p className="text-gray-700">{sseFormulation.product_name}</p>
              </div>

              {/* Reasoning */}
              <div className="bg-white/90 border border-green-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Scientific Reasoning</h4>
                <p className="text-gray-700 leading-relaxed">{sseFormulation.reasoning}</p>
              </div>

              {/* Ingredients */}
              {sseFormulation.ingredients && sseFormulation.ingredients.length > 0 && (
                <div className="bg-white/90 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-4">Ingredients</h4>
                  <div className="space-y-3">
                    {sseFormulation.ingredients.map((ingredient, index) => (
                      <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-800">{ingredient.name}</span>
                          <span className="text-green-600 font-semibold">{ingredient.percent}%</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{ingredient.why_chosen}</p>
                        <p className="text-sm text-green-600">Cost: ${ingredient.cost_per_100ml}/100ml</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manufacturing Steps */}
              {sseFormulation.manufacturing_steps && sseFormulation.manufacturing_steps.length > 0 && (
                <div className="bg-white/90 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-4">Manufacturing Steps</h4>
                  <ol className="space-y-2">
                    {sseFormulation.manufacturing_steps.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-sm font-medium mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Cost Information */}
              <div className="bg-white/90 border border-green-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Cost Analysis</h4>
                <p className="text-xl font-bold text-green-600">
                  Estimated Cost: ${sseFormulation.estimated_cost}/100ml
                </p>
              </div>

              {/* Safety Notes */}
              {sseFormulation.safety_notes && sseFormulation.safety_notes.length > 0 && (
                <div className="bg-white/90 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-4">Safety Notes</h4>
                  <ul className="space-y-2">
                    {sseFormulation.safety_notes.map((note, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        <span className="text-gray-700">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Marketing Inspiration */}
              {sseFormulation.packaging_marketing_inspiration && (
                <div className="bg-white/90 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-2">Marketing & Packaging Ideas</h4>
                  <p className="text-gray-700 leading-relaxed">{sseFormulation.packaging_marketing_inspiration}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* SSE Error Display */}
      {sseError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-xl">❌</span>
            <div>
              <h4 className="text-red-800 font-semibold">Error</h4>
              <p className="text-red-700">{sseError}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}; 