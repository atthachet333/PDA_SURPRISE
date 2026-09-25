import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import * as about from '../src/i18n/about.ts';
import { pageMeta } from '../src/lib/seo.ts';
import { caseStudies } from '../src/data/caseStudies.ts';
import { company, metrics, process } from '../src/data/company.ts';
import { primaryServices } from '../src/data/services.ts';

/**
 * EP41 — About is a concise company story: who we are, how we think, what we
 * build, why the work is credible. These guard its structure and its truth
 * without snapshotting any visuals.
 */

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const ABOUT = read('../src/pages/business/About.tsx');
const SECTIONS = read('../src/components/business/AboutSections.tsx');
const TRUST = read('../src/components/business/TrustSections.tsx');
const LOCALES = ['th', 'en', 'zh'];

function* strings(value) {
  if (typeof value === 'string') yield value;
  else if (Array.isArray(value)) for (const item of value) yield* strings(item);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) yield* strings(item);
}

/** The copy About actually renders — the aftercare grid shows only handover and ongoing care. */
const RENDERED = [
  ...strings(about.aboutPage),
  ...strings(about.buildGroups),
  ...strings(about.philosophyText),
  ...strings(about.aftercareText[3]),
  ...strings(about.aftercareText[4])
].join('\n');

test('About renders the nine story sections in order, then one CTA', () => {
  const order = ['<PageHeader', '<AboutStory', '<WhatWeBuild', '<HowWeThink', '<AboutEvidence', '<ProcessPath', '<TechQuality', '<AboutSupport', '<CompanyInfo', '<BigCTA'];
  const positions = order.map((tag) => ABOUT.indexOf(tag));
  positions.forEach((position, index) => assert.ok(position > 0, `${order[index]} is missing from About`));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'About sections are out of order');
  /* Sections moved to other pages are not repeated here. */
  ['<ScopeFactors', '<VerifiedMetrics', '<StrengthStatements', '<TechDiagram', 'targetMarket'].forEach((tag) =>
    assert.ok(!ABOUT.includes(tag), `About repeats ${tag}, which lives on another page`)
  );
  /* One h1: PageHeader owns it; no About section declares another. */
  assert.ok(!/<h1[\s>]/.test(ABOUT + SECTIONS));
});

test('every EP40 anchor still resolves on About', () => {
  const source = ABOUT + SECTIONS + TRUST;
  ['process', 'technology', 'quality', 'support', 'company'].forEach((id) =>
    assert.ok(source.includes(`id="${id}"`), `/about#${id} no longer resolves`)
  );
  /* The process note points at the scope block on Services. */
  assert.ok(ABOUT.includes('/services#scope'));
  assert.ok(TRUST.includes('id="scope"'));
  assert.equal(process.length, 7, 'the canonical process keeps seven stages');
});

test('evidence is read from data, never typed', () => {
  assert.deepEqual(metrics.map((metric) => metric.value), [6, 4]);
  assert.ok(SECTIONS.includes('caseStudies.length'), 'the case-study count must come from data');
  assert.ok(SECTIONS.includes('metrics.map'), 'the verified metrics must come from data');
  assert.ok(!/\b\d+\b/.test([...strings(about.buildGroups)].join(' ')), 'capability copy types a number');
  const slugs = new Set(caseStudies.map((study) => study.slug));
  about.evidenceCases.forEach((slug) => assert.ok(slugs.has(slug), `${slug} is not a case study`));
});

test('capability summary links into the canonical services', () => {
  const ids = new Set(primaryServices.map((service) => service.id));
  assert.equal(about.buildGroups.length, 5, 'About summarises; it does not list all eight services');
  about.buildGroups.forEach((group) => {
    const [path, hash] = group.to.split('#');
    assert.equal(path, '/services');
    assert.ok(ids.has(hash), `${group.to} is not a core service`);
    LOCALES.forEach((locale) => assert.ok(group.label[locale].trim() && group.line[locale].trim()));
  });
});

test('company information is canonical and matches the schema', () => {
  assert.equal(company.legalNameTh, 'บริษัท พีดีเอ บลิส จำกัด');
  assert.equal(company.legalName, 'PDA BLISS COMPANY LIMITED');
  assert.equal(company.phone, '0638693614');
  assert.equal(company.email, 'pdablissoffice@gmail.com');
  assert.equal(company.lineOA, '@593oiwec');
  /* The hero and the company block name the company from the same source the schema uses. */
  assert.ok(ABOUT.includes('company.legalName') && ABOUT.includes('company.legalNameTh'));
  const schema = read('../src/lib/structuredData.ts') /* EP44: schema builder */;
  assert.match(schema, /legalName:\s*company\.legalName/);
  assert.match(schema, /alternateName:\s*company\.legalNameTh/);
});

test('About adds no unverified claim or firm commitment', () => {
  const banned = [
    /ประกันสังคม|social security|社保|社会保险/i,
    /ภาษี|\btax\b|税/i,
    /หลายบริษัท|multi-company|多公司/i,
    /ลายเซ็นดิจิทัล|digital signature|电子签名/i,
    /ไม่มีสัญญาณ|offline|离线/i,
    /บาร์โค้ด|barcode|条码/i,
    /สำรองข้อมูล|backup|备份/i,
    /App Store|Play Store|สโตร์|应用商店/i,
    /2 สัปดาห์|every 2 weeks|每 ?2 ?周/i,
    /ทุกสัปดาห์|weekly|每周/i,
    /PostgreSQL|Docker|container|คอนเทนเนอร์|容器/i,
    /24\s*\/\s*7|unlimited|lifetime|guarantee|ไม่จำกัด|ตลอดชีพ|รับประกัน|无限|终身|保证/i,
    /Google APIs?/i,
    /ISO|SOC\s*2|certif|award|รางวัล|认证|奖项/i,
    /digital transformation|innovative|world-class|leading|ที่สุด|领先|最佳/i
  ];
  banned.forEach((pattern) => assert.ok(!pattern.test(RENDERED), `About copy matches ${pattern}`));
  /* The standards list (PostgreSQL, containers) is no longer rendered. */
  assert.ok(!ABOUT.includes('standards') && !SECTIONS.includes('standards'));
});

test('About copy is complete in TH / EN / ZH', () => {
  const triples = [
    ...Object.values(about.aboutPage),
    ...about.buildGroups.flatMap((group) => [group.label, group.line]),
    ...about.philosophyText.flatMap((item) => [item.heading, item.body])
  ];
  triples.forEach((triple) =>
    LOCALES.forEach((locale) => {
      const value = triple[locale];
      assert.ok(Array.isArray(value) ? value.length && value.every((line) => line.trim()) : value.trim(), 'empty About copy');
    })
  );
  assert.equal(about.aboutPage.heroTitle.en.length, about.aboutPage.heroTitle.th.length);
});

test('About metadata describes the company, not a service list', () => {
  LOCALES.forEach((locale) => {
    assert.match(pageMeta.about.title[locale], /PDA BLISS/);
    assert.ok(pageMeta.about.description[locale].includes('PDA BLISS COMPANY LIMITED'));
  });
});
