import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import * as trust from '../src/i18n/trust.ts';
import * as preview from '../src/i18n/trustPreview.ts';
import * as about from '../src/i18n/about.ts';
import { primaryServices } from '../src/data/services.ts';
import { businessHours } from '../src/i18n/company.ts';
import { caseStudies } from '../src/data/caseStudies.ts';
import { company, metrics, metricsVerified, process, techStack } from '../src/data/company.ts';

/**
 * EP40 — the trust layer may only show evidence.
 *
 *   verified facts   metrics, contact details and hours stay canonical
 *   no inflation     no guarantees, certifications, awards or rankings
 *   no amplification of claims still awaiting an owner decision
 *   evidence         every tool traces to delivered work; every link resolves
 *   schema           Organization structured data holds truthful fields only
 */

const LOCALES = ['th', 'en', 'zh'];
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

/** Every string reachable from a value. */
function* strings(value) {
  if (typeof value === 'string') yield value;
  else if (Array.isArray(value)) for (const item of value) yield* strings(item);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) yield* strings(item);
}

const TRUST_COPY = [...strings(trust), ...strings(preview)].join('\n');

test('verified metrics are unchanged and nothing claims more', () => {
  assert.equal(metricsVerified, true);
  assert.deepEqual(metrics.map((metric) => metric.value), [6, 4]);
  assert.deepEqual(metrics.map((metric) => metric.label), ['ระบบซอฟต์แวร์', 'เว็บไซต์']);
  /* Numbers in trust copy are slots filled from data, never typed. */
  const typedFigures = [...strings(preview.trustTiles), ...strings(about.buildGroups)].filter((text) => /\b\d+\b|\d+\s*(\+|%)/.test(text));
  assert.deepEqual(typedFigures, [], `trust copy types a figure instead of using a slot:\n${typedFigures.join('\n')}`);
  assert.ok(caseStudies.length >= 1);
  assert.equal(process.length, 7, 'the canonical process has seven stages');
});

test('company contact truth is canonical', () => {
  assert.equal(company.legalNameTh, 'บริษัท พีดีเอ บลิส จำกัด');
  assert.equal(company.legalName, 'PDA BLISS COMPANY LIMITED');
  assert.equal(company.phone, '0638693614');
  assert.equal(company.email, 'pdablissoffice@gmail.com');
  assert.equal(company.lineOA, '@593oiwec');
  assert.deepEqual([...company.address.lines], ['14/14 ซอยกรุงเทพ-นนท์ 21', 'ถนนกรุงเทพ-นนท์', 'แขวงบางซื่อ เขตบางซื่อ', 'กรุงเทพมหานคร 10800']);
  LOCALES.forEach((locale) => assert.match(businessHours.time[locale], /08:30\s*–\s*17:30/));
  /* No invented identity facts. */
  assert.equal(company.foundedVerified, false);
  assert.equal(company.founded, null);
});

test('trust and support copy makes no unsupported guarantee', () => {
  const banned = [
    /24\s*\/\s*7/, /round the clock/i, /unlimited/i, /lifetime/i, /instant/i, /guarantee/i, /100\s*%/, /never be hacked/i, /military/i,
    /ตลอด 24/, /ไม่จำกัด/, /ตลอดชีพ/, /ทันที/, /รับประกัน/, /ปลอดภัย 100/,
    /全天候/, /无限/, /终身/, /立即响应/, /保证/, /百分之百/
  ];
  banned.forEach((pattern) => assert.ok(!pattern.test(TRUST_COPY), `trust copy matches ${pattern}`));
  /* The honest support model is stated in every language. */
  LOCALES.forEach((locale) => assert.ok(trust.supportCopy.model[locale].length > 40));
  assert.match(trust.supportCopy.model.th, /ขึ้นอยู่กับขอบเขตและลักษณะของแต่ละโปรเจกต์/);
});

test('no fake certification, award or authority signal', () => {
  const banned = [
    /\bISO\b/, /SOC\s*2/i, /certif/i, /accredit/i, /award/i, /penetration/i, /pen-?test/i, /world-class/i, /enterprise-grade/i,
    /leading/i, /\bbest\b/i, /number one|#1/i, /trusted by/i, /clients worldwide/i,
    /อันดับหนึ่ง/, /ที่สุด/, /รางวัล/, /ใบรับรอง/, /มาตรฐานสากล/,
    /认证/, /奖项/, /第一/, /最佳/, /领先/, /顶级/
  ];
  banned.forEach((pattern) => assert.ok(!pattern.test(TRUST_COPY), `trust copy matches ${pattern}`));
});

test('claims awaiting an owner decision are not introduced', () => {
  const unresolved = [
    /ประกันสังคม/, /ภาษี/, /social security/i, /\btax\b/i, /社保|社会保险/, /税/,
    /App Store/, /Play Store/, /应用商店/, /สโตร์/,
    /สำรองข้อมูล/, /backup/i, /备份/,
    /หลายบริษัท/, /multi-company/i, /多公司/,
    /ลายเซ็นดิจิทัล/, /digital signature/i, /电子签名/,
    /ไม่มีสัญญาณ/, /offline/i, /无信号/
  ];
  unresolved.forEach((pattern) => assert.ok(!pattern.test(TRUST_COPY), `trust copy amplifies an unresolved claim: ${pattern}`));
});

