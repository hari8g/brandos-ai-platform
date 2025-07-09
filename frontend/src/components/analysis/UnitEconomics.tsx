import React from 'react';
import { CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface UnitEconomicsProps {
  content: string | any;
  colors: {
    text: string;
    border: string;
    bg: string;
    gradient: string;
    hoverGradient: string;
    icon: string;
  };
  selectedCategory?: string; // <-- Add this prop
}

interface CostItem {
  category: string;
  value: number;
}

const COST_CATEGORIES = [
  { key: 'rawMaterials', name: 'Raw Materials' },
  { key: 'manufacturing', name: 'Manufacturing' },
  { key: 'packaging', name: 'Packaging' },
  { key: 'logistics', name: 'Logistics' },
  { key: 'qualityControl', name: 'Quality' },
  { key: 'salesMarketing', name: 'Marketing' },
  { key: 'administrative', name: 'Admin' }
];

export const UnitEconomics: React.FC<UnitEconomicsProps> = ({ content, colors, selectedCategory }) => {
  // Parse the content to extract cost items
  const parseCostItems = (content: any): CostItem[] => {
    let items: CostItem[] = [];
    if (content && typeof content === 'object' && content.costBreakdown) {
      const breakdown = content.costBreakdown;
      COST_CATEGORIES.forEach(cat => {
        const val = breakdown[cat.key];
        if (val) {
          const match = val.match(/INR\s*(\d+)/i);
          const value = match ? parseInt(match[1]) : 0;
          items.push({ category: cat.name, value: value });
        }
      });
    }
    return items;
  };

  const data = parseCostItems(content);

  // Key Takeaways (placeholder)
  const takeaways = [
    'Raw materials and manufacturing are the largest cost drivers.',
    'Bulk purchasing can reduce raw material costs.',
    'Efficiency in logistics and packaging can further optimize costs.',
    'Direct-to-consumer sales can improve margin.',
    'Gross margin is healthy for this unit.'
  ];

  // --- Unit Definition ---
  const unitDefinition =
    'A unit refers to one packaged product ready for sale (e.g., one 260ml bottle, including all packaging and ready for distribution).';

  // --- Robust extraction for unit economics KPIs ---
  function extractKPIs(fields: any) {
    let totalUnitCost: number | null = null;
    let retailPrice: number | null = null;
    let grossMarginPercentFromText: number | null = null;
    const allINR: number[] = [];
    for (const key in fields) {
      if (typeof fields[key] === 'string') {
        const lines = fields[key].split(/\n|\\n/);
        for (const line of lines) {
          // Extract INR values
          const inrMatch = line.match(/INR\s*(\d+)/i);
          if (inrMatch) {
            allINR.push(parseInt(inrMatch[1]));
          }
          // Total Unit Cost
          if (line.toLowerCase().includes('total unit cost') && inrMatch) {
            totalUnitCost = parseInt(inrMatch[1]);
          }
          // Suggested Retail Price
          if (line.toLowerCase().includes('suggested retail price') && inrMatch) {
            retailPrice = parseInt(inrMatch[1]);
          }
          // Gross Margin %
          const marginMatch = line.match(/(\d+)%/);
          if (line.toLowerCase().includes('gross margin') && marginMatch) {
            grossMarginPercentFromText = parseInt(marginMatch[1]);
          }
        }
      }
    }
    // Fallback: use largest and next largest INR values, but never allow them to be the same
    const sorted = Array.from(new Set(allINR)).sort((a, b) => b - a);
    if (retailPrice == null && sorted.length > 0) retailPrice = sorted[0];
    if ((totalUnitCost == null || totalUnitCost === retailPrice) && sorted.length > 1) {
      totalUnitCost = sorted.find(v => v !== retailPrice) ?? sorted[1];
    }
    // If still not found, fallback to calculated
    if (totalUnitCost == null) totalUnitCost = 0;
    if (retailPrice == null) retailPrice = 0;
    return { totalUnitCost, retailPrice, grossMarginPercentFromText };
  }

  // --- Summary KPI Data ---
  let totalUnitCost = 0;
  let retailPrice = 0;
  let grossMarginPercentFromText: number | null = null;
  if (content && typeof content === 'object' && content.costBreakdown) {
    const kpis = extractKPIs(content.costBreakdown);
    totalUnitCost = kpis.totalUnitCost;
    retailPrice = kpis.retailPrice;
    grossMarginPercentFromText = kpis.grossMarginPercentFromText;
  }
  // Calculate gross margin (INR and %)
  const grossMargin = retailPrice > 0 ? retailPrice - totalUnitCost : 0;
  const grossMarginPercent = (retailPrice > 0 && grossMargin > 0)
    ? Math.round((grossMargin / retailPrice) * 100)
    : 0;

  // --- AOV by category (copied from MarketResearch) ---
  const getAOVByCategory = (category: string | undefined): string => {
    const cat = (category || 'wellness').toLowerCase();
    if (cat === 'pet food') return '₹2,500 - ₹4,000';
    if (cat === 'wellness') return '₹3,000 - ₹5,000';
    if (cat === 'beverages') return '₹1,500 - ₹3,000';
    if (cat === 'textiles') return '₹2,000 - ₹4,500';
    if (cat === 'desi masala') return '₹800 - ₹1,500';
    return '₹2,000 - ₹4,000'; // fallback (cosmetics/other)
  };
  const aov = getAOVByCategory(selectedCategory);

  return (
    <div className="space-y-4">
      {/* Unit Definition */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 px-4 py-3">
        <span className="font-semibold text-blue-900">What is a unit?</span>
        <span className="ml-2 text-blue-800">{unitDefinition}</span>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Unit Economics Breakdown
            </h3>
            <div className="flex items-center space-x-3">
              <CurrencyRupeeIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">INR</span>
            </div>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 14 }} />
                <PolarRadiusAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => `INR ${value}`} />
                <Radar name="Cost" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Unit Cost */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-sm font-medium text-emerald-800 mb-1">Total Unit Cost</span>
          <span className="text-2xl font-bold text-emerald-900">₹{totalUnitCost}</span>
        </div>
        {/* Suggested Retail Price */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-sm font-medium text-blue-800 mb-1">Suggested Retail Price</span>
          <span className="text-2xl font-bold text-blue-900">₹{retailPrice}</span>
        </div>
        {/* Gross Margin */}
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-sm font-medium text-pink-800 mb-1">Gross Margin</span>
          <span className="text-2xl font-bold text-pink-900">₹{grossMargin}</span>
          <span className="text-base font-medium text-pink-700 mt-1">{grossMarginPercent}%</span>
        </div>
        {/* AOV by Category */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-sm font-medium text-yellow-800 mb-1">Avg. Order Value (AOV)</span>
          <span className="text-2xl font-bold text-yellow-900">{aov}</span>
        </div>
      </div>

      {/* Key Takeaways Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
        <div className="bg-blue-600 text-white rounded-full px-6 py-2 text-base font-bold mb-4 text-center">Key Takeaways</div>
        <ul className="space-y-3">
          {takeaways.map((t, i) => (
            <li key={i} className="text-gray-800 text-sm">{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 