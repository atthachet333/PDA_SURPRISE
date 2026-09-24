import { PageHeader } from '@/components/business/PageHeader';
import { Container } from '@/components/shared/Layout';
import { company } from '@/data/company';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';
import { useLocale } from '@/app/LocaleContext';
import { privacyPage, type LegalPage } from '@/i18n/legal';
import { fill } from '@/i18n/fill';

export default function Privacy() {
  usePageMeta(pageMeta.privacy);

  return (
    <LegalDocument
      page={privacyPage}
      slots={{
        email: <a href={`mailto:${company.email}`} className="text-brand-700 underline underline-offset-4">{company.email}</a>,
        phone: <a href={`tel:${company.phone}`} className="text-brand-700 underline underline-offset-4">{company.phoneDisplay}</a>
      }}
    />
  );
}

/**
 * A legal page from its localised source (i18n/legal.ts). `slots` fills
 * `{email}`-style placeholders with real elements, so contact details and
 * storage keys are never part of the translated text.
 */
export function LegalDocument({
  page,
  slots = {},
  after
}: {
  page: LegalPage;
  slots?: Record<string, React.ReactNode>;
  /** Extra content under a section, by index (the cookie-settings button). */
  after?: Record<number, React.ReactNode>;
}) {
  const { t } = useLocale();
  return (
    <>
      <PageHeader eyebrow={page.eyebrow} title={<>{t(page.title)}</>} lead={t(page.lead)} />
      <LegalBody>
        {page.sections.map((section, index) => (
          <Section key={section.title.th} title={t(section.title)}>
            <p>{fill(t(section.body), slots)}</p>
            {after?.[index]}
          </Section>
        ))}
      </LegalBody>
    </>
  );
}

export function LegalBody({ children }: { children: React.ReactNode }) { return <section className="sect sect--bright py-section"><Container><div className="mx-auto max-w-3xl space-y-12">{children}</div></Container></section>; }
export function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="thai-display text-xl font-bold text-ink">{title}</h2><div className="mt-4 space-y-4 text-sm leading-8 text-steel-600">{children}</div></section>; }
