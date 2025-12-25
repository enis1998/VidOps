import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Runs UI on 8090 and proxies /api/* to the gateway (8080)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8090,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
