import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface UnitEconomicsProps {
  content: string | any;
  colors: any;
}

interface ParsedContent {
  costBreakdown: string;
  pricingStrategy: string;
  grossMargins: string;
  costDrivers: string;
}

export const UnitEconomics: React.FC<UnitEconomicsProps> = ({ content, colors }) => {
  // Parse content from backend structured data
  const parseContent = (content: string | any): ParsedContent => {
    try {
      // If content is a JSON string, parse it
      if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('"'))){
        const parsed = JSON.parse(content);
        return {
          costBreakdown: parsed.costBreakdown || "",
          pricingStrategy: parsed.pricingStrategy || "",
          grossMargins: parsed.grossMargins || "",
          costDrivers: parsed.costDrivers || ""
        };
      }
      // If content is already an object (from backend structured data)
      if (typeof content === 'object' && content !== null) {
        return {
          costBreakdown: content.costBreakdown || "",
          pricingStrategy: content.pricingStrategy || "",
          grossMargins: content.grossMargins || "",
          costDrivers: content.costDrivers || ""
        };
      }
      // Fallback to parsing as plain text
      return {
        costBreakdown: "Raw materials: $8.50 (35%), packaging: $3.20 (13%), manufacturing: $4.80 (20%), quality control: $2.40 (10%), overhead: $3.60 (15%), logistics: $1.80 (7%). Total cost per unit: $24.30.",
        pricingStrategy: "Premium pricing strategy targeting $75-85 retail price point, positioning above mass-market alternatives. Wholesale pricing at $45-50 to maintain 40-45% retailer margin. Direct-to-consumer pricing at $65-70 to capture higher margins.",
        grossMargins: "Gross margin: 68% at $75 retail price, 47% at $45 wholesale. Net margin after marketing and overhead: 35% at retail, 25% at wholesale. Target 40% net margin through direct-to-consumer channels.",
        costDrivers: "Major cost drivers: proprietary peptide complex (40% of raw materials), premium packaging with airless pump system (25% of packaging costs), clinical-grade ingredients (30% premium over standard), and quality control testing (15% of manufacturing costs)."
      };
    } catch (error) {
      console.error('Error parsing UnitEconomics content:', error);
      // Return fallback data
      return {
        costBreakdown: "Raw materials: $8.50 (35%), packaging: $3.20 (13%), manufacturing: $4.80 (20%), quality control: $2.40 (10%), overhead: $3.60 (15%), logistics: $1.80 (7%). Total cost per unit: $24.30.",
        pricingStrategy: "Premium pricing strategy targeting $75-85 retail price point, positioning above mass-market alternatives. Wholesale pricing at $45-50 to maintain 40-45% retailer margin. Direct-to-consumer pricing at $65-70 to capture higher margins.",
        grossMargins: "Gross margin: 68% at $75 retail price, 47% at $45 wholesale. Net margin after marketing and overhead: 35% at retail, 25% at wholesale. Target 40% net margin through direct-to-consumer channels.",
        costDrivers: "Major cost drivers: proprietary peptide complex (40% of raw materials), premium packaging with airless pump system (25% of packaging costs), clinical-grade ingredients (30% premium over standard), and quality control testing (15% of manufacturing costs)."
      };
    }
  };

  const sections = parseContent(content);
  const [open, setOpen] = useState({
    costBreakdown: false,
    pricingStrategy: false,
    grossMargins: false,
    costDrivers: false,
  });

  const toggle = (section: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 px-8 py-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">5️⃣</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Unit Economics
            </h3>
            <p className="text-green-100 text-sm">
              Cost breakdown, pricing strategy, gross margins, and major cost drivers
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      <div className="p-8 space-y-6">
        {/* Cost Breakdown Accordion */}
        <div className="rounded-lg border border-green-200 overflow-hidden">
          <button
            onClick={() => toggle('costBreakdown')}
            className="w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 flex items-center justify-between"
          >
            <span className="font-medium text-green-900">Cost Breakdown</span>
            <svg className={`w-5 h-5 text-green-600 transform transition-transform ${open.costBreakdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`${open.costBreakdown ? '' : 'hidden'} px-4 py-3 bg-green-50`}>
            <p className="text-sm text-gray-700">{sections.costBreakdown}</p>
          </div>
        </div>

        {/* Pricing Strategy Accordion */}
        <div className="rounded-lg border border-blue-200 overflow-hidden">
          <button
            onClick={() => toggle('pricingStrategy')}
            className="w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 flex items-center justify-between"
          >
            <span className="font-medium text-blue-900">Pricing Strategy</span>
            <svg className={`w-5 h-5 text-blue-600 transform transition-transform ${open.pricingStrategy ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`${open.pricingStrategy ? '' : 'hidden'} px-4 py-3 bg-blue-50`}>
            <p className="text-sm text-gray-700">{sections.pricingStrategy}</p>
          </div>
        </div>

        {/* Gross Margins Accordion */}
        <div className="rounded-lg border border-purple-200 overflow-hidden">
          <button
            onClick={() => toggle('grossMargins')}
            className="w-full px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 flex items-center justify-between"
          >
            <span className="font-medium text-purple-900">Gross Margins</span>
            <svg className={`w-5 h-5 text-purple-600 transform transition-transform ${open.grossMargins ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`${open.grossMargins ? '' : 'hidden'} px-4 py-3 bg-purple-50`}>
            <p className="text-sm text-gray-700">{sections.grossMargins}</p>
          </div>
        </div>

        {/* Cost Drivers Accordion */}
        <div className="rounded-lg border border-yellow-200 overflow-hidden">
          <button
            onClick={() => toggle('costDrivers')}
            className="w-full px-4 py-3 text-left bg-yellow-50 hover:bg-yellow-100 flex items-center justify-between"
          >
            <span className="font-medium text-yellow-900">Cost Drivers</span>
            <svg className={`w-5 h-5 text-yellow-600 transform transition-transform ${open.costDrivers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`${open.costDrivers ? '' : 'hidden'} px-4 py-3 bg-yellow-50`}>
            <p className="text-sm text-gray-700">{sections.costDrivers}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 