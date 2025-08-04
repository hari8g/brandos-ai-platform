import React, { useState } from 'react';
import { getCategoryColors } from '@/lib/colorUtils';
import type { GenerateResponse } from '@/types/formulation';

interface Props {
  formulation: GenerateResponse;
  selectedCategory?: string | null;
}

export default function FormulationDetails({ formulation, selectedCategory }: Props) {
  const colors = getCategoryColors(selectedCategory || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'ingredients'>('steps');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.lightBg} rounded-2xl p-6 border-2 ${colors.border}`}>
        <h2 className={`text-3xl font-bold ${colors.text} mb-2`}>
          {formulation.product_name}
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className={`px-3 py-1 bg-white rounded-full border ${colors.border} ${colors.text} font-medium`}>
            Cost: ₹{formulation.estimated_cost}/100ml
          </span>
          <span className={`px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium`}>
            {formulation.ingredients.length} Ingredients
          </span>
          <span className={`px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium`}>
            {formulation.manufacturing_steps.length} Steps
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'steps', label: ' Manufacturing Steps', icon: '' },
          { id: 'ingredients', label: 'Ingredients', icon: '' },
          { id: 'overview', label: 'Overview', icon: '' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? `${colors.buttonGradient.replace('bg-gradient-to-r', '')} bg-white text-gray-800 shadow-sm`
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'steps' && (
          <div className="space-y-4">
            <h3 className={`text-2xl font-bold ${colors.text} mb-6 flex items-center gap-2`}>
              <span className="text-3xl"></span>
              Detailed Manufacturing Process ({formulation.manufacturing_steps.length} Steps)
            </h3>
            
            <div className="space-y-6">
              {formulation.manufacturing_steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step connector line */}
                  {index < formulation.manufacturing_steps.length - 1 && (
                    <div className={`absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b ${colors.primary === 'purple' ? 'from-purple-300 to-purple-200' : 'from-blue-300 to-blue-200'}`}></div>
                  )}
                  
                  <div className={`bg-white rounded-2xl p-6 border-2 ${colors.border} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                    <div className="flex items-start gap-4">
                      {/* Step number badge */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${colors.buttonGradient} text-white font-bold text-lg flex items-center justify-center shadow-md`}>
                        {index + 1}
                      </div>
                      
                      {/* Step content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className={`text-xl font-bold ${colors.text}`}>
                            Step {index + 1}
                          </h4>
                          <span className={`px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium`}>
                            {getStepType(step)}
                          </span>
                        </div>
                        
                        <div className={`${colors.lightBg} rounded-xl p-4 border ${colors.border}`}>
                          <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                            {step}
                          </p>
                        </div>
                        
                        {/* Add step insights */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {getStepInsights(step).map((insight, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                              {insight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div className="space-y-4">
            <h3 className={`text-2xl font-bold ${colors.text} mb-6 flex items-center gap-2`}>
              <span className="text-3xl"></span>
              Ingredient Details ({formulation.ingredients.length} Components)
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              {formulation.ingredients.map((ingredient, index) => (
                <div key={index} className={`bg-white rounded-xl p-5 border-2 ${colors.border} hover:shadow-md transition-shadow duration-200`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className={`font-bold text-lg ${colors.text}`}>{ingredient.name}</h4>
                    <span className={`px-3 py-1 bg-gradient-to-r ${colors.buttonGradient} text-white rounded-full text-sm font-bold`}>
                      {ingredient.percent}%
                    </span>
                  </div>
                  
                  <div className={`${colors.lightBg} rounded-lg p-3 mb-3 border ${colors.border}`}>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <span className="font-semibold text-gray-800">Why chosen:</span> {ingredient.why_chosen}
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Cost per 100ml:</span>
                      <span className="font-bold text-green-600">₹{ingredient.cost_per_100ml}</span>
                    </div>
                    
                    {ingredient.suppliers && ingredient.suppliers.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-700">Top Supplier:</span>
                        <div className="mt-1 text-xs bg-blue-50 p-2 rounded border">
                          <div className="font-medium text-blue-800">{ingredient.suppliers[0].name}</div>
                          <div className="text-blue-600">{ingredient.suppliers[0].location}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold ${colors.text} mb-6 flex items-center gap-2`}>
              <span className="text-3xl"></span>
              Formulation Overview
            </h3>
            
            {/* Reasoning */}
            <div className={`bg-gradient-to-r ${colors.lightBg} rounded-xl p-6 border-2 ${colors.border}`}>
              <h4 className={`text-xl font-bold ${colors.text} mb-3`}>Scientific Reasoning</h4>
              <p className="text-gray-700 leading-relaxed">{formulation.reasoning}</p>
            </div>
            
            {/* Safety Notes */}
            {formulation.safety_notes && formulation.safety_notes.length > 0 && (
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <h4 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  Safety Considerations
                </h4>
                <ul className="space-y-2">
                  {formulation.safety_notes.map((note, index) => (
                    <li key={index} className="text-red-700 flex items-start gap-2">
                      <span className="text-red-600 mt-1">⚠️</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Enhanced Marketing & Packaging Section */}
            {formulation.packaging_marketing_inspiration && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className={`bg-gradient-to-r ${colors.lightBg} rounded-2xl p-6 border-2 ${colors.border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-2xl font-bold ${colors.text} flex items-center gap-3`}>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.buttonGradient} flex items-center justify-center text-white text-xl`}>
                        🎨
                      </div>
                      Marketing & Packaging Strategy
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 ${colors.bg} text-white rounded-full text-sm font-medium`}>
                        Brand Ready
                      </span>
                    </div>
                  </div>
                  <p className={`${colors.text} opacity-80`}>
                    Comprehensive branding and packaging recommendations tailored for your product
                  </p>
                </div>

                {/* Enhanced Content Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Packaging Innovation */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-lg">
                        📦
                      </div>
                      <h5 className="text-lg font-bold text-purple-800">Packaging Innovation</h5>
                    </div>
                    <div className="space-y-3">
                      {extractPackagingInsights(formulation.packaging_marketing_inspiration).map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-purple-700 text-sm leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brand Positioning */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-lg">
                        🎯
                      </div>
                      <h5 className="text-lg font-bold text-blue-800">Brand Positioning</h5>
                    </div>
                    <div className="space-y-3">
                      {extractBrandingInsights(formulation.packaging_marketing_inspiration, selectedCategory || null).map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-blue-700 text-sm leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marketing Channels */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-lg">
                        📢
                      </div>
                      <h5 className="text-lg font-bold text-green-800">Marketing Channels</h5>
                    </div>
                    <div className="space-y-3">
                      {getMarketingChannels(selectedCategory || null).map((channel, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors cursor-pointer">
                          <div className="text-lg">{channel.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-green-800 text-sm">{channel.name}</div>
                            <div className="text-green-600 text-xs">{channel.description}</div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${channel.priority === 'High' ? 'bg-red-100 text-red-700' : channel.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                            {channel.priority}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Identity */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-lg">
                        🎨
                      </div>
                      <h5 className="text-lg font-bold text-orange-800">Visual Identity</h5>
                    </div>
                    <div className="space-y-4">
                      {/* Color Palette */}
                      <div>
                        <div className="text-sm font-semibold text-orange-700 mb-2">Recommended Colors</div>
                        <div className="flex gap-2">
                          {getCategoryColorPalette(selectedCategory || null).map((color, index) => (
                            <div key={index} className="group relative">
                              <div 
                                className={`w-8 h-8 rounded-lg border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              ></div>
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {color.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Typography Suggestion */}
                      <div>
                        <div className="text-sm font-semibold text-orange-700 mb-2">Typography Style</div>
                        <div className="text-orange-600 text-sm">
                          {getTypographyRecommendation(selectedCategory || null)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-lg">
                      ✅
                    </div>
                    <h5 className="text-lg font-bold text-indigo-800">Next Steps</h5>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: '🎨', task: 'Create brand mood board', priority: 'High', time: '2-3 days' },
                      { icon: '📦', task: 'Design packaging prototypes', priority: 'High', time: '1 week' },
                      { icon: '📝', task: 'Develop brand messaging', priority: 'Medium', time: '3-4 days' },
                      { icon: '📊', task: 'Plan go-to-market strategy', priority: 'Medium', time: '1 week' },
                      { icon: '🧪', task: 'Test packaging with focus groups', priority: 'Low', time: '2 weeks' },
                      { icon: '🚀', task: 'Launch marketing campaigns', priority: 'Low', time: '3-4 weeks' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
                        <div className="text-lg">{item.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-indigo-800 text-sm">{item.task}</div>
                          <div className="text-indigo-600 text-xs">Timeline: {item.time}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${item.priority === 'High' ? 'bg-red-100 text-red-700' : item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {item.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Original Content (Enhanced) */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white text-lg">
                      💡
                    </div>
                    <h5 className="text-lg font-bold text-purple-800">AI-Generated Insights</h5>
                  </div>
                  <div className="prose prose-purple max-w-none">
                    <p className="text-purple-700 leading-relaxed text-base font-medium bg-white/50 rounded-xl p-4 border border-purple-100">
                      {formulation.packaging_marketing_inspiration}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getStepType(step: string): string {
  const stepLower = step.toLowerCase();
  if (stepLower.includes('heat') || stepLower.includes('temperature') || stepLower.includes('warm')) return 'Heating';
  if (stepLower.includes('mix') || stepLower.includes('stir') || stepLower.includes('blend')) return 'Mixing';
  if (stepLower.includes('cool') || stepLower.includes('chill')) return 'Cooling';
  if (stepLower.includes('add') || stepLower.includes('incorporate')) return 'Addition';
  if (stepLower.includes('test') || stepLower.includes('check') || stepLower.includes('measure')) return 'Quality Control';
  if (stepLower.includes('package') || stepLower.includes('fill') || stepLower.includes('bottle')) return 'Packaging';
  if (stepLower.includes('prepare') || stepLower.includes('setup')) return 'Preparation';
  return 'Process';
}

function getStepInsights(step: string): string[] {
  const insights: string[] = [];
  const stepLower = step.toLowerCase();
  
  // Look for temperature mentions
  const tempMatch = stepLower.match(/(\d+)[-–]?(\d+)?\s*°?[cf]/);
  if (tempMatch) insights.push(`Temp: ${tempMatch[0]}`);
  
  // Look for time mentions
  const timeMatch = stepLower.match(/(\d+)\s*(min|hour|sec)/);
  if (timeMatch) insights.push(`Time: ${timeMatch[0]}`);
  
  // Look for speed mentions  
  const speedMatch = stepLower.match(/(\d+)\s*(rpm|speed)/);
  if (speedMatch) insights.push(`Speed: ${speedMatch[0]}`);
  
  // Add safety indicators
  if (stepLower.includes('safety') || stepLower.includes('caution') || stepLower.includes('warning')) {
    insights.push('⚠️ Safety Critical');
  }
  
  // Add quality control indicators
  if (stepLower.includes('test') || stepLower.includes('check') || stepLower.includes('verify')) {
    insights.push('✓ QC Point');
  }
  
  return insights.slice(0, 3); // Limit to 3 insights per step
}

// Enhanced Marketing & Packaging Helper Functions
function extractPackagingInsights(content: string): string[] {
  const insights: string[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Look for packaging-related keywords
  const packagingKeywords = ['package', 'packaging', 'container', 'bottle', 'jar', 'tube', 'box', 'design', 'sustainable', 'eco-friendly', 'premium'];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    if (packagingKeywords.some(keyword => lowerSentence.includes(keyword))) {
      insights.push(sentence.trim());
    }
  });
  
  // Add default insights if none found
  if (insights.length === 0) {
    insights.push(
      "Consider sustainable packaging materials to appeal to eco-conscious consumers",
      "Design user-friendly dispensing mechanisms for optimal product usage",
      "Implement premium packaging elements to justify pricing strategy"
    );
  }
  
  return insights.slice(0, 4);
}

function extractBrandingInsights(content: string, category: string | null): string[] {
  const insights: string[] = [];
  const categorySpecific = getCategoryBrandingInsights(category);
  
  // Extract brand-related content from the original text
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const brandingKeywords = ['brand', 'premium', 'luxury', 'natural', 'organic', 'quality', 'trust', 'reputation', 'value'];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    if (brandingKeywords.some(keyword => lowerSentence.includes(keyword))) {
      insights.push(sentence.trim());
    }
  });
  
  // Add category-specific insights
  insights.push(...categorySpecific);
  
  return insights.slice(0, 4);
}

function getCategoryBrandingInsights(category: string | null): string[] {
  switch (category?.toLowerCase()) {
    case 'cosmetics':
      return [
        "Position as clean beauty with ingredient transparency",
        "Emphasize dermatologist-tested and cruelty-free credentials",
        "Focus on immediate visible results and long-term skin benefits"
      ];
    case 'pet food':
      return [
        "Highlight nutritional benefits and veterinarian approval",
        "Emphasize natural ingredients and no artificial preservatives",
        "Build trust through transparency in sourcing and manufacturing"
      ];
    default:
      return [
        "Focus on product quality and safety standards",
        "Build brand trust through consistent messaging",
        "Emphasize unique value proposition in the market"
      ];
  }
}

function getMarketingChannels(category: string | null): Array<{
  name: string;
  icon: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}> {
  const baseChannels = [
    { name: 'Social Media Marketing', icon: '📱', description: 'Instagram, Facebook, TikTok campaigns', priority: 'High' as const },
    { name: 'Influencer Partnerships', icon: '🌟', description: 'Collaborate with micro and macro influencers', priority: 'High' as const },
    { name: 'Content Marketing', icon: '📝', description: 'Blog posts, tutorials, and educational content', priority: 'Medium' as const },
    { name: 'Email Marketing', icon: '📧', description: 'Newsletter campaigns and customer retention', priority: 'Medium' as const },
  ];

  const categorySpecific = getCategorySpecificChannels(category);
  return [...baseChannels, ...categorySpecific];
}

function getCategorySpecificChannels(category: string | null): Array<{
  name: string;
  icon: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}> {
  switch (category?.toLowerCase()) {
    case 'cosmetics':
      return [
        { name: 'Beauty Retail Partnerships', icon: '🏪', description: 'Nykaa, Sephora, local beauty stores', priority: 'High' as const },
        { name: 'YouTube Beauty Channels', icon: '📺', description: 'Product reviews and tutorials', priority: 'Medium' as const }
      ];
    case 'pet food':
      return [
        { name: 'Pet Store Partnerships', icon: '🐕', description: 'Local pet stores and veterinary clinics', priority: 'High' as const },
        { name: 'Pet Community Forums', icon: '💬', description: 'Online pet owner communities', priority: 'Low' as const }
      ];
    default:
      return [
        { name: 'E-commerce Platforms', icon: '🛒', description: 'Amazon, Flipkart, direct-to-consumer', priority: 'Medium' as const }
      ];
  }
}

function getCategoryColorPalette(category: string | null): Array<{
  name: string;
  hex: string;
}> {
  switch (category?.toLowerCase()) {
    case 'cosmetics':
      return [
        { name: 'Rose Gold', hex: '#E8B4B8' },
        { name: 'Soft Pink', hex: '#F8BBD9' },
        { name: 'Cream', hex: '#F5F5DC' },
        { name: 'Lavender', hex: '#E6E6FA' },
        { name: 'Gold', hex: '#FFD700' }
      ];
    case 'pet food':
      return [
        { name: 'Forest Green', hex: '#228B22' },
        { name: 'Warm Orange', hex: '#FF8C00' },
        { name: 'Earth Brown', hex: '#8B4513' },
        { name: 'Sky Blue', hex: '#87CEEB' },
        { name: 'Cream', hex: '#F5F5DC' }
      ];
    default:
      return [
        { name: 'Deep Blue', hex: '#4169E1' },
        { name: 'Fresh Green', hex: '#32CD32' },
        { name: 'Warm Gray', hex: '#808080' },
        { name: 'Soft White', hex: '#F8F8FF' },
        { name: 'Accent Orange', hex: '#FF6347' }
      ];
  }
}

function getTypographyRecommendation(category: string | null): string {
  switch (category?.toLowerCase()) {
    case 'cosmetics':
      return 'Elegant serif fonts with modern sans-serif combinations. Think sophistication meets accessibility.';
    case 'pet food':
      return 'Friendly, rounded sans-serif fonts that convey trust and approachability for pet owners.';
    default:
      return 'Clean, professional sans-serif fonts with good readability across all marketing materials.';
  }
} 