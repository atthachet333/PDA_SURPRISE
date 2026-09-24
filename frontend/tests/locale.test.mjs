import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  LOCALE_LABEL,
  LOCALE_STORAGE_KEY,
  LOCALES,
  applyDocumentLang,
  isLocale,
  localizePath,
  parseLocale,
  readStoredLocale,
  splitLocalePath,
  switchLocalePath,
  writeStoredLocale
} from '../src/i18n/locales.ts';
import { alternatesFor, canonicalFor, localizedPaths } from '../src/i18n/seo.ts';
import { THEME_STORAGE_KEY, readStoredMode, writeStoredMode } from '../src/lib/theme.ts';

/**
 * The routing rules a visitor feels: what a URL renders, where a language
 * switch lands, and that a stored preference never overrides a direct link.
 */

function fakeStorage({ initial = {}, failing = false } = {}) {
  const data = { ...initial };
  return {
    getItem(key) {
      if (failing) throw new Error('storage blocked');
      return key in data ? data[key] : null;
    },
    setItem(key, value) {
      if (failing) throw new Error('storage blocked');
      data[key] = value;
    },
    dump: () => ({ ...data })
  };
}

test('exactly three locales exist, Thai is the default', () => {
  assert.deepEqual([...LOCALES], ['th', 'en', 'zh']);
  assert.equal(DEFAULT_LOCALE, 'th');
  assert.deepEqual(LOCALE_LABEL, { th: 'ไทย', en: 'EN', zh: '中文' });
  assert.deepEqual(HTML_LANG, { th: 'th', en: 'en', zh: 'zh-Hans' });
});

test('locale parsing accepts only th / en / zh', () => {
  LOCALES.forEach((locale) => assert.equal(isLocale(locale), true));
  ['', 'TH', 'fr', 'zh-Hans', 'english', null, undefined, 42, {}].forEach((value) => {
    assert.equal(isLocale(value), false, `${String(value)} must not be a locale`);
    assert.equal(parseLocale(value), 'th');
  });
});

test('the URL prefix decides the locale; Thai is unprefixed', () => {
  assert.deepEqual(splitLocalePath('/'), { locale: 'th', path: '/' });
  assert.deepEqual(splitLocalePath('/services'), { locale: 'th', path: '/services' });
  assert.deepEqual(splitLocalePath('/en'), { locale: 'en', path: '/' });
  assert.deepEqual(splitLocalePath('/en/'), { locale: 'en', path: '/' });
  assert.deepEqual(splitLocalePath('/en/services'), { locale: 'en', path: '/services' });
  assert.deepEqual(splitLocalePath('/zh/work/payroll-monthly-control'), {
    locale: 'zh',
    path: '/work/payroll-monthly-control'
  });
});

test('unknown first segments are NOT locales and reach normal not-found', () => {
  assert.deepEqual(splitLocalePath('/fr/services'), { locale: 'th', path: '/fr/services' });
  assert.deepEqual(splitLocalePath('/foo/work'), { locale: 'th', path: '/foo/work' });
  assert.deepEqual(splitLocalePath('/th/services'), { locale: 'th', path: '/th/services' });
  assert.deepEqual(splitLocalePath('/english'), { locale: 'th', path: '/english' });
  assert.deepEqual(splitLocalePath('/zhx'), { locale: 'th', path: '/zhx' });
});

test('route generation prefixes EN/ZH and leaves Thai clean', () => {
  assert.equal(localizePath('/', 'th'), '/');
  assert.equal(localizePath('/', 'en'), '/en');
  assert.equal(localizePath('/', 'zh'), '/zh');
  assert.equal(localizePath('/services', 'en'), '/en/services');
  assert.equal(localizePath('/services#payroll', 'zh'), '/zh/services#payroll');
  assert.equal(localizePath('/contact?service=payroll&source=service:payroll', 'en'), '/en/contact?service=payroll&source=service:payroll');
  assert.equal(localizePath('/work/erp-inventory-costing', 'zh'), '/zh/work/erp-inventory-costing');
  /* Never double-prefixed. */
  assert.equal(localizePath('/en/services', 'zh'), '/zh/services');
  assert.equal(localizePath('/en/services', 'th'), '/services');
});

test('external targets and private A&I routes are never localised', () => {
  ['tel:0638693614', 'mailto:pdablissoffice@gmail.com', 'https://line.me/R/ti/p/@593oiwec', '#main', '//cdn.example'].forEach((to) => {
    assert.equal(localizePath(to, 'en'), to);
  });
  ['/login', '/memory-gate', '/workspace', '/us', '/dev/anniversary-preview', '/us#finale'].forEach((to) => {
    assert.equal(localizePath(to, 'en'), to, `${to} must stay unprefixed`);
    assert.equal(localizePath(to, 'zh'), to, `${to} must stay unprefixed`);
  });
  /* A public route that merely starts with the same letters is still public. */
  assert.equal(localizePath('/usage', 'en'), '/en/usage');
});

