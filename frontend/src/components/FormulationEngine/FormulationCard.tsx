import React, { useState } from "react";
import { useCosting } from "../../hooks/useCosting";
import { useBranding } from "../../hooks/useBranding";
import ManufacturingInsights from "./ManufacturingInsights";
import ScientificReasoning from "../ScientificReasoning";
import MarketResearch from "../MarketResearch";
import ManufacturingSteps from "./ManufacturingSteps";
import Branding from "../Branding";
import { getCategoryColors } from "@/lib/colorUtils";
import type { GenerateResponse, IngredientDetail, SupplierInfo } from "../../types/formulation";
import { useMarketSize } from '@/hooks/useMarketSize';
import IngredientList from "./IngredientList";

// ─── Modern AccordionSection component ─────────────────────────────────
interface AccordionSectionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  colors: any;
  badge?: string;
  badgeColor?: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  colors,
  badge,
  badgeColor = 'bg-blue-100 text-blue-800'
}) => {
  return (
    <div className={`${colors.cardBg} border ${colors.border} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}>
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between ${colors.lightBg} hover:${colors.lightBg} transition-colors duration-200`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg ${colors.primary} flex items-center justify-center`}>
            <span className="text-white text-lg">{icon}</span>
          </div>
          <div className="text-left">
            <h3 className={`text-lg font-semibold ${colors.text}`}>{title}</h3>
            {badge && (
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${badgeColor} mt-1`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6 pt-2 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── Main FormulationCard component ─────────────────────────────────
interface FormulationCardProps {
  data: GenerateResponse;
  isGenerated?: boolean;
  onDownload?: () => void;
  selectedCategory?: string | null;
}

const FormulationCard: React.FC<FormulationCardProps> = ({
  data,
  isGenerated = false,
  onDownload,
  selectedCategory,
}) => {
  // Add costing functionality
  const { loading, error, costEstimate, estimateCost, clearCostEstimate } = useCosting();
  const { loading: brandingLoading, error: brandingError, brandingStrategy, analyzeBranding, reset: clearBrandingStrategy } = useBranding();
  const { loading: marketSizeLoading, error: marketSizeError, marketSizeData, fetchCurrentMarketSize, clearMarketSizeData } = useMarketSize();
  const colors = getCategoryColors(selectedCategory || null);

  // Currency formatting function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const [expandedSections, setExpandedSections] = useState({
    reasoning: true,
    ingredients: true,
    manufacturing: true,
    safety: true,
    marketing: true,
    costing: false,
    scientific_reasoning: true,
    market_research: true,
    branding: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));

  // Update handleCostingRequest to use manufacturing analysis
  const handleCostingRequest = async () => {
    const request = {
      formulation: data,
      target_market: "premium",
      region: "IN"
    };
    await estimateCost(request);
    setExpandedSections(prev => ({ ...prev, costing: true }));
  };

  // Handle branding analysis request
  const handleBrandingRequest = async () => {
    const request = {
      formulation: data,
      target_audience: "general",
      brand_tone: "modern",
      region: "IN"
    };
    await analyzeBranding(request);
    setExpandedSections(prev => ({ ...prev, branding: true }));
  };

  // Handle market size analysis request
  const handleMarketSizeRequest = async () => {
    const request = {
      product_name: data.product_name,
      category: selectedCategory || "cosmetics",
      ingredients: data.ingredients.map(ing => ({
        name: ing.name,
        percent: ing.percent
      }))
    };
    await fetchCurrentMarketSize(request);
    setExpandedSections(prev => ({ ...prev, market_research: true }));
  };

  // Validate core data
  if (
    !data ||
    typeof data.product_name !== "string" ||
    !Array.isArray(data.ingredients) ||
    data.ingredients.length === 0
  ) {
    console.log("❌ FormulationCard validation failed - invalid data structure");
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <strong>Invalid formulation data.</strong> Please try generating again.
        <pre className="mt-2 text-xs">{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  // Debug: Log scientific reasoning data
  console.log("🔍 Scientific reasoning data:", data.scientific_reasoning);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {data.product_name}
        </h2>
        {isGenerated && onDownload && (
          <button
            data-download-button
            onClick={onDownload}
            className={`bg-gradient-to-r ${colors.buttonGradient} hover:${colors.buttonHoverGradient} text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Download Formulation</span>
          </button>
        )}
      </div>

      {/* Formulation Reasoning Section - Story Mode */}
      <AccordionSection
        title="Formulation Story"
        icon="📖"
        isOpen={expandedSections.reasoning}
        onToggle={() => toggleSection("reasoning")}
        colors={colors}
        badge="Narrative"
        badgeColor="bg-blue-100 text-blue-800"
      >
        <div className="space-y-6">
          {/* Story Header */}
          <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-6`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${colors.primary} flex items-center justify-center`}>
                <span className="text-white text-lg">🎯</span>
              </div>
              <div>
                <h4 className={`font-bold ${colors.text} text-lg`}>The Formulation Journey</h4>
                <p className={`${colors.text} text-sm opacity-70`}>How we crafted this product</p>
              </div>
            </div>
            
            {/* Story Content */}
            <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-6 shadow-sm`}>
              <div className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full ${colors.primary} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <div className={`${colors.text} text-base leading-relaxed space-y-4`}>
                    {/* First Paragraph - The Challenge & Market Context */}
                    <p>
                      In today's rapidly evolving beauty landscape, where consumers are increasingly conscious about ingredient transparency and efficacy, we embarked on crafting {data.product_name.toLowerCase()}. The market research revealed a growing demand for {data.reasoning.includes('vegan') ? 'vegan-friendly' : data.reasoning.includes('natural') ? 'natural' : 'innovative'} formulations that deliver visible results while maintaining the highest safety standards. Our target demographic - {data.reasoning.includes('women') ? 'young urban women' : data.reasoning.includes('men') ? 'modern men' : 'conscious consumers'} - seeks products that not only perform but also align with their values and lifestyle choices.
                    </p>
                    
                                         {/* Second Paragraph - The Scientific Journey & Ingredient Selection */}
                     <p>
                       The formulation journey began with a deep dive into scientific literature and ingredient efficacy studies. We carefully selected each component based on proven performance, starting with {data.ingredients.length > 0 ? data.ingredients[0].name : 'key active ingredients'} as our hero ingredient for its {data.ingredients.length > 0 && data.ingredients[0].why_chosen ? (data.ingredients[0].why_chosen.toLowerCase().includes('water') ? 'exceptional water-binding properties' : data.ingredients[0].why_chosen.toLowerCase().includes('anti') ? 'powerful antioxidant capabilities' : 'proven efficacy and safety profile') : 'proven efficacy and safety profile'}. The formulation strategy balanced {data.ingredients.length > 1 ? `multiple synergistic ingredients including ${data.ingredients.slice(1, 3).map(ing => ing.name).join(' and ')}` : 'carefully chosen complementary ingredients'} to create a harmonious blend that addresses multiple skin concerns simultaneously. Every ingredient was chosen not just for its individual benefits, but for how it enhances the overall formulation's performance and stability.
                     </p>
                    
                    {/* Third Paragraph - The Technical Excellence & Compliance */}
                    <p>
                      Beyond the ingredient selection, we prioritized technical excellence and regulatory compliance. The formulation process incorporated {data.reasoning.includes('IS') || data.reasoning.includes('FDA') ? 'stringent quality control measures and regulatory standards' : 'advanced manufacturing techniques and quality assurance protocols'}, ensuring that every batch meets the highest safety and efficacy standards. The manufacturing process was designed to preserve ingredient potency while ensuring product stability and shelf life. We also considered environmental sustainability, opting for {data.reasoning.includes('eco') || data.reasoning.includes('sustainable') ? 'eco-friendly packaging and sustainable sourcing practices' : 'responsible sourcing and efficient production methods'} to minimize our environmental footprint.
                    </p>
                    
                    {/* Fourth Paragraph - The Market Positioning & Consumer Value */}
                    <p>
                      The final formulation represents more than just a product - it's a solution designed to meet the evolving needs of today's discerning consumers. By combining cutting-edge science with consumer insights, we've created a formulation that not only delivers on its promises but also exceeds expectations. The {data.reasoning.includes('premium') ? 'premium positioning' : 'strategic positioning'} ensures accessibility while maintaining the quality that consumers expect, making this formulation a compelling choice in a competitive market landscape.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Story Elements Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Trend Analysis */}
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">📈</span>
                <h5 className={`font-semibold ${colors.text} text-sm`}>Market Trend</h5>
              </div>
              <p className={`${colors.text} text-xs leading-relaxed`}>
                {data.reasoning.includes('trend') || data.reasoning.includes('demand') 
                  ? 'Responding to current market demands and consumer preferences'
                  : 'Addressing evolving market needs and consumer expectations'}
              </p>
            </div>

            {/* Target Audience */}
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">👥</span>
                <h5 className={`font-semibold ${colors.text} text-sm`}>Target Audience</h5>
              </div>
              <p className={`${colors.text} text-xs leading-relaxed`}>
                {data.reasoning.includes('women') || data.reasoning.includes('men') || data.reasoning.includes('young')
                  ? 'Tailored for specific demographic and lifestyle needs'
                  : 'Designed for target consumer segments and preferences'}
              </p>
            </div>

            {/* Scientific Approach */}
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">🧪</span>
                <h5 className={`font-semibold ${colors.text} text-sm`}>Scientific Basis</h5>
              </div>
              <p className={`${colors.text} text-xs leading-relaxed`}>
                {data.reasoning.includes('acid') || data.reasoning.includes('vitamin') || data.reasoning.includes('peptide')
                  ? 'Leveraging proven scientific ingredients and formulations'
                  : 'Based on scientific research and ingredient efficacy'}
              </p>
            </div>

            {/* Compliance Focus */}
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">🛡️</span>
                <h5 className={`font-semibold ${colors.text} text-sm`}>Compliance</h5>
              </div>
              <p className={`${colors.text} text-xs leading-relaxed`}>
                {data.reasoning.includes('IS') || data.reasoning.includes('FDA') || data.reasoning.includes('standard')
                  ? 'Meeting regulatory standards and safety requirements'
                  : 'Ensuring regulatory compliance and safety standards'}
              </p>
            </div>

            {/* Innovation */}
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">💡</span>
                <h5 className={`font-semibold ${colors.text} text-sm`}>Innovation</h5>
              </div>
              <p className={`${colors.text} text-xs leading-relaxed`}>
                {data.reasoning.includes('new') || data.reasoning.includes('innovative') || data.reasoning.includes('advanced')
                  ? 'Incorporating cutting-edge ingredients and technology'
                  : 'Pioneering new approaches to formulation'}
              </p>
            </div>

            {/* Quality Assurance */}
            <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">✨</span>
                <h5 className={`font-semibold ${colors.text} text-sm`}>Quality</h5>
              </div>
              <p className={`${colors.text} text-xs leading-relaxed`}>
                {data.reasoning.includes('premium') || data.reasoning.includes('high') || data.reasoning.includes('quality')
                  ? 'Maintaining premium quality standards throughout'
                  : 'Ensuring highest quality and performance standards'}
              </p>
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Enhanced Ingredients Section */}
      <AccordionSection
        title="Ingredients & Priority Analysis"
        icon="⚗️"
        isOpen={expandedSections.ingredients}
        onToggle={() => toggleSection("ingredients")}
        colors={colors}
        badge={`${data.ingredients.length} ingredients`}
        badgeColor="bg-indigo-100 text-indigo-800"
      >
        <IngredientList 
          ingredients={data.ingredients} 
          selectedCategory={selectedCategory}
        />
      </AccordionSection>

      {/* Manufacturing Steps Section */}
      <AccordionSection
        title="Manufacturing Steps"
        icon="🏭"
        isOpen={expandedSections.manufacturing}
        onToggle={() => toggleSection("manufacturing")}
        colors={colors}
        badge="Production guide"
        badgeColor="bg-orange-100 text-orange-800"
      >
        <ManufacturingSteps 
          steps={data.manufacturing_steps} 
          selectedCategory={selectedCategory}
        />
      </AccordionSection>

      {/* Scientific Reasoning Component */}
      {data.scientific_reasoning && (
        <AccordionSection
          title="Scientific Analysis"
          icon="🧪"
          isOpen={expandedSections.scientific_reasoning}
          onToggle={() => toggleSection("scientific_reasoning")}
          colors={colors}
          badge="Research insights"
          badgeColor="bg-purple-100 text-purple-800"
        >
          <ScientificReasoning
            keyComponents={data.scientific_reasoning.keyComponents || []}
            impliedDesire={data.scientific_reasoning.impliedDesire || ""}
            psychologicalDrivers={data.scientific_reasoning.psychologicalDrivers || []}
            valueProposition={data.scientific_reasoning.valueProposition || []}
            targetAudience={data.scientific_reasoning.targetAudience || ""}
            indiaTrends={data.scientific_reasoning.indiaTrends || []}
            regulatoryStandards={data.scientific_reasoning.regulatoryStandards || []}
            demographicBreakdown={data.scientific_reasoning.demographicBreakdown}
            psychographicProfile={data.scientific_reasoning.psychographicProfile}
            selectedCategory={selectedCategory}
          />
        </AccordionSection>
      )}

      {/* Market Research Component */}
      {data.market_research && (
        <AccordionSection
          title="Market Research & Analysis"
          icon="📊"
          isOpen={expandedSections.market_research}
          onToggle={() => toggleSection("market_research")}
          colors={colors}
          badge="Market data"
          badgeColor="bg-green-100 text-green-800"
        >
          <div className="space-y-4">
            {/* Market Size Analysis Button */}
            {!marketSizeData && (
              <div className="text-center mb-6">
                <button
                  onClick={handleMarketSizeRequest}
                  disabled={marketSizeLoading}
                  className={`bg-gradient-to-r ${colors.buttonGradient} hover:${colors.buttonHoverGradient} text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {marketSizeLoading ? 'Analyzing Market Size...' : 'Get Current Market Size Analysis'}
                </button>
              </div>
            )}

            {/* Market Research */}
            <MarketResearch
              selectedCategory={selectedCategory || null}
              marketResearchData={data.market_research}
            />

            {/* Market Size Error */}
            {marketSizeError && (
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{marketSizeError}</p>
              </div>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Costing and Pricing Strategy Section */}
      <AccordionSection
        title="Costing and Pricing Strategy"
        icon="💰"
        isOpen={expandedSections.costing}
        onToggle={() => toggleSection("costing")}
        colors={colors}
        badge="Financial analysis"
        badgeColor="bg-yellow-100 text-yellow-800"
      >
        <div className="space-y-4">
          {/* Manufacturing Analysis Button */}
          {!costEstimate && (
            <div className="text-center mb-6">
              <button
                onClick={handleCostingRequest}
                disabled={loading}
                className={`bg-gradient-to-r ${colors.buttonGradient} hover:${colors.buttonHoverGradient} text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Analyzing...' : 'Generate Costing and Pricing'}
              </button>
            </div>
          )}

          {/* Manufacturing Insights */}
          {costEstimate && costEstimate.manufacturing_insights && (
            <ManufacturingInsights
              small_scale={costEstimate.manufacturing_insights.small_scale}
              medium_scale={costEstimate.manufacturing_insights.medium_scale}
              large_scale={costEstimate.manufacturing_insights.large_scale}
              scaling_benefits={costEstimate.manufacturing_insights.scaling_benefits}
              risk_factors={costEstimate.manufacturing_insights.risk_factors}
              market_opportunity={costEstimate.manufacturing_insights.market_opportunity}
              selectedCategory={selectedCategory}
            />
          )}
        </div>
      </AccordionSection>

      {/* Safety Assessment Section */}
      <AccordionSection
        title="Safety Assessment"
        icon="🛡️"
        isOpen={expandedSections.safety}
        onToggle={() => toggleSection("safety")}
        colors={colors}
        badge={`${data.safety_notes.length} notes`}
        badgeColor="bg-red-100 text-red-800"
      >
        <div className="space-y-4">
          <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-6`}>
            <h4 className={`font-semibold ${colors.text} text-base mb-4`}>Safety Notes</h4>
            <ul className="space-y-3">
              {data.safety_notes.map((note, index) => (
                <li key={index} className={`flex items-start space-x-3 ${colors.text} text-base leading-relaxed`}>
                  <span className={`${colors.icon} mt-1 flex-shrink-0`}>•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AccordionSection>

      {/* Enhanced Marketing & Packaging Strategy Section */}
      <AccordionSection
        title="Marketing & Packaging Strategy"
        icon="🎨"
        isOpen={expandedSections.marketing}
        onToggle={() => toggleSection("marketing")}
        colors={colors}
        badge="Brand Ready"
        badgeColor="bg-pink-100 text-pink-800"
      >
        <div className="space-y-6">
          {/* Strategy Overview Header */}
          <div className={`bg-gradient-to-r ${colors.lightBg} rounded-2xl p-6 border-2 ${colors.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-xl font-bold ${colors.text} flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.buttonGradient} flex items-center justify-center text-white text-lg`}>
                  🚀
                </div>
                Go-to-Market Strategy
              </h4>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 ${colors.bg} text-white rounded-full text-sm font-medium`}>
                  Launch Ready
                </span>
              </div>
            </div>
            <p className={`${colors.text} opacity-80 text-sm leading-relaxed`}>
              Comprehensive marketing and packaging recommendations to maximize your product's market impact
            </p>
          </div>

          {/* Enhanced Content Sections */}
          <div className="grid gap-6">
            {/* Packaging Innovation & Design */}
            {data.packaging_marketing_inspiration && (
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-lg">
                    📦
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-bold text-purple-800">Packaging Design Strategy</h5>
                    <p className="text-purple-600 text-sm">AI-powered packaging and branding insights</p>
                  </div>
                </div>
                
                {/* Original AI Content */}
                <div className="mb-6 bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className={`${colors.text} text-sm leading-relaxed font-medium`}>
                    {data.packaging_marketing_inspiration}
                  </div>
                </div>

                {/* Structured Insights */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h6 className="font-semibold text-purple-700 text-sm flex items-center gap-2">
                      <span>🎨</span> Design Elements
                    </h6>
                    {getPackagingDesignElements(selectedCategory || null).map((element, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          ✓
                        </div>
                        <span className="text-purple-700">{element}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <h6 className="font-semibold text-purple-700 text-sm flex items-center gap-2">
                      <span>💡</span> Innovation Ideas
                    </h6>
                    {getPackagingInnovationIdeas(selectedCategory || null).map((idea, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          💡
                        </div>
                        <span className="text-purple-700">{idea}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Marketing Channels & Strategy */}
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-lg">
                  📢
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-bold text-blue-800">Marketing Strategy & Channels</h5>
                  <p className="text-blue-600 text-sm">Optimized for {selectedCategory || 'your product'} category</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {getDetailedMarketingChannels(selectedCategory || null).map((channel, index) => (
                  <div key={index} className="bg-blue-50 rounded-xl p-4 border border-blue-100 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{channel.icon}</span>
                      <span className="font-semibold text-blue-800 text-sm">{channel.name}</span>
                    </div>
                    <p className="text-blue-600 text-xs mb-2">{channel.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        channel.priority === 'High' ? 'bg-red-100 text-red-700' : 
                        channel.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {channel.priority}
                      </span>
                      <span className="text-blue-500 text-xs font-medium">{channel.reach}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Timeline */}
            <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-lg">
                  📅
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-bold text-green-800">Go-to-Market Timeline</h5>
                  <p className="text-green-600 text-sm">Strategic phases for optimal market entry</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { phase: 'Pre-Launch', duration: '4-6 weeks', tasks: ['Brand finalization', 'Packaging design', 'Marketing material creation'], color: 'bg-yellow-100 text-yellow-800' },
                  { phase: 'Soft Launch', duration: '2-3 weeks', tasks: ['Limited market testing', 'Influencer partnerships', 'Feedback collection'], color: 'bg-blue-100 text-blue-800' },
                  { phase: 'Full Launch', duration: '4-8 weeks', tasks: ['Mass marketing campaigns', 'Retail partnerships', 'Scale production'], color: 'bg-green-100 text-green-800' },
                  { phase: 'Growth', duration: 'Ongoing', tasks: ['Market expansion', 'Product line extension', 'Customer retention'], color: 'bg-purple-100 text-purple-800' }
                ].map((phase, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h6 className="font-semibold text-green-800">{phase.phase}</h6>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${phase.color}`}>
                          {phase.duration}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {phase.tasks.map((task, taskIndex) => (
                          <span key={taskIndex} className="text-xs bg-white text-green-700 px-2 py-1 rounded-md border border-green-200">
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Trends */}
            {data.market_trends && data.market_trends.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-lg">
                    📈
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-bold text-orange-800">Market Trends & Opportunities</h5>
                    <p className="text-orange-600 text-sm">Stay ahead of the curve</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {data.market_trends.map((trend, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        📊
                      </div>
                      <span className="text-orange-700 text-sm font-medium">{trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Analysis */}
            {data.competitive_landscape && (
              <div className="bg-white rounded-2xl p-6 border-2 border-red-200 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-lg">
                    🏆
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-bold text-red-800">Competitive Packaging Analysis</h5>
                    <p className="text-red-600 text-sm">Differentiation opportunities</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(data.competitive_landscape).map(([key, value]) => (
                    <div key={key} className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <div className="font-semibold text-red-800 text-sm mb-2 capitalize flex items-center gap-2">
                        <span>🔍</span>
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-red-700 text-sm leading-relaxed">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </AccordionSection>

      {/* Branding Strategy Section */}
      <AccordionSection
        title="Branding Strategy"
        icon="🎨"
        isOpen={expandedSections.branding}
        onToggle={() => toggleSection("branding")}
        colors={colors}
        badge="Brand guide"
        badgeColor="bg-teal-100 text-teal-800"
      >
        <div className="space-y-4">
          {/* Branding Analysis Button */}
          {!brandingStrategy && (
            <div className="text-center mb-6">
              <button
                onClick={handleBrandingRequest}
                disabled={brandingLoading}
                className={`bg-gradient-to-r ${colors.buttonGradient} hover:${colors.buttonHoverGradient} text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {brandingLoading ? 'Analyzing Branding...' : 'Get Branding Strategy'}
              </button>
            </div>
          )}

          {/* Branding Strategy */}
          {brandingStrategy && (
            <Branding
              brandingStrategy={brandingStrategy}
              selectedCategory={selectedCategory}
            />
          )}

          {/* Branding Error */}
          {brandingError && (
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{brandingError}</p>
            </div>
          )}
        </div>
      </AccordionSection>
    </div>
  );
};

// Helper functions for enhanced marketing section
function getPackagingDesignElements(category: string | null): string[] {
  switch (category?.toLowerCase()) {
    case 'cosmetics':
      return [
        'Premium glass or acrylic containers',
        'Minimalist, elegant typography',
        'Gradient color schemes',
        'Sustainable packaging materials',
        'User-friendly dispensing mechanisms'
      ];
    case 'pet food':
      return [
        'Resealable, airtight containers',
        'Colorful, playful imagery',
        'Clear nutritional information display',
        'Pet-safe, durable materials',
        'Easy-to-carry handles or grips'
      ];
    default:
      return [
        'Clean, professional design',
        'Clear product information',
        'Sustainable materials',
        'User-friendly functionality',
        'Brand-consistent colors'
      ];
  }
}

function getPackagingInnovationIdeas(category: string | null): string[] {
  switch (category?.toLowerCase()) {
    case 'cosmetics':
      return [
        'Smart packaging with NFC technology',
        'Refillable container systems',
        'UV-protective materials',
        'Temperature-sensitive labels',
        'Airless pump dispensers'
      ];
    case 'pet food':
      return [
        'Portion-controlled dispensing',
        'Built-in freshness indicators',
        'Stackable storage design',
        'Compostable packaging options',
        'Interactive QR codes for pet tips'
      ];
    default:
      return [
        'Smart packaging technology',
        'Eco-friendly materials',
        'User-centric design features',
        'Interactive elements',
        'Innovative dispensing systems'
      ];
  }
}

function getDetailedMarketingChannels(category: string | null): Array<{
  name: string;
  icon: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  reach: string;
}> {
  const baseChannels = [
    { name: 'Social Media', icon: '📱', description: 'Instagram, TikTok, Facebook campaigns', priority: 'High' as const, reach: '10M+' },
    { name: 'Influencers', icon: '🌟', description: 'Micro & macro influencer partnerships', priority: 'High' as const, reach: '5M+' },
    { name: 'Content Marketing', icon: '📝', description: 'Educational blogs and tutorials', priority: 'Medium' as const, reach: '1M+' },
    { name: 'Email Campaigns', icon: '📧', description: 'Newsletter and retention marketing', priority: 'Medium' as const, reach: '500K+' },
    { name: 'Paid Advertising', icon: '💰', description: 'Google Ads, Facebook Ads', priority: 'Medium' as const, reach: '2M+' },
    { name: 'SEO & Organic', icon: '🔍', description: 'Search engine optimization', priority: 'Low' as const, reach: '800K+' }
  ];

  const categorySpecific = getChannelsByCategory(category);
  return [...baseChannels, ...categorySpecific];
}

function getChannelsByCategory(category: string | null): Array<{
  name: string;
  icon: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  reach: string;
}> {
  switch (category?.toLowerCase()) {
    case 'cosmetics':
      return [
        { name: 'Beauty Retail', icon: '🏪', description: 'Nykaa, Sephora partnerships', priority: 'High' as const, reach: '3M+' },
        { name: 'YouTube Beauty', icon: '📺', description: 'Product review channels', priority: 'Medium' as const, reach: '2M+' }
      ];
    case 'pet food':
      return [
        { name: 'Pet Stores', icon: '🐕', description: 'Local pet store partnerships', priority: 'High' as const, reach: '800K+' },
        { name: 'Vet Clinics', icon: '🏥', description: 'Veterinary recommendations', priority: 'Medium' as const, reach: '400K+' }
      ];
    default:
      return [
        { name: 'E-commerce', icon: '🛒', description: 'Amazon, Flipkart listings', priority: 'Medium' as const, reach: '5M+' }
      ];
  }
}

export default FormulationCard;
