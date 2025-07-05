import React, { useState } from "react";
import { useCosting } from "../../hooks/useCosting";
import CostSummary from "./CostSummary";
import ScientificReasoning from "../ScientificReasoning";
import MarketResearch from "../MarketResearch";
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
  });

  // Add state for batch size selection
  const [batchSizeType, setBatchSizeType] = useState<'small' | 'medium' | 'large' | 'custom'>('medium');
  const [customBatchSize, setCustomBatchSize] = useState<number>(1000);

  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));

  // Update handleCostingRequest to use selected batch size(s)
  const handleCostingRequest = async () => {
    let batch_sizes: (string | number)[] = [];
    if (batchSizeType === 'custom') {
      batch_sizes = [customBatchSize];
    } else {
      batch_sizes = [batchSizeType];
    }
    const request = {
      formulation: data,
      batch_sizes,
      target_market: "mid-market",
      region: "IN"
    };
    await estimateCost(request);
    setExpandedSections(prev => ({ ...prev, costing: true }));
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
        title="💡 Formulation Reasoning"
        isOpen={expandedSections.reasoning}
        onToggle={() => toggleSection("reasoning")}
        colors={colors}
      >
        <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {data.reasoning}
          </p>
        </div>
      </Section>

      {/* Scientific Reasoning Component */}
      {data.scientific_reasoning && (
        <Section
          title="🔬 Scientific Reasoning"
          isOpen={expandedSections.scientific_reasoning}
          onToggle={() => toggleSection("scientific_reasoning")}
          colors={colors}
        >
          <ScientificReasoning
            keyComponents={data.scientific_reasoning.keyComponents}
            impliedDesire={data.scientific_reasoning.impliedDesire}
            targetAudience={data.scientific_reasoning.targetAudience}
            indiaTrends={data.scientific_reasoning.indiaTrends}
            regulatoryStandards={data.scientific_reasoning.regulatoryStandards}
            selectedCategory={selectedCategory}
          />
        </Section>
      )}

      {/* Market Research Component */}
      {data.market_research && (
        <Section
          title="📊 Market Research & Analysis"
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
          />
        </Section>
      )}

      {/* Enhanced Ingredients Section */}
      <Section
        title="🧴 Ingredients & Suppliers"
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
                    <span className="font-bold text-gray-900 text-lg">
                      {ingredient.name}
                    </span>
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {ingredient.percent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>₹{ingredient.cost_per_100ml}/100ml</span>
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
                  <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center">
                    <span className="mr-2">🏢</span>
                    Local Suppliers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ingredient.suppliers.map((supplier, idx) => (
                      <div
                        key={idx}
                        className={`${colors.lightBg} border ${colors.border} rounded-lg p-3`}
                      >
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {supplier.name}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
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
                            <span className="ml-1">₹{supplier.price_per_unit}/unit</span>
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
        title="⚙️ Manufacturing Steps"
        isOpen={expandedSections.manufacturing}
        onToggle={() => toggleSection("manufacturing")}
        colors={colors}
      >
        <div className={`${colors.cardBg} border ${colors.border} rounded-lg p-4`}>
          <div className="space-y-3">
            {data.manufacturing_steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center text-sm font-bold`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className={`${colors.text} text-sm leading-relaxed`}>
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Cost Analysis Section */}
      <Section
        title="💰 Cost Analysis & Pricing Strategy"
        isOpen={expandedSections.costing}
        onToggle={() => toggleSection("costing")}
        colors={colors}
      >
        <div className="mt-4">
          {/* Costing Button */}
          {!costEstimate && (
            <div className="text-center mb-6">
              <button
                onClick={handleCostingRequest}
                disabled={loading}
                className={`bg-gradient-to-r ${colors.buttonGradient} hover:${colors.buttonHoverGradient} text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Calculating...' : 'Get Cost Analysis'}
              </button>
            </div>
          )}

          {/* Simplified Cost Summary */}
          <CostSummary 
            costEstimate={costEstimate} 
            loading={loading} 
            selectedCategory={selectedCategory} 
          />
        </div>
      </Section>

      {/* Safety Assessment Section */}
      <Section
        title="🛡️ Safety Assessment"
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

      {/* Marketing & Market Analysis Section */}
      <Section
        title="🎨 Marketing & Market Analysis"
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
                Packaging & Marketing Inspiration
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
                <span className="mr-2">📈</span>
                Current Market Trends
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
                Competitive Landscape
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {Object.entries(data.competitive_landscape).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className={`font-medium ${colors.text} capitalize`}>
                      {key.replace(/_/g, ' ')}:
                    </div>
                    <div className="text-gray-700">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

export default FormulationCard;
