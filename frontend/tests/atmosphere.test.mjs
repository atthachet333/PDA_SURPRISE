import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VisualAtmosphere } from '../src/components/business/atmosphere/VisualAtmosphere.tsx';
import { ATMOSPHERE_VARIANTS } from '../src/components/business/atmosphere/variants.ts';
import { ALL_FRAGMENTS } from '../src/components/business/atmosphere/fragments.ts';

/**
 * EP43 — corporate visual atmosphere.
 *
 * Decoration is judged in the browser (before/after screenshots); these tests
 * only pin the contracts that must never regress: decorative layers are
 * hidden from assistive tech and from the pointer, every variant exists in
 * both themes, the code texture carries nothing real, motion stops under
 * reduced motion, and no corporate page pulls in the A&I renderer.
 */

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const read = (file) => readFileSync(path.join(SRC, file), 'utf8');
const css = read('styles/atmosphere.css');
const tokens = read('styles/theme-tokens.css');

test('every atmosphere variant renders one aria-hidden, non-interactive layer', () => {
  assert.ok(ATMOSPHERE_VARIANTS.length >= 10);
  for (const variant of ATMOSPHERE_VARIANTS) {
    const html = renderToStaticMarkup(createElement(VisualAtmosphere, { variant }));
    assert.match(html, /^<div class="atm" aria-hidden="true" data-atmosphere=/, variant);
    assert.equal(html.match(/aria-hidden="true"/g)?.length, 1, `${variant}: exactly one hidden root, nothing re-exposed inside`);
    assert.doesNotMatch(html, /<(a|button|input|select|textarea)\b|tabindex=|href=|role="/, `${variant} contains something interactive`);
    assert.doesNotMatch(html, /<img\b|<video\b|url\(http/, `${variant} loads an asset`);
  }
});

test('decorative layers never take the pointer', () => {
  for (const selector of ['.atm {', '.atm > * {', '.atm-rail {']) {
    const block = css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)));
    assert.match(block, /pointer-events:\s*none/, `${selector} must be pointer-events: none`);
  }
  const ground = css.slice(css.indexOf('.sect--mesh)::before {'), css.indexOf('}', css.indexOf('.sect--mesh)::before {')));
  assert.match(ground, /pointer-events:\s*none/);
  assert.match(ground, /z-index:\s*-1/);
});

test('motion stops under prefers-reduced-motion; the static layers remain', () => {
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  for (const moving of ['.atm-drift-a', '.atm-drift-b', '.atm-breathe', '.atm-signal', '.atm-pulse']) {
    assert.ok(reduced.includes(moving), `${moving} keeps moving under reduced motion`);
  }
  assert.match(reduced, /animation:\s*none !important/);
  assert.doesNotMatch(reduced.split('/* Small screens')[0], /\.atm\s*\{[^}]*display:\s*none/, 'the atmosphere itself must not be removed');
});

test('every atmosphere token is composed for Light, Dark and the dark islands', () => {
  const names = [...new Set(tokens.match(/--atm-[a-z-]+(?=:)/g))];
  assert.ok(names.length >= 12, 'atmosphere tokens missing');
  const light = tokens.slice(tokens.indexOf(':root {'), tokens.indexOf(":root[data-theme='light']"));
  const dark = tokens.slice(tokens.indexOf(":root[data-theme='dark'] body:not([data-theme='ai'])"), tokens.indexOf(' * ISLAND —'));
  const island = tokens.slice(tokens.lastIndexOf(':is(.sect--mesh'));
  for (const name of names) {
    for (const [scope, block] of [['light', light], ['dark', dark], ['island', island]]) {
      assert.ok(block.includes(`${name}:`), `${name} has no ${scope} value`);
    }
  }
  // Dark is its own composition, not the light values reused.
  const value = (block, name) => block.match(new RegExp(`${name}:\\s*([^;]+);`))[1].trim();
  for (const name of ['--atm-line', '--atm-ghost-bg', '--atm-glow-blue']) {
    assert.notEqual(value(light, name), value(dark, name), `${name} is identical in light and dark`);
  }
});

