/**
 * EP46.6 — PDA BLISS SOLUTION brand integration.
 *
 * Checks the contract, not pixels: which files the logo uses, that icons and
 * manifest resolve, that the site brand and the legal company never swap
 * places, that the hero drift is conservative and switched off under reduced
 * motion, and that none of it reaches the private A&I world.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { test } from 'node:test';

import { SITE_BRAND, brandAssets, brandIcons } from '../src/data/brand.ts';
import { company } from '../src/data/company.ts';
import { buildHead } from '../src/lib/head.ts';
import { PRIVATE_SITE_NAME, SITE_NAME, pageMeta, privateMeta } from '../src/lib/seo.ts';
import { organizationSchema, websiteSchema } from '../src/lib/structuredData.ts';
import { sanitizeOrigin } from '../src/lib/url.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
/** Source text with /* … *\/ and // comments removed (comments may name what is forbidden). */
const code = (path) => read(path).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const bytes = (publicPath) => readFileSync(new URL(`../public${publicPath}`, import.meta.url));
const ORIGIN = 'https://solution.pdabliss.com';
const meta = (head, key) => head.metas.find((tag) => tag.key === key)?.content;

/** Canvas size of a WebP (VP8 / VP8L / VP8X). */
function webpSize(buffer) {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP');
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return [1 + buffer.readUIntLE(24, 3), 1 + buffer.readUIntLE(27, 3)];
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
}

/** RIFF chunk ids of a WebP. */
function webpChunks(buffer) {
  const ids = [];
  for (let offset = 12; offset + 8 <= buffer.length; ) {
    const size = buffer.readUInt32LE(offset + 4);
    ids.push(buffer.toString('ascii', offset, offset + 4));
    offset += 8 + size + (size & 1);
  }
  return ids;
}

/** PNG chunk types. */
function pngChunks(buffer) {
  const types = [];
  for (let offset = 8; offset + 8 <= buffer.length; ) {
    const size = buffer.readUInt32BE(offset);
    types.push(buffer.toString('ascii', offset + 4, offset + 8));
    offset += 12 + size;
  }
  return types;
}

test('every logo variant exists at its declared size, light and dark', () => {
  for (const [name, asset] of Object.entries(brandAssets)) {
    for (const tone of ['light', 'dark']) {
      const path = asset[tone];
      assert.match(path, /^\/brand\/solution\/pda-bliss-solution-[a-z-]+\.webp$/, `${name} ${tone}`);
      const [width, height] = webpSize(bytes(path));
      // ±1px: light and dark are cropped from the same box by alpha.
      assert.ok(Math.abs(width - asset.width) <= 1 && Math.abs(height - asset.height) <= 1, `${path} is ${width}x${height}`);
      assert.ok(statSync(new URL(`../public${path}`, import.meta.url)).size < 100_000, `${path} is too heavy`);
    }
  }
});

test('the corporate chrome uses the solution logo; /login keeps its own', () => {
  const logo = read('../src/components/business/SolutionLogo.tsx');
  assert.match(logo, /brandAssets\.markSmall/);
  assert.match(logo, /brandAssets\.wordmark/);
  assert.doesNotMatch(logo, /\/brand\/[a-z]/, 'paths come from data/brand.ts, not literals');
  for (const file of ['Header', 'Footer', 'FloatingContact']) {
    const source = read(`../src/components/business/${file}.tsx`);
    assert.match(source, /import \{ SolutionLogo \} from '\.\/SolutionLogo'/, file);
    assert.doesNotMatch(source, /import \{ Logo \}/, `${file} still imports the old Logo`);
  }
  // The private /login page is out of scope for the sub-brand.
  assert.match(read('../src/pages/business/Login.tsx'), /import \{ Logo \} from '@\/components\/business\/Logo'/);
});

test('favicons, home-screen icons and manifest resolve to the new set', () => {
  const html = read('../index.html');
  for (const path of [brandIcons.ico, brandIcons.png16, brandIcons.png32, brandIcons.apple]) {
    assert.ok(html.includes(`href="${path}"`), `index.html does not link ${path}`);
  }
  assert.doesNotMatch(html, /favicon\.svg|\/brand\/icon-/, 'old icon links remain');

  const ico = bytes(brandIcons.ico);
  assert.deepEqual([ico.readUInt16LE(0), ico.readUInt16LE(2)], [0, 1], 'favicon.ico is not an icon file');
  const sizes = Array.from({ length: ico.readUInt16LE(4) }, (_, index) => ico[6 + index * 16] || 256);
  assert.deepEqual(sizes.sort((a, b) => a - b), [16, 32, 48]);

  const manifest = JSON.parse(read('../public/site.webmanifest'));
  assert.equal(manifest.name, SITE_BRAND);
  assert.deepEqual(
    manifest.icons.map((icon) => [icon.src, icon.purpose]),
    [[brandIcons.android192, 'any'], [brandIcons.android512, 'any'], [brandIcons.maskable512, 'maskable']]
  );
  for (const path of Object.values(brandIcons)) assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), path);
});

