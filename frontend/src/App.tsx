import React, { useState, useRef } from 'react';
import { PromptInput } from './components/FormulationEngine';
import { MultimodalFormulation } from './components/MultimodalFormulation';
import LandingPage from './components/LandingPage';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'multimodal'>('multimodal');
  const promptInputRef = useRef<HTMLDivElement>(null);

  console.log('🛠️ Parent component loaded');

  // Function to handle category selection with smooth scrolling
  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
    
    // Smooth scroll to prompt input
    setTimeout(() => {
      if (promptInputRef.current) {
        promptInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Function to handle landing page completion
  const handleLandingComplete = () => {
    setShowLanding(false);
  };

  // If showing landing page, render LandingPage component
  if (showLanding) {
    return <LandingPage onComplete={handleLandingComplete} />;
  }

  // Main app UI (only shown after landing page completion)
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-purple-700">Build Faster – Launch Smarter</h1>
          <p className="text-gray-600 mt-2">Idea to formulation, creation to marketing in minutes.</p>
        </header>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          {[
            { 
              label: "Cosmetics", 
              value: "cosmetics", 
              icon: "💄",
              gradient: "from-pink-400 via-purple-400 to-indigo-400",
              hoverGradient: "from-pink-500 via-purple-500 to-indigo-500",
              description: "Skincare & Beauty"
            },
            { 
              label: "Pet Food", 
              value: "pet food", 
              icon: "🐾",
              gradient: "from-orange-400 via-amber-400 to-yellow-400",
              hoverGradient: "from-orange-500 via-amber-500 to-yellow-500",
              description: "Pet Nutrition"
            },
            { 
              label: "Wellness", 
              value: "wellness", 
              icon: "🌱",
              gradient: "from-green-400 via-emerald-400 to-teal-400",
              hoverGradient: "from-green-500 via-emerald-500 to-teal-500",
              description: "Health & Supplements"
            },
            { 
              label: "Beverages", 
              value: "beverages", 
              icon: "🥤",
              gradient: "from-blue-400 via-cyan-400 to-teal-400",
              hoverGradient: "from-blue-500 via-cyan-500 to-teal-500",
              description: "Drinks & Beverages"
            },
            { 
              label: "Textiles", 
              value: "textiles", 
              icon: "🧵",
              gradient: "from-red-400 via-pink-400 to-purple-400",
              hoverGradient: "from-red-500 via-pink-500 to-purple-500",
              description: "Fabric & Materials"
            },
            { 
              label: "Desi Masala", 
              value: "desi masala", 
              icon: "🌶️",
              gradient: "from-yellow-400 via-orange-400 to-red-400",
              hoverGradient: "from-yellow-500 via-orange-500 to-red-500",
              description: "Indian Spices & Blends",
              isNew: true
            }
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategorySelection(cat.value)}
              className={`group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl font-semibold border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl h-48 w-full
                ${selectedCategory === cat.value
                  ? `bg-gradient-to-r ${cat.gradient} text-white border-transparent shadow-2xl shadow-purple-500/25`
                  : `bg-white/80 backdrop-blur-sm text-gray-700 border-gray-200 hover:bg-gradient-to-r ${cat.hoverGradient} hover:text-white hover:border-transparent`
                }`}
              aria-pressed={selectedCategory === cat.value}
              aria-label={`Select ${cat.label} category`}
            >
              {/* Glow effect for selected */}
              {selectedCategory === cat.value && (
                <div className={`absolute -inset-2 bg-gradient-to-r ${cat.gradient} rounded-2xl blur opacity-75 animate-pulse`}></div>
              )}
              
              {/* Subtle glow effect on hover */}
              <div className={`absolute -inset-2 bg-gradient-to-r ${cat.hoverGradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
              
              {/* NEW badge */}
              {cat.isNew && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                  NEW
                </div>
              )}
              
              <div className="relative z-10 flex flex-col items-center">
                <span className={`text-5xl mb-3 transition-transform duration-300 group-hover:scale-110 ${selectedCategory === cat.value ? 'animate-bounce' : ''}`}>
                  {cat.icon}
                </span>
                <span className="text-xl font-bold text-center">{cat.label}</span>
                <span className={`text-sm mt-2 text-center transition-colors duration-300 ${selectedCategory === cat.value ? 'text-white/80' : 'text-gray-500 group-hover:text-white/80'}`}>
                  {cat.description}
                </span>
              </div>
              
              {/* Selection indicator */}
              {selectedCategory === cat.value && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Input Mode Toggle */}
        <div className="flex flex-col items-center mb-8">
          <div className={`rounded-lg p-1 shadow-lg transition-all ${
            selectedCategory ? 'bg-white' : 'bg-gray-100'
          }`}>
            <div className="flex">
              <button
                onClick={() => setInputMode('text')}
                disabled={!selectedCategory}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  !selectedCategory
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : inputMode === 'text'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Text-Only
              </button>
              <button
                onClick={() => setInputMode('multimodal')}
                disabled={!selectedCategory}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  !selectedCategory
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : inputMode === 'multimodal'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Multi-Modal
              </button>
            </div>
          </div>
          {!selectedCategory && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-500">Please select a category first to choose input mode</p>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        {selectedCategory ? (
        <div ref={promptInputRef}>
          {inputMode === 'text' ? (
            <PromptInput
              onResult={(data) => {
                console.log('🔄 App.tsx received data:', data);
                  // Handle text-only formulation if needed
              }}
              selectedCategory={selectedCategory}
            />
          ) : (
            <MultimodalFormulation
                onResult={() => {
                  // No longer needed since results are displayed directly in the component
              }}
              selectedCategory={selectedCategory}
            />
          )}
        </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Start?</h3>
              <p className="text-gray-500 mb-4">Select a product category above to begin your formulation journey</p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
              </div>
            </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default App;
