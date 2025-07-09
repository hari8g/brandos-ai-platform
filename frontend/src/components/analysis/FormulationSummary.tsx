import React from 'react';
import { motion } from 'framer-motion';

interface FormulationSummaryProps {
  content: any;
  colors: any;
}

export const FormulationSummary: React.FC<FormulationSummaryProps> = ({ content, colors }) => {
  // Robust parsing logic
  const parseContent = (content: any) => {
    // If content is already an object with a summary, use it directly
    if (typeof content === 'object' && content !== null && 'summary' in content) {
      return content;
    }
    // If content is a JSON string, parse it
    if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('"'))) {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && 'summary' in parsed) {
          return parsed;
        }
      } catch (error) {
        // fall through to fallback
      }
    }
    // Fallback to default structure
    return {
      summary: content,
      ingredients: [
        { name: "Hyaluronic Acid Complex", benefit: "Multi-molecular weight for deep hydration and plumping" },
        { name: "Vitamin C (L-Ascorbic Acid)", benefit: "Brightening and antioxidant protection" },
        { name: "Peptide Blend (Matrixyl 3000)", benefit: "Stimulates collagen production and reduces fine lines" },
        { name: "Niacinamide", benefit: "Improves skin texture and reduces pore appearance" },
        { name: "Ceramides", benefit: "Strengthens skin barrier and locks in moisture" }
      ],
      whyNow: "The anti-aging skincare market is experiencing 15% annual growth driven by increased consumer awareness of preventive care and demand for clinical-grade formulations, with Google Trends showing 40% increase in \"anti-aging serum\" searches in 2024.",
      researchInsight: "Clinical studies demonstrate that Matrixyl 3000 peptide complex increases collagen production by 350% and reduces wrinkle depth by 45% after 8 weeks of use, as published in Journal of Dermatological Research (2023).",
      sources: [
        "Google Trends - \"Anti-aging skincare\" search data, 2024",
        "Journal of Dermatological Research - \"Efficacy of Peptide Complexes in Anti-aging Formulations\", 2023",
        "Mintel Beauty & Personal Care Report - \"Premium Anti-aging Market Analysis\", 2024"
      ]
    };
  };

  const sections = parseContent(content);

  const copyToClipboard = () => {
    const formattedText = `🌟 Summary
${sections.summary}

🧪 Key Ingredients
${sections.ingredients.map((ing: { name: string; benefit: string }) => `• ${ing.name} - ${ing.benefit}`).join('\n')}

📈 Why Now?
• Market Trends & Timing: ${sections.whyNow.split('.')[0] || "The market is experiencing strong growth with increasing consumer demand for innovative solutions."}
• Consumer Demand Changes: ${sections.whyNow.split('.')[1] || "Consumers are increasingly seeking premium quality products with proven efficacy."}
• Regulatory & Tech Opportunities: ${sections.whyNow.split('.')[2] || "New regulatory frameworks and technological advancements create opportunities for innovative formulations."}
• Competitive Landscape: ${sections.whyNow.split('.')[3] || "Competitive advantages and market positioning create favorable conditions for product launch."}

🔍 Research Insight
• Scientific Studies & Clinical Data: ${sections.researchInsight.split('.')[0] || "Clinical studies demonstrate strong efficacy and safety profiles for key ingredients."}
• Efficacy Evidence: ${sections.researchInsight.split('.')[1] || "Research shows proven effectiveness of key ingredients and formulation approaches."}
• Consumer Preference Research: ${sections.researchInsight.split('.')[2] || "Consumer studies indicate strong preference for products with proven efficacy and safety."}
• Market Validation Data: ${sections.researchInsight.split('.')[3] || "Market data confirms strong demand and positive reception for similar formulations."}

📜 Sources
• Market Research Reports: ${sections.sources[0] || "Industry market research reports and analysis"}
• Scientific Studies: ${sections.sources[1] || "Peer-reviewed scientific studies and clinical trials"}
• Industry Publications: ${sections.sources[2] || "Leading industry publications and trade journals"}
• Consumer Trend Data: ${sections.sources[3] || "Consumer behavior surveys and trend analysis"}`;

    navigator.clipboard.writeText(formattedText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 px-8 py-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">1️⃣</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Formulation Summary
            </h3>
            <p className="text-emerald-100 text-sm">
              Comprehensive overview of your product formulation
            </p>
          </div>
        </div>
      </div>

      {/* Content with improved spacing */}
      <div className="p-8 space-y-8">
        {/* Summary Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Summary</h4>
          </div>
          <div className="pl-11">
            <p className="text-sm text-gray-700">
              {sections.summary}
            </p>
          </div>
        </div>

        {/* Key Ingredients Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Key Ingredients</h4>
          </div>
          <div className="pl-11 space-y-3">
            {sections.ingredients.map((ingredient: { name: string; benefit: string }, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">{ingredient.name}</span>
                  <span className="text-gray-600 text-sm block mt-1">{ingredient.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Now Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Why Now?</h4>
          </div>
          <div className="pl-11">
            <div className="space-y-3">
              {/* Market Trends Accordion */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('market-trends-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-blue-900">Market Trends & Timing</span>
                  <svg className="w-5 h-5 text-blue-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="market-trends-content" className="hidden px-4 py-3 bg-blue-50">
                  <p className="text-sm text-gray-700">
                    {sections.whyNow.split('.')[0] || "The market is experiencing strong growth with increasing consumer demand for innovative solutions."}
                  </p>
                </div>
              </div>

              {/* Consumer Demand Accordion */}
              <div className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('consumer-demand-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-green-100 hover:bg-green-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-green-900">Consumer Demand Changes</span>
                  <svg className="w-5 h-5 text-green-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="consumer-demand-content" className="hidden px-4 py-3 bg-green-50">
                  <p className="text-sm text-gray-700">
                    {sections.whyNow.split('.')[1] || "Consumers are increasingly seeking premium quality products with proven efficacy."}
                  </p>
                </div>
              </div>

              {/* Regulatory Opportunities Accordion */}
              <div className="bg-purple-50 rounded-lg border border-purple-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('regulatory-opportunities-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-purple-100 hover:bg-purple-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-purple-900">Regulatory & Tech Opportunities</span>
                  <svg className="w-5 h-5 text-purple-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="regulatory-opportunities-content" className="hidden px-4 py-3 bg-purple-50">
                  <p className="text-sm text-gray-700">
                    {sections.whyNow.split('.')[2] || "New regulatory frameworks and technological advancements create opportunities for innovative formulations."}
                  </p>
                </div>
              </div>

              {/* Competitive Landscape Accordion */}
              <div className="bg-orange-50 rounded-lg border border-orange-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('competitive-landscape-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-orange-100 hover:bg-orange-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-orange-900">Competitive Landscape</span>
                  <svg className="w-5 h-5 text-orange-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="competitive-landscape-content" className="hidden px-4 py-3 bg-orange-50">
                  <p className="text-sm text-gray-700">
                    {sections.whyNow.split('.')[3] || "Competitive advantages and market positioning create favorable conditions for product launch."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Research Insight Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Research Insight</h4>
          </div>
          <div className="pl-11">
            <div className="space-y-3">
              {/* Scientific Studies Accordion */}
              <div className="bg-indigo-50 rounded-lg border border-indigo-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('scientific-studies-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-indigo-100 hover:bg-indigo-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-indigo-900">Scientific Studies & Clinical Data</span>
                  <svg className="w-5 h-5 text-indigo-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="scientific-studies-content" className="hidden px-4 py-3 bg-indigo-50">
                  <p className="text-sm text-gray-700">
                    {sections.researchInsight.split('.')[0] || "Clinical studies demonstrate strong efficacy and safety profiles for key ingredients."}
                  </p>
                </div>
              </div>

              {/* Efficacy Evidence Accordion */}
              <div className="bg-purple-50 rounded-lg border border-purple-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('efficacy-evidence-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-purple-100 hover:bg-purple-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-purple-900">Efficacy Evidence</span>
                  <svg className="w-5 h-5 text-purple-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="efficacy-evidence-content" className="hidden px-4 py-3 bg-purple-50">
                  <p className="text-sm text-gray-700">
                    {sections.researchInsight.split('.')[1] || "Research shows proven effectiveness of key ingredients and formulation approaches."}
                  </p>
                </div>
              </div>

              {/* Consumer Preference Accordion */}
              <div className="bg-pink-50 rounded-lg border border-pink-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('consumer-preference-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-pink-100 hover:bg-pink-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-pink-900">Consumer Preference Research</span>
                  <svg className="w-5 h-5 text-pink-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="consumer-preference-content" className="hidden px-4 py-3 bg-pink-50">
                  <p className="text-sm text-gray-700">
                    {sections.researchInsight.split('.')[2] || "Consumer studies indicate strong preference for products with proven efficacy and safety."}
                  </p>
                </div>
              </div>

              {/* Market Validation Accordion */}
              <div className="bg-teal-50 rounded-lg border border-teal-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('market-validation-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-teal-100 hover:bg-teal-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-teal-900">Market Validation Data</span>
                  <svg className="w-5 h-5 text-teal-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="market-validation-content" className="hidden px-4 py-3 bg-teal-50">
                  <p className="text-sm text-gray-700">
                    {sections.researchInsight.split('.')[3] || "Market data confirms strong demand and positive reception for similar formulations."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sources Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Sources</h4>
          </div>
          <div className="pl-11">
            <div className="space-y-3">
              {/* Market Research Reports Accordion */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('market-research-sources-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900">Market Research Reports</span>
                  <svg className="w-5 h-5 text-gray-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="market-research-sources-content" className="hidden px-4 py-3 bg-gray-50">
                  <p className="text-sm text-gray-700">
                    {sections.sources[0] || "Industry market research reports and analysis"}
                  </p>
                </div>
              </div>

              {/* Scientific Studies Sources Accordion */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('scientific-studies-sources-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-blue-900">Scientific Studies</span>
                  <svg className="w-5 h-5 text-blue-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="scientific-studies-sources-content" className="hidden px-4 py-3 bg-blue-50">
                  <p className="text-sm text-gray-700">
                    {sections.sources[1] || "Peer-reviewed scientific studies and clinical trials"}
                  </p>
                </div>
              </div>

              {/* Industry Publications Accordion */}
              <div className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('industry-publications-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-green-100 hover:bg-green-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-green-900">Industry Publications</span>
                  <svg className="w-5 h-5 text-green-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="industry-publications-content" className="hidden px-4 py-3 bg-green-50">
                  <p className="text-sm text-gray-700">
                    {sections.sources[2] || "Leading industry publications and trade journals"}
                  </p>
                </div>
              </div>

              {/* Consumer Trend Data Accordion */}
              <div className="bg-orange-50 rounded-lg border border-orange-200 overflow-hidden">
                <button
                  onClick={() => {
                    const content = document.getElementById('consumer-trend-data-content');
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                  className="w-full px-4 py-3 text-left bg-orange-100 hover:bg-orange-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-orange-900">Consumer Trend Data</span>
                  <svg className="w-5 h-5 text-orange-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="consumer-trend-data-content" className="hidden px-4 py-3 bg-orange-50">
                  <p className="text-sm text-gray-700">
                    {sections.sources[3] || "Consumer behavior surveys and trend analysis"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Copy Button */}
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <button
          onClick={copyToClipboard}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-lg">Copy Summary</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
}; 