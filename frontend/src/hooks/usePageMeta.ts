import { useEffect } from 'react';
import { absoluteUrl, type PageMeta } from '@/lib/seo';

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
 */
export function usePageMeta(meta: PageMeta): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = meta.title;

    const canonical = absoluteUrl(meta.path);
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

    setMeta('description', meta.description);
    setMeta('og:title', meta.title, 'property');
    setMeta('og:description', meta.description, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('twitter:title', meta.title);
    setMeta('twitter:description', meta.description);

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

    return () => {
      document.title = previousTitle;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [meta]);
}
