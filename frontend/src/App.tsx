// App.tsx - Very Simple Test
import React, { useState } from 'react';
import FormulationCard from './components/FormulationCard';
import PromptInput from './components/PromptInput';

function App() {
  const [formulation, setFormulation] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div>
      {/* Main app UI */}
      <PromptInput onResult={setFormulation} selectedCategory={selectedCategory} />
      {formulation && <FormulationCard data={formulation} />}
    </div>
  );
}

export default App;