test('switching language keeps the page, slug, query and hash', () => {
  assert.equal(switchLocalePath({ pathname: '/services' }, 'en'), '/en/services');
  assert.equal(
    switchLocalePath({ pathname: '/en/services', hash: '#file-management' }, 'zh'),
    '/zh/services#file-management'
  );
  assert.equal(
    switchLocalePath({ pathname: '/work/payroll-monthly-control' }, 'en'),
    '/en/work/payroll-monthly-control'
  );
  assert.equal(switchLocalePath({ pathname: '/zh/work/payroll-monthly-control' }, 'th'), '/work/payroll-monthly-control');
  assert.equal(
    switchLocalePath({ pathname: '/contact', search: '?service=payroll', hash: '' }, 'zh'),
    '/zh/contact?service=payroll'
  );
  assert.equal(switchLocalePath({ pathname: '/en' }, 'th'), '/');
  assert.equal(switchLocalePath({ pathname: '/' }, 'zh'), '/zh');
});

test('a stored preference persists, and a corrupt one falls back to Thai', () => {
  const storage = fakeStorage();
  assert.equal(readStoredLocale(storage), 'th');
  writeStoredLocale('zh', storage);
  assert.deepEqual(storage.dump(), { [LOCALE_STORAGE_KEY]: 'zh' });
  assert.equal(readStoredLocale(storage), 'zh');

  assert.equal(readStoredLocale(fakeStorage({ initial: { [LOCALE_STORAGE_KEY]: 'fr' } })), 'th');
  assert.equal(readStoredLocale(fakeStorage({ initial: { [LOCALE_STORAGE_KEY]: '' } })), 'th');
  assert.equal(readStoredLocale(fakeStorage({ failing: true })), 'th');
  assert.doesNotThrow(() => writeStoredLocale('en', fakeStorage({ failing: true })));
});

test('locale and theme preferences are independent', () => {
  assert.equal(LOCALE_STORAGE_KEY, 'pdabliss.locale');
  assert.notEqual(LOCALE_STORAGE_KEY, THEME_STORAGE_KEY);
  const storage = fakeStorage({ initial: { [THEME_STORAGE_KEY]: 'dark' } });
  writeStoredLocale('en', storage);
  assert.equal(readStoredMode(storage), 'dark', 'changing locale reset the theme');
  writeStoredMode('light', storage);
  assert.equal(readStoredLocale(storage), 'en', 'changing theme reset the locale');
});

test('the document language follows the locale', () => {
  const root = { lang: '', dataset: {} };
  applyDocumentLang('zh', root);
  assert.equal(root.lang, 'zh-Hans');
  assert.equal(root.dataset.locale, 'zh');
  applyDocumentLang('en', root);
  assert.equal(root.lang, 'en');
  applyDocumentLang('th', root);
  assert.equal(root.lang, 'th');
});

test('the first-paint bootstrap agrees with the locale module', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes("segment === 'en' || segment === 'zh'"), 'bootstrap recognises different prefixes');
  assert.ok(html.includes("'zh-Hans'"), 'bootstrap writes a different Chinese lang');
  assert.ok(html.includes('dataset.locale'), 'bootstrap does not set data-locale');
  assert.ok(!/getItem\(['"]pdabliss\.locale/.test(html), 'a stored preference must never override the URL');
  assert.ok(html.indexOf('dataset.locale') < html.indexOf('src="/src/main'), 'bootstrap must precede the app');
});

test('canonical follows the active locale; hreflang only with a real origin', () => {
  assert.equal(canonicalFor('/services', 'th', ''), '/services');
  assert.equal(canonicalFor('/services', 'en', ''), '/en/services');
  assert.equal(canonicalFor('/services', 'zh', 'https://pdabliss.example'), 'https://pdabliss.example/zh/services');

  assert.deepEqual(alternatesFor('/services', ''), [], 'no origin, no alternates');
  assert.deepEqual(alternatesFor('/', 'https://pdabliss.example/'), [
    { hreflang: 'th', href: 'https://pdabliss.example/' },
    { hreflang: 'en', href: 'https://pdabliss.example/en' },
    { hreflang: 'zh-Hans', href: 'https://pdabliss.example/zh' },
    { hreflang: 'x-default', href: 'https://pdabliss.example/' }
  ]);
});

test('the sitemap lists every public route in every locale, and nothing private', () => {
  const seo = readFileSync(new URL('../src/lib/seo.ts', import.meta.url), 'utf8');
  const script = readFileSync(new URL('../scripts/generate-sitemap.mjs', import.meta.url), 'utf8');
  const list = (src) => {
    const block = src.match(/(?:indexablePaths: string\[\] =|const paths =) \[([\s\S]*?)\];/)?.[1] ?? '';
    return [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  };
  const paths = list(seo);
  assert.deepEqual(list(script), paths, 'sitemap script and seo.ts have drifted');

  const urls = localizedPaths(paths);
  assert.equal(urls.length, paths.length * 3);
  ['/login', '/memory-gate', '/workspace', '/us'].forEach((route) => {
    assert.ok(!urls.some((url) => url === route || url.startsWith(`${route}/`)), `${route} must never be listed`);
  });
  assert.ok(urls.includes('/en/services') && urls.includes('/zh/work/payroll-monthly-control'));
  assert.ok(script.includes("hreflang: 'zh-Hans'") && script.includes('x-default'));
  assert.ok(script.includes("if (!origin)"), 'the no-origin safety must remain');
});
