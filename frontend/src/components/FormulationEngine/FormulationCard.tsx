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

// ─── Helper Section component ─────────────────────────────────
interface SectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  colors: any;
}

function Section({ title, isOpen, onToggle, children, colors }: SectionProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 text-left font-semibold ${colors.text} bg-gradient-to-r ${colors.cardBg} border-b border-gray-200 hover:${colors.lightBg} transition-colors duration-200 flex items-center justify-between`}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-6">{children}</div>}
    </div>
  );
}

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
  const { loading: brandingLoading, error: brandingError, brandingStrategy, analyzeBranding } = useBranding();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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

      {/* Formulation Reasoning Section */}
      <Section
        title="Formulation Reasoning"
        isOpen={expandedSections.reasoning}
        onToggle={() => toggleSection("reasoning")}
        colors={colors}
      >
        <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
          <p className={`${colors.text} whitespace-pre-line leading-relaxed`}>
            {data.reasoning}
          </p>
        </div>
      </Section>

      {/* Scientific Reasoning Component */}
      {data.scientific_reasoning && (
        <Section
          title="Scientific Reasoning"
          isOpen={expandedSections.scientific_reasoning}
          onToggle={() => toggleSection("scientific_reasoning")}
          colors={colors}
        >
          <ScientificReasoning
            keyComponents={data.scientific_reasoning.keyComponents || []}
            impliedDesire={data.scientific_reasoning.impliedDesire || ""}
            psychologicalDrivers={data.scientific_reasoning.psychologicalDrivers || []}
            valueProposition={data.scientific_reasoning.valueProposition || []}
            targetAudience={data.scientific_reasoning.targetAudience || ""}
            indiaTrends={data.scientific_reasoning.indiaTrends || []}
            regulatoryStandards={data.scientific_reasoning.regulatoryStandards || []}
            selectedCategory={selectedCategory}
          />
        </Section>
      )}

      {/* Market Research Component */}
      {data.market_research && (
        <Section
          title="Market Research & Analysis"
          isOpen={expandedSections.market_research}
          onToggle={() => toggleSection("market_research")}
          colors={colors}
        >
          <MarketResearch
            tam={data.market_research.tam.marketSize}
            sam={data.market_research.sam.marketSize}
            som={data.market_research.tm.marketSize}
            marketSize={data.market_research.tam.marketSize}
            growthRate={data.market_research.tam.cagr}
            keyTrends={data.market_research.tam.insights}
            competitiveLandscape={data.market_research.tam.competitors}
            selectedCategory={selectedCategory}
            marketResearchData={data.market_research}
          />
        </Section>
      )}

      {/* Enhanced Ingredients Section */}
      <Section
        title="Ingredients & Suppliers"
        isOpen={expandedSections.ingredients}
        onToggle={() => toggleSection("ingredients")}
        colors={colors}
      >
        <div className="space-y-4">
          {data.ingredients.map((ingredient, i) => (
            <div
              key={i}
              className={`bg-white border ${colors.border} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              {/* Ingredient Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${colors.text} text-lg`}>
                      {ingredient.name}
                    </span>
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {ingredient.percent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${colors.text}`}>₹{ingredient.cost_per_100ml}/100ml</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.lightBg} ${colors.text}`}>
                      Grade A
                    </span>
                  </div>
                </div>
              </div>

              {/* Why Chosen Rationale */}
              <div className={`mb-4 p-3 ${colors.cardBg} border ${colors.border} rounded-lg`}>
                <h4 className={`font-semibold ${colors.text} text-sm mb-2 flex items-center`}>
                  <span className="mr-2">💡</span>
                  Why Chosen
                </h4>
                <p className={`${colors.text} text-sm leading-relaxed`}>
                  {ingredient.why_chosen}
                </p>
              </div>

              {/* Suppliers */}
              {ingredient.suppliers && ingredient.suppliers.length > 0 && (
                <div className="space-y-2">
                  <h4 className={`font-semibold ${colors.text} text-sm mb-2 flex items-center`}>
                    <span className="mr-2">🏢</span>
                    Local Suppliers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ingredient.suppliers.map((supplier, idx) => (
                      <div
                        key={idx}
                        className={`${colors.lightBg} border ${colors.border} rounded-lg p-3`}
                      >
                        <div className={`font-medium ${colors.text} text-sm mb-1`}>
                          {supplier.name}
                        </div>
                        <div className={`text-xs ${colors.text} space-y-1`}>
                          <div className="flex items-center">
                            <span className="font-medium">📍</span>
                            <span className="ml-1">{supplier.location}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">📞</span>
                            <span className="ml-1">{supplier.contact}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">💰</span>
                            <span className="ml-1">
                              ₹{supplier.price_per_unit}/unit
                              {ingredient.cost_per_100ml > 0 && (
                                <span className={`text-xs ${colors.text} ml-1 opacity-70`}>
                                  (≈₹{(ingredient.cost_per_100ml * ingredient.percent / 100).toFixed(2)}/100ml)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Manufacturing Steps Section */}
      <Section
        title="Manufacturing Steps"
        isOpen={expandedSections.manufacturing}
        onToggle={() => toggleSection("manufacturing")}
        colors={colors}
      >
        <ManufacturingSteps 
          steps={data.manufacturing_steps} 
          selectedCategory={selectedCategory}
        />
      </Section>

      {/* Manufacturing Insights Section */}
      <Section
        title="Manufacturing Insights & Scaling Strategy"
        isOpen={expandedSections.costing}
        onToggle={() => toggleSection("costing")}
        colors={colors}
      >
        <div className="mt-4">
          {/* Manufacturing Analysis Button */}
          {!costEstimate && (
            <div className="text-center mb-6">
              <button
                onClick={handleCostingRequest}
                disabled={loading}
                className={`bg-gradient-to-r ${colors.buttonGradient} hover:${colors.buttonHoverGradient} text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Analyzing...' : 'Get Manufacturing Analysis'}
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
      </Section>

      {/* Safety Assessment Section */}
      <Section
        title="Safety Assessment"
        isOpen={expandedSections.safety}
        onToggle={() => toggleSection("safety")}
        colors={colors}
      >
        <div className="mt-4 space-y-4">
          <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
            <h4 className={`font-semibold ${colors.text} text-sm mb-2`}>Safety Notes</h4>
            <ul className="space-y-1">
              {data.safety_notes.map((note, index) => (
                <li key={index} className={`flex items-start space-x-2 ${colors.text} text-sm`}>
                  <span className={`${colors.icon} mt-1`}>•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Packaging Inspiration Section */}
      <Section
        title="Packaging Inspiration"
        isOpen={expandedSections.marketing}
        onToggle={() => toggleSection("marketing")}
        colors={colors}
      >
        <div className="mt-4 space-y-4">
          {/* Packaging & Marketing Inspiration */}
          {data.packaging_marketing_inspiration && (
            <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
              <h4 className={`font-semibold ${colors.text} text-sm mb-2 flex items-center`}>
                <span className="mr-2">✨</span>
                Packaging Design & Inspiration
              </h4>
              <div className={`${colors.text} text-sm leading-relaxed`}>
                {data.packaging_marketing_inspiration}
              </div>
            </div>
          )}
          
          {/* Market Trends */}
          {data.market_trends && data.market_trends.length > 0 && (
            <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
              <h4 className={`font-semibold ${colors.text} text-sm mb-3 flex items-center`}>
                <span className="mr-2">📦</span>
                Packaging Trends
              </h4>
              <div className="space-y-2">
                {data.market_trends.map((trend, idx) => (
                  <div key={idx} className={`flex items-center space-x-2 ${colors.text} text-sm`}>
                    <div className={`w-2 h-2 ${colors.bg} rounded-full`}></div>
                    <span>{trend}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitive Landscape */}
          {data.competitive_landscape && (
            <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
              <h4 className={`font-semibold ${colors.text} text-sm mb-3 flex items-center`}>
                <span className="mr-2">🏆</span>
                Competitive Packaging Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {Object.entries(data.competitive_landscape).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className={`font-medium ${colors.text} capitalize`}>
                      {key.replace(/_/g, ' ')}:
                    </div>
                    <div className={`${colors.text}`}>
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Branding Strategy Section */}
      <Section
        title="Branding Strategy"
        isOpen={expandedSections.branding}
        onToggle={() => toggleSection("branding")}
        colors={colors}
      >
        <div className="mt-4">
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
      </Section>
    </div>
  );
};

export default FormulationCard;
