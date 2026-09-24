/**
 * ============================================================================
 * CORPORATE LOCALES — TH / EN / 中文
 * ============================================================================
 * Pure logic, no React and no DOM beyond storage, so what a URL means, how a
 * path is rewritten on a language switch and what happens to a corrupt stored
 * preference are all testable in node.
 *
 * SCOPE
 *   The public PDA BLISS site only. The private routes (/login, /memory-gate,
 *   /workspace, /us, /dev) are never prefixed, never translated and never
 *   rewritten by anything in this file — A&I stays Thai as designed.
 *
 * URL STRATEGY
 *   Thai is the default and stays unprefixed:   /services, /work/:slug
 *   English and Chinese carry a prefix:         /en/services, /zh/work/:slug
 *   Slugs, hashes and service ids are never localised.
 *
 * PRECEDENCE
 *   The URL is the only thing that decides what language renders. A stored
 *   preference records the visitor's last explicit choice, but it never
 *   rewrites a direct link — `/services` always renders Thai, `/en/services`
 *   always renders English, whatever was stored before.
 * ============================================================================
 */

export const LOCALES = ['th', 'en', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'th';

/** Independent of `pdabliss.theme` — neither preference ever touches the other. */
export const LOCALE_STORAGE_KEY = 'pdabliss.locale';

/** What the switcher shows. Each label is written in its own language. */
export const LOCALE_LABEL: Record<Locale, string> = {
  th: 'ไทย',
  en: 'EN',
  zh: '中文'
};

/** Full language names, for the accessible name of each switcher option. */
export const LOCALE_NAME: Record<Locale, string> = {
  th: 'ภาษาไทย',
  en: 'English',
  zh: '简体中文'
};

/** The `lang` attribute on <html>. Chinese is Simplified Chinese. */
export const HTML_LANG: Record<Locale, string> = {
  th: 'th',
  en: 'en',
  zh: 'zh-Hans'
};

/** `hreflang` values for alternate links. */
export const HREFLANG: Record<Locale, string> = HTML_LANG;

/** Open Graph locale tags. */
export const OG_LOCALE: Record<Locale, string> = {
  th: 'th_TH',
  en: 'en_US',
  zh: 'zh_CN'
};

/** The only first path segments that mean "a language". Thai has none. */
const PREFIXED: readonly Locale[] = ['en', 'zh'];

/**
 * Private, full-viewport routes. A path under any of these is returned as-is
 * by every helper below: no prefix is added and none is expected.
 */
const UNLOCALIZED_ROOTS = ['/login', '/memory-gate', '/workspace', '/us', '/dev'];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Anything unrecognised resolves to Thai rather than throwing. */
export function parseLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export interface LocalePath {
  locale: Locale;
  /** The locale-neutral path the route table matches, always starting with '/'. */
  path: string;
}

/**
 * Reads the locale from a pathname and strips its prefix.
 *
 *   /en/services   → en, /services
 *   /zh            → zh, /
 *   /services      → th, /services
 *   /fr/services   → th, /fr/services   (not a locale — normal not-found)
 *   /english       → th, /english       (a segment, not a prefix match)
 */
export function splitLocalePath(pathname: string): LocalePath {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const segment = clean.split('/')[1] ?? '';
  const prefixed = PREFIXED.find((locale) => locale === segment);
  if (!prefixed) return { locale: DEFAULT_LOCALE, path: clean };
  const rest = clean.slice(segment.length + 1);
  return { locale: prefixed, path: rest === '' ? '/' : rest };
}

function isUnlocalized(path: string): boolean {
  return UNLOCALIZED_ROOTS.some((root) => path === root || path.startsWith(`${root}/`) || path.startsWith(`${root}?`) || path.startsWith(`${root}#`));
}

/**
 * The path a locale-neutral link should point to in `locale`.
 *
 * Accepts a query and/or hash on the path (`/services#payroll`), leaves
 * external targets and private routes untouched, and never double-prefixes a
 * path that already carries a locale.
 */
export function localizePath(to: string, locale: Locale): string {
  if (!to.startsWith('/') || to.startsWith('//')) return to;
  if (isUnlocalized(to)) return to;

  const suffixAt = to.search(/[?#]/);
  const pathname = suffixAt === -1 ? to : to.slice(0, suffixAt);
  const suffix = suffixAt === -1 ? '' : to.slice(suffixAt);
  const neutral = splitLocalePath(pathname).path;

  if (locale === DEFAULT_LOCALE) return `${neutral}${suffix}`;
  return `/${locale}${neutral === '/' ? '' : neutral}${suffix}`;
}

/**
 * The same page in another language: path, slug, query and hash preserved.
 *
 *   /services              → en → /en/services
 *   /en/services#files     → zh → /zh/services#files
 *   /zh/work/payroll       → th → /work/payroll
 */
export function switchLocalePath(
  location: { pathname: string; search?: string; hash?: string },
  target: Locale
): string {
  const { path } = splitLocalePath(location.pathname);
  return localizePath(`${path}${location.search ?? ''}${location.hash ?? ''}`, target);
}

/* --------------------------------------------------------------- storage -- */

/**
 * Storage can throw outright in a privacy mode that blocks site data, so every
 * access is guarded. A visitor without storage still gets a working site.
 */
export function readStoredLocale(storage?: Pick<Storage, 'getItem'>): Locale {
  try {
    const store = storage ?? globalThis.localStorage;
    return parseLocale(store?.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function writeStoredLocale(locale: Locale, storage?: Pick<Storage, 'setItem'>): void {
  try {
    const store = storage ?? globalThis.localStorage;
    store?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* A preference we cannot persist is not worth breaking the page over. */
  }
}

/* ----------------------------------------------------------------- apply -- */

/** The single place the active locale reaches <html lang>. */
export function applyDocumentLang(locale: Locale, root?: HTMLElement): void {
  const element = root ?? globalThis.document?.documentElement;
  if (!element) return;
  element.lang = HTML_LANG[locale];
  element.dataset.locale = locale;
}
