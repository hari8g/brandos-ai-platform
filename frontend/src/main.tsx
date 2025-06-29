import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('🛠️ main.tsx loaded');

const rootElement = document.getElementById('root');
console.log('🔍 rootElement:', rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  console.log('🔍 root created');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('🔍 App rendered');
} else {
  console.error('❌ Root element not found!');
}
