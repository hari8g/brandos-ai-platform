import React, { useState } from "react";

// ─── Helper Section component (hoisted) ─────────────────────────────────
interface SectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
function Section({ title, isOpen, onToggle, children }: SectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          {title}
        </h3>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

// ─── Helper Components ─────────────────────────────────
// Socio-Customer Metrics Component
const SocioCustomerMeter = ({ score, label }: { score: number; label: string }) => {
  const getColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className={`px-3 py-1 rounded-full text-xs font-bold ${getColor(score)}`}>
        {score}/10
      </div>
    </div>
  );
};

// Purchasing Metrics Component
const PurchasingMetrics = ({ metrics }: { metrics: any }) => {
  const metricList = [
    {
      label: "Purchase Intent",
      value: Math.min(metrics.purchaseIntent, 100),
      color: "bg-blue-500"
    },
    {
      label: "Price Sensitivity",
      value: Math.min(metrics.priceSensitivity, 100),
      color: "bg-green-500"
    },
    {
      label: "Brand Loyalty",
      value: Math.min(metrics.brandLoyalty, 100),
      color: "bg-purple-500"
    }
  ];
  return (
    <div className="space-y-4">
      {metricList.map((metric, idx) => (
        <div key={metric.label} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
          <span className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">{metric.label}</span>
          <div className="flex-1 mx-4">
            <div className="w-full h-2.5 bg-gray-100 rounded-full">
              <div
                className={`${metric.color} h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${metric.value}%` }}
              ></div>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-700 min-w-[2.5rem] text-right">{metric.value}%</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main FormulationCard component ─────────────────────────────────
interface Supplier {
  name: string;
  location: string;
  url?: string;
  price_per_100ml: number;
}
interface Alternative {
  name: string;
  price_impact: number;
  reasoning: string;
}
interface Ingredient {
  name: string;
  percent: number;
  cost_per_100ml: number;
  suppliers: Supplier[];
  alternatives: Alternative[];
}
interface CompetitiveLandscape {
  price_range: string;
  target_demographics: string;
  distribution_channels: string;
  key_competitors: string;
}
interface SeasonalTrend {
  season: string;
  trend: string;
}
interface Pricing {
  small_batch: number;
  medium_scale: number;
  reasoning?: string;
}
interface FormulationData {
  product_name: string;
  ingredients: Ingredient[];
  reasoning: string;
  predicted_ph: number;
  estimated_cost: number;
  safety_notes: string[];
  category?: string;
  pricing: Pricing;
  query_quality_score?: number;
  query_quality_feedback?: string;
  quality_warnings?: string[];
  improvement_suggestions?: string[];
  packaging_marketing_inspiration?: string;
  market_trends?: string[];
  packaging_design_ideas?: string[];
  marketing_strategies?: string[];
  competitive_landscape?: CompetitiveLandscape;
  seasonal_trends?: SeasonalTrend[];
}
interface FormulationCardProps {
  data: FormulationData;
  isGenerated?: boolean;
  onDownload?: () => void;
}

const FormulationCard: React.FC<FormulationCardProps> = ({
  data,
  isGenerated = false,
  onDownload,
}) => {
  // Inspect raw payload
  console.log("🧩 Raw formulation payload:", data);

  // Destructure with defaults
  const {
    packaging_marketing_inspiration = "",
    market_trends = [],
    packaging_design_ideas = [],
    marketing_strategies = [],
    competitive_landscape = null,
    seasonal_trends = [],
  } = data;

  const [expandedSections, setExpandedSections] = useState({
    reasoning: true,
    ingredients: true,
    metrics: true,
    pricing: true,
    safety: true,
    marketing: true,
  });
  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));

  // Validate core data
  if (
    !data ||
    typeof data.product_name !== "string" ||
    !Array.isArray(data.ingredients) ||
    data.ingredients.length === 0
  ) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <strong>Invalid formulation data.</strong> Please try generating again.
      </div>
    );
  }
  const validIngredients = data.ingredients.every(
    (ing) => ing.name && typeof ing.percent === "number"
  );
  if (!validIngredients) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <strong>Invalid ingredient data.</strong> Please try generating again.
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
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
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

      {/* Sections */}
      <Section
        title="🧠 Scientific Reasoning & Manufacturing Process"
        isOpen={expandedSections.reasoning}
        onToggle={() => toggleSection("reasoning")}
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-line">
            {data.reasoning}
          </p>
        </div>
      </Section>

      <Section
        title="🧴 Ingredients & Formulation"
        isOpen={expandedSections.ingredients}
        onToggle={() => toggleSection("ingredients")}
      >
        <div className="space-y-3">
          {data.ingredients.map((ing, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {ing.name}
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {ing.percent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>₹{ing.cost_per_100ml}/100ml</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Grade A
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="📊 Analysis & Metrics"
        isOpen={expandedSections.metrics}
        onToggle={() => toggleSection("metrics")}
      >
        <div className="mt-4 space-y-6">
          {/* Socio-Customer Metrics */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">👥</span>
              Customer Insights
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SocioCustomerMeter score={8.5} label="Target Audience Match" />
              <SocioCustomerMeter score={7.2} label="Social Media Appeal" />
              <SocioCustomerMeter score={9.1} label="Trend Alignment" />
              <SocioCustomerMeter score={6.8} label="Cultural Relevance" />
            </div>
          </div>

          {/* Purchasing Metrics */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Purchase Behavior
            </h4>
            <PurchasingMetrics 
              metrics={{
                purchaseIntent: 78,
                priceSensitivity: 65,
                brandLoyalty: 82
              }} 
            />
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section
        title="💰 Cost Analysis"
        isOpen={expandedSections.pricing}
        onToggle={() => toggleSection("pricing")}
      >
        <div className="mt-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-green-800">Estimated Cost (100ml)</span>
              <span className="text-2xl font-bold text-green-900">₹{data.estimated_cost}</span>
            </div>
            <div className="mt-3 text-sm text-green-700">
              <div className="flex items-center justify-between mb-1">
                <span>Raw Materials</span>
                <span>₹{(data.estimated_cost * 0.6).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span>Packaging</span>
                <span>₹{(data.estimated_cost * 0.25).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Manufacturing</span>
                <span>₹{(data.estimated_cost * 0.15).toFixed(0)}</span>
              </div>
            </div>
          </div>
          
          {/* Pricing Tiers */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">Small Batch Pricing</h4>
              <div className="text-2xl font-bold text-blue-900">₹{data.pricing.small_batch}</div>
              <p className="text-blue-700 text-xs mt-1">Per 100ml</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 text-sm mb-2">Medium Scale Pricing</h4>
              <div className="text-2xl font-bold text-purple-900">₹{data.pricing.medium_scale}</div>
              <p className="text-purple-700 text-xs mt-1">Per 100ml</p>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-700 text-sm">{data.pricing.reasoning}</p>
          </div>
        </div>
      </Section>

      {/* Safety Assessment */}
      <Section
        title="🛡️ Safety Assessment"
        isOpen={expandedSections.safety}
        onToggle={() => toggleSection("safety")}
      >
        <div className="mt-4 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">Safety Notes</h4>
            <ul className="space-y-1">
              {data.safety_notes.map((note, index) => (
                <li key={index} className="flex items-start space-x-2 text-blue-700 text-sm">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        
          {data.quality_warnings && data.quality_warnings.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 text-sm mb-2">Quality Warnings</h4>
              <ul className="space-y-1">
                {data.quality_warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2 text-yellow-700 text-sm">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        
          {data.improvement_suggestions && data.improvement_suggestions.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 text-sm mb-2">Improvement Suggestions</h4>
              <ul className="space-y-1">
                {data.improvement_suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-green-700 text-sm">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Packaging & Marketing Inspiration */}
      <Section
        title="🎨 Packaging & Marketing Inspiration"
        isOpen={expandedSections.marketing}
        onToggle={() => toggleSection("marketing")}
      >
        <div className="mt-4 space-y-4">
          {/* Packaging & Marketing Inspiration */}
          {data.packaging_marketing_inspiration && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 text-sm mb-2 flex items-center">
                <span className="mr-2">✨</span>
                Packaging & Marketing Inspiration
              </h4>
              <div className="text-yellow-900 text-base font-medium">{data.packaging_marketing_inspiration}</div>
            </div>
          )}
          {/* Market Trends */}
          {Array.isArray(data.market_trends) && data.market_trends.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 text-sm mb-3 flex items-center">
                <span className="mr-2">📈</span>
                Current Market Trends
              </h4>
              <div className="space-y-2">
                {data.market_trends.map((trend, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-purple-700 text-xs">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{trend}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Packaging Design Ideas */}
          {Array.isArray(data.packaging_design_ideas) && data.packaging_design_ideas.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 text-sm mb-3 flex items-center">
                <span className="mr-2">📦</span>
                Packaging Design Ideas
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {data.packaging_design_ideas.map((idea, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-blue-700 text-xs">{idea}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Marketing Strategies */}
          {Array.isArray(data.marketing_strategies) && data.marketing_strategies.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 text-sm mb-3 flex items-center">
                <span className="mr-2">📢</span>
                Marketing Strategies
              </h4>
              <div className="space-y-3">
                {data.marketing_strategies.map((strategy, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-green-700 text-xs">{strategy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Competitive Analysis */}
          {typeof data.competitive_landscape === 'object' && data.competitive_landscape !== null && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 text-sm mb-3 flex items-center">
                <span className="mr-2">🔍</span>
                Competitive Landscape
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-700">Price Range (100ml)</span>
                  <span className="font-medium text-orange-900">{data.competitive_landscape.price_range}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-700">Target Demographics</span>
                  <span className="font-medium text-orange-900">{data.competitive_landscape.target_demographics}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-700">Distribution Channels</span>
                  <span className="font-medium text-orange-900">{data.competitive_landscape.distribution_channels}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-700">Key Competitors</span>
                  <span className="font-medium text-orange-900">{data.competitive_landscape.key_competitors}</span>
                </div>
              </div>
            </div>
          )}
          {/* Seasonal Trends */}
          {Array.isArray(data.seasonal_trends) && data.seasonal_trends.length > 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
              <h4 className="font-semibold text-pink-800 text-sm mb-3 flex items-center">
                <span className="mr-2">🌸</span>
                Seasonal Trends
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {data.seasonal_trends.map((season, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-2 border border-pink-200">
                    <h5 className="font-medium text-pink-900 text-xs mb-1">{season.season}</h5>
                    <p className="text-pink-700 text-xs">{season.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

export default FormulationCard;
