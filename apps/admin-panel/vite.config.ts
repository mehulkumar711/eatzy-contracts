import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Run on port 3005 to avoid conflicts
    port: 3005,
    // Optional: Proxy API requests to our backend (for later)
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3000', // Points to order-service
    //     changeOrigin: true,
    //   }
    // }
  }
})