// apps/admin-panel/vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables
  process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};
  
  return {
    plugins: [react()],
    server: {
      port: 3005, // Designated port for the Admin Panel
      // Proxy configuration to route API calls to respective microservices
      proxy: {
        // Routes /api/auth/* to auth-service (port 3001)
        '/api/auth': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/auth/, '/api/v1/auth'),
        },
        // Routes /api/orders/* to order-service (port 3000)
        '/api/orders': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/orders/, '/api/v1/orders'),
        },
      },
    },
    // Resolve alias for '@/...' imports (modular imports)
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  }
});