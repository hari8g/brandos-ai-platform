import React, { useState } from "react";
import { useCosting } from "../../hooks/useCosting";
import CostSummary from "./CostSummary";
import type { GenerateResponse, IngredientDetail, SupplierInfo } from "../../types/formulation";

// ─── Helper Section component ─────────────────────────────────
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

// ─── Main FormulationCard component ─────────────────────────────────
interface FormulationCardProps {
  data: GenerateResponse;
  isGenerated?: boolean;
  onDownload?: () => void;
}

const FormulationCard: React.FC<FormulationCardProps> = ({
  data,
  isGenerated = false,
  onDownload,
}) => {
  // Add costing functionality
  const { loading, error, costEstimate, estimateCost, clearCostEstimate } = useCosting();

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

      {/* Scientific Reasoning Section */}
      <Section
        title="🧠 Scientific Reasoning"
        isOpen={expandedSections.reasoning}
        onToggle={() => toggleSection("reasoning")}
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {data.reasoning}
          </p>
        </div>
      </Section>

      {/* Enhanced Ingredients Section */}
      <Section
        title="🧴 Ingredients & Suppliers"
        isOpen={expandedSections.ingredients}
        onToggle={() => toggleSection("ingredients")}
      >
        <div className="space-y-4">
          {data.ingredients.map((ingredient, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              {/* Ingredient Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-lg">
                      {ingredient.name}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {ingredient.percent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>₹{ingredient.cost_per_100ml}/100ml</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Grade A
                    </span>
                  </div>
                </div>
              </div>

              {/* Why Chosen Rationale */}
              <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 text-sm mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Why Chosen
                </h4>
                <p className="text-purple-700 text-sm leading-relaxed">
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
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
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
      >
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="space-y-3">
            {data.manufacturing_steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-green-800 text-sm leading-relaxed">
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
      >
        <div className="mt-4 space-y-6">
          {/* Unified Cost Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-bold text-blue-800">Cost Analysis Overview</h4>
                <p className="text-sm text-blue-600">Comprehensive cost breakdown and pricing strategy</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {costEstimate ? formatCurrency(costEstimate.total) : `₹${data.estimated_cost.toFixed(0)}`}
                </div>
                <div className="text-sm text-blue-700">
                  {costEstimate ? 'AI-Optimized Price' : 'Estimated Cost'} (50ml)
                </div>
              </div>
            </div>

            {/* Cost Breakdown Cards */}
            {(() => {
              // Calculate actual ingredient costs
              const totalIngredientCost = data.ingredients.reduce((sum, ing) => {
                return sum + (ing.cost_per_100ml * ing.percent / 100);
              }, 0);
              
              // Use AI data if available, otherwise use calculated estimates
              const costData = costEstimate ? {
                ingredients: costEstimate.raw_materials,
                packaging: costEstimate.packaging_cost,
                labor: costEstimate.labor_cost,
                overhead: costEstimate.overhead_cost,
                qualityControl: costEstimate.quality_control_cost || 0,
                capex: costEstimate.capex_amortization || 0
              } : {
                ingredients: totalIngredientCost,
                packaging: totalIngredientCost * 0.25,
                labor: totalIngredientCost * 0.20,
                overhead: totalIngredientCost * 0.15,
                qualityControl: totalIngredientCost * 0.10,
                capex: 0
              };

              const totalCost = Object.values(costData).reduce((sum, cost) => sum + cost, 0);

              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                  {[
                    { key: 'ingredients', label: 'Ingredients', color: 'green', icon: '🌿' },
                    { key: 'packaging', label: 'Packaging', color: 'blue', icon: '📦' },
                    { key: 'labor', label: 'Labor', color: 'purple', icon: '👷' },
                    { key: 'overhead', label: 'Overhead', color: 'orange', icon: '🏢' },
                    { key: 'qualityControl', label: 'QC', color: 'teal', icon: '🔬' },
                    { key: 'capex', label: 'Equipment', color: 'red', icon: '⚙️' }
                  ].map(({ key, label, color, icon }) => {
                    const cost = costData[key as keyof typeof costData];
                    const percentage = totalCost > 0 ? (cost / totalCost) * 100 : 0;
                    
                    return (
                      <div key={key} className={`bg-white/70 border border-${color}-200 rounded-lg p-3 text-center`}>
                        <div className="text-lg mb-1">{icon}</div>
                        <div className={`font-semibold text-${color}-700 text-sm`}>
                          ₹{cost.toFixed(0)}
                        </div>
                        <div className={`text-${color}-600 text-xs`}>{label}</div>
                        <div className={`text-${color}-500 text-xs`}>
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Status Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${costEstimate ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {costEstimate ? 'AI Analysis Complete' : 'Preliminary Estimate'}
                </span>
              </div>
              {costEstimate && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Scale: {costEstimate.scale_info?.scale || 'medium'} • Margin: {costEstimate.margin.toFixed(1)}%
                </div>
              )}
            </div>
          </div>

          {/* Production Scale Selection */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Select Production Scale
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              {[
                { type: 'small', label: 'Small Scale', units: '250 units', desc: 'Artisanal production', icon: '🏠', color: 'orange' },
                { type: 'medium', label: 'Medium Scale', units: '2,500 units', desc: 'Growing business', icon: '🏢', color: 'blue' },
                { type: 'large', label: 'Large Scale', units: '20,000 units', desc: 'Established business', icon: '🏭', color: 'purple' },
                { type: 'custom', label: 'Custom', units: 'Custom units', desc: 'Specific requirements', icon: '⚙️', color: 'gray' }
              ].map((option) => (
                <button
                  key={option.type}
                  type="button"
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    batchSizeType === option.type 
                      ? `border-${option.color}-500 bg-${option.color}-50 shadow-md` 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                  onClick={() => setBatchSizeType(option.type as any)}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm">{option.label}</div>
                  <div className="text-gray-600 text-xs">{option.units}</div>
                  <div className="text-gray-500 text-xs mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
            
            {batchSizeType === 'custom' && (
              <div className="flex items-center space-x-4">
                <label className="font-medium text-gray-700">Custom Batch Size:</label>
                <input
                  type="number"
                  min={10}
                  max={100000}
                  step={10}
                  value={customBatchSize}
                  onChange={e => setCustomBatchSize(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Enter units"
                />
                <span className="text-sm text-gray-600">units</span>
              </div>
            )}
          </div>

          {/* AI Analysis Section */}
          {!costEstimate && !loading && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h4 className="text-xl font-bold text-indigo-800 mb-3">Generate AI-Powered Cost Analysis</h4>
                <p className="text-indigo-700 text-sm mb-6 max-w-md mx-auto">
                  Get detailed cost breakdowns, pricing strategies, and optimization suggestions tailored to your selected production scale.
                </p>
                <button
                  onClick={handleCostingRequest}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate Detailed Analysis</span>
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h4 className="text-xl font-bold text-yellow-800 mb-2">Analyzing Your Costs...</h4>
                <p className="text-yellow-700 text-sm max-w-md mx-auto">
                  Our AI is calculating detailed cost breakdowns, pricing strategies, and optimization suggestions for your selected production scale.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">⚠️</span>
                <h4 className="font-semibold text-red-800">Error Generating Cost Analysis</h4>
              </div>
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <button
                onClick={handleCostingRequest}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Detailed AI Analysis Results */}
          {costEstimate && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="mr-2">📊</span>
                  AI-Generated Analysis Results
                </h4>
                <button
                  onClick={clearCostEstimate}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Clear Analysis
                </button>
              </div>
              
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{costEstimate.margin.toFixed(1)}%</div>
                  <div className="text-sm text-green-700">Profit Margin</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(costEstimate.total_production_cost)}</div>
                  <div className="text-sm text-blue-700">Production Cost</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(costEstimate.total)}</div>
                  <div className="text-sm text-purple-700">Retail Price</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">{costEstimate.scale_info?.scale || 'medium'}</div>
                  <div className="text-sm text-orange-700">Production Scale</div>
                </div>
              </div>
              
              {/* Detailed Cost Summary */}
              <CostSummary cost={costEstimate} />
            </div>
          )}
        </div>
      </Section>

      {/* Safety Assessment Section */}
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
        </div>
      </Section>

      {/* Marketing & Market Analysis Section */}
      <Section
        title="🎨 Marketing & Market Analysis"
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
              <div className="text-yellow-900 text-sm leading-relaxed">
                {data.packaging_marketing_inspiration}
              </div>
            </div>
          )}
          
          {/* Market Trends */}
          {data.market_trends && data.market_trends.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 text-sm mb-3 flex items-center">
                <span className="mr-2">📈</span>
                Current Market Trends
              </h4>
              <div className="space-y-2">
                {data.market_trends.map((trend, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-purple-700 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{trend}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitive Landscape */}
          {data.competitive_landscape && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 text-sm mb-3 flex items-center">
                <span className="mr-2">🔍</span>
                Competitive Landscape
              </h4>
              <div className="space-y-2">
                {Object.entries(data.competitive_landscape).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-orange-700 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-medium text-orange-900">{value}</span>
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
