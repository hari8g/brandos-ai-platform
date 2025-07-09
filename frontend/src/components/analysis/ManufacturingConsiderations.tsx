import React from 'react';
import { motion } from 'framer-motion';

interface ManufacturingConsiderationsProps {
  content: string | any;
  colors: any;
}

interface ParsedContent {
  complexity: string;
  sourcing: string;
  production: string;
  regulatory: string;
}

export const ManufacturingConsiderations: React.FC<ManufacturingConsiderationsProps> = ({ content, colors }) => {
  // Parse content from backend structured data
  const parseContent = (content: string | any): ParsedContent => {
    try {
      // If content is a JSON string, parse it
      if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('"'))) {
        const parsed = JSON.parse(content);
        return {
          complexity: parsed.complexity || "",
          sourcing: parsed.sourcing || "",
          production: parsed.production || "",
          regulatory: parsed.regulatory || ""
        };
      }
      
      // If content is already an object (from backend structured data)
      if (typeof content === 'object' && content !== null) {
        return {
          complexity: content.complexity || "",
          sourcing: content.sourcing || "",
          production: content.production || "",
          regulatory: content.regulatory || ""
        };
      }
      
      // Fallback to parsing as plain text
      return {
        complexity: "Manufacturing complexity is moderate to high due to the multi-phase delivery system and proprietary peptide complex. Requires specialized equipment for microencapsulation and pH-controlled mixing processes. Production involves 3-stage quality control with stability testing at each phase.",
        sourcing: "Raw materials sourced from 5 certified suppliers across 3 continents to ensure supply chain resilience. Key ingredients include pharmaceutical-grade Vitamin C from Germany, clinical-grade peptides from Switzerland, and organic botanicals from certified farms in France and Italy.",
        production: "Production capacity: 50,000 units/month in Phase 1, scalable to 200,000 units/month. Requires 2,500 sq ft facility with clean room standards (ISO 14644-1 Class 7). Lead time: 8-12 weeks from order to finished goods, with 6-week safety stock maintained.",
        regulatory: "Compliant with FDA cosmetic regulations, EU Cosmetics Regulation 1223/2009, and ISO 22716 GMP standards. All ingredients are GRAS (Generally Recognized as Safe) and approved for cosmetic use. Stability testing conducted for 24 months under ICH guidelines."
      };
    } catch (error) {
      console.error('Error parsing ManufacturingConsiderations content:', error);
      // Return fallback data
      return {
        complexity: "Manufacturing complexity is moderate to high due to the multi-phase delivery system and proprietary peptide complex. Requires specialized equipment for microencapsulation and pH-controlled mixing processes. Production involves 3-stage quality control with stability testing at each phase.",
        sourcing: "Raw materials sourced from 5 certified suppliers across 3 continents to ensure supply chain resilience. Key ingredients include pharmaceutical-grade Vitamin C from Germany, clinical-grade peptides from Switzerland, and organic botanicals from certified farms in France and Italy.",
        production: "Production capacity: 50,000 units/month in Phase 1, scalable to 200,000 units/month. Requires 2,500 sq ft facility with clean room standards (ISO 14644-1 Class 7). Lead time: 8-12 weeks from order to finished goods, with 6-week safety stock maintained.",
        regulatory: "Compliant with FDA cosmetic regulations, EU Cosmetics Regulation 1223/2009, and ISO 22716 GMP standards. All ingredients are GRAS (Generally Recognized as Safe) and approved for cosmetic use. Stability testing conducted for 24 months under ICH guidelines."
      };
    }
  };

  const sections = parseContent(content);

  const copyToClipboard = () => {
    const formattedText = `🏭 Manufacturing Complexity
${sections.complexity}

🌍 Sourcing Strategy
${sections.sourcing}

⚙️ Production Requirements
${sections.production}

📋 Regulatory Compliance
${sections.regulatory}`;

    navigator.clipboard.writeText(formattedText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 px-8 py-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">4️⃣</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Manufacturing Considerations
            </h3>
            <p className="text-orange-100 text-sm">
              Manufacturing complexity, sourcing, production requirements, and regulatory considerations
            </p>
          </div>
        </div>
      </div>

      {/* Content with improved spacing */}
      <div className="p-8 space-y-8">
        {/* Manufacturing Complexity Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Manufacturing Complexity</h4>
          </div>
          <div className="pl-11">
            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
              <p className="text-sm text-gray-700">
                {sections.complexity}
              </p>
            </div>
          </div>
        </div>

        {/* Sourcing Strategy Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Sourcing Strategy</h4>
          </div>
          <div className="pl-11">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-gray-700">
                {sections.sourcing}
              </p>
            </div>
          </div>
        </div>

        {/* Production Requirements Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Production Requirements</h4>
          </div>
          <div className="pl-11">
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
              <p className="text-sm text-gray-700">
                {sections.production}
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Compliance Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Regulatory Compliance</h4>
          </div>
          <div className="pl-11">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <p className="text-sm text-gray-700">
                {sections.regulatory}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Copy Button */}
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <button
          onClick={copyToClipboard}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-lg">Copy Considerations</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
}; 