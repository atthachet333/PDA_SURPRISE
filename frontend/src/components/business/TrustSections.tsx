import { Container } from '@/components/shared/Layout';
import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { LocaleLink } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { company, metrics } from '@/data/company';
import { addressLines, businessHours } from '@/i18n/company';
import { fillText } from '@/i18n/fill';
import { companyCopy, qualityCopy, scopeCopy, supportCopy, whyCopy, whyItems } from '@/i18n/trust';
import { ui } from '@/i18n/ui';
import { cn } from '@/lib/cn';

/**
 * ============================================================================
 * TRUST SECTIONS (EP40) — the evidence layer on About and Services
 * ============================================================================
 *   WhyEvidence     five reasons, each linking to the page that proves it
 *   ScopeFactors    what shapes scope, time and price — no fixed packages
 *   QualityPrivacy  engineering checks and data-disclosure practice
 *   SupportScope    post-handover work, and an honest support model
 *   CompanyInfo     the registered company and its real contact channels
 *
 * All copy is localised (i18n/trust.ts) and all surfaces use theme tokens,
 * so each section reads correctly in Light, Dark and System.
 * ============================================================================
 */

/** `#anchor` stays an in-page link; anything else is a localised route. */
function EvidenceLink({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  if (to.startsWith('#')) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    );
  }
  return (
    <LocaleLink to={to} className={className}>
      {children}
    </LocaleLink>
  );
}

const linkClass =
  'group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-700';

/* ------------------------------------------------------------ why us -- */

export function WhyEvidence({ code }: { code: string }) {
  const { t } = useLocale();
  const [lead, accent] = t(whyCopy.title);
  const slots = { systems: metrics[0]?.value ?? 0, websites: metrics[1]?.value ?? 0 };

  return (
    <section aria-labelledby="why-evidence" className="sect sect--field relative overflow-hidden py-section">
      <Container className="relative">
        <p className="section-code">{code}</p>
        <h2 id="why-evidence" className="thai-display mt-4 max-w-3xl text-statement font-bold text-ink">
          {lead}
          <br />
          <span className="text-brand-700">{accent}</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel-600">{t(whyCopy.lead)}</p>

        <ol className="mt-12 border-t border-steel-300/60">
          {whyItems.map((item, index) => (
            <li
              key={item.to}
              className="grid gap-3 border-b border-steel-300/60 py-7 lg:grid-cols-[4rem_minmax(0,0.9fr)_minmax(0,1.1fr)_auto] lg:items-baseline lg:gap-8"
            >
              <span className="font-mono text-[0.6875rem] tabular-nums text-brand-600">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="thai-display text-lg font-bold text-ink">{t(item.title)}</h3>
              <p className="max-w-prose text-sm leading-7 text-steel-600">{fillText(t(item.body), slots)}</p>
              <EvidenceLink to={item.to} className={linkClass}>
                {t(item.link)}
                <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
              </EvidenceLink>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------ scope factors -- */

export function ScopeFactors({ code, className }: { code: string; className?: string }) {
  const { t } = useLocale();
  const [lead, accent] = t(scopeCopy.title);

  return (
    <section aria-labelledby="scope-factors" className={cn('sect sect--paper relative py-section', className)}>
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
              <ButtonLink to="/contact" variant="secondary" size="md">
                {t(scopeCopy.cta)} <ArrowIcon />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------- quality + privacy -- */

export function QualityPrivacy({ code }: { code: string }) {
  const { t } = useLocale();
  const [lead, accent] = t(qualityCopy.title);

  return (
    <section id="quality" aria-labelledby="quality-title" className="sect sect--bright relative scroll-mt-24 py-section">
      <Container className="relative">
        <p className="section-code">{code}</p>
        <h2 id="quality-title" className="thai-display mt-4 max-w-3xl text-statement font-bold text-ink">
          {lead}
          <br />
          <span className="text-brand-700">{accent}</span>
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-panel border border-steel-200 bg-white p-6 sm:p-7">
            <h3 className="thai-display text-lg font-bold text-ink">{t(qualityCopy.practicesTitle)}</h3>
            <ul className="mt-5 space-y-3">
              {t(qualityCopy.practices).map((practice) => (
                <li key={practice} className="flex items-start gap-3 text-sm leading-relaxed text-steel-700">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-[2px] bg-brand-500" />
                  {practice}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-steel-200 pt-4 text-xs leading-relaxed text-steel-500">{t(qualityCopy.practicesNote)}</p>
          </div>

          <div className="rounded-panel border border-brand-200 bg-brand-50 p-6 sm:p-7">
            <h3 className="thai-display text-lg font-bold text-ink">{t(qualityCopy.privacyTitle)}</h3>
            <ul className="mt-5 space-y-3">
              {t(qualityCopy.privacy).map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-steel-700">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  {point}
                </li>
              ))}
            </ul>
            <LocaleLink to="/privacy" className={cn(linkClass, 'mt-3')}>
              {t(qualityCopy.privacyLink)}
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </LocaleLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ support -- */

/** Rendered inside the dark standards/aftercare section — light-on-dark text. */
export function SupportScope() {
  const { t } = useLocale();
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
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
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink to="/contact">
                {t(companyCopy.contact)} <ArrowIcon />
              </ButtonLink>
              <ButtonLink to="/work" variant="secondary">
                {t(companyCopy.work)}
              </ButtonLink>
            </div>
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
