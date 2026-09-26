/**
 * EP46.6.2 — business transformation showcase (problem → PDA BLISS SOLUTION →
 * result). Contract tests: scenario data and sources, copy completeness and
 * claim safety, the state machine (timing, wrap, stage holds, rapid input),
 * keyboard and swipe models, CTA targets, reduced motion and accessibility
 * wiring, and that Home no longer repeats the /solutions system map.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  FIRST_EXTRA_MS,
  MANUAL_HOLD_MS,
  SCENARIO_COUNT,
  SCENARIO_PERIOD_MS,
  STAGE_HOLD_MS,
  SWIPE_PX,
  counterLabel,
  delayFor,
  initialState,
  keyToScenario,
  reduce,
  serviceHref,
  swipeDirection,
  transformationScenarios
} from '../src/data/transformations.ts';
import { primaryServices } from '../src/data/services.ts';
import { localizeService } from '../src/i18n/services.ts';
import en from '../src/i18n/content/en.ts';
import zh from '../src/i18n/content/zh.ts';
import { transformation, transformationItems } from '../src/i18n/home.ts';
import { LOCALES } from '../src/i18n/locales.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const code = (path) => read(path).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const COMPONENT = '../src/components/business/TransformationShowcase.tsx';

test('six scenarios, each on a canonical EP38 service', () => {
  assert.equal(SCENARIO_COUNT, 6);
  assert.deepEqual(
    transformationScenarios.map((scenario) => [scenario.id, scenario.serviceId]),
    [
      ['erp', 'business-systems'],
      ['payroll', 'payroll'],
      ['hr-line', 'hr-line-bot'],
      ['documents', 'document-management'],
      ['web-app', 'web-applications'],
      ['website', 'websites']
    ]
  );
  const ids = new Set(primaryServices.map((service) => service.id));
  for (const scenario of transformationScenarios) assert.ok(ids.has(scenario.serviceId), scenario.serviceId);
});

test('problem and solution come from the service record, in every language', () => {
  const source = code(COMPONENT);
  for (const field of ['service.problem', 'service.problems.slice(0, 2)', 'service.title', 'service.deliverables.slice(0, 2)']) {
    assert.ok(source.includes(field), `showcase no longer reads ${field}`);
  }
  for (const { serviceId } of transformationScenarios) {
    const service = primaryServices.find((entry) => entry.id === serviceId);
    for (const pack of [en, zh]) {
      const local = localizeService(service, pack);
      assert.ok(local.problem && local.problem !== service.problem, `${serviceId} problem not localized`);
      assert.ok(local.problems.length >= 2 && local.deliverables.length >= 2, serviceId);
    }
    assert.ok(service.problems.length >= 2 && service.deliverables.length >= 2, serviceId);
  }
});

test('showcase copy is complete in TH / EN / ZH', () => {
  assert.deepEqual(Object.keys(transformationItems), transformationScenarios.map((scenario) => scenario.id));
  for (const [id, item] of Object.entries(transformationItems)) {
    for (const locale of LOCALES) {
      assert.ok(item.short[locale].trim() && item.result[locale].trim(), `${id} ${locale}`);
      assert.equal(item.resultPoints[locale].length, 2, `${id} points ${locale}`);
      item.resultPoints[locale].forEach((point) => assert.ok(point.trim(), `${id} empty point ${locale}`));
    }
  }
  for (const [key, value] of Object.entries(transformation)) for (const locale of LOCALES) assert.ok(value[locale].trim(), `${key} ${locale}`);
  // No Thai left in the EN / ZH results.
  for (const item of Object.values(transformationItems)) {
    for (const locale of ['en', 'zh']) assert.doesNotMatch([item.result[locale], ...item.resultPoints[locale]].join(' '), /[฀-๿]/);
  }
});

test('results stay qualitative: no numbers, guarantees or owner-decision capabilities', () => {
  const all = Object.values(transformationItems).flatMap((item) => LOCALES.flatMap((locale) => [item.result[locale], ...item.resultPoints[locale]])).join(' \n ');
  assert.doesNotMatch(all, /\d+\s*%|\d+\s*(x|เท่า|倍)\b/i, 'no measured improvement claims');
  assert.doesNotMatch(
    all,
    /guarantee|รับประกัน|保证|social security|ประกันสังคม|社保|\btax\b|ภาษี|税|backup|สำรองข้อมูล|备份|app store|google play|offline|ออฟไลน์|离线|digital signature|ลายเซ็นดิจิทัล|电子签名|multi-?company|หลายบริษัท|多公司|barcode|บาร์โค้ด|条形码|ranking|อันดับ|排名|revenue|รายได้|营收/i
  );
});

test('CTA opens the scenario service on /services', () => {
  assert.match(read('../src/components/business/ServiceCatalogue.tsx'), /id=\{service\.id\}/);
  for (const { serviceId } of transformationScenarios) assert.equal(serviceHref(serviceId), `/services#${serviceId}`);
  assert.match(code(COMPONENT), /href: serviceHref\(serviceId\)/);
  assert.match(code(COMPONENT), /<LocaleLink\s+to=\{scenario\.href\}/);
});

test('the 5-second story: problem → solution → result → next scenario', () => {
  assert.equal(SCENARIO_PERIOD_MS, 5000);
  assert.deepEqual(STAGE_HOLD_MS, { problem: 1400, solution: 1400, result: 2200 });
  let state = initialState;
  const seen = [];
  let elapsed = 0;
  for (let step = 0; step < 18; step += 1) {
    elapsed += delayFor(state);
    state = reduce(state, { type: 'tick' });
    seen.push(`${state.scenario}:${state.stage}`);
  }
  assert.deepEqual(seen.slice(0, 4), ['0:solution', '0:result', '1:problem', '1:solution']);
  assert.equal(seen[17], '0:problem', 'six scenarios wrap back to the first');
  assert.equal(elapsed, 6 * 5000);
  // First step waits longer so the first hand-over is offset from the hero's 5s poses.
  assert.equal(delayFor(initialState, true), STAGE_HOLD_MS.problem + FIRST_EXTRA_MS);
  assert.ok((SCENARIO_PERIOD_MS + FIRST_EXTRA_MS) % 5000 !== 0);
});

test('previous / next wrap and always restart at the problem', () => {
  const mid = { scenario: 3, stage: 'result', manual: true };
  assert.deepEqual(reduce(mid, { type: 'next' }), { scenario: 4, stage: 'problem', manual: false });
  assert.deepEqual(reduce(initialState, { type: 'prev' }), { scenario: 5, stage: 'problem', manual: false });
  assert.deepEqual(reduce({ scenario: 5, stage: 'solution', manual: false }, { type: 'next' }), { scenario: 0, stage: 'problem', manual: false });
});

test('direct scenario selection and stage selection', () => {
  assert.deepEqual(reduce({ scenario: 1, stage: 'result', manual: true }, { type: 'select', scenario: 4 }), { scenario: 4, stage: 'problem', manual: false });
  assert.deepEqual(reduce(initialState, { type: 'select', scenario: 9 }), { scenario: 3, stage: 'problem', manual: false }, 'out-of-range wraps');
  const picked = reduce({ scenario: 2, stage: 'problem', manual: false }, { type: 'stage', stage: 'result' });
  assert.deepEqual(picked, { scenario: 2, stage: 'result', manual: true });
  // A chosen stage is held for 5s, then the story carries on from it.
  assert.equal(delayFor(picked), MANUAL_HOLD_MS);
  assert.deepEqual(reduce(picked, { type: 'tick' }), { scenario: 3, stage: 'problem', manual: false });
  assert.deepEqual(reduce(reduce(initialState, { type: 'stage', stage: 'solution' }), { type: 'tick' }), { scenario: 0, stage: 'result', manual: false });
});

test('rapid input always lands on one valid state', () => {
  const actions = [
    { type: 'next' }, { type: 'prev' }, { type: 'select', scenario: 5 }, { type: 'stage', stage: 'result' }, { type: 'tick' },
    { type: 'next' }, { type: 'next' }, { type: 'stage', stage: 'solution' }, { type: 'select', scenario: -1 }, { type: 'tick' }, { type: 'prev' }
  ];
  let state = initialState;
  for (let round = 0; round < 50; round += 1) {
    for (const action of actions) {
      state = reduce(state, action);
      assert.ok(Number.isInteger(state.scenario) && state.scenario >= 0 && state.scenario < SCENARIO_COUNT, JSON.stringify(state));
      assert.ok(['problem', 'solution', 'result'].includes(state.stage));
      assert.equal(typeof state.manual, 'boolean');
    }
  }
});

test('one timer at a time, restarted by every visitor action; paused when not running', () => {
  const source = code(COMPONENT);
  assert.doesNotMatch(source, /setInterval/);
  assert.match(source, /const timer = window\.setTimeout\(/);
  assert.match(source, /return \(\) => window\.clearTimeout\(timer\)/);
  assert.match(source, /\}, \[running, state, nonce\]\);/);
  assert.match(source, /setNonce\(\(value\) => value \+ 1\)/);
  assert.match(source, /const running = !reduced && pageVisible && inView && !hovering && !focusInside;/);
  // Keyboard focus pauses; a mouse click (which leaves focus on the card) does not.
  assert.match(source, /matches\(':focus-visible'\)/);
});

test('rapid clicks cannot stack copies: stacked scenarios swap visibility, never mount/unmount', () => {
  const source = code(COMPONENT);
  assert.doesNotMatch(source, /AnimatePresence/);
  assert.match(source, /on \? \(reduced \? '' : 'tx-enter'\) : 'invisible'/);
  assert.match(source, /aria-hidden=\{on \? undefined : true\}/);
});

test('keyboard model for the scenario tabs', () => {
  assert.equal(keyToScenario('ArrowRight', 5), 0);
  assert.equal(keyToScenario('ArrowLeft', 0), 5);
  assert.equal(keyToScenario('Home', 4), 0);
  assert.equal(keyToScenario('End', 1), 5);
  assert.equal(keyToScenario('Enter', 2), null);
  assert.equal(counterLabel(2), '03 / 06');
});

test('swipe: clearly horizontal only; taps and vertical scrolls do nothing', () => {
  assert.equal(SWIPE_PX, 48);
  assert.equal(swipeDirection(-80, 6), 'next');
  assert.equal(swipeDirection(80, 6), 'prev');
  assert.equal(swipeDirection(-30, 0), null);
  assert.equal(swipeDirection(-60, 220), null);
  // A swipe that ends over a card must not also press that card.
  assert.match(code(COMPONENT), /swallowClick\.current = true;/);
});

test('reduced motion: no auto cycle, no signal motion, nothing dimmed', () => {
  const source = code(COMPONENT);
  assert.match(source, /const running = !reduced &&/);
  assert.match(source, /active \? 'opacity-100' : reduced \? 'opacity-100'/);
  const css = read('../src/styles/showcase.css');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.tx-enter\s*\{\s*animation: none;/);
  assert.match(css, /\.tx-confirm\s*\{\s*transition: none;/);
});

test('accessibility wiring: tabs, pressed stage buttons, labelled arrows, no live region', () => {
  const source = code(COMPONENT);
  for (const pattern of [
    /role="tablist"/,
    /role="tab"/,
    /role="tabpanel"/,
    /aria-selected=\{selected\}/,
    /tabIndex=\{selected \? 0 : -1\}/,
    /aria-pressed=\{active\}/,
    /label=\{t\(transformation\.prev\)\}/,
    /label=\{t\(transformation\.next\)\}/,
    /aria-label=\{label\}/,
    /h-11 w-11/
  ]) {
    assert.match(source, pattern);
  }
  assert.doesNotMatch(source, /aria-live|role="status"|role="alert"/);
});

test('Home no longer repeats the /solutions system map', () => {
  for (const gone of ['../src/components/business/CapabilityShowcase.tsx', '../src/data/capabilityShowcase.ts', '../src/components/business/KineticMarquee.tsx']) {
    assert.ok(!existsSync(new URL(gone, import.meta.url)), gone);
  }
  const home = read('../src/pages/business/Home.tsx');
  assert.match(home, /<TransformationShowcase \/>/);
  const source = code(COMPONENT);
  assert.doesNotMatch(source, /<ellipse|animateMotion|graphNodes|hub/i, 'no orbit, nodes or hub');
});

test('A&I is untouched by the showcase', () => {
  const source = read(COMPONENT);
  assert.doesNotMatch(source, /surprise|memory|anniversary|workspace/i);
});
