import { company } from '@/data/company';
import { useCookieConsent } from '@/app/cookieConsentContext';
import { useLocale } from '@/app/LocaleContext';
import { cookiePage, legalText } from '@/i18n/legal';
import { LegalDocument } from './Privacy';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';

export default function CookiePolicy() {
  usePageMeta(pageMeta.cookiePolicy);

  const { openSettings } = useCookieConsent();
  const { t } = useLocale();
  return (
    <LegalDocument
      page={cookiePage}
      slots={{
        key: <code className="rounded bg-steel-100 px-1.5 py-1 text-xs">pda-cookie-consent-v1</code>,
        email: <a href={`mailto:${company.email}`} className="text-brand-700 underline underline-offset-4">{company.email}</a>
      }}
      after={{
        3: (
          <button type="button" onClick={openSettings} className="rounded-pill bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800">
            {t(legalText.openSettings)}
          </button>
        )
      }}
    />
  );
}
