/**
 * Writes dist/sitemap.xml and dist/robots.txt after a build (EP44).
 *
 * Both come from src/lib/sitemap.ts, which reads the one public route
 * inventory in src/lib/seo.ts — no route is listed here, so the sitemap cannot
 * drift from the app. Run with tsx (it imports TypeScript) by `npm run build`.
 *
 * Without a safe public https origin in VITE_PUBLIC_ORIGIN no sitemap is
 * written — its URLs must be absolute, and a hostname is never invented.
 */
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildRobots, buildSitemap, sitemapUrls } from '../src/lib/sitemap.ts';
import { sanitizeOrigin } from '../src/lib/url.ts';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!existsSync(dist)) {
  console.error('[sitemap] no dist/ directory — run the build first');
  process.exit(0);
}

const raw = (process.env.VITE_PUBLIC_ORIGIN ?? '').trim();
const origin = sanitizeOrigin(raw);

if (raw && !origin) {
  console.error(`[sitemap] VITE_PUBLIC_ORIGIN "${raw}" is not a public https origin (no path, credentials, localhost or private host).`);
  process.exit(1);
}

writeFileSync(resolve(dist, 'robots.txt'), buildRobots(origin), 'utf8');

const sitemap = buildSitemap(origin);
if (!sitemap) {
  rmSync(resolve(dist, 'sitemap.xml'), { force: true });
  console.warn(
    '[sitemap] VITE_PUBLIC_ORIGIN is not set, so no sitemap.xml was generated.\n' +
      '          This is expected until the production hostname is chosen.\n' +
      '          Set it in frontend/.env.production and rebuild. See docs/SEO.md.'
  );
  process.exit(0);
}

writeFileSync(resolve(dist, 'sitemap.xml'), sitemap, 'utf8');
console.log(`[sitemap] wrote ${sitemapUrls(origin).length} public URLs for ${origin}`);
