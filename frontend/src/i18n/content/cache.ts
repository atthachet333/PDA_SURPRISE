import type { Locale } from '../locales';
import { loadContentPack, needsPack, type ContentPack, type OtherLocale } from './types';

/**
 * Loaded packs survive for the session, so switching back and forth between
 * languages is instant after the first visit to each.
 */
export const packCache = new Map<OtherLocale, ContentPack>();

/** Starts fetching a pack ahead of time — the language switcher calls this on hover. */
export function preloadContentPack(locale: Locale): void {
  if (!needsPack(locale) || packCache.has(locale)) return;
  void loadContentPack(locale)
    .then((pack) => packCache.set(locale, pack))
    .catch(() => undefined);
}
