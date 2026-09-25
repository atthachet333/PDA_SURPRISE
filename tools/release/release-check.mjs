/**
 * npm run release:check — local release preflight (EP46).
 *
 * Run it inside a release folder AFTER `npm run build`, before PM2 is pointed
 * at that folder. It reads and reports; it never builds, pushes, deploys,
 * restarts PM2 or touches Cloudflare. Exit code 1 means: do not start this
 * release.
 *
 *   npm run release:check
 *   npm run release:check -- --backend-env D:\path\to\backend.env
 *   npm run release:check -- --skip-build-output      (before building)
 *   npm run release:check -- --allow-missing-audio    (knowingly ship silent)
 *   npm run release:check -- --allow-dirty            (local experiments only)
 *
 * Node-only and path.join everywhere, so it behaves the same on the Windows
 * server as on a developer machine.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { loadEnv } from 'vite';

import { sanitizeOrigin } from '../../frontend/src/lib/url.ts';
import {
  MAIN_TRACK,
  checkBackendEnv,
  checkFrontendEnv,
  checkMainTrack,
  checkNode,
  checkSeoOutput,
  forbiddenFiles,
  unexpectedDistFiles
} from './checks.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const sections = [];
const section = (title, results) => sections.push({ title, results });
const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : null);

function git(...gitArgs) {
  try {
    return execFileSync('git', gitArgs, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(relative(dir, full).split(sep).join('/'));
    }
  };
  walk(dir);
  return out;
}

/* ---------------------------------------------------------------- runtime -- */
section('Runtime', [checkNode(process.version)]);

