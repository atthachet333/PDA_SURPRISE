import { OG_LOCALE, localizePath, type Locale } from '@/i18n/locales';
import { alternatesFor, canonicalFor, type Alternate } from '@/i18n/seo';
import { nav } from '@/i18n/ui';
import { SITE_NAME, SOCIAL_IMAGE, type Crumb, type LocalizedPageMeta, type PageMeta } from '@/lib/seo';
import { joinUrl, sanitizeOrigin } from '@/lib/url';

/**
 * THE HEAD OF A ROUTE — computed, not assembled piecemeal (EP44).
 *
 * `buildHead` is pure: the same meta, locale and origin always give the same
 * head, so node tests can check exactly what /services, /en/services and
 * /zh/services emit. `usePageMeta` only applies the result to the DOM.
 *
 *   public page    localized title/description, index,follow, a canonical on
 *                  the active locale's own route; with a public origin also
 *                  og:url, og:image, hreflang th/en/zh-Hans/x-default and a
 *                  BreadcrumbList where the page has a trail
 *   noindex page   noindex,nofollow and NO canonical, og:url, alternates or
 *                  breadcrumbs — a private route or a 404 must not claim to be
 *                  some other page (the home page least of all)
 */

export interface MetaTag {
  attr: 'name' | 'property';
  key: string;
  /** null = this tag must be absent on this route. */
  content: string | null;
}

export interface HeadSpec {
  title: string;
  canonical: string | null;
  metas: MetaTag[];
  alternates: Alternate[];
  breadcrumbs: Record<string, unknown> | null;
}

const text = (value: Crumb['name'] | LocalizedPageMeta['title'], locale: Locale) =>
  typeof value === 'string' ? value : value[locale];

export function buildHead(meta: PageMeta | LocalizedPageMeta, locale: Locale, rawOrigin: string): HeadSpec {
  const origin = sanitizeOrigin(rawOrigin);
  const localized = typeof meta.title !== 'string' || ('localizedRoute' in meta && meta.localizedRoute === true);
  const active: Locale = localized ? locale : 'th';
  const title = text(meta.title, active);
  const description = text(meta.description, active);
  const indexable = !meta.noindex;

  const canonical = indexable ? canonicalFor(meta.path, active, origin) : null;
  const ogUrl = indexable && origin ? canonical : null;
  const image = origin ? joinUrl(origin, SOCIAL_IMAGE.path) : null;
  const imageAlt = image ? SOCIAL_IMAGE.alt[active] : null;

  const metas: MetaTag[] = [
    { attr: 'name', key: 'description', content: description },
    /*
     * A request to well-behaved crawlers, NOT access control — the Memory Gate
     * is emotional gating and this is a politeness header.
     */
    { attr: 'name', key: 'robots', content: indexable ? 'index, follow' : 'noindex, nofollow' },
    { attr: 'property', key: 'og:site_name', content: ('siteName' in meta && meta.siteName) || SITE_NAME },
    { attr: 'property', key: 'og:type', content: 'website' },
    { attr: 'property', key: 'og:title', content: title },
    { attr: 'property', key: 'og:description', content: description },
    { attr: 'property', key: 'og:locale', content: OG_LOCALE[active] },
    { attr: 'property', key: 'og:url', content: ogUrl },
    { attr: 'property', key: 'og:image', content: image },
    { attr: 'property', key: 'og:image:width', content: image ? String(SOCIAL_IMAGE.width) : null },
    { attr: 'property', key: 'og:image:height', content: image ? String(SOCIAL_IMAGE.height) : null },
    { attr: 'property', key: 'og:image:type', content: image ? SOCIAL_IMAGE.type : null },
    { attr: 'property', key: 'og:image:alt', content: imageAlt },
    { attr: 'name', key: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
    { attr: 'name', key: 'twitter:title', content: title },
    { attr: 'name', key: 'twitter:description', content: description },
    { attr: 'name', key: 'twitter:image', content: image },
    { attr: 'name', key: 'twitter:image:alt', content: imageAlt }
  ];

  const alternates = localized && indexable ? alternatesFor(meta.path, origin) : [];

  let breadcrumbs: HeadSpec['breadcrumbs'] = null;
  const trail = 'breadcrumbs' in meta ? meta.breadcrumbs : undefined;
  if (origin && indexable && trail?.length) {
    const steps: Crumb[] = [{ name: nav.home, path: '/' }, ...trail];
    breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: steps.map((step, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: text(step.name, active),
        item: joinUrl(origin, localizePath(step.path, active))
      }))
    };
  }

  return { title, canonical, metas, alternates, breadcrumbs };
}
