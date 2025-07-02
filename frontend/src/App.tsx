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
        <div className="flex justify-center gap-4 mb-6">
          {[
            { label: "Cosmetics", value: "cosmetics", icon: "💄" },
            { label: "Pet Food", value: "pet food", icon: "🐾" },
            { label: "Wellness", value: "wellness", icon: "🌱" }
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold border transition
                ${selectedCategory === cat.value
                  ? "bg-purple-600 text-white border-purple-700 shadow"
                  : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                }`}
              aria-pressed={selectedCategory === cat.value}
              aria-label={`Select ${cat.label} category`}
            >
              <span className="text-xl">{cat.icon}</span>
              {cat.label}
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
