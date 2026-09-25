import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { joinUrl, sanitizeOrigin } from './src/lib/url';

/**
 * EP44 — the static share image.
 *
 * index.html is what a crawler or chat preview that runs no JavaScript sees.
 * og:image must be absolute, so the tags are written into the built HTML only
 * when VITE_PUBLIC_ORIGIN is a safe public https origin (lib/url.ts). Without
 * one nothing is written: a relative or invented image URL is a broken
 * preview. Keep the path and size in step with SOCIAL_IMAGE in src/lib/seo.ts.
 */
function shareImage(rawOrigin: string): Plugin {
  const origin = sanitizeOrigin(rawOrigin);
  return {
    name: 'pdabliss-share-image',
    transformIndexHtml(html) {
      if (!origin) return html;
      const image = joinUrl(origin, '/brand/og-default.png');
      const tags = [
        `<meta property="og:image" content="${image}" />`,
        '<meta property="og:image:width" content="1200" />',
        '<meta property="og:image:height" content="630" />',
        '<meta property="og:image:type" content="image/png" />',
        '<meta property="og:image:alt" content="PDA BLISS SOLUTION — พัฒนาซอฟต์แวร์ ระบบธุรกิจ และเว็บไซต์" />',
        `<meta name="twitter:image" content="${image}" />`
      ].join('\n    ');
      return html
        .replace('<meta name="twitter:card" content="summary" />', '<meta name="twitter:card" content="summary_large_image" />')
        .replace('</head>', `    ${tags}\n  </head>`);
    }
  };
}

/**
 * Owner logo files, when present in public/brand. Logo.tsx only requests a
 * file the build has seen, so a missing one costs no 404 (EP46).
 */
function brandAsset(file: string): string {
  return existsSync(resolve(__dirname, 'public', 'brand', file)) ? `/brand/${file}` : '';
}

const FRONTEND_PORT = 1368;
const BACKEND_PORT = 1369;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || `http://localhost:${BACKEND_PORT}`;

  return {
    plugins: [react(), shareImage(env.VITE_PUBLIC_ORIGIN ?? '')],
    define: {
      'import.meta.env.VITE_BRAND_LOGO_FULL': JSON.stringify(brandAsset('pda-bliss-logo.svg')),
      'import.meta.env.VITE_BRAND_LOGO_MARK': JSON.stringify(brandAsset('pda-bliss-mark.svg'))
    },
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
