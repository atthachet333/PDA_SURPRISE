import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { loadContentPack, needsPack, type OtherLocale } from '@/i18n/content/types';
import { packCache } from '@/i18n/content/cache';
import { ui } from '@/i18n/ui';
import { LocaleContext } from './LocaleContext';

/**
 * Owns the corporate locale.
 *
 * The locale is READ from the URL, never held in state: a direct link, a
 * refresh, back and forward all render the language the address names, with
 * nothing to fall out of sync. Choosing a language persists it and navigates
 * to the same page — path, slug, query and hash intact — under the new prefix.
 *
 * English and Chinese record text (case studies, services …) lives in a
 * per-locale chunk. Until the active one has loaded, the shell shows a short
 * loading state instead of rendering Thai records on an English or Chinese
 * page — there is no mixed-language flash.
 *
 * Mounted inside the corporate shell only. On leaving it (the private routes)
 * the document language returns to Thai.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = splitLocalePath(location.pathname);
  const [, setVersion] = useState(0);
  const [failed, setFailed] = useState<OtherLocale | null>(null);

  const content = needsPack(locale) ? packCache.get(locale) ?? null : null;
  const ready = !needsPack(locale) || content !== null;

  useEffect(() => {
    if (!needsPack(locale) || packCache.has(locale)) return;
    let alive = true;
    loadContentPack(locale)
      .then((pack) => {
        packCache.set(locale, pack);
        if (alive) setVersion((version) => version + 1);
      })
      .catch(() => {
        if (alive) setFailed(locale);
      });
    return () => {
      alive = false;
    };
  }, [locale]);

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
      t: <T,>(localized: Localized<T>) => localized[locale],
      content
    }),
    [locale, setLocale, content]
  );

  let body: React.ReactNode = children;
  if (!ready) {
    body =
      failed === locale ? (
        <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center" role="alert">
          <p className="thai-display text-xl font-bold text-ink">{ui.errorTitle[locale]}</p>
          <p className="mt-3 max-w-md text-sm text-steel-500">{ui.errorBody[locale]}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex min-h-11 items-center rounded-pill bg-ink px-6 text-sm font-medium text-white"
          >
            {ui.reload[locale]}
          </button>
        </div>
      ) : (
        <div className="flex min-h-screen items-center justify-center" role="status" aria-label={ui.loading[locale]}>
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-steel-200 border-t-brand-500" />
        </div>
      );
  }

  return <LocaleContext.Provider value={value}>{body}</LocaleContext.Provider>;
}
