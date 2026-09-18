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
          /**
           * Vendor splitting, as a FUNCTION rather than the object form.
           *
           * The object form (`{ three: ['three', ...] }`) let Rollup place
           * Vite's own `__vitePreload` helper inside the `three` chunk. The
           * entry statically imports that helper, so the entry statically
           * imported the whole 822KB three bundle — and index.html
           * modulepreloaded it — on every corporate page view, even though only
           * /us uses WebGL. The function form matches on real node_modules
           * paths only, so framework helpers stay in the entry and `three`
           * loads solely with the lazy A&I route that needs it.
           */
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            // Normalise Windows separators before matching.
            const path = id.split('\\').join('/');
            if (/\/node_modules\/(three|@react-three)\//.test(path)) return 'three';
            if (
              /\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(
                path
              )
            ) {
              return 'react';
            }
            if (/\/node_modules\/(gsap|framer-motion|motion-dom|motion-utils|lenis)\//.test(path)) {
              return 'motion';
            }
            return undefined;
          }
        }
      }
    }
  };
});
