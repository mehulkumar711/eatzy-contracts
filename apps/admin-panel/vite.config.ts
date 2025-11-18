import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on mode in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3005,
      proxy: {
        '/api/auth': {
          // Use env var if present, otherwise default to localhost
          target: env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/auth/, '/api/v1/auth'),
        },
        '/api/orders': {
          // Use env var if present, otherwise default to localhost
          target: env.VITE_ORDER_SERVICE_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/orders/, '/api/v1/orders'),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})