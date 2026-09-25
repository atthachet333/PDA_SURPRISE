/**
 * Release preflight checks (EP46) — pure functions, no I/O.
 *
 * release-check.mjs gathers the facts (env files, file lists, git state) and
 * hands them here; everything that decides PASS / WARN / FAIL / PROVISION lives
 * in this file so it can be unit-tested without a server, a build or git.
 *
 * Levels
 *   pass       fine
 *   warn       allowed, but the operator should read it
 *   fail       the release must not go out
 *   provision  an owner-supplied runtime file is missing on THIS machine —
 *              not a source-control problem (it is deliberately not in git),
 *              but the release is incomplete until it is copied in
 */
import { sanitizeOrigin } from '../../frontend/src/lib/url.ts';

export const PRIVATE_ROOTS = ['/login', '/memory-gate', '/workspace', '/us', '/dev'];

/** Owner-provisioned runtime asset: copyrighted, gitignored, copied per server. */
export const MAIN_TRACK = 'audio/main-track.mp3';

const pass = (message) => ({ level: 'pass', message });
const warn = (message) => ({ level: 'warn', message });
const fail = (message) => ({ level: 'fail', message });

export function checkNode(version) {
  const major = Number(String(version).replace(/^v/, '').split('.')[0]);
  return major >= 22
    ? pass(`Node ${version} (>= 22 required by @fastify/static -> content-disposition)`)
    : fail(`Node ${version} is too old: production needs Node 22 or newer (package.json engines).`);
}

/**
 * The production backend/.env, parsed. `env` is the key/value object; a
 * missing file is reported by the caller.
 */
export function checkBackendEnv(env) {
  const out = [];
  const value = (key) => (env[key] ?? '').trim();

  out.push(value('NODE_ENV') === 'production' ? pass('NODE_ENV=production') : fail(`NODE_ENV must be production (is "${value('NODE_ENV') || 'unset'}")`));
  out.push(value('SERVE_FRONTEND') === 'true' ? pass('SERVE_FRONTEND=true (one process serves API + SPA)') : fail('SERVE_FRONTEND must be true: the single-origin topology has no other frontend server'));

  const port = Number(value('PORT') || '1369');
  out.push(Number.isInteger(port) && port > 0 && port < 65536 ? pass(`PORT=${port}`) : fail(`PORT "${value('PORT')}" is not a valid port`));

  const host = value('HOST') || '0.0.0.0';
  out.push(
    host === '127.0.0.1' || host === 'localhost'
      ? pass(`HOST=${host} (loopback: only cloudflared can reach it)`)
      : warn(`HOST=${host}: production should bind 127.0.0.1 so the LAN cannot bypass the tunnel or forge X-Forwarded-For`)
  );

  const hops = value('TRUST_PROXY_HOPS') || '1';
  out.push(hops === '1' ? pass('TRUST_PROXY_HOPS=1 (cloudflared is the only hop)') : warn(`TRUST_PROXY_HOPS=${hops}: behind a local cloudflared the honest value is 1`));

  const origin = value('PUBLIC_ORIGIN');
  if (!origin) out.push(fail('PUBLIC_ORIGIN is empty — OWNER DECISION REQUIRED: production hostname'));
  else if (!sanitizeOrigin(origin)) out.push(fail(`PUBLIC_ORIGIN "${origin}" is not a public https origin (no path, query, localhost or private host)`));
  else out.push(pass(`PUBLIC_ORIGIN=${sanitizeOrigin(origin)}`));

  const store = value('LEAD_STORE') || 'file';
  const leadPath = value('LEAD_STORE_PATH') || './data/leads.jsonl';
  if (store !== 'file') out.push(fail(`LEAD_STORE=${store}: contact enquiries would be lost on every restart`));
  else if (!isAbsolutePath(leadPath)) out.push(fail(`LEAD_STORE_PATH "${leadPath}" is relative: it lives inside one release and the next deploy starts an empty file. Use <root>\\shared\\data\\leads.jsonl`));
  else out.push(pass(`LEAD_STORE_PATH is absolute (${leadPath})`));

  const cors = value('CORS_ORIGIN').split(',').map((entry) => entry.trim());
  out.push(cors.includes('*') ? fail('CORS_ORIGIN must not contain "*"') : pass('CORS_ORIGIN has no wildcard'));

  const level = value('LOG_LEVEL') || 'info';
  out.push(['debug', 'trace'].includes(level) ? warn(`LOG_LEVEL=${level} is verbose for production (info is the default)`) : pass(`LOG_LEVEL=${level}`));

  return out;
}

/** Windows (C:\…, \\server\share) or POSIX absolute. */
export function isAbsolutePath(value) {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\') || value.startsWith('/');
}