test('site brand and legal company are never swapped', () => {
  assert.equal(SITE_BRAND, 'PDA BLISS SOLUTION');
  assert.equal(SITE_NAME, SITE_BRAND);
  assert.equal(company.legalName, 'PDA BLISS COMPANY LIMITED');

  const org = organizationSchema('en', ORIGIN);
  assert.equal(org['@type'], 'Organization');
  assert.equal(org.legalName, 'PDA BLISS COMPANY LIMITED');
  assert.doesNotMatch(JSON.stringify(org), /SOLUTION/, 'the Organization is the company, not the sub-brand');

  const site = websiteSchema('en', ORIGIN);
  assert.equal(site['@type'], 'WebSite');
  assert.equal(site.name, SITE_BRAND);

  const home = buildHead(pageMeta.home, 'en', ORIGIN);
  assert.equal(meta(home, 'og:site_name'), SITE_BRAND);
  assert.match(home.title, /^PDA BLISS SOLUTION — /);
  assert.match(buildHead(pageMeta.contact, 'th', ORIGIN).title, / — PDA BLISS SOLUTION$/);

  // Nothing may invent a legal entity called "PDA BLISS SOLUTION CO., LTD.".
  const sources = [
    ...['../src/data/company.ts', '../src/data/brand.ts', '../src/i18n/legal.ts', '../src/i18n/company.ts', '../index.html', '../public/site.webmanifest'].map(code),
    read('../../docs/PRODUCTION_RUNBOOK.md')
  ].join('\n');
  assert.doesNotMatch(sources, /PDA BLISS SOLUTION (COMPANY|CO\.|LIMITED|LTD)|พีดีเอ บลิส โซลูชั่น จำกัด/i);
});

test('private routes keep their generic pre-EP46.6 metadata', () => {
  assert.equal(PRIVATE_SITE_NAME, 'PDA BLISS');
  assert.equal(privateMeta.title, 'PDA BLISS');
  const head = buildHead(privateMeta, 'th', ORIGIN);
  assert.equal(head.title, 'PDA BLISS');
  assert.equal(meta(head, 'og:site_name'), 'PDA BLISS');
  assert.equal(meta(head, 'robots'), 'noindex, nofollow');
});

test('production hostname is documented, valid and not committed as an env file', () => {
  assert.equal(sanitizeOrigin(ORIGIN), ORIGIN);
  const runbook = read('../../docs/PRODUCTION_RUNBOOK.md');
  assert.ok(runbook.includes(ORIGIN));
  assert.doesNotMatch(runbook, /<production-hostname>|<host>|OWNER DECISION — production hostname/);
  assert.ok(read('../.env.example').includes(ORIGIN));
  assert.match(read('../../.gitignore'), /^\.env\.\*$/m, '.env.production stays gitignored');
});

test('hero drift: conservative, transform-only, off under reduced motion', () => {
  const css = code('../src/styles/brand.css');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.hero-drift\s*\{\s*animation: none;/);
  assert.match(css, /animation: hero-drift 20s /, 'one 20s loop = a pose every 5s');
  assert.doesNotMatch(css, /rotate\(|(?<![-\w])(opacity|top|left|width|height|filter|margin)\s*:/, 'transform-only, no rotation');
  for (const [, x, y] of css.matchAll(/translate3d\((-?\d+)px, (-?\d+)px, 0\)/g)) {
    assert.ok(Math.abs(Number(x)) <= 16 && Math.abs(Number(y)) <= 16, `travel ${x},${y}px`);
  }
  for (const [, value] of css.matchAll(/scale\(([\d.]+)\)/g)) assert.ok(Number(value) >= 1 && Number(value) <= 1.03, `scale ${value}`);

  const home = read('../src/pages/business/Home.tsx');
  assert.match(home, /!reduced && 'hero-drift'/, 'the class is withheld under reduced motion');
  // The logo is never inside the moving layer.
  const drift = home.slice(home.indexOf("'hero-drift'"), home.indexOf('</div>', home.indexOf("'hero-drift'")));
  assert.doesNotMatch(drift, /Logo|Watermark/);
});

test('A&I is untouched: no brand import in the private world', () => {
  const dirs = ['../src/pages/surprise', '../src/components/surprise', '../src/scenes'];
  for (const dir of dirs) {
    const url = new URL(`${dir}/`, import.meta.url);
    const walk = (base) => readdirSync(base, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? walk(new URL(`${entry.name}/`, base)) : [new URL(entry.name, base)]
    );
    for (const file of walk(url)) {
      if (!/\.(tsx?|css)$/.test(file.pathname)) continue;
      const source = readFileSync(file, 'utf8');
      assert.doesNotMatch(source, /SolutionLogo|data\/brand|hero-drift|brand\/solution/, file.pathname);
    }
  }
});

test('new brand files carry no EXIF, XMP or text metadata', () => {
  for (const asset of Object.values(brandAssets)) {
    for (const path of [asset.light, asset.dark]) {
      const chunks = webpChunks(bytes(path));
      assert.ok(!chunks.includes('EXIF') && !chunks.includes('XMP '), `${path}: ${chunks}`);
    }
  }
  for (const path of [brandIcons.png16, brandIcons.png32, brandIcons.apple, brandIcons.android192, brandIcons.android512, brandIcons.maskable512, '/brand/og-default.png']) {
    const chunks = pngChunks(bytes(path));
    assert.ok(!chunks.some((type) => ['eXIf', 'tEXt', 'iTXt', 'zTXt', 'iCCP'].includes(type)), `${path}: ${chunks}`);
  }
  // The owner's source file stays out of public/, so it is never served.
  assert.ok(existsSync(new URL('../scripts/brand/source/pda-bliss-solution-source.webp', import.meta.url)));
  assert.ok(!readdirSync(new URL('../public/brand/solution/', import.meta.url)).some((name) => /source/.test(name)));
});
