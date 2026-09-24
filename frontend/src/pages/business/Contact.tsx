import { PageHeader } from '@/components/business/PageHeader';
import { ContactForm } from '@/components/business/ContactForm';
import { Container } from '@/components/shared/Layout';
import { company } from '@/data/company';
import { cn } from '@/lib/cn';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';
import { useLocale } from '@/app/LocaleContext';
import { contactPage as copy } from '@/i18n/contact';
import { addressLines, businessHours } from '@/i18n/company';
import { companyCopy, trustLinks } from '@/i18n/trust';
import { LocaleLink } from '@/components/shared/LocaleLink';

/**
 * /contact — the form is the page. Everything else is a quiet reference column.
 *
 * Every contact detail comes from `data/company.ts`. Nothing is literal here.
 */
export default function Contact() {
  usePageMeta(pageMeta.contact);
  const { t } = useLocale();

  return (
    <>
      <PageHeader
        eyebrow="01 / CONTACT"
        title={<>{t(copy.title)}</>}
        lead={t(copy.lead)}
      />

      <section className="sect sect--bright relative overflow-hidden py-section">
        <Container wide className="relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.55fr)] lg:gap-14 xl:gap-20">
            <div>
              <p className="section-code">02 / BRIEF</p>
              <ContactForm />
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="section-code">03 / DIRECT</p>

              <dl className="mt-8 border-t border-steel-200">
                {/* EP40: the registered company behind every channel below. */}
                <Row label={t(companyCopy.registeredName)}>
                  <span className="block" lang="th">{company.legalNameTh}</span>
                  <span className="block">{company.legalName}</span>
                </Row>
                <Row label={t(copy.email)}>
                  <a className="hover:text-brand-600" href={`mailto:${company.email}`}>
                    {company.email}
                  </a>
                </Row>
                <Row label={t(copy.phone)}>
                  <a className="hover:text-brand-600" href={`tel:${company.phone}`}>
                    {company.phoneDisplay}
                  </a>
                </Row>
                <Row label={t(copy.line)}>
                  <a
                    className="hover:text-brand-600"
                    href={company.lineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company.lineOA}
                  </a>
                </Row>
                <Row label={t(copy.office)}>
                  <address className="not-italic">
                    {t(addressLines).map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </Row>
                <Row label={t(copy.hours)}>
                  <span className="block">{t(businessHours.days)}</span>
                  <span className="block">{t(businessHours.time)}</span>
                  <span className="mt-2 block font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-400">
                    {t(businessHours.note)}
                  </span>
                </Row>
              </dl>
              <LocaleLink
                to="/about#company"
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-ink underline decoration-steel-300 underline-offset-4 transition-colors hover:text-brand-700"
              >
                {t(trustLinks.companyInfo)}
              </LocaleLink>

              {/* What happens next */}
              <div className="on-dark mt-10 overflow-hidden rounded-panel border border-brand-400/20 bg-[linear-gradient(155deg,#063B2A,#04261B)] p-7 text-white">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-300">
                  next steps
                </p>
                <ol className="mt-5 space-y-4">
                  {t(copy.nextSteps).split('|').map((step, index) => (
                    <li key={step} className="flex items-start gap-3.5">
                      <span className="mt-px font-mono text-[0.625rem] tabular-nums text-brand-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs leading-6 text-brand-100/75">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

function Row({
  label,
  children,
  className
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('border-b border-steel-200 py-5', className)}>
      <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-steel-400">
        {label}
      </dt>
      <dd className="thai-display mt-2.5 break-words text-sm leading-relaxed text-ink [&_a]:transition-colors">
        {children}
      </dd>
    </div>
  );
}
