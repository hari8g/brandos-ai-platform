import React, { useState, useRef, Suspense } from 'react';
import { PromptInput } from './components/FormulationEngine';

// Code splitting with React.lazy for large components
const MultimodalFormulation = React.lazy(() => import('./components/MultimodalFormulation').then(module => ({ default: module.MultimodalFormulation })));
const LandingPage = React.lazy(() => import('./components/LandingPage'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'multimodal'>('multimodal');
  const promptInputRef = useRef<HTMLDivElement>(null);

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
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LandingPage onComplete={handleLandingComplete} />
      </Suspense>
    );
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
          ].map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategorySelection(category.value)}
              className={`relative group bg-gradient-to-br ${category.gradient} hover:${category.hoverGradient} 
                text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.value ? 'ring-4 ring-purple-300' : ''
                }`}
            >
              {category.isNew && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  NEW
                </div>
              )}
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-semibold text-lg">{category.label}</h3>
              <p className="text-sm opacity-90">{category.description}</p>
            </button>
          ))}
        </div>

        {/* Input Mode Toggle */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setInputMode('multimodal')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              inputMode === 'multimodal'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📸 Visual + Text
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              inputMode === 'text'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📝 Text Only
          </button>
        </div>

        {/* Prompt Input */}
        {selectedCategory ? (
        <div ref={promptInputRef}>
          {inputMode === 'text' ? (
            <PromptInput
              onResult={(data) => {
                  // Handle text-only formulation if needed
              }}
              selectedCategory={selectedCategory}
            />
          ) : (
            <Suspense fallback={<LoadingSpinner />}>
              <MultimodalFormulation
                onResult={() => {
                  // No longer needed since results are displayed directly in the component
                }}
                selectedCategory={selectedCategory}
              />
            </Suspense>
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
