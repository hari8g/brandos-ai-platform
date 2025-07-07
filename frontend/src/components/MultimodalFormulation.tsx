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
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>('input');
  const [selectedSuggestion, setSelectedSuggestion] = useState<MultimodalSuggestion | null>(null);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingType, setLoadingType] = useState<'analysis' | 'suggestions' | 'formulation'>('analysis');
  const [editableEnhancedPrompt, setEditableEnhancedPrompt] = useState('');

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

  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowAnalysis(false);
    setCurrentStage('input');
    clearSuggestions();
    setSelectedSuggestion(null);
    setFinalPrompt('');
    setLoadingProgress(0);
    setLoadingStep('');
    setEditableEnhancedPrompt('');
  };

  const handleImageRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowAnalysis(false);
    setCurrentStage('input');
    clearSuggestions();
    setSelectedSuggestion(null);
    setFinalPrompt('');
    setLoadingProgress(0);
    setLoadingStep('');
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

    setLoadingType('analysis');
    setLoadingProgress(0);
    setLoadingStep('Starting image analysis...');

    // Simulate progress for analysis
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const stepTimeout1 = setTimeout(() => setLoadingStep('Analyzing visual elements...'), 1000);
    const stepTimeout2 = setTimeout(() => setLoadingStep('Extracting product insights...'), 3000);
    const stepTimeout3 = setTimeout(() => setLoadingStep('Generating enhanced prompt...'), 5000);

    console.log('📤 Calling analyzeImage...');
    const result = await analyzeImage(
      selectedFile,
      textPrompt.trim() || "Analyze this product image",
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

    clearInterval(progressInterval);
    clearTimeout(stepTimeout1);
    clearTimeout(stepTimeout2);
    clearTimeout(stepTimeout3);
  };

  const handleGenerateSuggestions = async () => {
    if (!imageAnalysis) return;

    setLoadingType('suggestions');
    setLoadingProgress(0);
    setLoadingStep('Generating suggestions...');

    // Simulate progress for suggestions
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    const stepTimeout1 = setTimeout(() => setLoadingStep('Analyzing image insights...'), 1000);
    const stepTimeout2 = setTimeout(() => setLoadingStep('Creating enhanced prompts...'), 3000);
    const stepTimeout3 = setTimeout(() => setLoadingStep('Finalizing suggestions...'), 5000);

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

    clearInterval(progressInterval);
    clearTimeout(stepTimeout1);
    clearTimeout(stepTimeout2);
    clearTimeout(stepTimeout3);
  };

  const handleUseSuggestion = (suggestion: MultimodalSuggestion) => {
    setSelectedSuggestion(suggestion);
    setFinalPrompt(suggestion.prompt);
    setCurrentStage('ready');
    console.log('✅ Suggestion selected, ready for formulation generation');
  };

  const handleAnalyzeAndFuse = async () => {
    console.log('🔍 handleAnalyzeAndFuse called', { selectedFile: selectedFile?.name, finalPrompt, selectedCategory });
    
    if (!selectedFile) {
      console.log('❌ No file selected');
      return;
    }

    setLoadingType('formulation');
    setLoadingProgress(0);
    setLoadingStep('Starting formulation generation...');

    // Simulate progress for formulation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 8;
      });
    }, 400);

    const stepTimeout1 = setTimeout(() => setLoadingStep('Analyzing ingredients...'), 2000);
    const stepTimeout2 = setTimeout(() => setLoadingStep('Calculating proportions...'), 5000);
    const stepTimeout3 = setTimeout(() => setLoadingStep('Generating formulation...'), 8000);

    console.log(' Calling analyzeAndFuse...');
    const result = await analyzeAndFuse(
      selectedFile,
      finalPrompt || textPrompt.trim() || "Generate a formulation based on this product image",
      selectedCategory || undefined,
      undefined,
      selectedStrategy
    );

    console.log(' analyzeAndFuse result:', result);

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

    clearInterval(progressInterval);
    clearTimeout(stepTimeout1);
    clearTimeout(stepTimeout2);
    clearTimeout(stepTimeout3);
  };

  const handleReset = () => {
    setTextPrompt('');
    handleImageRemove();
    setShowAnalysis(false);
    setSelectedStrategy('enhanced');
    setCurrentStage('input');
    clearSuggestions();
    setSelectedSuggestion(null);
    setFinalPrompt('');
    setLoadingProgress(0);
    setLoadingStep('');
    setEditableEnhancedPrompt('');
    reset();
  };

  const getCategoryIcon = () => {
    switch (selectedCategory) {
      case 'cosmetics': return '💄';
      case 'pet food': return '🐾';
      case 'wellness': return '🌱';
      default: return '🔬';
    }
  };

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'cosmetics': return 'Beauty & Cosmetics';
      case 'pet food': return 'Pet Nutrition';
      case 'wellness': return 'Health & Wellness';
      default: return 'Product Formulation';
    }
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
          placeholder={`Describe your ${selectedCategory || 'product'} idea, target audience, and requirements...`}
          className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 transition-all resize-none text-lg ${
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
          <label className={`block text-lg font-semibold ${colors.text}`}>
            Fusion Strategy
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FUSION_STRATEGIES.map((strategy) => (
              <motion.button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedStrategy === strategy.id
                    ? `${colors.border} ${colors.bg} shadow-lg`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                disabled={loading}
              >
                <div className="text-center">
                  <h3 className={`font-bold text-lg mb-2 ${selectedStrategy === strategy.id ? colors.text : 'text-gray-900'}`}>
                    {strategy.name}
                  </h3>
                  <p className="text-sm text-gray-600">{strategy.description}</p>
                </div>
              </motion.button>
            ))}
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
            disabled={loading || !textPrompt.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform
                       ${loading || !textPrompt.trim() 
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

        {currentStage === 'ready' && (
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
        )}

        <motion.button
          onClick={handleReset}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 border-2 border-gray-300 rounded-xl font-bold text-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          Reset
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

      {/* Improved Image Analysis Results UI/UX */}
      <AnimatePresence>
        {showAnalysis && imageAnalysis && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-8 shadow-lg`}
          >
            {/* Summary Section */}
            {(imageAnalysis.product_type || imageAnalysis.brand_name || imageAnalysis.market_positioning) && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-1">Image Analysis Summary</h3>
                <p className="text-gray-700 text-sm">
                  {imageAnalysis.brand_name && <span><b>Brand:</b> {imageAnalysis.brand_name}. </span>}
                  {imageAnalysis.product_type && <span><b>Product Type:</b> {imageAnalysis.product_type}. </span>}
                  {imageAnalysis.market_positioning && <span><b>Market Positioning:</b> {imageAnalysis.market_positioning}.</span>}
                </p>
              </div>
            )}

            {/* Confidence/Uncertainty Note */}
            {(!imageAnalysis.product_type || !imageAnalysis.visual_elements?.length) && (
              <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <span className="text-yellow-700 text-sm font-medium">Some details could not be confidently determined from the image. Results may be incomplete or uncertain.</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Insights */}
              {imageAnalysis.product_insights && imageAnalysis.product_insights.length > 0 && (
                <div className={`p-6 rounded-xl bg-white border ${colors.border}`}>
                  <h5 className={`text-xl font-bold ${colors.text} mb-2`}>Product Insights</h5>
                  <ul className="space-y-2 list-disc list-inside">
                    {imageAnalysis.product_insights.map((insight, index) => (
                      <li key={index} className="text-gray-700">{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Visual Elements */}
              {imageAnalysis.visual_elements && imageAnalysis.visual_elements.length > 0 && (
                <div className={`p-6 rounded-xl bg-white border ${colors.border}`}>
                  <h5 className={`text-xl font-bold ${colors.text} mb-2`}>Visual Elements</h5>
                  <ul className="space-y-2 list-disc list-inside">
                    {imageAnalysis.visual_elements.map((element, index) => (
                      <li key={index} className="text-gray-700">{element}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color Scheme */}
              {imageAnalysis.color_scheme && (
                <div className={`p-6 rounded-xl bg-white border ${colors.border}`}>
                  <h4 className={`text-xl font-bold ${colors.text} mb-2`}>Color Scheme</h4>
                  <p className="text-gray-700 text-lg">{imageAnalysis.color_scheme}</p>
                </div>
              )}

              {/* Packaging Style */}
              {imageAnalysis.packaging_style && (
                <div className={`p-6 rounded-xl bg-white border ${colors.border}`}>
                  <h4 className={`text-xl font-bold ${colors.text} mb-2`}>Packaging Style</h4>
                  <p className="text-gray-700 text-lg">{imageAnalysis.packaging_style}</p>
                </div>
              )}

              {/* Target Audience */}
              {imageAnalysis.target_audience_hints && imageAnalysis.target_audience_hints.length > 0 && (
                <div className={`p-6 rounded-xl bg-white border ${colors.border} lg:col-span-2`}>
                  <h4 className={`text-xl font-bold ${colors.text} mb-2`}>Target Audience</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    {imageAnalysis.target_audience_hints.map((hint, index) => (
                      <li key={index} className="text-gray-700">{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Ingredients */}
              {imageAnalysis.formulation_hints && imageAnalysis.formulation_hints.length > 0 && (
                <div className={`p-6 rounded-xl bg-white border ${colors.border}`}>
                  <h4 className={`text-xl font-bold ${colors.text} mb-2`}>Key Ingredients</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    {imageAnalysis.formulation_hints.map((ingredient: string, index: number) => (
                      <li key={index} className="text-gray-700">{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Market Positioning */}
              {imageAnalysis.market_positioning && (
                <div className={`p-6 rounded-xl bg-white border ${colors.border}`}>
                  <h4 className={`text-xl font-bold ${colors.text} mb-2`}>Market Positioning</h4>
                  <p className="text-gray-700 text-lg">{imageAnalysis.market_positioning}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Prompt Display with Editability */}
      {imageAnalysis && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-r from-green-50 to-emerald-50 p-6`}
        >
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2"></span>
            <h5 className="text-lg font-bold text-green-800">Enhanced Prompt</h5>
          </div>
          <textarea
            value={editableEnhancedPrompt || imageAnalysis.enhanced_prompt}
            onChange={(e) => setEditableEnhancedPrompt(e.target.value)}
            className="w-full p-4 text-green-700 text-sm leading-relaxed bg-white/80 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
            rows={4}
            placeholder="Edit the enhanced prompt here..."
          />
          
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
                <span>Assess & Query</span>
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

      {/* Final Prompt Display */}
      <AnimatePresence>
        {currentStage === 'ready' && selectedSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-medium text-blue-900">Selected Prompt</h3>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 leading-relaxed">{finalPrompt}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-blue-600">
                Ready to generate formulation with this enhanced prompt
              </div>
              <button
                onClick={() => setCurrentStage('suggestions')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Choose different prompt
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 