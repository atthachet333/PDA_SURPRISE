/**
 * Generates dist/sitemap.xml and completes dist/robots.txt after a build.
 *
 * A sitemap requires ABSOLUTE urls, and the production hostname has not been
 * chosen yet. Rather than invent one — or ship a sitemap full of `example.com`
 * that would be submitted to Google verbatim — this writes nothing at all until
 * `VITE_PUBLIC_ORIGIN` is set, and says so loudly in the build output.
 *
 * Only public corporate routes are ever listed. The private routes (/login,
 * /memory-gate, /workspace, /us) and the dev console are never included.
 *
 * Run automatically by `npm run build`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '..', 'dist');

const origin = (process.env.VITE_PUBLIC_ORIGIN ?? '').trim().replace(/\/$/, '');

/**
 * Kept in step with `indexablePaths` in src/lib/seo.ts by hand, because this
 * script runs in plain Node and cannot import the TypeScript module. If a
 * public route is added there, add it here.
 */
const paths = [
  '/',
  '/services',
  '/solutions',
  '/work',
  '/about',
  '/contact',
  '/insights',
  '/privacy',
  '/cookie-policy',
  '/terms'
];

if (!existsSync(dist)) {
  console.error('[sitemap] no dist/ directory — run the build first');
  process.exit(0);
}

if (!origin) {
  console.warn(
    '[sitemap] VITE_PUBLIC_ORIGIN is not set, so no sitemap.xml was generated.\n' +
      '          This is expected until the production hostname is chosen.\n' +
      '          Set it in frontend/.env.production and rebuild. See DEPLOYMENT.md.'
  );
  process.exit(0);
}

if (!origin.startsWith('https://')) {
  console.error(`[sitemap] VITE_PUBLIC_ORIGIN must be https:// — got "${origin}"`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const urls = paths
  .map((path) => {
    const priority = path === '/' ? '1.0' : path.startsWith('/privacy') || path.startsWith('/terms') || path.startsWith('/cookie') ? '0.3' : '0.8';
    return [
      '  <url>',
      `    <loc>${origin}${path}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <priority>${priority}</priority>`,
      '  </url>'
    ].join('\n');
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(resolve(dist, 'sitemap.xml'), sitemap, 'utf8');

// Point robots.txt at the sitemap now that a real origin exists.
const robotsPath = resolve(dist, 'robots.txt');
if (existsSync(robotsPath)) {
  let robots = readFileSync(robotsPath, 'utf8');
  robots = robots.replace(
    /# OWNER INPUT: uncomment and set the real hostname once it is chosen\.\r?\n# Sitemap: .*/,
    `Sitemap: ${origin}/sitemap.xml`
  );
  writeFileSync(robotsPath, robots, 'utf8');
}

console.log(`[sitemap] wrote ${paths.length} public routes for ${origin}`);
