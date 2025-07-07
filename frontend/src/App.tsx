// frontend/src/App.tsx
import React, { useState, useRef } from 'react';
import { PromptInput } from './components/FormulationEngine';
import { FormulationCard } from './components/FormulationEngine';
import { MultimodalFormulation } from './components/MultimodalFormulation';
import LandingPage from './components/LandingPage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 1️⃣ Module‐load log
console.log('🛠️ App.tsx module loaded');

function App() {
  const [formulations, setFormulations] = useState<any[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'multimodal'>('text');
  const formulationRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLDivElement>(null);

  // 2️⃣ State‐change log
  console.log('🛠️ Parent formulations:', formulations, 'isGenerated:', isGenerated);

  // Function to handle category selection with smooth scrolling
  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
    
    // Smooth scroll to prompt input area on mobile
    setTimeout(() => {
      if (promptInputRef.current) {
        promptInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100); // Small delay to ensure state update
  };

  // Show landing page if not subscribed
  if (!subscribed) {
    return <LandingPage onComplete={() => setSubscribed(true)} />;
  }

  const generatePDF = async () => {
    if (!formulationRef.current) {
      console.error('❌ FormulationRef not found');
      alert('Error: Formulation data not found');
      return;
    }

    if (!formulations[0]) {
      console.error('❌ No formulation data available');
      alert('Error: No formulation data available');
      return;
    }

    try {
      console.log('📄 Starting comprehensive PDF report generation...');
      
      // Find the download button more reliably - try multiple selectors
      let button = document.querySelector('[data-download-button]') as HTMLButtonElement;
      if (!button) {
        // Fallback: try to find button by text content
        const allButtons = document.querySelectorAll('button');
        button = Array.from(allButtons).find(btn => 
          btn.textContent?.includes('Download Formulation')
        ) as HTMLButtonElement;
      }
      
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span>Generating Report…</span>';
        console.log('✅ Download button found and updated');
      } else {
        console.warn('⚠️ Download button not found, continuing without UI update');
      }

      const f = formulations[0];
      console.log('📊 Formulation data for comprehensive report:', f);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Helper function to add text with word wrapping
      const addText = (text: string, y: number, fontSize: number = 12, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) pdf.setFont('helvetica', 'bold');
        else pdf.setFont('helvetica', 'normal');
        
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, y);
        return y + (lines.length * fontSize * 0.4);
      };

      // Helper function to add section header
      const addSectionHeader = (title: string, y: number) => {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(title, margin, y);
        return y + 8;
      };

      // Helper function to add subsection header
      const addSubsectionHeader = (title: string, y: number) => {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(title, margin, y);
        return y + 6;
      };

      // Helper function to add regular text
      const addRegularText = (text: string, y: number) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, y);
        return y + (lines.length * 10 * 0.4) + 2;
      };

      // Helper function to add list item
      const addListItem = (text: string, y: number) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        const lines = pdf.splitTextToSize(`• ${text}`, contentWidth);
        pdf.text(lines, margin, y);
        return y + (lines.length * 10 * 0.4) + 1;
      };

      // Helper function to add numbered item
      const addNumberedItem = (text: string, y: number, number: number) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        const lines = pdf.splitTextToSize(`${number}. ${text}`, contentWidth);
        pdf.text(lines, margin, y);
        return y + (lines.length * 10 * 0.4) + 1;
      };

      // Check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Page 1: Title and Executive Summary
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Product Formulation Report', margin, yPosition);
      yPosition += 20;

      // Add timestamp
      const now = new Date();
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, margin, yPosition);
      yPosition += 15;

      // Product Query
      if (f.query) {
        yPosition = addSectionHeader('Product Overview', yPosition);
        yPosition = addRegularText(`Product Query: ${f.query}`, yPosition);
        yPosition += 5;
      }

      // Executive Summary
      yPosition = addSectionHeader('Executive Summary', yPosition);
      const summaryText = `This comprehensive report provides detailed analysis of the product formulation, including manufacturing insights, market research, branding strategy, and scientific reasoning. The report covers all aspects from initial concept to market-ready formulation with supporting data and strategic recommendations.`;
      yPosition = addRegularText(summaryText, yPosition);
      yPosition += 10;

      // Formulation Details
      if (f.ingredients && f.ingredients.length > 0) {
        yPosition = addSectionHeader('Formulation Details', yPosition);
        
        // Ingredients with detailed information
        yPosition = addSubsectionHeader('Ingredient Composition & Analysis:', yPosition);
        f.ingredients.forEach((ingredient: any, index: number) => {
          const ingredientText = `${ingredient.name} - ${ingredient.percentage || ingredient.percent}%`;
          yPosition = addNumberedItem(ingredientText, yPosition, index + 1);
          
          // Add why chosen rationale
          if (ingredient.why_chosen) {
            const rationaleText = `   Rationale: ${ingredient.why_chosen}`;
            yPosition = addRegularText(rationaleText, yPosition);
          }
          
          // Add cost information
          if (ingredient.cost_per_100ml) {
            const costText = `   Cost: ₹${ingredient.cost_per_100ml}/100ml`;
            yPosition = addRegularText(costText, yPosition);
          }
          
          // Add supplier information
          if (ingredient.suppliers && ingredient.suppliers.length > 0) {
            yPosition = addRegularText(`   Suppliers:`, yPosition);
            ingredient.suppliers.forEach((supplier: any, supplierIndex: number) => {
              const supplierText = `     ${supplierIndex + 1}. ${supplier.name} - ${supplier.location}`;
              yPosition = addRegularText(supplierText, yPosition);
              if (supplier.contact) {
                yPosition = addRegularText(`       Contact: ${supplier.contact}`, yPosition);
              }
              if (supplier.price_per_unit) {
                yPosition = addRegularText(`       Price: ₹${supplier.price_per_unit}/unit`, yPosition);
              }
            });
          }
          yPosition += 2;
        });
        yPosition += 3;

        // Manufacturing Steps
        if (f.manufacturing_steps && f.manufacturing_steps.length > 0) {
          yPosition = addSubsectionHeader('Manufacturing Process:', yPosition);
          f.manufacturing_steps.forEach((step: any, index: number) => {
            yPosition = addNumberedItem(step, yPosition, index + 1);
          });
          yPosition += 3;
        }

        // Key Benefits
        if (f.key_benefits && f.key_benefits.length > 0) {
          yPosition = addSubsectionHeader('Product Benefits:', yPosition);
          f.key_benefits.forEach((benefit: any) => {
            yPosition = addListItem(benefit, yPosition);
          });
          yPosition += 3;
        }
      }

      // Manufacturing Insights
      if (f.manufacturing_insights) {
        checkNewPage(80);
        yPosition = addSectionHeader('Manufacturing & Cost Analysis', yPosition);
        
        const insights = f.manufacturing_insights;
        
        // CAPEX
        if (insights.capex) {
          yPosition = addSubsectionHeader('Capital Expenditure (CAPEX):', yPosition);
          Object.entries(insights.capex).forEach(([scale, amount]) => {
            yPosition = addRegularText(`${scale.charAt(0).toUpperCase() + scale.slice(1)} Scale: $${amount}`, yPosition);
          });
          yPosition += 3;
        }

        // OPEX
        if (insights.opex) {
          yPosition = addSubsectionHeader('Operating Expenditure (OPEX):', yPosition);
          Object.entries(insights.opex).forEach(([scale, amount]) => {
            yPosition = addRegularText(`${scale.charAt(0).toUpperCase() + scale.slice(1)} Scale: $${amount}`, yPosition);
          });
          yPosition += 3;
        }

        // Margins
        if (insights.margins) {
          yPosition = addSubsectionHeader('Profit Margins:', yPosition);
          Object.entries(insights.margins).forEach(([scale, margin]) => {
            yPosition = addRegularText(`${scale.charAt(0).toUpperCase() + scale.slice(1)} Scale: ${margin}%`, yPosition);
          });
          yPosition += 3;
        }

        // Pricing
        if (insights.pricing) {
          yPosition = addSubsectionHeader('Recommended Pricing Strategy:', yPosition);
          Object.entries(insights.pricing).forEach(([scale, price]) => {
            yPosition = addRegularText(`${scale.charAt(0).toUpperCase() + scale.slice(1)} Scale: $${price}`, yPosition);
          });
          yPosition += 3;
        }
      }

      // Market Research - Comprehensive Analysis
      if (f.market_research) {
        checkNewPage(150);
        yPosition = addSectionHeader('Market Research & Analysis', yPosition);
        
        const research = f.market_research;
        
        // TAM Analysis
        if (research.tam) {
          yPosition = addSubsectionHeader('Total Addressable Market (TAM):', yPosition);
          yPosition = addRegularText(`Market Size: ${research.tam.marketSize}`, yPosition);
          yPosition = addRegularText(`CAGR: ${research.tam.cagr}`, yPosition);
          if (research.tam.methodology) {
            yPosition = addRegularText(`Methodology: ${research.tam.methodology}`, yPosition);
          }
          if (research.tam.insights && research.tam.insights.length > 0) {
            yPosition = addRegularText('Key Insights:', yPosition);
            research.tam.insights.forEach((insight: any) => {
              yPosition = addListItem(insight, yPosition);
            });
          }
          if (research.tam.competitors && research.tam.competitors.length > 0) {
            yPosition = addRegularText('Key Competitors:', yPosition);
            research.tam.competitors.forEach((competitor: any) => {
              yPosition = addListItem(competitor, yPosition);
            });
          }
          yPosition += 3;
        }

        // SAM Analysis
        if (research.sam) {
          yPosition = addSubsectionHeader('Serviceable Addressable Market (SAM):', yPosition);
          yPosition = addRegularText(`Market Size: ${research.sam.marketSize}`, yPosition);
          if (research.sam.methodology) {
            yPosition = addRegularText(`Methodology: ${research.sam.methodology}`, yPosition);
          }
          if (research.sam.segments && research.sam.segments.length > 0) {
            yPosition = addRegularText('Market Segments:', yPosition);
            research.sam.segments.forEach((segment: any) => {
              yPosition = addListItem(segment, yPosition);
            });
          }
          if (research.sam.insights && research.sam.insights.length > 0) {
            yPosition = addRegularText('Key Insights:', yPosition);
            research.sam.insights.forEach((insight: any) => {
              yPosition = addListItem(insight, yPosition);
            });
          }
          if (research.sam.distribution && research.sam.distribution.length > 0) {
            yPosition = addRegularText('Distribution Channels:', yPosition);
            research.sam.distribution.forEach((channel: any) => {
              yPosition = addListItem(channel, yPosition);
            });
          }
          yPosition += 3;
        }

        // TM Analysis
        if (research.tm) {
          yPosition = addSubsectionHeader('Target Market (TM):', yPosition);
          yPosition = addRegularText(`Market Size: ${research.tm.marketSize}`, yPosition);
          if (research.tm.targetUsers) {
            yPosition = addRegularText(`Target Users: ${research.tm.targetUsers}`, yPosition);
          }
          if (research.tm.revenue) {
            yPosition = addRegularText(`Revenue Potential: ${research.tm.revenue}`, yPosition);
          }
          if (research.tm.methodology) {
            yPosition = addRegularText(`Methodology: ${research.tm.methodology}`, yPosition);
          }
          if (research.tm.insights && research.tm.insights.length > 0) {
            yPosition = addRegularText('Key Insights:', yPosition);
            research.tm.insights.forEach((insight: any) => {
              yPosition = addListItem(insight, yPosition);
            });
          }
          if (research.tm.adoptionDrivers && research.tm.adoptionDrivers.length > 0) {
            yPosition = addRegularText('Adoption Drivers:', yPosition);
            research.tm.adoptionDrivers.forEach((driver: any) => {
              yPosition = addListItem(driver, yPosition);
            });
          }
          yPosition += 3;
        }

        // Current Market Size (if available)
        if (research.current_market_size) {
          yPosition = addSubsectionHeader('Current Market Size:', yPosition);
          yPosition = addRegularText(`$${research.current_market_size}`, yPosition);
          yPosition += 3;
        }

        // Detailed Calculations
        if (research.detailed_calculations) {
          yPosition = addSubsectionHeader('Detailed Market Calculations:', yPosition);
          Object.entries(research.detailed_calculations).forEach(([metric, details]: [string, any]) => {
            yPosition = addRegularText(`${metric}:`, yPosition);
            if (details.formula) yPosition = addRegularText(`  Formula: ${details.formula}`, yPosition);
            if (details.variables) {
              yPosition = addRegularText(`  Variables:`, yPosition);
              Object.entries(details.variables).forEach(([varName, value]: [string, any]) => {
                yPosition = addRegularText(`    ${varName}: ${value}`, yPosition);
              });
            }
            if (details.calculation_steps && details.calculation_steps.length > 0) {
              yPosition = addRegularText(`  Calculation Steps:`, yPosition);
              details.calculation_steps.forEach((step: any, index: number) => {
                yPosition = addNumberedItem(step, yPosition, index + 1);
              });
            }
            if (details.assumptions && details.assumptions.length > 0) {
              yPosition = addRegularText(`  Assumptions:`, yPosition);
              details.assumptions.forEach((assumption: any) => {
                yPosition = addListItem(assumption, yPosition);
              });
            }
            if (details.data_sources && details.data_sources.length > 0) {
              yPosition = addRegularText(`  Data Sources:`, yPosition);
              details.data_sources.forEach((source: any) => {
                yPosition = addListItem(source, yPosition);
              });
            }
            if (details.confidence_level) {
              yPosition = addRegularText(`  Confidence Level: ${details.confidence_level}`, yPosition);
            }
            yPosition += 2;
          });
          yPosition += 3;
        }
      }

      // Packaging & Marketing Inspiration
      if (f.packaging_marketing_inspiration || f.market_trends || f.competitive_landscape) {
        checkNewPage(80);
        yPosition = addSectionHeader('Packaging & Marketing Strategy', yPosition);
        
        // Packaging Inspiration
        if (f.packaging_marketing_inspiration) {
          yPosition = addSubsectionHeader('Packaging Design & Inspiration:', yPosition);
          yPosition = addRegularText(f.packaging_marketing_inspiration, yPosition);
          yPosition += 3;
        }

        // Market Trends
        if (f.market_trends && f.market_trends.length > 0) {
          yPosition = addSubsectionHeader('Current Market Trends:', yPosition);
          f.market_trends.forEach((trend: any) => {
            yPosition = addListItem(trend, yPosition);
          });
          yPosition += 3;
        }

        // Competitive Landscape
        if (f.competitive_landscape) {
          yPosition = addSubsectionHeader('Competitive Landscape Analysis:', yPosition);
          Object.entries(f.competitive_landscape).forEach(([key, value]) => {
            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            yPosition = addRegularText(`${formattedKey}: ${value}`, yPosition);
          });
          yPosition += 3;
        }
      }

      // Branding Strategy - Comprehensive Analysis
      if (f.branding_strategy) {
        checkNewPage(120);
        yPosition = addSectionHeader('Branding & Marketing Strategy', yPosition);
        
        const branding = f.branding_strategy;
        
        // Brand Name Suggestions with details
        if (branding.brand_name_suggestions && branding.brand_name_suggestions.length > 0) {
          yPosition = addSubsectionHeader('Brand Name Recommendations:', yPosition);
          branding.brand_name_suggestions.forEach((suggestion: any, index: number) => {
            yPosition = addNumberedItem(`${suggestion.name}`, yPosition, index + 1);
            if (suggestion.meaning) {
              yPosition = addRegularText(`   Meaning: ${suggestion.meaning}`, yPosition);
            }
            if (suggestion.category) {
              yPosition = addRegularText(`   Category: ${suggestion.category}`, yPosition);
            }
            if (suggestion.reasoning) {
              yPosition = addRegularText(`   Reasoning: ${suggestion.reasoning}`, yPosition);
            }
            if (suggestion.availability_check) {
              yPosition = addRegularText(`   Availability: ${suggestion.availability_check}`, yPosition);
            }
            yPosition += 1;
          });
          yPosition += 3;
        }

        // Social Media Channels
        if (branding.social_media_channels && branding.social_media_channels.length > 0) {
          yPosition = addSubsectionHeader('Social Media Strategy:', yPosition);
          branding.social_media_channels.forEach((channel: any, index: number) => {
            yPosition = addNumberedItem(`${channel.platform}`, yPosition, index + 1);
            if (channel.content_strategy) {
              yPosition = addRegularText(`   Content Strategy: ${channel.content_strategy}`, yPosition);
            }
            if (channel.target_audience) {
              yPosition = addRegularText(`   Target Audience: ${channel.target_audience}`, yPosition);
            }
            if (channel.post_frequency) {
              yPosition = addRegularText(`   Post Frequency: ${channel.post_frequency}`, yPosition);
            }
            if (channel.content_ideas && channel.content_ideas.length > 0) {
              yPosition = addRegularText(`   Content Ideas:`, yPosition);
              channel.content_ideas.forEach((idea: any) => {
                yPosition = addListItem(idea, yPosition);
              });
            }
            if (channel.hashtag_strategy && channel.hashtag_strategy.length > 0) {
              yPosition = addRegularText(`   Hashtag Strategy:`, yPosition);
              channel.hashtag_strategy.forEach((hashtag: any) => {
                yPosition = addListItem(hashtag, yPosition);
              });
            }
            if (channel.engagement_tips && channel.engagement_tips.length > 0) {
              yPosition = addRegularText(`   Engagement Tips:`, yPosition);
              channel.engagement_tips.forEach((tip: any) => {
                yPosition = addListItem(tip, yPosition);
              });
            }
            yPosition += 2;
          });
          yPosition += 3;
        }

        // Overall Branding Theme
        if (branding.overall_branding_theme) {
          yPosition = addSubsectionHeader('Overall Branding Theme:', yPosition);
          yPosition = addRegularText(branding.overall_branding_theme, yPosition);
          yPosition += 3;
        }

        // Brand Personality
        if (branding.brand_personality) {
          yPosition = addSubsectionHeader('Brand Personality:', yPosition);
          yPosition = addRegularText(branding.brand_personality, yPosition);
          yPosition += 3;
        }

        // Visual Identity Guidelines
        if (branding.visual_identity_guidelines && branding.visual_identity_guidelines.length > 0) {
          yPosition = addSubsectionHeader('Visual Identity Guidelines:', yPosition);
          branding.visual_identity_guidelines.forEach((guideline: any) => {
            yPosition = addListItem(guideline, yPosition);
          });
          yPosition += 3;
        }

        // Marketing Messaging
        if (branding.marketing_messaging && branding.marketing_messaging.length > 0) {
          yPosition = addSubsectionHeader('Marketing Messaging:', yPosition);
          branding.marketing_messaging.forEach((message: any) => {
            yPosition = addListItem(message, yPosition);
          });
          yPosition += 3;
        }
      }

      // Scientific Reasoning - Comprehensive Analysis
      if (f.scientific_reasoning) {
        checkNewPage(120);
        yPosition = addSectionHeader('Scientific Foundation & Evidence', yPosition);
        
        const reasoning = f.scientific_reasoning;
        
        // Key Components
        if (reasoning.keyComponents && reasoning.keyComponents.length > 0) {
          yPosition = addSubsectionHeader('Key Components Analysis:', yPosition);
          reasoning.keyComponents.forEach((component: any, index: number) => {
            yPosition = addNumberedItem(`${component.name}`, yPosition, index + 1);
            if (component.why) {
              yPosition = addRegularText(`   Why: ${component.why}`, yPosition);
            }
          });
          yPosition += 3;
        }

        // Implied Desire
        if (reasoning.impliedDesire) {
          yPosition = addSubsectionHeader('Implied Consumer Desire:', yPosition);
          yPosition = addRegularText(reasoning.impliedDesire, yPosition);
          yPosition += 3;
        }

        // Psychological Drivers
        if (reasoning.psychologicalDrivers && reasoning.psychologicalDrivers.length > 0) {
          yPosition = addSubsectionHeader('Psychological Drivers:', yPosition);
          reasoning.psychologicalDrivers.forEach((driver: any) => {
            yPosition = addListItem(driver, yPosition);
          });
          yPosition += 3;
        }

        // Value Proposition
        if (reasoning.valueProposition && reasoning.valueProposition.length > 0) {
          yPosition = addSubsectionHeader('Value Proposition:', yPosition);
          reasoning.valueProposition.forEach((value: any) => {
            yPosition = addListItem(value, yPosition);
          });
          yPosition += 3;
        }

        // Target Audience
        if (reasoning.targetAudience) {
          yPosition = addSubsectionHeader('Target Audience Analysis:', yPosition);
          yPosition = addRegularText(reasoning.targetAudience, yPosition);
          yPosition += 3;
        }

        // India Trends
        if (reasoning.indiaTrends && reasoning.indiaTrends.length > 0) {
          yPosition = addSubsectionHeader('India-Specific Trends:', yPosition);
          reasoning.indiaTrends.forEach((trend: any) => {
            yPosition = addListItem(trend, yPosition);
          });
          yPosition += 3;
        }

        // Regulatory Standards
        if (reasoning.regulatoryStandards && reasoning.regulatoryStandards.length > 0) {
          yPosition = addSubsectionHeader('Regulatory Standards & Compliance:', yPosition);
          reasoning.regulatoryStandards.forEach((standard: any) => {
            yPosition = addListItem(standard, yPosition);
          });
          yPosition += 3;
        }

        // Demographic Breakdown
        if (reasoning.demographicBreakdown) {
          yPosition = addSubsectionHeader('Demographic Analysis:', yPosition);
          const demo = reasoning.demographicBreakdown;
          if (demo.age_range) yPosition = addRegularText(`Age Range: ${demo.age_range}`, yPosition);
          if (demo.income_level) yPosition = addRegularText(`Income Level: ${demo.income_level}`, yPosition);
          if (demo.lifestyle) yPosition = addRegularText(`Lifestyle: ${demo.lifestyle}`, yPosition);
          if (demo.purchase_behavior) yPosition = addRegularText(`Purchase Behavior: ${demo.purchase_behavior}`, yPosition);
          yPosition += 3;
        }

        // Psychographic Profile
        if (reasoning.psychographicProfile) {
          yPosition = addSubsectionHeader('Psychographic Profile:', yPosition);
          const psycho = reasoning.psychographicProfile;
          if (psycho.values && psycho.values.length > 0) {
            yPosition = addRegularText('Values:', yPosition);
            psycho.values.forEach((value: any) => {
              yPosition = addListItem(value, yPosition);
            });
          }
          if (psycho.preferences && psycho.preferences.length > 0) {
            yPosition = addRegularText('Preferences:', yPosition);
            psycho.preferences.forEach((pref: any) => {
              yPosition = addListItem(pref, yPosition);
            });
          }
          if (psycho.motivations && psycho.motivations.length > 0) {
            yPosition = addRegularText('Motivations:', yPosition);
            psycho.motivations.forEach((motivation: any) => {
              yPosition = addListItem(motivation, yPosition);
            });
          }
          yPosition += 3;
        }

        // Market Opportunity Summary
        if (reasoning.marketOpportunitySummary) {
          yPosition = addSubsectionHeader('Market Opportunity Summary:', yPosition);
          yPosition = addRegularText(reasoning.marketOpportunitySummary, yPosition);
          yPosition += 3;
        }
      }

      // Safety Assessment
      if (f.safety_notes && f.safety_notes.length > 0) {
        checkNewPage(60);
        yPosition = addSectionHeader('Safety Assessment & Compliance', yPosition);
        
        yPosition = addSubsectionHeader('Safety Notes & Considerations:', yPosition);
        f.safety_notes.forEach((note: any) => {
          yPosition = addListItem(note, yPosition);
        });
        yPosition += 3;
      }

      // Cost Analysis
      if (f.estimated_cost) {
        checkNewPage(40);
        yPosition = addSectionHeader('Cost Analysis', yPosition);
        
        yPosition = addSubsectionHeader('Estimated Production Cost:', yPosition);
        yPosition = addRegularText(`Total Cost per 100ml: ₹${f.estimated_cost}`, yPosition);
        yPosition += 3;
      }

      // Conclusion
      checkNewPage(40);
      yPosition = addSectionHeader('Conclusion & Recommendations', yPosition);
      const conclusionText = `This comprehensive analysis provides a complete roadmap for product development, from formulation to market entry. The combination of scientific validation, market analysis, and strategic positioning creates a strong foundation for successful product commercialization.`;
      yPosition = addRegularText(conclusionText, yPosition);

      // Save the PDF
      const filename = `comprehensive_formulation_report_${Date.now()}.pdf`;
      pdf.save(filename);
      
      console.log('✅ Comprehensive PDF report generated successfully:', filename);
      alert(`Comprehensive report downloaded as ${filename}`);

      if (button) {
        button.disabled = false;
        button.innerHTML = '<span>Download Formulation</span>';
      }
    } catch (err) {
      console.error('❌ PDF generation failed:', err);
      
      // More specific error messages
      if (err instanceof Error) {
        if (err.message.includes('jsPDF')) {
          alert('Error: Could not create PDF file. Please try again.');
        } else {
          alert(`Error generating PDF: ${err.message}`);
        }
      } else {
        alert('Error generating PDF. Please try again.');
      }
      
      // Reset button state on error
      const button = document.querySelector('[data-download-button]') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.innerHTML = '<span>Download Formulation</span>';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-purple-700">Build Faster – Launch Smarter</h1>
          <p className="text-gray-600 mt-2">Idea to formulation, creation to marketing in minutes.</p>
        </header>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          {[
            { 
              label: "Cosmetics", 
              value: "cosmetics", 
              icon: "💄",
              gradient: "from-pink-400 via-purple-400 to-indigo-400",
              hoverGradient: "from-pink-500 via-purple-500 to-indigo-500",
              description: "Skincare & Beauty"
            },
            { 
              label: "Pet Food", 
              value: "pet food", 
              icon: "🐾",
              gradient: "from-orange-400 via-amber-400 to-yellow-400",
              hoverGradient: "from-orange-500 via-amber-500 to-yellow-500",
              description: "Pet Nutrition"
            },
            { 
              label: "Wellness", 
              value: "wellness", 
              icon: "🌱",
              gradient: "from-green-400 via-emerald-400 to-teal-400",
              hoverGradient: "from-green-500 via-emerald-500 to-teal-500",
              description: "Health & Supplements"
            },
            { 
              label: "Beverages", 
              value: "beverages", 
              icon: "🥤",
              gradient: "from-blue-400 via-cyan-400 to-teal-400",
              hoverGradient: "from-blue-500 via-cyan-500 to-teal-500",
              description: "Drinks & Beverages"
            },
            { 
              label: "Textiles", 
              value: "textiles", 
              icon: "🧵",
              gradient: "from-red-400 via-pink-400 to-purple-400",
              hoverGradient: "from-red-500 via-pink-500 to-purple-500",
              description: "Fabric & Materials"
            }
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategorySelection(cat.value)}
              className={`group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl font-semibold border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl h-48 w-full
                ${selectedCategory === cat.value
                  ? `bg-gradient-to-r ${cat.gradient} text-white border-transparent shadow-2xl shadow-purple-500/25`
                  : "bg-white/80 backdrop-blur-sm text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-white"
                }`}
              aria-pressed={selectedCategory === cat.value}
              aria-label={`Select ${cat.label} category`}
            >
              {/* Glow effect for selected */}
              {selectedCategory === cat.value && (
                <div className={`absolute -inset-2 bg-gradient-to-r ${cat.gradient} rounded-2xl blur opacity-75 animate-pulse`}></div>
              )}
              
              <div className="relative z-10 flex flex-col items-center">
                <span className={`text-5xl mb-3 transition-transform duration-300 group-hover:scale-110 ${selectedCategory === cat.value ? 'animate-bounce' : ''}`}>
                  {cat.icon}
                </span>
                <span className="text-xl font-bold text-center">{cat.label}</span>
                <span className={`text-sm mt-2 text-center ${selectedCategory === cat.value ? 'text-white/80' : 'text-gray-500'}`}>
                  {cat.description}
                </span>
              </div>
              
              {/* Selection indicator */}
              {selectedCategory === cat.value && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Input Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <div className="flex">
              <button
                onClick={() => setInputMode('text')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  inputMode === 'text'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Text-Only
              </button>
              <button
                onClick={() => setInputMode('multimodal')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  inputMode === 'multimodal'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Multi-Modal
              </button>
            </div>
          </div>
        </div>

        {/* Prompt Input */}
        <div ref={promptInputRef}>
          {inputMode === 'text' ? (
            <PromptInput
              onResult={(data) => {
                console.log('🔄 App.tsx received data:', data);
                setFormulations([data]);
                setIsGenerated(true);
              }}
              selectedCategory={selectedCategory}
            />
          ) : (
            <MultimodalFormulation
              onResult={(data) => {
                console.log('🔄 App.tsx received multimodal data:', data);
                setFormulations([data]);
                setIsGenerated(true);
              }}
              selectedCategory={selectedCategory}
            />
          )}
        </div>

        {/* Reset */}
        {isGenerated && (
          <button
            onClick={() => { setFormulations([]); setIsGenerated(false); }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
          >
            Generate New
          </button>
        )}

        {/* Result Card */}
        <div ref={formulationRef}>
          {formulations[0] ? (
            <FormulationCard
              data={formulations[0]}
              isGenerated={isGenerated}
              onDownload={generatePDF}
              selectedCategory={selectedCategory}
            />
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No formulation yet. Enter your spec and click "Generate Formulation."</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
