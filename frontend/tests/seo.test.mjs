import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';

import en from '../src/i18n/content/en.ts';
import zh from '../src/i18n/content/zh.ts';
import { company } from '../src/data/company.ts';
import { caseStudies } from '../src/data/caseStudies.ts';
import { insights, isInsightPublished } from '../src/data/insights.ts';
import { localizeCaseStudy } from '../src/i18n/caseStudies.ts';
import { HTML_LANG, LOCALES, localizePath } from '../src/i18n/locales.ts';
import { buildHead } from '../src/lib/head.ts';
import {
  PRIVATE_ROOTS,
  SOCIAL_IMAGE,
  caseStudyPageMeta,
  indexablePaths,
  pageMeta,
  privateMeta
} from '../src/lib/seo.ts';
import { buildRobots, buildSitemap, sitemapUrls } from '../src/lib/sitemap.ts';
import { organizationSchema, websiteSchema } from '../src/lib/structuredData.ts';
import { joinUrl, normalizePath, sanitizeOrigin } from '../src/lib/url.ts';

/**
 * EP44 — SEO, social and metadata.
 *
 * Content, not magic totals: the inventory is checked against the app's own
 * router and data, and every locale of every public page is checked for the
 * head it actually emits.
 */

const ORIGIN = 'https://www.pdabliss.example';
const PACKS = { th: null, en, zh };
const PRIVATE = ['/login', '/memory-gate', '/workspace', '/us'];
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const meta = (head, key) => head.metas.find((tag) => tag.key === key)?.content ?? null;
const PUBLIC_PAGES = ['home', 'services', 'solutions', 'work', 'insights', 'about', 'contact', 'privacy', 'cookiePolicy', 'terms'];

/* ─── the public route inventory ───────────────────────────────────────── */

