import { joinUrl } from '../lib/url';
import { DEFAULT_LOCALE, HREFLANG, LOCALES, localizePath, type Locale } from './locales';

/**
 * Locale-aware URL rules for metadata, kept free of `import.meta` so node can
 * test them directly.
 *
 *   canonical   the active locale's own route — /services, /en/services,
 *               /zh/services — never the Thai page for every language.
 *   hreflang    th, en, zh-Hans and x-default (the Thai route), emitted ONLY
 *               when a public origin exists. Relative alternates are not valid
 *               hreflang, and nothing here invents a hostname.
 */

/** Kept as an alias of the one URL builder (lib/url.ts) for existing callers. */
export const absoluteFrom = (origin: string, path: string): string => joinUrl(origin, path);

export function canonicalFor(path: string, locale: Locale, origin: string): string {
  return absoluteFrom(origin, localizePath(path, locale));
}

export interface Alternate {
  hreflang: string;
  href: string;
}

export function alternatesFor(path: string, origin: string): Alternate[] {
  if (!joinUrl(origin, '/').startsWith('https://')) return [];
  const links = LOCALES.map((locale) => ({
    hreflang: HREFLANG[locale],
    href: absoluteFrom(origin, localizePath(path, locale))
  }));
  links.push({ hreflang: 'x-default', href: absoluteFrom(origin, localizePath(path, DEFAULT_LOCALE)) });
  return links;
}

/** Every locale's route for each public path — the sitemap's URL list. */
export function localizedPaths(paths: readonly string[]): string[] {
  return paths.flatMap((path) => LOCALES.map((locale) => localizePath(path, locale)));
}
