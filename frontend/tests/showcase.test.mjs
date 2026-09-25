/**
 * EP46.6.1 — the capability showcase that replaced the kinetic marquee.
 * Contract tests: data source, copy completeness, CTA targets, the timing and
 * keyboard model, reduced motion and accessibility wiring. No screenshots.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  GRAPH,
  SHOWCASE_FIRST_DELAY_MS,
  SHOWCASE_IDS,
  SHOWCASE_PERIOD_MS,
  SHOWCASE_TRANSITION,
  counterLabel,
  graphNodes,
  keyToIndex,
  nextIndex,
  prevIndex,
  serviceHref,
  swipeToIndex
} from '../src/data/capabilityShowcase.ts';
import { primaryServices } from '../src/data/services.ts';
import { showcase, showcaseItems } from '../src/i18n/home.ts';
import { LOCALES } from '../src/i18n/locales.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const code = (path) => read(path).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const CANONICAL = ['business-systems', 'payroll', 'hr-line-bot', 'document-management', 'file-management', 'web-applications', 'mobile-applications', 'websites'];

test('the eight capabilities are the canonical EP38 primary services, in order', () => {
  assert.deepEqual([...SHOWCASE_IDS], CANONICAL);
  assert.deepEqual(primaryServices.map((service) => service.id), CANONICAL);
});

test('no second service list: ids come from data/services.ts', () => {
  assert.match(code('../src/data/capabilityShowcase.ts'), /primaryServices\.map\(\(service\) => service\.id\)/);
  const component = code('../src/components/business/CapabilityShowcase.tsx');
  assert.match(component, /usePrimaryServices\(\)/);
  for (const id of CANONICAL) assert.ok(!component.includes(`'${id}'`), `component hard-codes ${id}`);
});

test('copy is complete in TH / EN / ZH for every capability', () => {
  assert.deepEqual(Object.keys(showcaseItems).sort(), [...CANONICAL].sort());
  for (const [id, item] of Object.entries(showcaseItems)) {
    for (const locale of LOCALES) {
      assert.ok(item.short[locale].trim(), `${id} short ${locale}`);
      assert.equal(item.terms[locale].length, 4, `${id} terms ${locale}`);
      item.terms[locale].forEach((term) => assert.ok(term.trim(), `${id} empty term ${locale}`));
    }
  }
  for (const [key, value] of Object.entries(showcase)) for (const locale of LOCALES) assert.ok(value[locale].trim(), `${key} ${locale}`);
});

test('terms make no claim the services file rules out', () => {
  const all = Object.values(showcaseItems).flatMap((item) => LOCALES.flatMap((locale) => item.terms[locale])).join(' ');
  assert.doesNotMatch(all, /social security|ประกันสังคม|社保|tax|ภาษี|税|app store|google play|backup|guarantee|รับประกัน|offline|barcode|multi-?company/i);
});

test('every CTA opens that service on /services', () => {
  const catalogue = read('../src/components/business/ServiceCatalogue.tsx');
  assert.match(catalogue, /id=\{service\.id\}/, 'service blocks are anchored by their canonical id');
  for (const id of CANONICAL) assert.equal(serviceHref(id), `/services#${id}`);
  assert.match(code('../src/components/business/CapabilityShowcase.tsx'), /<LocaleLink\s+to=\{serviceHref\(service\.id\)\}/);
});

test('timing: 5s per capability, first hand-over offset from the hero drift', () => {
  assert.equal(SHOWCASE_PERIOD_MS, 5000);
  assert.ok(SHOWCASE_FIRST_DELAY_MS > SHOWCASE_PERIOD_MS && SHOWCASE_FIRST_DELAY_MS % 5000 !== 0, 'never in step with the 5s hero poses');
  // The cross-fade finishes inside the 5s window: the next title has settled well before its own turn ends.
  assert.ok(SHOWCASE_TRANSITION.enterDelayS + SHOWCASE_TRANSITION.enterS < 1.2);
  assert.match(read('../src/styles/brand.css'), /animation: hero-drift 20s /);
});

test('sequence helpers wrap and count', () => {
  assert.equal(nextIndex(7), 0);
  assert.equal(prevIndex(0), 7);
  assert.equal(counterLabel(0), '01 / 08');
  assert.equal(counterLabel(7), '08 / 08');
});

test('keyboard model: arrows wrap, Home / End jump, other keys ignored', () => {
  assert.equal(keyToIndex('ArrowRight', 7), 0);
  assert.equal(keyToIndex('ArrowLeft', 0), 7);
  assert.equal(keyToIndex('ArrowDown', 2), 3);
  assert.equal(keyToIndex('Home', 5), 0);
  assert.equal(keyToIndex('End', 1), 7);
  assert.equal(keyToIndex('Enter', 3), null);
  assert.equal(keyToIndex('a', 3), null);
});

test('swipe: horizontal and long enough, never a vertical scroll', () => {
  assert.equal(swipeToIndex(-80, 5, 0), 1);
  assert.equal(swipeToIndex(80, 5, 0), 7);
  assert.equal(swipeToIndex(-20, 0, 0), null);
  assert.equal(swipeToIndex(-60, 90, 0), null);
});

test('one timer per state, cleaned up; paused under reduced motion, hidden tab or off-screen', () => {
  const component = code('../src/components/business/CapabilityShowcase.tsx');
  assert.doesNotMatch(component, /setInterval/);
  assert.match(component, /const timer = window\.setTimeout\(/);
  assert.match(component, /return \(\) => window\.clearTimeout\(timer\)/);
  assert.match(component, /const running = !reduced && pageVisible && inView && !holding;/);
  assert.match(component, /if \(!running\) return undefined;/);
  // The ambient signal only exists while live; CSS loops stop under reduced motion.
  assert.match(component, /\{animate && activeNode \?/);
  assert.match(read('../src/styles/showcase.css'), /prefers-reduced-motion: reduce\)\s*\{\s*\.showcase-orbit,\s*\.showcase-halo,\s*\.showcase-progress\s*\{\s*animation: none;/);
});

test('selector is a tablist with a tabpanel, and nothing announces the auto changes', () => {
  const component = code('../src/components/business/CapabilityShowcase.tsx');
  for (const pattern of [/role="tablist"/, /role="tab"/, /role="tabpanel"/, /aria-selected=\{selected\}/, /aria-controls=\{panelId\}/, /aria-labelledby=\{tabId\(service\.id\)\}/, /tabIndex=\{selected \? 0 : -1\}/, /onKeyDown=\{onTabKey\}/]) {
    assert.match(component, pattern);
  }
  assert.doesNotMatch(component, /aria-live|role="status"|role="alert"/);
  assert.match(component, /<div aria-hidden="true" className="pointer-events-none/, 'the map is decorative');
});

test('the marquee is gone', () => {
  assert.ok(!existsSync(new URL('../src/components/business/KineticMarquee.tsx', import.meta.url)));
  const home = read('../src/pages/business/Home.tsx');
  assert.match(home, /<CapabilityShowcase \/>/);
  assert.doesNotMatch(home, /KineticMarquee/);
  assert.doesNotMatch(read('../src/styles/global.css'), /\.marquee-track|\.marquee-mask/);
});

test('the map is one stable topology: eight distinct nodes inside the view box', () => {
  assert.deepEqual(graphNodes.map((node) => node.id), [...SHOWCASE_IDS]);
  for (const node of graphNodes) {
    assert.ok(node.x > 0 && node.x < GRAPH.width && node.y > 0 && node.y < GRAPH.height, node.id);
    assert.match(node.path, /^M280 210 Q/);
  }
  assert.equal(new Set(graphNodes.map((node) => `${node.x},${node.y}`)).size, 8);
});
