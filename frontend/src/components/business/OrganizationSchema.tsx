import { useEffect } from 'react';
import { PUBLIC_ORIGIN } from '@/lib/seo';
import { organizationSchema, websiteSchema } from '@/lib/structuredData';
import { useLocale } from '@/app/LocaleContext';

const IDS = { organization: 'pdabliss-organization-schema', website: 'pdabliss-website-schema' } as const;

/**
 * Site-wide JSON-LD for the corporate shell only — never rendered on the
 * private routes. What is (and is deliberately not) claimed lives in
 * lib/structuredData.ts, where it is tested against data/company.ts.
 */
export function OrganizationSchema() {
  const { locale } = useLocale();

  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];
    const add = (id: string, data: Record<string, unknown> | null) => {
      if (!data) return;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
      scripts.push(script);
    };
    add(IDS.organization, organizationSchema(locale, PUBLIC_ORIGIN));
    add(IDS.website, websiteSchema(locale, PUBLIC_ORIGIN));
    return () => scripts.forEach((script) => script.remove());
  }, [locale]);

  return null;
}