test('the inventory is derived from the router and the data, and holds nothing private', () => {
  const app = read('../src/app/App.tsx');
  const routed = new Set([...app.matchAll(/<Route path="([^"]+)"/g)].map((match) => match[1]));
  for (const path of indexablePaths) {
    const pattern = path.startsWith('/work/') ? '/work/:slug' : path.startsWith('/insights/') ? '/insights/:slug' : path;
    assert.ok(routed.has(pattern), `${path} has no route in App.tsx`);
  }
  assert.equal(new Set(indexablePaths).size, indexablePaths.length, 'duplicate route in the inventory');
  for (const study of caseStudies) assert.ok(indexablePaths.includes(`/work/${study.slug}`), `${study.slug} missing`);
  assert.equal(indexablePaths.filter((path) => path.startsWith('/work/')).length, caseStudies.length);
  // Drafts redirect to /insights, so they are never offered.
  for (const insight of insights) {
    assert.equal(indexablePaths.includes(`/insights/${insight.slug}`), isInsightPublished(insight), insight.slug);
  }
  for (const path of indexablePaths) {
    assert.ok(!PRIVATE_ROOTS.some((root) => path === root || path.startsWith(`${root}/`)), `${path} is private`);
    assert.notEqual(path, '/404');
  }
});

/* ─── origin safety ────────────────────────────────────────────────────── */

test('one URL helper: unsafe origins degrade to relative, paths never double-slash', () => {
  assert.equal(sanitizeOrigin('https://www.pdabliss.example/'), ORIGIN);
  assert.equal(sanitizeOrigin(' https://www.pdabliss.example// '), ORIGIN);
  for (const bad of [
    '', 'http://www.pdabliss.example', 'https://localhost:1368', 'https://127.0.0.1', 'https://10.0.0.8',
    'https://192.168.1.20', 'https://172.20.0.1', 'https://intranet', 'https://files.local', 'https://srv.internal',
    'https://www.pdabliss.example/app', 'https://user:pw@www.pdabliss.example', 'https://www.pdabliss.example?x=1',
    'javascript:alert(1)', 'not a url', undefined
  ]) {
    assert.equal(sanitizeOrigin(bad), '', `accepted ${bad}`);
  }
  assert.equal(joinUrl(ORIGIN, '/'), `${ORIGIN}/`);
  assert.equal(joinUrl(`${ORIGIN}/`, '//en//services/'), `${ORIGIN}/en/services`);
  assert.equal(joinUrl('https://localhost', '/services'), '/services');
  assert.equal(normalizePath('work//payroll/'), '/work/payroll');
});

/* ─── multilingual head ────────────────────────────────────────────────── */

test('TH /services, EN /en/services and ZH /zh/services each emit their own head', () => {
  const heads = Object.fromEntries(LOCALES.map((locale) => [locale, buildHead(pageMeta.services, locale, ORIGIN)]));
  const expected = { th: '/services', en: '/en/services', zh: '/zh/services' };
  for (const locale of LOCALES) {
    const head = heads[locale];
    assert.equal(head.canonical, `${ORIGIN}${expected[locale]}`);
    assert.equal(meta(head, 'og:url'), head.canonical);
    assert.equal(head.title, pageMeta.services.title[locale]);
    assert.equal(meta(head, 'description'), pageMeta.services.description[locale]);
    assert.equal(meta(head, 'robots'), 'index, follow');
    assert.deepEqual(head.alternates, [
      { hreflang: 'th', href: `${ORIGIN}/services` },
      { hreflang: 'en', href: `${ORIGIN}/en/services` },
      { hreflang: 'zh-Hans', href: `${ORIGIN}/zh/services` },
      { hreflang: 'x-default', href: `${ORIGIN}/services` }
    ]);
    assert.equal(meta(head, 'og:image'), `${ORIGIN}${SOCIAL_IMAGE.path}`);
    assert.equal(meta(head, 'twitter:card'), 'summary_large_image');
  }
  assert.deepEqual(HTML_LANG, { th: 'th', en: 'en', zh: 'zh-Hans' });
  assert.equal(new Set(LOCALES.map((locale) => heads[locale].title)).size, 3, 'titles are not localized');
  assert.equal(meta(heads.en, 'og:locale'), 'en_US');
  assert.equal(meta(heads.zh, 'og:locale'), 'zh_CN');
});

test('every public page has one canonical per locale, and titles and descriptions are unique', () => {
  for (const locale of LOCALES) {
    const titles = new Set();
    const descriptions = new Set();
    for (const page of PUBLIC_PAGES) {
      const head = buildHead(pageMeta[page], locale, ORIGIN);
      assert.equal(head.canonical, joinUrl(ORIGIN, localizePath(pageMeta[page].path, locale)), `${locale} ${page}`);
      assert.equal(head.alternates.length, 4, `${locale} ${page} alternates`);
      assert.match(head.title, /PDA BLISS/, `${locale} ${page} title`);
      assert.ok(head.title.length <= 70, `${locale} ${page} title is ${head.title.length} chars`);
      titles.add(head.title);
      descriptions.add(meta(head, 'description'));
    }
    assert.equal(titles.size, PUBLIC_PAGES.length, `${locale}: repeated titles`);
    assert.equal(descriptions.size, PUBLIC_PAGES.length, `${locale}: repeated descriptions`);
  }
});

test('without a public origin nothing absolute is invented', () => {
  const head = buildHead(pageMeta.work, 'en', '');
  assert.equal(head.canonical, '/en/work');
  assert.deepEqual(head.alternates, []);
  assert.equal(head.breadcrumbs, null);
  for (const key of ['og:url', 'og:image', 'twitter:image']) assert.equal(meta(head, key), null, key);
  assert.equal(meta(head, 'twitter:card'), 'summary');
  assert.equal(websiteSchema('th', ''), null);
  assert.equal(organizationSchema('th', '').url, undefined);
  assert.equal(buildSitemap(''), null);
  assert.deepEqual(sitemapUrls('http://localhost:1368'), []);
});

/* ─── private routes and 404 ───────────────────────────────────────────── */

test('private routes and the 404 are noindex, nofollow with no canonical to claim', () => {
  for (const noindex of [privateMeta, pageMeta.notFound]) {
    for (const locale of LOCALES) {
      const head = buildHead(noindex, locale, ORIGIN);
      assert.equal(meta(head, 'robots'), 'noindex, nofollow');
      assert.equal(head.canonical, null, 'a noindex page must not canonicalize — least of all to Home');
      assert.equal(meta(head, 'og:url'), null);
      assert.deepEqual(head.alternates, []);
      assert.equal(head.breadcrumbs, null);
    }
  }
  // Private metadata gives nothing personal away.
  assert.equal(privateMeta.title, 'PDA BLISS');
  assert.doesNotMatch(`${privateMeta.title} ${privateMeta.description}`, /anniversary|A&I|love|wedding|ครบรอบ|แต่งงาน/i);
  for (const page of ['Login.tsx', '../surprise/MemoryGate.tsx', '../surprise/Workspace.tsx', '../surprise/Experience.tsx']) {
    assert.match(read(`../src/pages/business/${page}`), /usePageMeta\(privateMeta\)/, `${page} lost its noindex`);
  }
});

/* ─── case studies ─────────────────────────────────────────────────────── */

test('every case study: stable slug, localized metadata, correct canonical and breadcrumb, no live URL', () => {
  const forbidden = /https?:\/\/|localhost|\b\d{1,3}(\.\d{1,3}){3}\b|\/admin|\/login|\/dashboard|token=|\.internal|\.local\b/i;
  for (const source of caseStudies) {
    const titles = new Set();
    for (const locale of LOCALES) {
      const study = localizeCaseStudy(source, PACKS[locale]);
      assert.equal(study.slug, source.slug, 'slugs are never localized');
      const head = buildHead(caseStudyPageMeta(study), locale, ORIGIN);
      assert.equal(head.canonical, `${ORIGIN}${localizePath(`/work/${source.slug}`, locale)}`);
      assert.equal(head.alternates.find((alt) => alt.hreflang === 'x-default')?.href, `${ORIGIN}/work/${source.slug}`);
      assert.equal(meta(head, 'robots'), 'index, follow');
      titles.add(head.title);
      const items = head.breadcrumbs.itemListElement;
      assert.deepEqual(items.map((item) => item.item), [
        joinUrl(ORIGIN, localizePath('/', locale)),
        `${ORIGIN}${localizePath('/work', locale)}`,
        `${ORIGIN}${localizePath(`/work/${source.slug}`, locale)}`
      ]);
      assert.equal(items[2].name, study.title);
      const text = [head.title, ...head.metas.map((tag) => tag.content ?? '').filter((value) => !value.startsWith(ORIGIN))].join(' ');
      assert.doesNotMatch(text, forbidden, `${source.slug} ${locale} leaks a URL or internal detail`);
      if (source.liveUrl) assert.ok(!text.includes(new URL(source.liveUrl).host), `${source.slug} exposes its live host`);
    }
    assert.equal(titles.size, 3, `${source.slug} title not localized`);
  }
});

/* ─── structured data ──────────────────────────────────────────────────── */

test('Organization facts come from data/company.ts and nothing unverified is claimed', () => {
  const org = organizationSchema('en', ORIGIN);
  assert.equal(org.name, 'PDA BLISS');
  assert.equal(org.name, company.companyName);
  assert.equal(org.legalName, 'PDA BLISS COMPANY LIMITED');
  assert.equal(org.legalName, company.legalName);
  assert.equal(org.email, 'pdablissoffice@gmail.com');
  assert.equal(org.email, company.email);
  assert.equal(org.telephone, '+66638693614');
  assert.equal(company.phone, '0638693614');
  assert.equal(org.url, `${ORIGIN}/`);
  assert.equal(org.address.streetAddress, '14/14 ซอยกรุงเทพ-นนท์ 21 ถนนกรุงเทพ-นนท์');
  assert.equal(org.address.addressLocality, company.address.district);
  assert.equal(org.address.addressRegion, 'กรุงเทพมหานคร');
  assert.equal(org.address.postalCode, '10800');
  assert.equal(org.address.addressCountry, 'TH');
  assert.equal(company.addressOneLine, company.address.lines.join(' '));
  // The address is identical in every locale; only the description follows the page.
  for (const locale of LOCALES) assert.deepEqual(organizationSchema(locale, ORIGIN).address, org.address);
  const hours = org.openingHoursSpecification[0];
  assert.ok(company.businessHours.time.includes(hours.opens) && company.businessHours.time.includes(hours.closes));
  assert.ok(!hours.dayOfWeek.includes('Sunday'));
  const json = JSON.stringify(org);
  for (const key of ['foundingDate', 'founder', 'numberOfEmployees', 'aggregateRating', 'review', 'award', 'hasCredential', 'priceRange', 'knowsLanguage', 'availableLanguage', 'logo']) {
    assert.ok(!json.includes(`"${key}"`), `unverified ${key} claimed`);
  }
  assert.deepEqual(org.sameAs, ['https://line.me/R/ti/p/@593oiwec']);
});

test('WebSite schema is the real site: three languages, no fake search', () => {
  const site = websiteSchema('th', ORIGIN);
  assert.equal(site['@type'], 'WebSite');
  assert.equal(site.url, `${ORIGIN}/`);
  assert.deepEqual(site.inLanguage, ['th', 'en', 'zh-Hans']);
  assert.equal(site.publisher['@id'], organizationSchema('th', ORIGIN)['@id']);
  assert.ok(!('potentialAction' in site), 'no SearchAction: the site has no search');
});

test('breadcrumbs exist only where navigation has a trail, in the page language', () => {
  const services = buildHead(pageMeta.services, 'zh', ORIGIN).breadcrumbs.itemListElement;
  assert.deepEqual(services.map((item) => item.name), ['首页', '服务']);
  assert.deepEqual(services.map((item) => item.item), [`${ORIGIN}/zh`, `${ORIGIN}/zh/services`]);
  for (const page of ['work', 'solutions', 'about', 'contact', 'insights']) {
    assert.equal(buildHead(pageMeta[page], 'th', ORIGIN).breadcrumbs.itemListElement.length, 2, page);
  }
  for (const page of ['home', 'privacy', 'terms', 'cookiePolicy']) {
    assert.equal(buildHead(pageMeta[page], 'th', ORIGIN).breadcrumbs, null, `${page} has no breadcrumb trail`);
  }
});

/* ─── claims ───────────────────────────────────────────────────────────── */

test('metadata makes no unsupported claim and none of the owner-decision items', () => {
  const texts = [];
  for (const page of Object.values(pageMeta)) texts.push(...Object.values(page.title), ...Object.values(page.description));
  for (const source of caseStudies) {
    for (const locale of LOCALES) {
      const head = buildHead(caseStudyPageMeta(localizeCaseStudy(source, PACKS[locale])), locale, '');
      texts.push(head.title, meta(head, 'description'));
    }
  }
  texts.push(...Object.values(SOCIAL_IMAGE.alt), read('../scripts/brand/og-default.svg'), read('../index.html'));
  const unsupported = [
    /24\s*\/\s*7|24 ชั่วโมง|全天候/i, /guarantee|รับประกัน|保证/i, /uptime|99\.\d/i, /certif|ISO\s?\d|认证/i,
    /#\s?1|number one|อันดับ\s?1|第一/i, /\d+\+?\s*(clients|customers|years|ลูกค้า|ปี)|\d+\s*(家客户|年经验)/i,
    /award|รางวัล|获奖/i, /fast response|ตอบกลับภายใน|within \d+ (hours|minutes)/i,
    /social security|ประกันสังคม|社保/i, /multi-?company|หลายบริษัท|多公司/i, /digital signature|ลายเซ็นดิจิทัล|电子签名/i,
    /offline|ออฟไลน์|离线/i, /barcode|บาร์โค้ด|条形码/i, /app store|google play/i, /every (2|two) weeks|ทุก 2 สัปดาห์/i
  ];
  for (const value of texts) {
    for (const pattern of unsupported) assert.doesNotMatch(value, pattern, `unsupported claim in metadata: ${value.slice(0, 90)}`);
  }
});

/* ─── sitemap and robots ───────────────────────────────────────────────── */

test('sitemap: well-formed, complete, unique, private-free, consistent alternates, no fake lastmod', () => {
  const xml = buildSitemap(`${ORIGIN}/`);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset [^>]+>\n/);
  assert.ok(xml.trimEnd().endsWith('</urlset>'));
  assert.equal((xml.match(/<url>/g) ?? []).length, (xml.match(/<\/url>/g) ?? []).length);
  assert.doesNotMatch(xml, /&(?!amp;|lt;|gt;|quot;)/, 'unescaped ampersand');
  assert.doesNotMatch(xml, /<lastmod>|<priority>/, 'no fabricated per-page dates or priorities');

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(locs).size, locs.length, 'duplicate URL');
  assert.deepEqual(locs, sitemapUrls(ORIGIN));
  assert.equal(locs.length, indexablePaths.length * LOCALES.length);
  for (const loc of locs) {
    const path = loc.slice(ORIGIN.length) || '/';
    const bare = path.replace(/^\/(en|zh)(?=\/|$)/, '') || '/';
    assert.ok(!PRIVATE.some((root) => bare === root || bare.startsWith(`${root}/`)), `${loc} is private`);
    assert.ok(!/\/404|\/dev\//.test(path));
  }
  for (const route of ['/', '/en/services', '/zh/work/payroll-monthly-control', '/en/about', '/zh/contact']) {
    assert.ok(locs.includes(joinUrl(ORIGIN, route)), `${route} missing`);
  }
  // Every entry of a route carries the same four alternates.
  const blocks = xml.split('<url>').slice(1);
  for (const block of blocks) {
    const alternates = [...block.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(alternates, ['th', 'en', 'zh-Hans', 'x-default']);
    const loc = block.match(/<loc>([^<]+)</)[1];
    assert.ok(block.includes(`href="${loc}"`), `${loc} is not among its own alternates`);
  }
});

test('robots.txt allows the site, disallows the private roots, names the sitemap only with an origin', () => {
  const withOrigin = buildRobots(ORIGIN);
  const withoutOrigin = buildRobots('');
  for (const robots of [withOrigin, withoutOrigin]) {
    assert.match(robots, /^User-agent: \*$/m);
    assert.match(robots, /^Allow: \/$/m);
    for (const root of PRIVATE) assert.match(robots, new RegExp(`^Disallow: ${root}$`, 'm'));
    const disallowed = [...robots.matchAll(/^Disallow: (.+)$/gm)].map((match) => match[1]);
    for (const path of ['/', '/services', '/work', '/solutions', '/about', '/contact']) {
      assert.ok(!disallowed.some((rule) => rule === path || (path !== '/' && path.startsWith(rule))), `${path} is blocked`);
    }
  }
  assert.match(withOrigin, new RegExp(`^Sitemap: ${ORIGIN}/sitemap\\.xml$`, 'm'));
  assert.doesNotMatch(withoutOrigin, /^Sitemap:/m);
  assert.equal(read('../public/robots.txt'), withoutOrigin, 'public/robots.txt drifted from buildRobots');
});

/* ─── social image, icons, manifest ────────────────────────────────────── */

function png(path) {
  const url = new URL(`../public${path}`, import.meta.url);
  assert.ok(existsSync(url), `${path} missing`);
  const bytes = readFileSync(url);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${path} is not a PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), size: statSync(url).size };
}

