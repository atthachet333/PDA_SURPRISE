import { useEffect } from 'react';
import { PUBLIC_ORIGIN, type LocalizedPageMeta, type PageMeta } from '@/lib/seo';
import { useLocale } from '@/app/LocaleContext';
import { OG_LOCALE } from '@/i18n/locales';
import { alternatesFor, canonicalFor } from '@/i18n/seo';

/**
 * Per-route document metadata for a single-page app.
 *
 * Deliberately no library. react-helmet and friends exist to solve SSR ordering
 * and nested overrides; this app has one metadata owner per route and renders
 * entirely in the browser, so a dozen lines of DOM writes do the whole job
 * without adding a dependency to the eager corporate bundle.
 *
 * A crawler that does not execute JavaScript sees only the defaults in
 * index.html. That is the accepted trade-off of a client-rendered site, and it
 * is why those defaults are a complete, honest description of the company
 * rather than a placeholder.
 *
 * LOCALES
 *   A `LocalizedPageMeta` (every public corporate page) resolves its title and
 *   description for the active locale, points the canonical at that locale's
 *   own route and — only when a public origin is configured — lists th / en /
 *   zh-Hans / x-default alternates. A plain `PageMeta` (the private routes) is
 *   written exactly as given, Thai-default, with no alternates.
 */
export function usePageMeta(meta: PageMeta | LocalizedPageMeta): void {
  const { locale } = useLocale();

  useEffect(() => {
    const localized = typeof meta.title !== 'string';
    const title = typeof meta.title === 'string' ? meta.title : meta.title[locale];
    const description = typeof meta.description === 'string' ? meta.description : meta.description[locale];

    const previousTitle = document.title;
    document.title = title;

    const canonical = canonicalFor(meta.path, localized ? locale : 'th', PUBLIC_ORIGIN);
    const cleanups: Array<() => void> = [];

    const setTag = (selector: string, create: () => HTMLElement, value: string, attr: string) => {
      let element = document.head.querySelector<HTMLElement>(selector);
      let created = false;
      if (!element) {
        element = create();
        document.head.appendChild(element);
        created = true;
      }
      const previous = element.getAttribute(attr);
      element.setAttribute(attr, value);
      cleanups.push(() => {
        if (created) element?.remove();
        else if (previous !== null) element?.setAttribute(attr, previous);
      });
    };

    const setMeta = (name: string, value: string, key: 'name' | 'property' = 'name') => {
      setTag(
        `meta[${key}="${name}"]`,
        () => {
          const element = document.createElement('meta');
          element.setAttribute(key, name);
          return element;
        },
        value,
        'content'
      );
    };

    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('og:locale', OG_LOCALE[localized ? locale : 'th'], 'property');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    /*
     * `noindex, nofollow` for every private route. This is a request to
     * well-behaved crawlers, NOT access control — the Memory Gate is emotional
     * gating and this is a politeness header. Neither keeps anyone out.
     */
    setMeta('robots', meta.noindex ? 'noindex, nofollow' : 'index, follow');

    setTag(
      'link[rel="canonical"]',
      () => {
        const element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        return element;
      },
      canonical,
      'href'
    );

    /*
     * Alternates are owned entirely by this effect: created here, removed on
     * cleanup. Nothing is emitted without a real origin, and nothing for a
     * noindex page.
     */
    if (localized && !meta.noindex) {
      alternatesFor(meta.path, PUBLIC_ORIGIN).forEach(({ hreflang, href }) => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = hreflang;
        link.href = href;
        document.head.appendChild(link);
        cleanups.push(() => link.remove());
      });
    }

    return () => {
      document.title = previousTitle;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [meta, locale]);
}
