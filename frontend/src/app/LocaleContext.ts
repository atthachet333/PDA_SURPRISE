import { createContext, useContext } from 'react';
import { DEFAULT_LOCALE, localizePath, type Locale } from '@/i18n/locales';
import type { Localized } from '@/i18n/text';
import type { ContentPack } from '@/i18n/content/types';

export interface LocaleState {
  /** Decided by the URL alone. */
  locale: Locale;
  /** Persists the choice and moves to the same page in `next`. */
  setLocale: (next: Locale) => void;
  /** A locale-neutral internal path, rewritten for the active locale. */
  path: (to: string) => string;
  /** The active-locale value of a localised triple. */
  t: <T>(value: Localized<T>) => T;
  /**
   * EN / ZH overlays for the canonical Thai records, or null for Thai. The
   * provider does not render the page until the active pack is loaded, so a
   * component never sees a Thai record on an English or Chinese page.
   */
  content: ContentPack | null;
}

/**
 * Outside the corporate shell — the private A&I routes — nothing provides a
 * locale, so this default answers: Thai, paths untouched, no switching. That
 * is what lets shared components such as `ButtonLink` localise their targets
 * without the private routes ever noticing.
 */
export const LocaleContext = createContext<LocaleState>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  path: (to) => localizePath(to, DEFAULT_LOCALE),
  t: (value) => value[DEFAULT_LOCALE],
  content: null
});

export const useLocale = (): LocaleState => useContext(LocaleContext);