test('section grounds are never flat white in either theme', () => {
  for (const ground of ['--sect-bright', '--sect-grid']) {
    const values = [...tokens.matchAll(new RegExp(`${ground}:([^;]+);`, 'g'))].map((match) => match[1]);
    assert.equal(values.length, 2, `${ground} needs a light and a dark value`);
    for (const value of values) assert.match(value, /gradient/, `${ground} is a flat colour: ${value.trim()}`);
  }
});

test('decorative code carries nothing real', () => {
  const unsafe = [
    /\b\d{1,3}(\.\d{1,3}){3}\b/, // IPv4
    /@[\w-]+\.[a-z]{2,}/i, // email / domain handle
    /https?:\/\//i,
    /localhost|127\.0\.0\.1/i,
    /\b(api[_-]?key|secret|token|passw(or)?d|bearer|private[_-]?key)\b/i,
    /\bsk-[A-Za-z0-9]/,
    /\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/, // ENV_VAR style
    /process\.env|import\.meta\.env|\.env\b/,
    /(^|\s)(\/|~\/|[A-Z]:\\)(home|Users|var|etc|srv|opt)\b/i, // filesystem paths
    /postgres|mysql:\/\/|mongodb|redis:\/\//i,
    /pdabliss|pda bliss|gmail|0\d{8,9}/i // company contact data never becomes texture
  ];
  assert.ok(ALL_FRAGMENTS.length > 20);
  for (const fragment of ALL_FRAGMENTS) {
    for (const pattern of unsafe) assert.doesNotMatch(fragment, pattern, `unsafe decorative string: ${fragment}`);
  }
});

/* Static import graph from every corporate page. */
function resolveImport(from, spec) {
  const base = spec.startsWith('@/') ? path.join(SRC, spec.slice(2)) : path.resolve(path.dirname(from), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
    if (existsSync(candidate) && !candidate.endsWith('/') && /\.(tsx?|css)$/.test(candidate)) return candidate;
  }
  return null;
}

function importGraph(entry) {
  const seen = new Set();
  const external = new Set();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(file, 'utf8');
    for (const [, spec] of source.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      if (!spec) continue;
      if (spec.startsWith('.') || spec.startsWith('@/')) {
        const resolved = resolveImport(file, spec);
        if (resolved) stack.push(resolved);
      } else external.add(spec);
    }
  }
  return { files: [...seen], external: [...external] };
}

test('no corporate page reaches the A&I renderer, three.js or WebGL', () => {
  const pages = ['Home', 'Services', 'Work', 'WorkDetail', 'Solutions', 'About', 'Contact'];
  for (const page of pages) {
    const { files, external } = importGraph(path.join(SRC, 'pages/business', `${page}.tsx`));
    const surprise = files.filter((file) => /[\\/](surprise|scenes)[\\/]/.test(file));
    assert.deepEqual(surprise, [], `${page} imports A&I code`);
    const heavy = external.filter((spec) => /^(three|@react-three)/.test(spec));
    assert.deepEqual(heavy, [], `${page} imports ${heavy.join(', ')}`);
  }
});

test('each corporate page composes its own atmosphere', () => {
  const expected = {
    'pages/business/Home.tsx': 'variant="hero"',
    'pages/business/Services.tsx': 'variant="workflow"',
    'pages/business/Work.tsx': 'variant="portfolio"',
    'pages/business/WorkDetail.tsx': 'variant="evidence"',
    'pages/business/Solutions.tsx': 'variant="topology"',
    'pages/business/About.tsx': 'atmosphere="blueprint"',
    'pages/business/Contact.tsx': 'atmosphere="contact"',
    'components/business/SystemUniverse.tsx': 'variant="universe"',
    'components/business/BigCTA.tsx': 'variant="closing"'
  };
  for (const [file, marker] of Object.entries(expected)) {
    assert.ok(read(file).includes(marker), `${file} lost its ${marker}`);
  }
  // The System Universe stays the hero visual of Solutions — it is enhanced, not replaced.
  assert.ok(read('pages/business/Solutions.tsx').includes('<SystemUniverse'));
});
