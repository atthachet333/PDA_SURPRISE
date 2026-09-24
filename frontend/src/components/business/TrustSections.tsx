import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { LocaleLink } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { company } from '@/data/company';
import { addressLines, businessHours } from '@/i18n/company';
import { companyCopy, scopeCopy, supportCopy } from '@/i18n/trust';
import { ui } from '@/i18n/ui';
import { cn } from '@/lib/cn';

/**
 * ============================================================================
 * TRUST SECTIONS (EP40) — the evidence layer on About and Services
 * ============================================================================
 *   ScopeFactors    what shapes scope, time and price — no fixed packages
 *                   (/services#scope)
 *   SupportScope    post-handover work, and an honest support model
 *   CompanyInfo     the registered company and its real contact channels
 *
 * EP41 moved the "why us" and quality/privacy blocks into About's own,
 * shorter sections (AboutSections.tsx).
 *
 * All copy is localised (i18n/trust.ts) and all surfaces use theme tokens,
 * so each section reads correctly in Light, Dark and System.
 * ============================================================================
 */

/* ------------------------------------------------------ scope factors -- */

export function ScopeFactors({ code, className }: { code: string; className?: string }) {
  const { t } = useLocale();
  const [lead, accent] = t(scopeCopy.title);

  return (
    <section id="scope" aria-labelledby="scope-factors" className={cn('sect sect--paper relative scroll-mt-24 py-section', className)}>
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <p className="section-code">{code}</p>
            <h2 id="scope-factors" className="thai-display mt-4 text-statement font-bold text-ink">
              {lead}
              <br />
              <span className="text-brand-700">{accent}</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-steel-600">{t(scopeCopy.lead)}</p>
          </div>
          <div>
            <ul className="grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-2">
              {t(scopeCopy.factors).map((factor, index) => (
                <li key={factor} className="flex items-start gap-3 bg-white p-4 text-sm leading-relaxed text-steel-700">
                  <span className="mt-0.5 font-mono text-[0.625rem] tabular-nums text-brand-600">{String(index + 1).padStart(2, '0')}</span>
                  {factor}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <p className="text-sm font-medium text-ink">{t(scopeCopy.note)}</p>
              {/* A quiet link: the page's one primary action is its closing CTA. */}
              <LocaleLink
                to="/contact"
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-ink"
              >
                {t(scopeCopy.cta)} <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
              </LocaleLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ support -- */

/** Rendered inside the dark About support section — light-on-dark text, stacked. */
export function SupportScope() {
  const { t } = useLocale();
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-400">{t(supportCopy.worksTitle)}</h4>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {t(supportCopy.works).map((work) => (
            <li key={work} className="flex items-start gap-2.5 text-sm leading-relaxed text-brand-100/80">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
              {work}
            </li>
          ))}
        </ul>
      </div>
      <p className="rounded-card border border-white/10 p-5 text-sm leading-7 text-brand-100/75">{t(supportCopy.model)}</p>
    </div>
  );
}

/* ------------------------------------------------------------ company -- */

export function CompanyInfo({ code }: { code: string }) {
  const { t } = useLocale();

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: t(companyCopy.registeredName),
      value: (
        <>
          <span className="block" lang="th">{company.legalNameTh}</span>
          <span className="block">{company.legalName}</span>
        </>
      )
    },
    {
      label: t(companyCopy.address),
      value: (
        <address className="not-italic">
          {t(addressLines).map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      )
    },
    { label: t(companyCopy.phone), value: <a className="hover:text-brand-700" href={`tel:${company.phone}`}>{company.phoneDisplay}</a> },
    { label: t(companyCopy.email), value: <a className="break-all hover:text-brand-700" href={`mailto:${company.email}`}>{company.email}</a> },
    {
      label: t(companyCopy.line),
      value: (
        <a className="hover:text-brand-700" href={company.lineUrl} target="_blank" rel="noopener noreferrer">
          {company.lineOA}
          <span className="sr-only"> {t(ui.opensInNewTab)}</span>
        </a>
      )
    },
    {
      label: t(companyCopy.hours),
      value: (
        <>
          <span className="block">
            {t(businessHours.days)} {t(businessHours.time)}
          </span>
          <span className="mt-1 block text-xs text-steel-500">{t(businessHours.note)}</span>
        </>
      )
    }
  ];

  return (
    <section id="company" aria-labelledby="company-title" className="sect sect--paper relative scroll-mt-24 py-section">
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <div>
            <p className="section-code">{code}</p>
            <h2 id="company-title" className="thai-display mt-4 text-statement font-bold text-ink">
              {t(companyCopy.title)}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-steel-600">{t(companyCopy.lead)}</p>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label} className="bg-white p-5">
                <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-steel-500">{row.label}</dt>
                <dd className="thai-display mt-2 text-sm leading-relaxed text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