/* --------------------------------------------------------- source control -- */
const head = git('rev-parse', 'HEAD');
if (head === null) {
  section('Source control', [{ level: 'warn', message: 'not a git checkout: release commit cannot be recorded' }]);
} else {
  const dirty = git('status', '--porcelain', '--untracked-files=no');
  const tracked = (git('ls-files') ?? '').split('\n').filter(Boolean);
  const stray = tracked.filter((file) => /^(review-local|\.media-staging)\//.test(file) || (/^media-inbox\//.test(file) && file !== 'media-inbox/README.md'));
  section('Source control', [
    { level: 'pass', message: `commit ${head} on ${git('branch', '--show-current') || '(detached)'}` },
    dirty
      ? { level: flag('--allow-dirty') ? 'warn' : 'fail', message: 'tracked files are modified: a release must be a clean commit (--allow-dirty for local experiments)' }
      : { level: 'pass', message: 'working tree clean' },
    stray.length ? { level: 'fail', message: `private working folders are tracked: ${stray.slice(0, 5).join(', ')}` } : { level: 'pass', message: 'no review-local / media-inbox / staging files tracked' }
  ]);
}

/* ------------------------------------------------------------ backend env -- */
const backendEnvPath = resolve(option('--backend-env') ?? join(root, 'backend', '.env'));
const backendEnvText = read(backendEnvPath);
const backendEnv = backendEnvText == null ? null : parse(backendEnvText);
section(
  `Backend env (${backendEnvPath})`,
  backendEnv == null ? [{ level: 'fail', message: 'file not found: copy <root>\\shared\\backend.env to backend\\.env' }] : checkBackendEnv(backendEnv)
);

/* ----------------------------------------------------------- frontend env -- */
const viteEnv = loadEnv('production', join(root, 'frontend'), 'VITE_');
section('Frontend build env (.env.production + shell)', checkFrontendEnv(viteEnv, backendEnv?.PUBLIC_ORIGIN ?? ''));

/* -------------------------------------------------------- runtime assets -- */
const distDir = join(root, 'frontend', 'dist');
const checkDist = !flag('--skip-build-output');
const trackInPublic = join(root, 'frontend', 'public', ...MAIN_TRACK.split('/'));
const audio = checkMainTrack({
  inPublic: existsSync(trackInPublic) && statSync(trackInPublic).size > 0,
  inDist: existsSync(join(distDir, ...MAIN_TRACK.split('/'))),
  tracked: Boolean(git('ls-files', `frontend/public/${MAIN_TRACK}`)),
  distChecked: checkDist
}).map((result) => (result.level === 'provision' && flag('--allow-missing-audio') ? { ...result, level: 'warn' } : result));
section('Owner-provisioned assets', audio);

/* ----------------------------------------------------------- build output -- */
if (checkDist) {
  const results = [];
  const distFiles = listFiles(distDir);
  const need = [
    'index.html', 'robots.txt', 'site.webmanifest', 'brand/og-default.png',
    // PDA BLISS SOLUTION icons and logo variants (EP46.6)
    'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png',
    'android-chrome-192x192.png', 'android-chrome-512x512.png', 'maskable-512x512.png',
    ...['logo', 'mark', 'mark-sm', 'wordmark'].flatMap((name) => [`brand/solution/pda-bliss-solution-${name}.webp`, `brand/solution/pda-bliss-solution-${name}-dark.webp`])
  ];
  if (!distFiles.length) results.push({ level: 'fail', message: 'frontend/dist is empty: run npm run build' });
  else {
    const missing = need.filter((file) => !distFiles.includes(file));
    results.push(missing.length ? { level: 'fail', message: `frontend/dist missing ${missing.join(', ')}` } : { level: 'pass', message: 'index, robots, manifest, favicons, home-screen icons and PDA BLISS SOLUTION logos present' });
    results.push(distFiles.some((file) => /^assets\/index-[A-Za-z0-9_-]{8,}\.js$/.test(file)) ? { level: 'pass', message: 'hashed entry bundle present (old-tab recovery relies on hashed names)' } : { level: 'fail', message: 'no hashed assets/index-*.js' });
  }
  results.push(existsSync(join(root, 'backend', 'dist', 'server.js')) ? { level: 'pass', message: 'backend/dist/server.js present' } : { level: 'fail', message: 'backend/dist/server.js missing: run npm run build' });

  const forbidden = forbiddenFiles(distFiles);
  results.push(forbidden.length ? { level: 'fail', message: `forbidden files would be public: ${forbidden.slice(0, 8).join(', ')}` } : { level: 'pass', message: 'no source maps, raw media, archives, env or private folders in dist' });

  const trackedPublic = git('ls-files', 'frontend/public');
  if (trackedPublic === null) results.push({ level: 'warn', message: 'git unavailable: cannot compare dist against tracked public files' });
  else {
    const allowed = trackedPublic.split('\n').filter(Boolean).map((file) => file.replace(/^frontend\/public\//, ''));
    const unexpected = unexpectedDistFiles(distFiles, allowed);
    results.push(unexpected.length ? { level: 'fail', message: `files in dist come from neither git nor the build (publicly downloadable): ${unexpected.slice(0, 8).join(', ')}` } : { level: 'pass', message: 'every dist file is tracked in public/ or generated by the build' });
  }
  section('Build output (frontend/dist, backend/dist)', results);

  const origin = sanitizeOrigin(viteEnv.VITE_PUBLIC_ORIGIN ?? '');
  section('SEO output', checkSeoOutput({ origin, robots: read(join(distDir, 'robots.txt')), sitemap: read(join(distDir, 'sitemap.xml')), indexHtml: read(join(distDir, 'index.html')) }));
}

/* ----------------------------------------------------------------- report -- */
const mark = { pass: 'PASS', warn: 'WARN', fail: 'FAIL', provision: 'PROVISION' };
let failures = 0;
let provisions = 0;
for (const { title, results } of sections) {
  console.log(`\n${title}`);
  for (const { level, message } of results) {
    if (level === 'fail') failures += 1;
    if (level === 'provision') provisions += 1;
    console.log(`  ${mark[level].padEnd(9)} ${message}`);
  }
}
console.log('');
if (failures || provisions) {
  console.log(`RELEASE CHECK FAILED: ${failures} failure(s), ${provisions} runtime asset(s) to provision. Do not start this release.`);
  process.exit(1);
}
console.log(`RELEASE CHECK PASSED${head ? ` for ${head.slice(0, 12)}` : ''}.`);
