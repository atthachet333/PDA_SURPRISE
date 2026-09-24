import { useEffect } from 'react';
import { company } from '@/data/company';
import { absoluteUrl, PUBLIC_ORIGIN } from '@/lib/seo';
import { useLocale } from '@/app/LocaleContext';
import { description } from '@/i18n/company';
import { HTML_LANG } from '@/i18n/locales';

const SCRIPT_ID = 'pdabliss-organization-schema';

/**
 * Organization structured data for the corporate site.
 *
 * ONLY VERIFIED FACTS. Every value below comes from `data/company.ts`, which is
 * the truth-locked source: the registered legal name in both languages, the
 * real registered address, the real phone, the real email, the real LINE OA.
 *
 * DELIBERATELY ABSENT — because nobody has supplied them, and structured data
 * is exactly the wrong place to guess:
 *   foundingDate      no registration year has been given (`foundedVerified`)
 *   aggregateRating   no reviews exist
 *   numberOfEmployees no figure has been verified
 *   priceRange        no published pricing
 *   sameAs            only the LINE OA is real; the other social slots are empty
 *   logo / image      no final brand asset has been supplied yet
 *
 * Opening hours use the verified Monday–Saturday 08:30–17:30. Sunday is simply
 * not listed, which is how schema.org expresses closed — it must never be
 * implied open by a careless Mo-Su range.
 */
export function OrganizationSchema() {
  /*
   * Only the description follows the page language. Names, address, phone and
   * email are identifiers and stay exactly as registered.
   */
  const { locale } = useLocale();

  useEffect(() => {
    const socials = company.socials
      .map((social) => social.href)
      .filter((href): href is string => Boolean(href && href.trim()));

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company.legalName,
      alternateName: company.legalNameTh,
      description: description[locale],
      email: company.email,
      telephone: `+66${company.phone.replace(/^0/, '')}`,
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
          // Saturday included, Sunday omitted — omission is how "closed" is said.
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:30',
          closes: '17:30'
        }
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: `+66${company.phone.replace(/^0/, '')}`,
          email: company.email,
          areaServed: 'TH',
          availableLanguage: ['th', 'en']
        }
      ]
    };

    // Only claim a canonical URL once a real origin is configured.
    if (PUBLIC_ORIGIN) schema.url = absoluteUrl('/');
    schema.knowsLanguage = Object.values(HTML_LANG);
    if (socials.length > 0) schema.sameAs = socials;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = SCRIPT_ID;
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, [locale]);

  return null;
}
