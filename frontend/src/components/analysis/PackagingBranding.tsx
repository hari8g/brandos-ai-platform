import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getCategoryColors } from '@/lib/colorUtils';

interface PackagingBrandingProps {
  content: string | any;
  colors: any;
  selectedCategory?: string | null;
}

interface ParsedContent {
  packaging: string;
  branding: string;
  visualIdentity: string;
  marketing: string;
}

export const PackagingBranding: React.FC<PackagingBrandingProps> = ({ content, colors, selectedCategory }) => {
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
  const categoryColors = getCategoryColors(selectedCategory || null);
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
    <div className="space-y-4">
      {/* Modern Gradient Header - aligned with MarketResearch */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-t-3xl px-8 py-6 text-white shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">6️⃣</span>
          </div>
          <div>
            <h3 className="text-xl font-bold">Packaging & Branding Ideas</h3>
            <p className="text-purple-100 text-sm">Creative packaging concepts, branding strategies, and visual identity recommendations</p>
          </div>
        </div>
      </div>

      {/* Main content - white card container */}
      <div className="bg-white rounded-b-3xl shadow-sm border border-gray-200">
        <div className="p-4">
          {/* Packaging Accordion */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${categoryColors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-blue-600">📦</span>
              </div>
              <h4 className={`text-lg font-semibold ${categoryColors.text}`}>Packaging Design</h4>
            </div>
            <div className={`${categoryColors.lightBg} border ${categoryColors.border} rounded-xl p-4 md:p-6`}>
              <div className={`${categoryColors.text} text-sm leading-relaxed`}>
                {sections.packaging}
              </div>
            </div>
          </div>

          {/* Branding Accordion */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${categoryColors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-purple-600">🎨</span>
              </div>
              <h4 className={`text-lg font-semibold ${categoryColors.text}`}>Branding Strategy</h4>
            </div>
            <div className={`${categoryColors.lightBg} border ${categoryColors.border} rounded-xl p-4 md:p-6`}>
              <div className={`${categoryColors.text} text-sm leading-relaxed`}>
                {sections.branding}
              </div>
            </div>
          </div>

          {/* Visual Identity Accordion */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${categoryColors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-yellow-600">🎭</span>
              </div>
              <h4 className={`text-lg font-semibold ${categoryColors.text}`}>Visual Identity</h4>
            </div>
            <div className={`${categoryColors.lightBg} border ${categoryColors.border} rounded-xl p-4 md:p-6`}>
              <div className={`${categoryColors.text} text-sm leading-relaxed`}>
                {sections.visualIdentity}
              </div>
            </div>
          </div>

          {/* Marketing Accordion */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-6 h-6 rounded-lg ${categoryColors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-green-600">📢</span>
              </div>
              <h4 className={`text-lg font-semibold ${categoryColors.text}`}>Marketing Approach</h4>
            </div>
            <div className={`${categoryColors.lightBg} border ${categoryColors.border} rounded-xl p-4 md:p-6`}>
              <div className={`${categoryColors.text} text-sm leading-relaxed`}>
                {sections.marketing}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className={`${categoryColors.lightBg} border ${categoryColors.border} rounded-xl p-4 md:p-6`}>
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-5 h-5 rounded-lg ${categoryColors.bg} flex items-center justify-center text-xs font-bold`}>
                <span className="text-purple-600">S</span>
              </div>
              <h5 className={`font-semibold ${categoryColors.text} text-sm`}>Branding Summary</h5>
            </div>
            <p className={`${categoryColors.text} text-xs leading-relaxed opacity-80`}>
              These packaging and branding recommendations are tailored for the {selectedCategory?.toLowerCase() || 'product'} category, 
              focusing on premium positioning, sustainable materials, and modern design principles that align with current market trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 