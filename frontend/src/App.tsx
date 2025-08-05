import React, { useState, useRef, Suspense, useEffect } from 'react';
import keepaliveService from './services/keepalive';
import DeploymentStatusBanner from './components/DeploymentStatusBanner';
// Code splitting with React.lazy for large components
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const PromptInput = React.lazy(() => import('./components/FormulationEngine/PromptInput'));

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
  const promptInputRef = useRef<HTMLDivElement>(null);

  // Initialize keepalive service for production
  useEffect(() => {
    const isProduction = window.location.hostname !== 'localhost';
    if (isProduction) {
      console.log('🚀 Initializing keepalive service for production environment');
      keepaliveService.startKeepalive();
    }
    
    return () => {
      keepaliveService.stopKeepalive();
    };
  }, []);

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
      <div>
        <DeploymentStatusBanner show={true} />
        <Suspense fallback={<LoadingSpinner />}>
          <LandingPage onComplete={handleLandingComplete} />
        </Suspense>
      </div>
    );
  }

  // Main app UI (only shown after landing page completion)
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex flex-col items-center">
      <DeploymentStatusBanner show={true} />
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-purple-700">Build Faster – Launch Smarter</h1>
          <p className="text-gray-600 mt-2">Idea to formulation, creation to marketing in minutes.</p>
        </header>

        {/* Category Selection - Centered with proper spacing for 2 items */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
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
              }
            ].map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategorySelection(category.value)}
                className={`relative group bg-gradient-to-br ${category.gradient} hover:${category.hoverGradient} 
                  text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.value ? 'ring-4 ring-purple-300' : ''
                  }`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-xl mb-2">{category.label}</h3>
                <p className="text-sm opacity-90">{category.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input - Only Text Mode */}
        {selectedCategory ? (
          <div ref={promptInputRef}>
            <Suspense fallback={<LoadingSpinner />}>
              <PromptInput
                onResult={(data) => {
                  // Handle text-only formulation if needed
                }}
                selectedCategory={selectedCategory}
              />
            </Suspense>
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
