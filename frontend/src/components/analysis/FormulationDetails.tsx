import React from 'react';
import { motion } from 'framer-motion';

interface FormulationDetailsProps {
  content: string | any;
  colors: any;
}

interface ParsedContent {
  formulation: string;
  value: string;
  moat: string;
  audience: string;
  competitors: string;
}

export const FormulationDetails: React.FC<FormulationDetailsProps> = ({ content, colors }) => {
  // Parse content from backend structured data
  const parseContent = (content: string | any): ParsedContent => {
    try {
      // If content is a JSON string, parse it
      if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('"'))) {
        const parsed = JSON.parse(content);
        return {
          formulation: parsed.formulation || content,
          value: parsed.value || "",
          moat: parsed.moat || "",
          audience: parsed.audience || "",
          competitors: parsed.competitors || ""
        };
      }
      
      // If content is already an object (from backend structured data)
      if (typeof content === 'object' && content !== null) {
        return {
          formulation: content.formulation || content,
          value: content.value || "",
          moat: content.moat || "",
          audience: content.audience || "",
          competitors: content.competitors || ""
        };
      }
      
      // Fallback to parsing as plain text
      return {
        formulation: typeof content === 'string' ? content : "",
        value: "This formulation delivers exceptional value through superior ingredient quality, innovative technology, and proven efficacy that justifies premium pricing while exceeding customer expectations.",
        moat: "Our competitive moat is built on proprietary formulations, exclusive ingredient access, and innovative delivery systems that create barriers to entry and ensure long-term market advantage.",
        audience: "Primary target: Consumers aged 25-55 with disposable income seeking premium quality products. Secondary: Health-conscious individuals who value efficacy and are willing to pay for superior formulations.",
        competitors: "Direct competitors include established brands in the premium segment, with our formulation offering superior ingredient quality and innovative technology at competitive pricing."
      };
    } catch (error) {
      console.error('Error parsing FormulationDetails content:', error);
      // Return fallback data
      return {
        formulation: typeof content === 'string' ? content : "",
        value: "This formulation delivers exceptional value through superior ingredient quality, innovative technology, and proven efficacy that justifies premium pricing while exceeding customer expectations.",
        moat: "Our competitive moat is built on proprietary formulations, exclusive ingredient access, and innovative delivery systems that create barriers to entry and ensure long-term market advantage.",
        audience: "Primary target: Consumers aged 25-55 with disposable income seeking premium quality products. Secondary: Health-conscious individuals who value efficacy and are willing to pay for superior formulations.",
        competitors: "Direct competitors include established brands in the premium segment, with our formulation offering superior ingredient quality and innovative technology at competitive pricing."
      };
    }
  };

  const sections = parseContent(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 px-8 py-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">2️⃣</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Formulation Details
            </h3>
            <p className="text-blue-100 text-sm">
              What went into the formulation, why it's valuable, moat, audience & competitors
            </p>
          </div>
        </div>
      </div>

      {/* Content with improved spacing */}
      <div className="p-8 space-y-8">
        {/* What Went Into the Formulation Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">What Went Into the Formulation</h4>
          </div>
          <div className="pl-11">
            <div className="space-y-3">
              {/* Key Ingredients Accordion */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('key-ingredients-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-blue-900">Key Ingredients & Functions</span>
                  <svg className="w-5 h-5 text-blue-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="key-ingredients-content" className="hidden px-4 py-3 bg-blue-50">
                  <p className="text-sm text-gray-700">
                    {sections.formulation.split('.')[0] || "The formulation incorporates carefully selected key ingredients for optimal performance."}
                  </p>
                </div>
              </div>

              {/* Ingredient Selection Accordion */}
              <div className="bg-cyan-50 rounded-lg border border-cyan-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('ingredient-selection-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-cyan-100 hover:bg-cyan-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-cyan-900">Why These Ingredients</span>
                  <svg className="w-5 h-5 text-cyan-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="ingredient-selection-content" className="hidden px-4 py-3 bg-cyan-50">
                  <p className="text-sm text-gray-700">
                    {sections.formulation.split('.')[1] || "Each ingredient was chosen for its specific benefits and proven efficacy."}
                  </p>
                </div>
              </div>

              {/* Synergistic Effects Accordion */}
              <div className="bg-indigo-50 rounded-lg border border-indigo-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('synergistic-effects-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-indigo-100 hover:bg-indigo-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-indigo-900">Synergistic Effects</span>
                  <svg className="w-5 h-5 text-indigo-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="synergistic-effects-content" className="hidden px-4 py-3 bg-indigo-50">
                  <p className="text-sm text-gray-700">
                    {sections.formulation.split('.')[2] || "These ingredients work together synergistically to enhance overall product performance."}
                  </p>
                </div>
              </div>

              {/* Innovative Aspects Accordion */}
              <div className="bg-purple-50 rounded-lg border border-purple-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('innovative-aspects-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-purple-100 hover:bg-purple-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-purple-900">Innovative Aspects</span>
                  <svg className="w-5 h-5 text-purple-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="innovative-aspects-content" className="hidden px-4 py-3 bg-purple-50">
                  <p className="text-sm text-gray-700">
                    {sections.formulation.split('.')[3] || "The formulation features innovative approaches that differentiate it from conventional products."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why It's Valuable Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Why It's Valuable</h4>
          </div>
          <div className="pl-11">
            <div className="space-y-3">
              {/* Value Proposition Accordion */}
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('value-proposition-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-yellow-100 hover:bg-yellow-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-yellow-900">Value Proposition</span>
                  <svg className="w-5 h-5 text-yellow-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="value-proposition-content" className="hidden px-4 py-3 bg-yellow-50">
                  <p className="text-sm text-gray-700">
                    {sections.value.split('.')[0] || "This formulation delivers exceptional value through superior ingredient quality and proven efficacy."}
                  </p>
                </div>
              </div>

              {/* Problem Solving Accordion */}
              <div className="bg-orange-50 rounded-lg border border-orange-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('problem-solving-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-orange-100 hover:bg-orange-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-orange-900">Problem Solving</span>
                  <svg className="w-5 h-5 text-orange-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="problem-solving-content" className="hidden px-4 py-3 bg-orange-50">
                  <p className="text-sm text-gray-700">
                    {sections.value.split('.')[1] || "It solves key customer problems by providing innovative solutions that address specific needs."}
                  </p>
                </div>
              </div>

              {/* Premium Features Accordion */}
              <div className="bg-amber-50 rounded-lg border border-amber-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('premium-features-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-amber-100 hover:bg-amber-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-amber-900">Premium Features</span>
                  <svg className="w-5 h-5 text-amber-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="premium-features-content" className="hidden px-4 py-3 bg-amber-50">
                  <p className="text-sm text-gray-700">
                    {sections.value.split('.')[2] || "Premium features and superior performance justify the investment in this high-quality product."}
                  </p>
                </div>
              </div>

              {/* Competitive Advantages Accordion */}
              <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('competitive-advantages-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-red-100 hover:bg-red-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-red-900">Competitive Advantages</span>
                  <svg className="w-5 h-5 text-red-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="competitive-advantages-content" className="hidden px-4 py-3 bg-red-50">
                  <p className="text-sm text-gray-700">
                    {sections.value.split('.')[3] || "Competitive advantages include proprietary formulations and exclusive access to premium ingredients."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moat Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Moat</h4>
          </div>
          <div className="pl-11">
            <div className="space-y-3">
              {/* Proprietary Technology Accordion */}
              <div className="bg-purple-50 rounded-lg border border-purple-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('proprietary-technology-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-purple-100 hover:bg-purple-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-purple-900">Proprietary Technology</span>
                  <svg className="w-5 h-5 text-purple-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="proprietary-technology-content" className="hidden px-4 py-3 bg-purple-50">
                  <p className="text-sm text-gray-700">
                    {sections.moat.split('.')[0] || "Our formulation features proprietary technology and unique ingredient combinations."}
                  </p>
                </div>
              </div>

              {/* Supplier Relationships Accordion */}
              <div className="bg-pink-50 rounded-lg border border-pink-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('supplier-relationships-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-pink-100 hover:bg-pink-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-pink-900">Supplier Relationships</span>
                  <svg className="w-5 h-5 text-pink-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="supplier-relationships-content" className="hidden px-4 py-3 bg-pink-50">
                  <p className="text-sm text-gray-700">
                    {sections.moat.split('.')[1] || "Exclusive supplier relationships ensure access to premium ingredients and competitive pricing."}
                  </p>
                </div>
              </div>

              {/* IP Protection Accordion */}
              <div className="bg-violet-50 rounded-lg border border-violet-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('ip-protection-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-violet-100 hover:bg-violet-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-violet-900">IP Protection</span>
                  <svg className="w-5 h-5 text-violet-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="ip-protection-content" className="hidden px-4 py-3 bg-violet-50">
                  <p className="text-sm text-gray-700">
                    {sections.moat.split('.')[2] || "Intellectual property protection creates barriers to entry for potential competitors."}
                  </p>
                </div>
              </div>

              {/* Brand Positioning Accordion */}
              <div className="bg-fuchsia-50 rounded-lg border border-fuchsia-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('brand-positioning-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-fuchsia-100 hover:bg-fuchsia-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-fuchsia-900">Brand Positioning</span>
                  <svg className="w-5 h-5 text-fuchsia-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="brand-positioning-content" className="hidden px-4 py-3 bg-fuchsia-50">
                  <p className="text-sm text-gray-700">
                    {sections.moat.split('.')[3] || "Strong brand positioning and customer loyalty provide sustainable competitive advantages."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audience Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Audience</h4>
          </div>
          <div className="pl-11">
            <div className="space-y-3">
              {/* Demographics Accordion */}
              <div className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('demographics-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-green-100 hover:bg-green-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-green-900">Demographics</span>
                  <svg className="w-5 h-5 text-green-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="demographics-content" className="hidden px-4 py-3 bg-green-50">
                  <p className="text-sm text-gray-700">
                    {sections.audience.split('.')[0] || "Primary target includes consumers aged 25-55 with disposable income seeking premium products."}
                  </p>
                </div>
              </div>

              {/* Psychographics Accordion */}
              <div className="bg-emerald-50 rounded-lg border border-emerald-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('psychographics-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-emerald-100 hover:bg-emerald-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-emerald-900">Psychographics</span>
                  <svg className="w-5 h-5 text-emerald-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="psychographics-content" className="hidden px-4 py-3 bg-emerald-50">
                  <p className="text-sm text-gray-700">
                    {sections.audience.split('.')[1] || "This audience values quality, efficacy, and innovative formulations over price considerations."}
                  </p>
                </div>
              </div>

              {/* Secondary Segments Accordion */}
              <div className="bg-teal-50 rounded-lg border border-teal-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('secondary-segments-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-teal-100 hover:bg-teal-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-teal-900">Secondary Segments</span>
                  <svg className="w-5 h-5 text-teal-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="secondary-segments-content" className="hidden px-4 py-3 bg-teal-50">
                  <p className="text-sm text-gray-700">
                    {sections.audience.split('.')[2] || "Secondary segments include health-conscious individuals and early adopters of new technologies."}
                  </p>
                </div>
              </div>

              {/* Purchase Motivations Accordion */}
              <div className="bg-cyan-50 rounded-lg border border-cyan-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('purchase-motivations-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-cyan-100 hover:bg-cyan-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-cyan-900">Purchase Motivations</span>
                  <svg className="w-5 h-5 text-cyan-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="purchase-motivations-content" className="hidden px-4 py-3 bg-cyan-50">
                  <p className="text-sm text-gray-700">
                    {sections.audience.split('.')[3] || "Purchase decisions are driven by proven efficacy, brand reputation, and superior ingredient quality."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitors Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Competitors</h4>
          </div>
          <div className="pl-11">
            <div className="space-y-3">
              {/* Direct Competitors Accordion */}
              <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('direct-competitors-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-red-100 hover:bg-red-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-red-900">Direct Competitors</span>
                  <svg className="w-5 h-5 text-red-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="direct-competitors-content" className="hidden px-4 py-3 bg-red-50">
                  <p className="text-sm text-gray-700">
                    {sections.competitors.split('.')[0] || "Direct competitors include established brands with strong market presence and loyal customer bases."}
                  </p>
                </div>
              </div>

              {/* Product Comparison Accordion */}
              <div className="bg-rose-50 rounded-lg border border-rose-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('product-comparison-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-rose-100 hover:bg-rose-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-rose-900">Product Comparison</span>
                  <svg className="w-5 h-5 text-rose-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="product-comparison-content" className="hidden px-4 py-3 bg-rose-50">
                  <p className="text-sm text-gray-700">
                    {sections.competitors.split('.')[1] || "Our formulation offers superior ingredient quality and innovative technology compared to mass-market alternatives."}
                  </p>
                </div>
              </div>

              {/* Competitive Advantages Accordion */}
              <div className="bg-pink-50 rounded-lg border border-pink-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('competitive-advantages-moat-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-pink-100 hover:bg-pink-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-pink-900">Competitive Advantages</span>
                  <svg className="w-5 h-5 text-pink-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="competitive-advantages-moat-content" className="hidden px-4 py-3 bg-pink-50">
                  <p className="text-sm text-gray-700">
                    {sections.competitors.split('.')[2] || "Competitive advantages include proprietary formulations and exclusive access to premium ingredients."}
                  </p>
                </div>
              </div>

              {/* Market Positioning Accordion */}
              <div className="bg-orange-50 rounded-lg border border-orange-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('market-positioning-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-orange-100 hover:bg-orange-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-orange-900">Market Positioning</span>
                  <svg className="w-5 h-5 text-orange-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="market-positioning-content" className="hidden px-4 py-3 bg-orange-50">
                  <p className="text-sm text-gray-700">
                    {sections.competitors.split('.')[3] || "Market positioning focuses on premium quality and innovative technology at competitive pricing."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 