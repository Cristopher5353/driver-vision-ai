import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 Agregamos la integración de Tailwind
  ],
  define: {
    global: 'window', // Para compatibilidad con SockJS
  },
})