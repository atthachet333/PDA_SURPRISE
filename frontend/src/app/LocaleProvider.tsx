import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  applyDocumentLang,
  DEFAULT_LOCALE,
  localizePath,
  splitLocalePath,
  switchLocalePath,
  writeStoredLocale,
  type Locale
} from '@/i18n/locales';
import type { Localized } from '@/i18n/text';
import { LocaleContext } from './LocaleContext';

/**
 * Owns the corporate locale.
 *
 * The locale is READ from the URL, never held in state: a direct link, a
 * refresh, back and forward all render the language the address names, with
 * nothing to fall out of sync. Choosing a language persists it and navigates
 * to the same page — path, slug, query and hash intact — under the new prefix.
 *
 * Mounted inside the corporate shell only. On leaving it (the private routes)
 * the document language returns to Thai.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = splitLocalePath(location.pathname);

  useEffect(() => {
    applyDocumentLang(locale);
  }, [locale]);

  useEffect(() => () => applyDocumentLang(DEFAULT_LOCALE), []);

  const setLocale = useCallback(
    (next: Locale) => {
      writeStoredLocale(next);
      if (next === locale) return;
      navigate(switchLocalePath(location, next));
    },
    [locale, location, navigate]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      path: (to: string) => localizePath(to, locale),
      t: <T,>(localized: Localized<T>) => localized[locale]
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
