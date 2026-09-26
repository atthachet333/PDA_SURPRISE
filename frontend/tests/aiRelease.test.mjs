/**
 * EP46.5 — A&I release pass. Regression tests for the defects this pass found
 * and fixed, nothing more:
 *
 *   1. an unused standalone copy of an archive photo shipped publicly
 *      (wedding-ceremony-02 duplicated archive memory-015)
 *   2. /us had no h1
 *   3. the archive photo viewer was aria-modal but left focus behind it
 *   4. the Places heading split ความทรงจำ across two lines on desktop
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { test } from 'node:test';

import * as anniversaryModule from '../src/data/anniversary.ts';
import * as memoryArchiveModule from '../src/data/memoryArchive.ts';
import * as memoryVideosModule from '../src/data/memoryVideos.ts';
import * as storyMediaModule from '../src/data/storyMedia.ts';

const url = (path) => new URL(path, import.meta.url);
const read = (path) => readFileSync(url(path), 'utf8');
const MEDIA = /^\/(images|videos)\/memories\/\S+\.(webp|jpg|mp4)$/;

/** Every A&I media path the runtime data can reach (deep walk of the exports). */
function referencedMedia() {
  const found = new Set();
  const seen = new Set();
  const walk = (value) => {
    if (typeof value === 'string') {
      if (MEDIA.test(value)) found.add(value);
      return;
    }
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    Object.values(value).forEach(walk);
  };
  for (const module of [anniversaryModule, memoryArchiveModule, memoryVideosModule, storyMediaModule]) {
    for (const exported of Object.values(module)) {
      if (typeof exported === 'function') {
        if (exported.length === 0) {
          try {
            walk(exported());
          } catch {
            /* not a data getter */
          }
        }
      } else walk(exported);
    }
  }
  return found;
}

/** Every media file that ships under public/images|videos/memories. */
function shippedMedia() {
  const out = [];
  const visit = (dir, publicPath) => {
    for (const name of readdirSync(url(dir))) {
      const child = `${dir}/${name}`;
      if (statSync(url(child)).isDirectory()) visit(child, `${publicPath}/${name}`);
      else if (/\.(webp|jpg|jpeg|png|mp4|mov|heic)$/i.test(name)) out.push(`${publicPath}/${name}`);
    }
  };
  visit('../public/images/memories', '/images/memories');
  visit('../public/videos/memories', '/videos/memories');
  return out;
}

test('every shipped A&I media file is used, and every used path exists', () => {
  const used = referencedMedia();
  const shipped = shippedMedia();
  assert.ok(used.size > 250, `only ${used.size} media paths found — the walk broke`);
  const orphans = shipped.filter((path) => !used.has(path));
  assert.deepEqual(orphans, [], 'files that ship publicly but nothing shows');
  const missing = [...used].filter((path) => !existsSync(url(`../public${path}`)));
  assert.deepEqual(missing, [], 'paths the runtime asks for that do not exist');
  assert.ok(!existsSync(url('../public/images/memories/wedding-ceremony-02.webp')));
});

test('/us has exactly one h1, in the arrival scene', () => {
  const dirs = ['../src/scenes/surprise', '../src/components/surprise', '../src/pages/surprise'];
  const h1s = [];
  for (const dir of dirs) {
    for (const name of readdirSync(url(dir))) {
      if (!name.endsWith('.tsx') || name === 'AnniversaryPreview.tsx') continue;
      const count = (read(`${dir}/${name}`).match(/<h1[\s>]/g) ?? []).length;
      for (let i = 0; i < count; i += 1) h1s.push(name);
    }
  }
  // MemoryGate and Workspace are their own routes; /us is Experience + scenes.
  const usH1 = h1s.filter((name) => name.startsWith('Scene') || name === 'Experience.tsx');
  assert.deepEqual(usH1, ['Scene01Entry.tsx']);
});

test('the archive photo viewer takes focus, traps Tab and gives focus back', () => {
  const source = read('../src/scenes/surprise/Scene04Universe.tsx');
  assert.match(source, /const opener = document\.activeElement as HTMLElement \| null;/);
  assert.match(source, /lightboxCloseRef\.current\?\.focus\(\);/);
  assert.match(source, /event\.key === 'Tab'[\s\S]{0,80}event\.preventDefault\(\);/);
  assert.match(source, /if \(opener && document\.contains\(opener\)\) opener\.focus\(\);/);
  assert.match(source, /ref=\{lightboxCloseRef\}/);
});

test('ความทรงจำ never breaks inside the Places heading', () => {
  assert.match(read('../src/scenes/surprise/Scene05Map.tsx'), /<span className="whitespace-nowrap">ความทรงจำ<\/span>/);
});
