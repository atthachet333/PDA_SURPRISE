import { useEffect } from 'react';
import { PUBLIC_ORIGIN, type LocalizedPageMeta, type PageMeta } from '@/lib/seo';
import { buildHead } from '@/lib/head';
import { useLocale } from '@/app/LocaleContext';

const BREADCRUMB_ID = 'pdabliss-breadcrumbs';

/**
 * Per-route document metadata for a single-page app.
 *
 * Deliberately no library. react-helmet and friends exist to solve SSR ordering
 * and nested overrides; this app has one metadata owner per route and renders
 * entirely in the browser, so a few DOM writes do the whole job without adding
 * a dependency to the eager corporate bundle.
 *
 * WHAT IS EMITTED is decided by `buildHead` (lib/head.ts), which is pure and
 * tested. This hook only applies it, and restores everything on cleanup, so a
 * route change never leaves a second canonical, a stale og:url or yesterday's
 * hreflang set behind: each managed tag is set, created, or removed, and every
 * change is undone when the route unmounts.
 *
 * A crawler that does not execute JavaScript sees only the defaults in
 * index.html — the accepted trade-off of a client-rendered site (docs/SEO.md).
 */
export function usePageMeta(meta: PageMeta | LocalizedPageMeta): void {
  const { locale } = useLocale();

  useEffect(() => {
    const head = buildHead(meta, locale, PUBLIC_ORIGIN);
    const cleanups: Array<() => void> = [];

    const previousTitle = document.title;
    document.title = head.title;
    cleanups.push(() => {
      document.title = previousTitle;
    });

    /** Set, create or remove one element, and remember how to undo it. */
    const manage = (selector: string, value: string | null, attr: string, create: () => HTMLElement) => {
      const existing = document.head.querySelector<HTMLElement>(selector);
      if (value === null) {
        if (existing) {
          const parent = existing.parentNode;
          const next = existing.nextSibling;
          existing.remove();
          cleanups.push(() => parent?.insertBefore(existing, next));
        }
        return;
      }
      if (existing) {
        const previous = existing.getAttribute(attr);
        existing.setAttribute(attr, value);
        cleanups.push(() => {
          if (previous === null) existing.removeAttribute(attr);
          else existing.setAttribute(attr, previous);
        });
        return;
      }
      const element = create();
      element.setAttribute(attr, value);
      document.head.appendChild(element);
      cleanups.push(() => element.remove());
    };

    for (const tag of head.metas) {
      manage(`meta[${tag.attr}="${tag.key}"]`, tag.content, 'content', () => {
        const element = document.createElement('meta');
        element.setAttribute(tag.attr, tag.key);
        return element;
      });
    }

    manage('link[rel="canonical"]', head.canonical, 'href', () => {
      const element = document.createElement('link');
      element.setAttribute('rel', 'canonical');
      return element;
    });

    /* Alternates and breadcrumbs are owned entirely by this effect. */
    for (const { hreflang, href } of head.alternates) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      link.href = href;
      document.head.appendChild(link);
      cleanups.push(() => link.remove());
    }

    if (head.breadcrumbs) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = BREADCRUMB_ID;
      script.textContent = JSON.stringify(head.breadcrumbs);
      document.head.appendChild(script);
      cleanups.push(() => script.remove());
    }

    return () => {
      for (const cleanup of cleanups.reverse()) cleanup();
    };
  }, [meta, locale]);
}
