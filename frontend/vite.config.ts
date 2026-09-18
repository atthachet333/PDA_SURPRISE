import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const FRONTEND_PORT = 1368;
const BACKEND_PORT = 1369;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || `http://localhost:${BACKEND_PORT}`;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: FRONTEND_PORT,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    },
    preview: {
      port: FRONTEND_PORT,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            three: ['three', '@react-three/fiber', '@react-three/drei'],
            motion: ['gsap', 'framer-motion', 'lenis']
          }
        }
      }
    }
  };
});