test('the share image is a real, small, 1200×630 PNG', () => {
  const image = png(SOCIAL_IMAGE.path);
  assert.deepEqual([image.width, image.height], [SOCIAL_IMAGE.width, SOCIAL_IMAGE.height]);
  assert.equal(SOCIAL_IMAGE.type, 'image/png');
  assert.ok(image.size < 300_000, `share image is ${image.size} bytes`);
  const vite = read('../vite.config.ts');
  assert.ok(vite.includes(SOCIAL_IMAGE.path) && vite.includes('content="1200"') && vite.includes('content="630"'), 'static tags drifted from SOCIAL_IMAGE');
  // Public-safe: the source contains only the brand, never a screenshot or private asset.
  const svg = read('../scripts/brand/og-default.svg');
  assert.doesNotMatch(svg, /<image\b|href="(?!#)|memories|anniversary|surprise/i);
});

test('icons and manifest resolve to PDA BLISS files, never A&I assets', () => {
  const html = read('../index.html');
  const manifest = JSON.parse(read('../public/site.webmanifest'));
  const refs = [
    ...[...html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*href="([^"]+)"/g)].map((match) => match[1]),
    ...manifest.icons.map((icon) => icon.src)
  ];
  for (const ref of refs) {
    assert.ok(existsSync(new URL(`../public${ref}`, import.meta.url)), `${ref} does not exist`);
    assert.doesNotMatch(ref, /memories|surprise|anniversary|\/ai/i);
  }
  assert.deepEqual(Object.values(png('/brand/apple-touch-icon.png')).slice(0, 2), [180, 180]);
  for (const icon of manifest.icons.filter((entry) => entry.type === 'image/png')) {
    const [width, height] = icon.sizes.split('x').map(Number);
    const real = png(icon.src);
    assert.deepEqual([real.width, real.height], [width, height], icon.src);
  }
  assert.equal(manifest.name, 'PDA BLISS');
  // One theme-color tag, resolved per theme — and A&I still overrides that same element.
  assert.equal((html.match(/<meta name="theme-color"/g) ?? []).length, 1);
  assert.match(read('../src/lib/theme.ts'), /THEME_COLOR[\s\S]*light: '#F4F7F3', dark: '#0E1311'/);
  assert.match(read('../src/pages/surprise/Experience.tsx'), /meta\[name="theme-color"\]/);
});
