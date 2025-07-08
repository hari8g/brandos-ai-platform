import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';
import { useMultimodal } from '../hooks/useMultimodal';
import { getCategoryColors } from '../lib/colorUtils';

interface MultimodalFormulationProps {
  onResult: (data: any) => void;
  selectedCategory: string | null;
}

type Stage = 'input' | 'analysis' | 'ready';

export const MultimodalFormulation: React.FC<MultimodalFormulationProps> = ({
  onResult,
  selectedCategory
}) => {
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>('input');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingType, setLoadingType] = useState<'analysis' | 'formulation'>('analysis');
  const [editableEnhancedPrompt, setEditableEnhancedPrompt] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Refs to store interval and timeout IDs for cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const promptIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    loading,
    error,
    imageAnalysis,
    multimodalResult,
    analyzeImage,
    analyzeAndFuse,
    reset
  } = useMultimodal();

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

  const handleImageSelect = (file: File) => {
    // Clean up any ongoing operations
    cleanupTimers();
    resetLoadingState();
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowAnalysis(false);
    setCurrentStage('input');
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

  const handleGenerateFormulation = async () => {
    console.log('🔍 handleGenerateFormulation called', { selectedFile: selectedFile?.name, finalPrompt, selectedCategory });
    
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
      const promptToUse = finalPrompt || textPrompt.trim() || "Generate a formulation based on this product image";
      console.log('📤 Using prompt for formulation:', promptToUse);
      
      const result = await analyzeAndFuse(
        selectedFile,
        promptToUse,
        selectedCategory || undefined
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
    setCurrentStage('input');
    setFinalPrompt('');
    setEditableEnhancedPrompt('');
    setCurrentPromptIndex(0);
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
                {loadingType === 'formulation' && 'Creating Formulation...'}
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

      {/* Single Analyze Button */}
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
                <span>Analyze</span>
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

      {/* Image Analysis Results with Accordion Style */}
      <AnimatePresence>
        {showAnalysis && imageAnalysis && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 shadow-lg`}
          >
            <div className="mb-6">
              <h3 className={`text-xl font-bold font-sans ${colors.text} mb-2`}>
                This is what we observed from the image upload
              </h3>
              <p className="text-gray-600 text-sm font-sans">
                Our model analyzed your product image and extracted these key insights
              </p>
            </div>

            <div className="space-y-4">
              {/* 1. Product Category & Intended Use */}
              {(imageAnalysis.product_category || imageAnalysis.intended_use) && (
                <div className={`bg-white/90 border ${colors.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${colors.icon} rounded-full mr-3`}></div>
                      <h5 className={`text-sm font-semibold font-sans ${colors.text}`}>Product Category & Intended Use</h5>
                    </div>
                    <svg className={`w-4 h-4 ${colors.text} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="space-y-2 text-sm font-sans">
                    {imageAnalysis.product_category && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Product:</span> <span className="text-gray-700">{imageAnalysis.product_category}</span>
                      </div>
                    )}
                    {imageAnalysis.intended_use && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Intended Use:</span> <span className="text-gray-700">{imageAnalysis.intended_use}</span>
                      </div>
                    )}
                    {imageAnalysis.usage_instructions && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Usage:</span> <span className="text-gray-700">{imageAnalysis.usage_instructions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Key Ingredients & Claims */}
              {(imageAnalysis.key_ingredients?.length > 0 || imageAnalysis.claims?.length > 0) && (
                <div className={`bg-white/90 border ${colors.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${colors.icon} rounded-full mr-3`}></div>
                      <h5 className={`text-sm font-semibold font-sans ${colors.text}`}>Key Ingredients & Claims</h5>
                    </div>
                    <svg className={`w-4 h-4 ${colors.text} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="space-y-2 font-sans">
                    {imageAnalysis.key_ingredients?.length > 0 && (
                      <div>
                        <span className={`text-sm font-medium ${colors.text}`}>Ingredients:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {imageAnalysis.key_ingredients.map((ingredient: string, index: number) => (
                            <span key={index} className={`text-xs ${colors.bg} ${colors.text} px-2 py-1 rounded-full`}>
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {imageAnalysis.claims?.length > 0 && (
                      <div>
                        <span className={`text-sm font-medium ${colors.text}`}>Claims:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {imageAnalysis.claims.map((claim: string, index: number) => (
                            <span key={index} className={`text-xs ${colors.bg} ${colors.text} px-2 py-1 rounded-full`}>
                              {claim}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Packaging Details */}
              {(imageAnalysis.packaging_type || imageAnalysis.packaging_size || imageAnalysis.packaging_material) && (
                <div className={`bg-white/90 border ${colors.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${colors.icon} rounded-full mr-3`}></div>
                      <h5 className={`text-sm font-semibold font-sans ${colors.text}`}>Packaging Details</h5>
                    </div>
                    <svg className={`w-4 h-4 ${colors.text} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="space-y-2 text-sm font-sans">
                    {imageAnalysis.packaging_type && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Type:</span> <span className="text-gray-700">{imageAnalysis.packaging_type}</span>
                      </div>
                    )}
                    {imageAnalysis.packaging_size && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Size:</span> <span className="text-gray-700">{imageAnalysis.packaging_size}</span>
                      </div>
                    )}
                    {imageAnalysis.packaging_material && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Material:</span> <span className="text-gray-700">{imageAnalysis.packaging_material}</span>
                      </div>
                    )}
                    {imageAnalysis.storage_requirements && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Storage:</span> <span className="text-gray-700">{imageAnalysis.storage_requirements}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Target Market & Audience */}
              {imageAnalysis.target_audience && (
                <div className={`bg-white/90 border ${colors.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${colors.icon} rounded-full mr-3`}></div>
                      <h5 className={`text-sm font-semibold font-sans ${colors.text}`}>Target Market & Audience</h5>
                    </div>
                    <svg className={`w-4 h-4 ${colors.text} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-sans">{imageAnalysis.target_audience}</p>
                </div>
              )}

              {/* 5. Brand & Positioning */}
              {(imageAnalysis.brand_style || imageAnalysis.competitor_positioning || imageAnalysis.price_positioning) && (
                <div className={`bg-white/90 border ${colors.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${colors.icon} rounded-full mr-3`}></div>
                      <h5 className={`text-sm font-semibold font-sans ${colors.text}`}>Brand & Positioning</h5>
                    </div>
                    <svg className={`w-4 h-4 ${colors.text} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="space-y-2 text-sm font-sans">
                    {imageAnalysis.brand_style && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Brand Style:</span> <span className="text-gray-700">{imageAnalysis.brand_style}</span>
                      </div>
                    )}
                    {imageAnalysis.competitor_positioning && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Positioning:</span> <span className="text-gray-700">{imageAnalysis.competitor_positioning}</span>
                      </div>
                    )}
                    {imageAnalysis.price_positioning && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Price:</span> <span className="text-gray-700">{imageAnalysis.price_positioning}</span>
                      </div>
                    )}
                    {imageAnalysis.brand_story && (
                      <div>
                        <span className={`font-medium ${colors.text}`}>Brand Story:</span> <span className="text-gray-700">{imageAnalysis.brand_story}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulation Output Section */}
      {imageAnalysis && !loading && (
        <motion.div
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
            disabled={loading || !selectedFile}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full mt-4 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform shadow-lg hover:shadow-xl
                       ${loading || !selectedFile
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
                <span>Generate Formulation</span>
              </div>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}; 