test('scope, price and time are never fixed', () => {
  assert.ok(!/฿|THB|baht|泰铢|\d+\s*(วัน|สัปดาห์|เดือน|days?|weeks?|months?|天|周|个月)/i.test(TRUST_COPY), 'trust copy states a price or a duration');
  LOCALES.forEach((locale) => assert.equal(trust.scopeCopy.factors[locale].length, 6));
});

test('every technology traces to delivered work', () => {
  const slugs = new Map(caseStudies.map((study) => [study.slug, study]));
  /* The corporate website is this repository, so its deployment files are its evidence. */
  const repoEvidence = [read('../../DEPLOYMENT.md'), read('../../ecosystem.config.cjs'), read('../../backend/package.json')].join('\n');
  const names = techStack.flatMap((group) => group.items.map((item) => item.name));
  techStack.forEach((group) =>
    group.items.forEach((item) => {
      assert.ok(item.evidence.length > 0, `${item.name} has no evidence`);
      item.evidence.forEach((slug) => {
        const study = slugs.get(slug);
        assert.ok(study, `${item.name} cites unknown case ${slug}`);
        const haystack = [...study.technicalNotes, ...(slug === 'corporate-website-system' ? [repoEvidence] : [])].join('\n').toLowerCase();
        assert.ok(haystack.includes(item.name.toLowerCase()), `${item.name} is not evidenced by ${slug}`);
      });
    })
  );
  ['PostgreSQL', 'MariaDB', 'Docker'].forEach((name) => assert.ok(!names.includes(name), `${name} is not used by any delivered case study`));
  assert.equal(new Set(names).size, names.length);
  /* Every tool and group is localised. */
  techStack.forEach((group) => {
    assert.ok(trust.techText[group.group], `${group.group} has no localised name`);
    group.items.forEach((item) => assert.ok(trust.techText[group.group].notes[item.name], `${item.name} has no localised note`));
  });
});

test('every trust link resolves to real work or a real section', () => {
  const caseSlugs = new Set(caseStudies.map((study) => study.slug));
  const aboutSource = [
    read('../src/pages/business/About.tsx'),
    read('../src/components/business/AboutSections.tsx'),
    read('../src/components/business/TrustSections.tsx')
  ].join('\n');
  const aboutIds = new Set([...aboutSource.matchAll(/\bid="([a-z-]+)"/g)].map((m) => m[1]));
  const targets = [...about.buildGroups.map((group) => group.to), ...about.evidenceCases.map((slug) => `/work/${slug}`), ...preview.trustTiles.map((tile) => tile.to), '/about#process', '/about#company', '/about#technology', '/about#quality', '/about#support', '/services#scope'];
  targets.forEach((to) => {
    if (to.startsWith('#')) return assert.ok(aboutIds.has(to.slice(1)), `${to} is not a section on /about`);
    const [path, hash] = to.split('#');
    if (path.startsWith('/work/')) return assert.ok(caseSlugs.has(path.slice(6)), `${to} is not a case study`);
    assert.ok(['/work', '/solutions', '/about', '/contact', '/services'].includes(path), `${to} is not a public route`);
    /* /services#<id>: each core service section takes its id from data. */
    if (path === '/services' && primaryServices.some((service) => service.id === hash)) return;
    if (hash) {
      const pageSource = path === '/work' ? read('../src/pages/business/Work.tsx') : path === '/services' ? [read('../src/pages/business/Services.tsx'), read('../src/components/business/ServiceCatalogue.tsx'), aboutSource].join('\n') : aboutSource;
      assert.ok(pageSource.includes(`id="${hash}"`), `${to} points at a missing section`);
    }
  });
  ['process', 'technology', 'quality', 'support', 'company'].forEach((id) => assert.ok(aboutIds.has(id), `/about#${id} is missing`));
});

test('Organization structured data holds truthful fields only', () => {
  const source = read('../src/components/business/OrganizationSchema.tsx').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.match(source, /legalName:\s*company\.legalName/);
  assert.match(source, /alternateName:\s*company\.legalNameTh/);
  assert.match(source, /email:\s*company\.email/);
  assert.match(source, /addressCountry:\s*'TH'/);
  /* One canonical address for every locale — no locale-dependent address. */
  assert.match(source, /streetAddress:\s*`\$\{company\.address\.lines\[0\]\}/);
  ['aggregateRating', 'review', 'award', 'numberOfEmployees', 'foundingDate', 'priceRange', 'knowsLanguage', 'hasCredential'].forEach((field) =>
    assert.ok(!new RegExp(`\\b${field}\\b`).test(source), `schema claims ${field}`)
  );
});
