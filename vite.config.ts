import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    allowedHosts: [
      'frontend', 
      'localhost', 
      '127.0.0.1',
      'vou-falar-com-meu-socio.lcdev.click'
    ] 
  }
})
