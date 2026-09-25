import { SITE_BRAND } from '@/data/brand';
import { company } from '@/data/company';
import { description } from '@/i18n/company';
import { HTML_LANG, LOCALES, type Locale } from '@/i18n/locales';
import { joinUrl, sanitizeOrigin } from '@/lib/url';

/**
 * SITE-WIDE STRUCTURED DATA — Organization and WebSite (EP44).
 *
 * Pure builders so the facts can be tested against `data/company.ts`, the one
 * truth-locked source. Nothing here is typed by hand: name, legal names,
 * phone, email, address and hours all come from that record.
 *
 * DELIBERATELY ABSENT — nobody has supplied or verified them, and structured
 * data is exactly the wrong place to guess:
 *   foundingDate · founder · numberOfEmployees · aggregateRating · award ·
 *   hasCredential · priceRange · logo/image (no final brand asset) ·
 *   knowsLanguage and contactPoint.availableLanguage (the SITE is trilingual;
 *   the company's working languages are an owner decision) · SearchAction
 *   (the site has no search).
 *
 * The address is the one registered Thai address in every locale; only the
 * description follows the page language. Sunday is omitted from the hours,
 * which is how schema.org says "closed".
 */

const ORG_ID = '/#organization';
const SITE_ID = '/#website';

export const e164 = (phone: string) => `+66${phone.replace(/^0/, '')}`;

export function organizationSchema(locale: Locale, rawOrigin: string): Record<string, unknown> {
  const origin = sanitizeOrigin(rawOrigin);
  const socials = company.socials.map((social) => social.href.trim()).filter(Boolean);
  const telephone = e164(company.phone);
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.companyName,
    legalName: company.legalName,
    alternateName: company.legalNameTh,
    description: description[locale],
    email: company.email,
    telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${company.address.lines[0]} ${company.address.lines[1]}`.trim(),
      addressLocality: company.address.district,
      addressRegion: company.address.province,
      postalCode: company.address.postalCode,
      addressCountry: 'TH'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...company.businessHours.dayOfWeek],
        opens: company.businessHours.opens,
        closes: company.businessHours.closes
      }
    ],
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', telephone, email: company.email, areaServed: 'TH' }]
  };
  if (origin) {
    schema['@id'] = joinUrl(origin, ORG_ID);
    schema.url = joinUrl(origin, '/');
  }
  if (socials.length) schema.sameAs = socials;
  return schema;
}

/** The public site itself. Only meaningful with a real origin, so null without one. */
export function websiteSchema(locale: Locale, rawOrigin: string): Record<string, unknown> | null {
  const origin = sanitizeOrigin(rawOrigin);
  if (!origin) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': joinUrl(origin, SITE_ID),
    name: SITE_BRAND,
    alternateName: company.companyName,
    url: joinUrl(origin, '/'),
    inLanguage: LOCALES.map((code) => HTML_LANG[code]),
    description: description[locale],
    publisher: { '@id': joinUrl(origin, ORG_ID) }
  };
}
