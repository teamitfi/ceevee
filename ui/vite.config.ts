import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    proxy: {
      // When your code calls fetch('/api/...')
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy) => {
          // Log each proxied request's method and URL
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(`[vite proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
          });
          // Log any errors
          proxy.on('error', (err, req) => {
            console.error(`[vite proxy] Error for ${req.url}:`, err);
          });
        },
      },
    },
  },
});
