import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocalMarket } from '@/hooks/useLocalMarket';
import { getCategoryColors } from '@/lib/colorUtils';

interface LocalMarketAnalysisProps {
  selectedCategory: string | null;
  productName?: string;
  ingredients?: Array<{ name: string; percent: number }>;
}

export const LocalMarketAnalysis: React.FC<LocalMarketAnalysisProps> = ({
  selectedCategory,
  productName = '',
  ingredients = []
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const {
    loading,
    error,
    marketData,
    availableCities,
    availableCategories,
    analyzeLocalMarket,
    getAvailableCities,
    getAvailableCategories,
    reset
  } = useLocalMarket();

  const colors = getCategoryColors(selectedCategory) || getCategoryColors(null);

  useEffect(() => {
    // Load available cities and categories on component mount
    getAvailableCities();
    getAvailableCategories();
  }, [getAvailableCities, getAvailableCategories]);

  useEffect(() => {
    // Reset when category changes
    reset();
    setShowAnalysis(false);
  }, [selectedCategory, reset]);

  const handleAnalyzeMarket = async () => {
    if (!selectedLocation || !selectedCategory) {
      return;
    }

    const request = {
      location: selectedLocation,
      category: selectedCategory,
      product_name: productName,
      ingredients: ingredients.map(ing => ing.name)
    };

    const result = await analyzeLocalMarket(request);
    if (result.success) {
      setShowAnalysis(true);
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return '0';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-r from-blue-50 to-indigo-50 p-6`}
      >
        <div className="mb-6">
          <h3 className={`text-xl font-bold font-sans ${colors.text} mb-2`}>
            📊 Local Market Size Analysis
          </h3>
          <p className="text-gray-600 text-sm font-sans">
            Analyze local market potential using Google Trends data and population triangulation
          </p>
        </div>

        {/* Location Selection */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium font-sans ${colors.text} mb-2`}>
              Select Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all font-sans ${
                colors.focus
              } ${colors.border} ${loading ? 'opacity-50' : ''}`}
              disabled={loading}
            >
              <option value="">Choose a city...</option>
              {availableCities && availableCities.map((city) => (
                <option key={city} value={city}>
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Analyze Button */}
          <motion.button
            onClick={handleAnalyzeMarket}
            disabled={loading || !selectedLocation || !selectedCategory}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform shadow-lg hover:shadow-xl
                       ${loading || !selectedLocation || !selectedCategory
                         ? 'bg-gray-300 cursor-not-allowed' 
                         : `bg-gradient-to-r ${colors.gradient} hover:${colors.hoverGradient} hover:scale-[1.02] active:scale-[0.98]`
                       }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Market...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analyze Local Market</span>
              </div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && error.length > 0 && (
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

      {/* Market Analysis Results */}
      {marketData && showAnalysis && marketData.location && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-r from-green-50 to-emerald-50 p-6`}
        >
          <div className="mb-6">
            <h3 className={`text-xl font-bold font-sans ${colors.text} mb-2`}>
              📈 Market Analysis Results for {marketData.location ? marketData.location.charAt(0).toUpperCase() + marketData.location.slice(1) : 'Unknown Location'}
            </h3>
            <p className="text-gray-600 text-sm font-sans">
              Local market size analysis using Google Trends and population data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Market Size */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-4`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-sm font-bold`}>
                  ₹
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} text-sm`}>Market Size</h4>
                  <p className={`${colors.text} text-xs opacity-70`}>Estimated local market value</p>
                </div>
              </div>
              <div className={`${colors.text} text-xl font-bold`}>
                {formatCurrency(marketData.market_size || '0')}
              </div>
            </div>

            {/* Population */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-4`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-sm font-bold`}>
                  👥
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} text-sm`}>Population</h4>
                  <p className={`${colors.text} text-xs opacity-70`}>Total residents</p>
                </div>
              </div>
              <div className={`${colors.text} text-xl font-bold`}>
                {formatCurrency(marketData.population || '0')}
              </div>
            </div>

            {/* Internet Users */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-4`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-sm font-bold`}>
                  🌐
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} text-sm`}>Internet Users</h4>
                  <p className={`${colors.text} text-xs opacity-70`}>Online population</p>
                </div>
              </div>
              <div className={`${colors.text} text-xl font-bold`}>
                {formatCurrency(marketData.internet_users || '0')}
              </div>
            </div>

            {/* Confidence Level */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-4`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-sm font-bold`}>
                  🎯
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} text-sm`}>Confidence</h4>
                  <p className={`${colors.text} text-xs opacity-70`}>Data reliability</p>
                </div>
              </div>
              <div className={`${colors.text} text-xl font-bold`}>
                {marketData.confidence_level || 'N/A'}
              </div>
            </div>

            {/* Search Terms */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-4`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-sm font-bold`}>
                  🔍
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} text-sm`}>Search Terms</h4>
                  <p className={`${colors.text} text-xs opacity-70`}>Analyzed keywords</p>
                </div>
              </div>
              <div className={`${colors.text} text-xl font-bold`}>
                {marketData.search_terms ? marketData.search_terms.length : 0}
              </div>
            </div>

            {/* Data Sources */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-4`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-sm font-bold`}>
                  📊
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} text-sm`}>Data Sources</h4>
                  <p className={`${colors.text} text-xs opacity-70`}>Information sources</p>
                </div>
              </div>
              <div className={`${colors.text} text-xl font-bold`}>
                {marketData.data_sources ? marketData.data_sources.length : 0}
              </div>
            </div>
          </div>

          {/* Search Volume Analysis */}
          <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-6 mb-6`}>
            <h4 className={`font-semibold ${colors.text} text-lg mb-4`}>Search Volume Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketData.search_volume && Object.entries(marketData.search_volume).map(([term, volume]) => (
                <div key={term} className={`${colors.cardBg} border ${colors.border} rounded-lg p-3`}>
                  <div className="flex justify-between items-center">
                    <span className={`${colors.text} text-sm font-medium`}>{term}</span>
                    <span className={`${colors.text} text-sm font-bold`}>{volume.toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors.bg}`}
                        style={{ width: `${Math.min((volume / Math.max(...Object.values(marketData.search_volume || {}))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Methodology */}
          <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-6 mb-6`}>
            <h4 className={`font-semibold ${colors.text} text-lg mb-4`}>Methodology</h4>
            <div className={`${colors.text} text-sm leading-relaxed whitespace-pre-line`}>
              {marketData.methodology || 'Methodology not available'}
            </div>
          </div>

          {/* Assumptions */}
          <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-6 mb-6`}>
            <h4 className={`font-semibold ${colors.text} text-lg mb-4`}>Key Assumptions</h4>
            <ul className="space-y-2">
              {marketData.assumptions && marketData.assumptions.map((assumption, index) => (
                <li key={index} className={`${colors.text} text-sm leading-relaxed flex items-start`}>
                  <span className="w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></span>
                  {assumption}
                </li>
              ))}
            </ul>
          </div>

          {/* Analysis Summary */}
          <div className={`${colors.lightBg} border ${colors.border} rounded-xl p-6`}>
            <h4 className={`font-semibold ${colors.text} text-lg mb-4`}>Analysis Summary</h4>
            <div className={`${colors.text} text-sm leading-relaxed whitespace-pre-line`}>
              {marketData.analysis_summary || 'Analysis summary not available'}
            </div>
          </div>

          {/* Copy Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                const textarea = document.createElement('textarea');
                textarea.value = JSON.stringify(marketData, null, 2);
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
              }}
              className="text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors"
            >
              Copy Analysis
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}; 