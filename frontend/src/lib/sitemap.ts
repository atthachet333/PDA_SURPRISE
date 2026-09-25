import { DEFAULT_LOCALE, HREFLANG, LOCALES, localizePath } from '@/i18n/locales';
import { PRIVATE_ROOTS, indexablePaths } from '@/lib/seo';
import { joinUrl, sanitizeOrigin } from '@/lib/url';

/**
 * sitemap.xml and robots.txt, built from the ONE public route inventory
 * (`indexablePaths` in lib/seo.ts) — nothing is listed by hand (EP44).
 *
 *   sitemap   every public route in th / en / zh, each <url> carrying the same
 *             th · en · zh-Hans · x-default alternates. No <lastmod>: there is
 *             no reliable per-page modification date, and stamping every URL
 *             with the build day would be a false signal. No <priority>
 *             either; search engines ignore it.
 *   robots    allows the site, disallows the private roots, and points at the
 *             sitemap only when a public origin exists.
 *
 * Without a safe public origin there is no sitemap at all (URLs must be
 * absolute), and robots.txt says so in a comment instead of naming a host.
 */

const xml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function sitemapUrls(rawOrigin: string): string[] {
  const origin = sanitizeOrigin(rawOrigin);
  if (!origin) return [];
  return indexablePaths.flatMap((path) => LOCALES.map((locale) => joinUrl(origin, localizePath(path, locale))));
}

export function buildSitemap(rawOrigin: string): string | null {
  const origin = sanitizeOrigin(rawOrigin);
  if (!origin) return null;
  const entries = indexablePaths.flatMap((path) => {
    const alternates = [
      ...LOCALES.map((locale) => ({ hreflang: HREFLANG[locale], href: joinUrl(origin, localizePath(path, locale)) })),
      { hreflang: 'x-default', href: joinUrl(origin, localizePath(path, DEFAULT_LOCALE)) }
    ];
    const links = alternates.map(({ hreflang, href }) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${xml(href)}" />`);
    return LOCALES.map((locale) =>
      ['  <url>', `    <loc>${xml(joinUrl(origin, localizePath(path, locale)))}</loc>`, ...links, '  </url>'].join('\n')
    );
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    ''
  ].join('\n');
}

export function buildRobots(rawOrigin: string): string {
  const origin = sanitizeOrigin(rawOrigin);
  return [
    '# PDA BLISS — crawler guidance',
    '#',
    '# robots.txt is a request to well-behaved crawlers. It is NOT access control',
    '# and provides no protection: the private routes below are listed so search',
    '# engines stay out of them, and each also sends noindex, nofollow.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Private client/workspace routes and the development console.',
    ...PRIVATE_ROOTS.map((root) => `Disallow: ${root}${root === '/dev' ? '/' : ''}`),
    '',
    origin
      ? `Sitemap: ${joinUrl(origin, '/sitemap.xml')}`
      : '# Sitemap: added by the build once VITE_PUBLIC_ORIGIN is set (docs/SEO.md).',
    ''
  ].join('\n');
}
