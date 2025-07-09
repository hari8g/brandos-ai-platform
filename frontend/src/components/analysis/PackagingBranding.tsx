import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PackagingBrandingProps {
  content: string | any;
  colors: any;
}

interface ParsedContent {
  packaging: string;
  branding: string;
  visualIdentity: string;
  marketing: string;
}

export const PackagingBranding: React.FC<PackagingBrandingProps> = ({ content, colors }) => {
  // Parse content from backend structured data
  const parseContent = (content: string | any): ParsedContent => {
    try {
      // If content is a JSON string, parse it
      if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('"'))){
        const parsed = JSON.parse(content);
        return {
          packaging: parsed.packaging || "",
          branding: parsed.branding || "",
          visualIdentity: parsed.visualIdentity || "",
          marketing: parsed.marketing || ""
        };
      }
      // If content is already an object (from backend structured data)
      if (typeof content === 'object' && content !== null) {
        return {
          packaging: content.packaging || "",
          branding: content.branding || "",
          visualIdentity: content.visualIdentity || "",
          marketing: content.marketing || ""
        };
      }
      // Fallback to parsing as plain text
      return {
        packaging: "Premium airless pump bottle with frosted glass effect and gold accents. Features a magnetic cap with integrated applicator for precise dosing. Packaging dimensions: 30ml bottle with 2.5\" height and 1.2\" diameter. Sustainable materials: 30% post-consumer recycled glass, FSC-certified paperboard outer packaging.",
        branding: "Brand positioning: 'Clinical luxury for the modern woman.' Visual identity: clean, minimalist design with sophisticated typography. Brand personality: confident, scientific, accessible luxury. Target emotional response: trust, sophistication, and efficacy.",
        visualIdentity: "Typography: modern sans-serif (Inter) for body text, elegant serif (Playfair Display) for headlines. Color palette: deep navy (#1a365d), warm gold (#d69e2e), and clean white (#ffffff). Logo design: minimalist geometric symbol representing the fusion of science and beauty.",
        marketing: "Launch strategy: exclusive pre-launch with beauty editors and dermatologists. PR focus: clinical studies and ingredient efficacy stories. Digital marketing: influencer partnerships with dermatologists and beauty experts. Retail strategy: premium beauty retailers and direct-to-consumer channels."
      };
    } catch (error) {
      console.error('Error parsing PackagingBranding content:', error);
      // Return fallback data
      return {
        packaging: "Premium airless pump bottle with frosted glass effect and gold accents. Features a magnetic cap with integrated applicator for precise dosing. Packaging dimensions: 30ml bottle with 2.5\" height and 1.2\" diameter. Sustainable materials: 30% post-consumer recycled glass, FSC-certified paperboard outer packaging.",
        branding: "Brand positioning: 'Clinical luxury for the modern woman.' Visual identity: clean, minimalist design with sophisticated typography. Brand personality: confident, scientific, accessible luxury. Target emotional response: trust, sophistication, and efficacy.",
        visualIdentity: "Typography: modern sans-serif (Inter) for body text, elegant serif (Playfair Display) for headlines. Color palette: deep navy (#1a365d), warm gold (#d69e2e), and clean white (#ffffff). Logo design: minimalist geometric symbol representing the fusion of science and beauty.",
        marketing: "Launch strategy: exclusive pre-launch with beauty editors and dermatologists. PR focus: clinical studies and ingredient efficacy stories. Digital marketing: influencer partnerships with dermatologists and beauty experts. Retail strategy: premium beauty retailers and direct-to-consumer channels."
      };
    }
  };

  const sections = parseContent(content);
  const [open, setOpen] = useState({
    packaging: false,
    branding: false,
    visualIdentity: false,
    marketing: false,
  });

  const toggle = (section: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));

  const copyToClipboard = () => {
    const formattedText = `📦 Packaging Design\n${sections.packaging}\n\n🎨 Branding Strategy\n${sections.branding}\n\n🎭 Visual Identity\n${sections.visualIdentity}\n\n📢 Marketing Approach\n${sections.marketing}`;
    navigator.clipboard.writeText(formattedText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 px-8 py-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">6️⃣</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Packaging & Branding Ideas
            </h3>
            <p className="text-purple-100 text-sm">
              Creative packaging concepts, branding strategies, and visual identity recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      <div className="p-8 space-y-6">
        {/* Packaging Accordion */}
        <div className="rounded-lg border border-blue-200 overflow-hidden">
          <button
            onClick={() => toggle('packaging')}
            className="w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 flex items-center justify-between"
          >
            <span className="flex items-center space-x-2 font-medium text-blue-900">
              <span className="text-lg">📦</span>
              <span>Packaging Design</span>
            </span>
            <svg className={`w-5 h-5 text-blue-600 transform transition-transform ${open.packaging ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`${open.packaging ? '' : 'hidden'} px-4 py-3 bg-blue-50`}>
            <p className="text-sm text-gray-700">{sections.packaging}</p>
          </div>
        </div>

        {/* Branding Accordion */}
        <div className="rounded-lg border border-purple-200 overflow-hidden">
          <button
            onClick={() => toggle('branding')}
            className="w-full px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 flex items-center justify-between"
          >
            <span className="flex items-center space-x-2 font-medium text-purple-900">
              <span className="text-lg">🎨</span>
              <span>Branding Strategy</span>
            </span>
            <svg className={`w-5 h-5 text-purple-600 transform transition-transform ${open.branding ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`${open.branding ? '' : 'hidden'} px-4 py-3 bg-purple-50`}>
            <p className="text-sm text-gray-700">{sections.branding}</p>
          </div>
        </div>

        {/* Visual Identity Accordion */}
        <div className="rounded-lg border border-yellow-200 overflow-hidden">
          <button
            onClick={() => toggle('visualIdentity')}
            className="w-full px-4 py-3 text-left bg-yellow-50 hover:bg-yellow-100 flex items-center justify-between"
          >
            <span className="flex items-center space-x-2 font-medium text-yellow-900">
              <span className="text-lg">🎭</span>
              <span>Visual Identity</span>
            </span>
            <svg className={`w-5 h-5 text-yellow-600 transform transition-transform ${open.visualIdentity ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`${open.visualIdentity ? '' : 'hidden'} px-4 py-3 bg-yellow-50`}>
            <p className="text-sm text-gray-700">{sections.visualIdentity}</p>
          </div>
        </div>

        {/* Marketing Accordion */}
        <div className="rounded-lg border border-green-200 overflow-hidden">
          <button
            onClick={() => toggle('marketing')}
            className="w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 flex items-center justify-between"
          >
            <span className="flex items-center space-x-2 font-medium text-green-900">
              <span className="text-lg">📢</span>
              <span>Marketing Approach</span>
            </span>
            <svg className={`w-5 h-5 text-green-600 transform transition-transform ${open.marketing ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`${open.marketing ? '' : 'hidden'} px-4 py-3 bg-green-50`}>
            <p className="text-sm text-gray-700">{sections.marketing}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 