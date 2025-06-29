// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),      // your Tailwind plugin
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 3000,         // optional: dev server port
    proxy: {
      // forward all /api requests to your FastAPI backend
      '/api': 'http://127.0.0.1:8000',
    },
  },

  build: {
    outDir: '../backend/static', // <-- drop production files here
    emptyOutDir: true,           // clears backend/static on each build
  },
})