/** VITE_* values as the production build sees them (Vite's own env loading). */
export function checkFrontendEnv(viteEnv, backendOrigin) {
  const out = [];
  const raw = (viteEnv.VITE_PUBLIC_ORIGIN ?? '').trim();
  const origin = sanitizeOrigin(raw);
  if (!raw) out.push(fail('VITE_PUBLIC_ORIGIN is empty — OWNER DECISION REQUIRED: production hostname (frontend/.env.production)'));
  else if (!origin) out.push(fail(`VITE_PUBLIC_ORIGIN "${raw}" is not a public https origin`));
  else if (backendOrigin && origin !== sanitizeOrigin(backendOrigin)) out.push(fail(`VITE_PUBLIC_ORIGIN (${origin}) and PUBLIC_ORIGIN (${backendOrigin}) name different sites`));
  else out.push(pass(`VITE_PUBLIC_ORIGIN=${origin}`));

  const api = (viteEnv.VITE_API_BASE_URL ?? '').trim();
  if (api && api !== '/api') out.push(warn(`VITE_API_BASE_URL=${api}: production is same-origin /api; anything else needs CORS`));
  return out;
}

/** The owner-supplied track, in public/ (before build) and in dist/ (after). */
export function checkMainTrack({ inPublic, inDist, tracked, distChecked }) {
  const out = [];
  if (tracked) out.push(fail(`frontend/public/${MAIN_TRACK} is TRACKED by git — copyrighted audio must never be committed`));
  if (!inPublic) {
    out.push({ level: 'provision', message: `RUNTIME PROVISIONING REQUIRED: copy the owner's track to frontend/public/${MAIN_TRACK} (from <root>\\shared\\audio\\main-track.mp3) before building` });
  } else {
    out.push(pass(`frontend/public/${MAIN_TRACK} present (owner-provisioned, untracked)`));
  }
  if (distChecked && inPublic && !inDist) out.push(fail(`dist/${MAIN_TRACK} missing: the track was copied in after the build — rebuild`));
  return out;
}

const FORBIDDEN_EXT = /\.(heic|heif|mov|m4v|avi|dng|cr2|nef|arw|raw|psd|zip|7z|rar|tar|gz|jsonl|map|log|py|pem|key|pfx|env)$/i;
const FORBIDDEN_SEGMENT = /(^|\/)(review-local|media-inbox|\.media-staging|drive-[^/]*|\.env[^/]*|node_modules|\.git)(\/|$)/i;

/** Files that must never be publicly downloadable, whatever put them there. */
export function forbiddenFiles(files) {
  return files.filter((file) => FORBIDDEN_EXT.test(file) || FORBIDDEN_SEGMENT.test(file));
}

/** Files a build legitimately creates that are not tracked under public/. */
export function isGeneratedDistFile(file) {
  return (
    file === 'index.html' ||
    file === 'robots.txt' ||
    file === 'sitemap.xml' ||
    file === MAIN_TRACK ||
    /^assets\/[^/]+-[A-Za-z0-9_-]{8,}\.(js|css|woff2?|png|jpe?g|webp|svg)$/.test(file) ||
    /^audio\/sfx\/[a-z0-9-]+\.mp3$/.test(file)
  );
}

/**
 * dist/ files that come from neither git nor the build: a screenshot, a
 * contact sheet, a copied source file sitting in public/ on this machine.
 * Everything in dist/ is downloadable by anyone who guesses the path.
 */
export function unexpectedDistFiles(distFiles, trackedPublic) {
  const tracked = new Set(trackedPublic);
  return distFiles.filter((file) => !tracked.has(file) && !isGeneratedDistFile(file));
}

/** robots.txt, sitemap.xml and the static share tags for a built release. */
export function checkSeoOutput({ origin, robots, sitemap, indexHtml }) {
  const out = [];
  if (!origin) return [warn('SEO output not checked: no valid public origin')];

  if (robots == null) out.push(fail('dist/robots.txt missing'));
  else {
    out.push(robots.includes(`Sitemap: ${origin}/sitemap.xml`) ? pass('robots.txt points at the sitemap') : fail(`robots.txt has no "Sitemap: ${origin}/sitemap.xml" line — was the origin set for the build?`));
    const missing = PRIVATE_ROOTS.filter((root) => !robots.includes(`Disallow: ${root}`));
    out.push(missing.length ? fail(`robots.txt does not disallow ${missing.join(', ')}`) : pass('robots.txt disallows every private root'));
  }

  if (sitemap == null) out.push(fail('dist/sitemap.xml missing — the build did not see VITE_PUBLIC_ORIGIN'));
  else {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    const foreign = locs.filter((loc) => !loc.startsWith(`${origin}/`) && loc !== origin);
    const privateLocs = locs.filter((loc) => PRIVATE_ROOTS.some((root) => new URL(loc).pathname.replace(/^\/(en|zh)(?=\/|$)/, '').startsWith(root)));
    if (!locs.length) out.push(fail('sitemap.xml lists no URLs'));
    else if (foreign.length) out.push(fail(`sitemap.xml has URLs outside ${origin}: ${foreign.slice(0, 3).join(', ')}`));
    else if (privateLocs.length) out.push(fail(`sitemap.xml lists private routes: ${privateLocs.slice(0, 3).join(', ')}`));
    else out.push(pass(`sitemap.xml: ${locs.length} public URLs on ${origin}`));
  }

  if (indexHtml == null) out.push(fail('dist/index.html missing'));
  else out.push(indexHtml.includes(`content="${origin}/brand/og-default.png"`) ? pass('index.html carries the absolute share image') : fail('index.html has no absolute og:image for this origin'));
  return out;
}
