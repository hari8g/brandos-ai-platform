// frontend/src/App.tsx
import React, { useState, useRef } from 'react';
import { PromptInput } from './components/FormulationEngine';
import { FormulationCard } from './components/FormulationEngine';
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
  const formulationRef = useRef<HTMLDivElement>(null);

  // 2️⃣ State‐change log
  console.log('🛠️ Parent formulations:', formulations, 'isGenerated:', isGenerated);

  // Show landing page if not subscribed
  if (!subscribed) {
    return <LandingPage onComplete={() => setSubscribed(true)} />;
  }

  const generatePDF = async () => {
    if (!formulationRef.current) return;

    try {
      document.documentElement.classList.add('pdf-export-root');
      const button = document.querySelector('[data-download-button]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span>Generating PDF…</span>';
      }

      // Build a hidden container for PDF
      const pdfContainer = document.createElement('div');
      Object.assign(pdfContainer.style, {
        width: '800px',
        padding: '20px',
        background: '#fff',
        color: '#000',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        position: 'absolute',
        left: '-9999px',
        top: '0'
      });

      const f = formulations[0];
      pdfContainer.innerHTML = `
        <div style="text-align:center; margin-bottom:30px;">
          <h1 style="font-size:24px;">${f.product_name}</h1>
          <p style="color:#666;">Formulation Report — ${new Date().toLocaleDateString()}</p>
        </div>
        <!-- reasoning -->
        <section style="margin-bottom:20px;">
          <h2>🧠 Scientific Reasoning & Process</h2>
          <pre style="background:#f8f9fa;padding:15px;border:1px solid #dee2e6;">${f.reasoning}</pre>
        </section>
        <!-- ingredients -->
        <section style="margin-bottom:20px;">
          <h2>🧴 Ingredients & Formulation</h2>
          ${f.ingredients.map((ing: any) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #dee2e6;">
              <span><strong>${ing.name}</strong> — ₹${ing.cost_per_100ml}/100ml</span>
              <span>${ing.percent}%</span>
            </div>
          `).join('')}
        </section>
        <!-- cost -->
        <section style="margin-bottom:20px;">
          <h2>💰 Cost Analysis</h2>
          <div style="background:#f8f9fa;padding:15px;border:1px solid #dee2e6;">
            <div style="display:flex;justify-content:space-between;">
              <strong>100 ml total:</strong><strong>₹${f.estimated_cost}</strong>
            </div>
          </div>
        </section>
        <!-- safety -->
        <section style="margin-bottom:20px;">
          <h2>🛡️ Safety Assessment</h2>
          <ul>${f.safety_notes.map((n: string) => `<li>${n}</li>`).join('')}</ul>
        </section>
      `;

      document.body.appendChild(pdfContainer);
      const canvas = await html2canvas(pdfContainer, { background: '#fff', width: 800 });
      document.body.removeChild(pdfContainer);
      document.documentElement.classList.remove('pdf-export-root');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      let posY = 10;
      let remH = imgH;

      pdf.addImage(imgData, 'PNG', 10, posY, imgW, imgH);
      while (remH > pageH - 20) {
        remH -= (pageH - 20);
        posY = 10 - remH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, posY, imgW, imgH);
      }

      pdf.save(`${f.product_name.replace(/\s+/g, '_')}_report.pdf`);

      if (button) {
        button.disabled = false;
        button.innerHTML = '<span>Download Formulation</span>';
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      document.documentElement.classList.remove('pdf-export-root');
      alert('Error generating PDF');
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
            }
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
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

        {/* Prompt Input */}
        <PromptInput
          onResult={(data) => {
            console.log('🔄 App.tsx received data:', data);
            setFormulations([data]);
            setIsGenerated(true);
          }}
          selectedCategory={selectedCategory}
        />

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
