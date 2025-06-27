import React from "react"
import { Badge } from "@/components/ui/badge"
import PHMeter from "./PHMeter"

function getRole(name: string) {
  name = name.toLowerCase()
  if (["niacinamide", "salicylic acid", "vitamin c", "retinol", "hyaluronic acid", "peptides"].includes(name)) return "Active"
  if (["phenoxyethanol", "ethylhexylglycerin", "benzoic acid", "sorbic acid"].includes(name)) return "Preservative"
  if (["glycerin", "aloe vera juice", "water", "distilled water", "purified water"].includes(name)) return "Base"
  if (["dimethicone", "cyclomethicone", "caprylic triglyceride"].includes(name)) return "Emollient"
  if (["xanthan gum", "carbomer", "cellulose gum"].includes(name)) return "Thickener"
  return "Other"
}

export default function FormulationCard({ data }: { data: any }) {
  // Guard against invalid or missing data
  if (
    !data ||
    typeof data !== "object" ||
    typeof data.product_name !== "string" ||
    !Array.isArray(data.ingredients) ||
    data.ingredients.length === 0 ||
    typeof data.estimated_cost !== "number" ||
    typeof data.predicted_ph !== "number"
  ) {
    return null
  }

  // Optionally, you can add more granular checks for each ingredient
  const validIngredients = data.ingredients.every(
    (item: any) => item && typeof item.name === "string" && typeof item.percent === "number"
  )
  if (!validIngredients) {
    return null
  }

  return (
    <div className="mt-10 bg-white p-6 rounded-2xl shadow-md w-full max-w-xl transition-all duration-500">
      <h2 className="text-2xl font-bold text-indigo-600 mb-4">{data.product_name}</h2>

      {/* Quality Assessment Section */}
      {data.query_quality_score !== undefined && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-orange-800">🔍 Query Quality Assessment</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-orange-700">Score:</span>
              <Badge variant={data.query_quality_score >= 5 ? "default" : "destructive"}>
                {data.query_quality_score}/7
              </Badge>
            </div>
          </div>
          {data.query_quality_feedback && (
            <p className="text-orange-700 text-sm mb-3">{data.query_quality_feedback}</p>
          )}
          
          {/* Quality Warnings */}
          {data.quality_warnings && data.quality_warnings.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-orange-800 text-sm mb-2">⚠️ Warnings:</h4>
              <ul className="list-disc list-inside text-orange-700 text-sm space-y-1">
                {data.quality_warnings.map((warning: string, index: number) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Improvement Suggestions */}
          {data.improvement_suggestions && data.improvement_suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-800 text-sm mb-2">💡 Suggestions to improve your query:</h4>
              <ul className="list-disc list-inside text-orange-700 text-sm space-y-1">
                {data.improvement_suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Reasoning Section */}
      {data.reasoning && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Formulation Reasoning</h3>
          <p className="text-blue-700 text-sm leading-relaxed">{data.reasoning}</p>
        </div>
      )}

      {/* Ingredients Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">📋 Ingredients</h3>
        <ul className="space-y-4">
          {data.ingredients.map((item: any, i: number) => (
            <li
              key={i}
              className="flex flex-col border-b pb-2"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{item.name}</span>
                  <Badge variant="outline">{getRole(item.name)}</Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{item.percent}%</span>
                  <span className="text-xs text-gray-500">₹{item.cost_per_100ml}/100ml</span>
                </div>
              </div>
              {/* Supplier List */}
              {item.suppliers && item.suppliers.length > 0 && (
                <div className="mt-1 ml-2">
                  <span className="text-xs text-gray-600 font-medium">Suppliers:</span>
                  <ul className="ml-2 list-disc text-xs text-gray-700">
                    {item.suppliers.map((sup: any, idx: number) => (
                      <li key={idx} className="mb-1">
                        <span className="font-semibold">{sup.name}</span> ({sup.location})
                        {sup.url && (
                          <a href={sup.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 underline">link</a>
                        )}
                        <span className="ml-1">₹{sup.price_per_100ml}/100ml</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Alternatives */}
              {item.alternatives && item.alternatives.length > 0 && (
                <div className="mt-1 ml-2">
                  <span className="text-xs text-gray-600 font-medium">Alternatives:</span>
                  <ul className="ml-2 list-disc text-xs text-gray-700">
                    {item.alternatives.map((alt: any, idx: number) => (
                      <li key={idx} className="mb-1">
                        <span className="font-semibold">{alt.name}</span> (Price impact: <span className={alt.price_impact < 0 ? 'text-green-600' : 'text-red-600'}>₹{alt.price_impact}</span>)<br/>
                        <span className="text-gray-500">{alt.reasoning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing Section */}
      {data.pricing && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">💸 Pricing Estimates</h3>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="mb-2 md:mb-0">
              <span className="text-gray-700 font-medium">Small Batch (100 units): </span>
              <span className="font-bold text-green-700">₹{data.pricing.small_batch}</span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Medium Scale (10,000 units): </span>
              <span className="font-bold text-green-700">₹{data.pricing.medium_scale}</span>
            </div>
          </div>
          {data.pricing.reasoning && (
            <div className="mt-2 text-xs text-green-900">{data.pricing.reasoning}</div>
          )}
        </div>
      )}

      {/* Safety Notes */}
      {data.safety_notes && data.safety_notes.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-2">⚠️ Safety Notes</h3>
          <ul className="list-disc list-inside text-amber-700 text-sm space-y-1">
            {data.safety_notes.map((note: string, index: number) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cost and pH Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="font-semibold text-gray-700">💰 Estimated Cost:</span>
          <span className="font-bold text-green-600">₹{data.estimated_cost}</span>
        </div>
        
        <div>
          <PHMeter ph={data.predicted_ph} />
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Ingredients:</span>
            <span className="ml-2 font-medium">{data.ingredients.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>
            <span className="ml-2 font-medium capitalize">{data.category || 'Custom'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
