import { LocaleLink as Link } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { usePrimaryServices, useSupportingServices } from '@/i18n/useContent';
import { servicesPage as copy } from '@/i18n/services';
import { cta as ctaText, ui } from '@/i18n/ui';
import { businessHours } from '@/i18n/company';
import { fill } from '@/i18n/fill';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { Icon } from '@/components/shared/Icon';
import { ProcessPath } from '@/components/business/ProcessPath';
import { ServiceDistinctions, ServiceMap, ServiceSections } from '@/components/business/ServiceCatalogue';
import { caseStudies } from '@/data/caseStudies';
import { company } from '@/data/company';
import { contactHref, isContactServiceId } from '@/data/contactRouting';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useHashTarget } from '@/hooks/useHashTarget';
import { ScopeFactors } from '@/components/business/TrustSections';
import { trustLinks } from '@/i18n/trust';
import { pageMeta } from '@/lib/seo';
import { cn } from '@/lib/cn';

/**
 * /services — "PDA BLISS ช่วยธุรกิจของผมเรื่องอะไรได้บ้าง?"
 *
 *   01 hero          the answer in two lines
 *   02 capability map  all eight services in one scan
 *   03 services      one section each: problem → what we build → good for → work
 *   04 distinctions  website vs web app vs ERP vs mobile vs files
 *   05 process       how a project actually runs
 *   06 scope         what shapes scope, time and price — no fixed packages (EP40)
 *   07 capabilities  the supporting work that ships inside the eight
 *   08 CTA           for visitors who have a problem but not a solution name
 *
 * /services answers what PDA BLISS can build. /solutions shows how those
 * systems connect as one universe — the cross-link in 06 keeps the two from
 * reading as the same page.
 */
export default function Services() {
  usePageMeta(pageMeta.services);
  useHashTarget();

  return (
    <>
      <ServicesHero />
      <ServiceMap code="02 / CAPABILITY MAP" />
      <ServiceSections code="03 / SERVICES" />
      <ServiceDistinctions code="04 / NOT THE SAME THING" />
      <ProcessPath code="05 / PROCESS" />
      <ScopeFactors code="06 / SCOPE" />
      <SupportingCapabilities />
      <ServicesCta />
    </>
  );
}

/* --------------------------------------------------------------- 01 hero -- */

/** Concrete proof under the headline — counts, never adjectives. */
function ServicesHero() {
  const { t } = useLocale();
  const primaryServices = usePrimaryServices();
  const withWork = primaryServices.filter((service) => service.relatedProjects.length > 0).length;
  const [lead, accent] = t(copy.heroTitle);

  return (
    <section className="sect sect--bright relative overflow-hidden pb-14 pt-32 sm:pb-16 sm:pt-40">
      <span aria-hidden="true" className="work-grid pointer-events-none absolute inset-0" />
      <Container wide className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end">
          <div>
            <p className="section-code">{t(copy.heroCode)}</p>
            <h1 className="thai-display mt-4 max-w-4xl text-[clamp(2.1rem,4.4vw,3.8rem)] font-bold leading-[1.14] text-ink">
              {lead}
              <br />
              <span className="text-brand-700">{accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-steel-600">
              {t(copy.heroLead)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#service-map"
                className="group inline-flex min-h-11 items-center gap-2 rounded-pill bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {t(ctaText.viewAllServices)}
                <ArrowIcon className="transition-transform duration-base group-hover:translate-y-0.5 group-hover:rotate-90" />
              </a>
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-steel-300 px-5 text-sm font-semibold text-ink transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                {t(copy.heroTell)}
                <ArrowIcon />
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200">
            <div className="bg-white p-5">
              <dt className="text-xs text-steel-500">{t(copy.statCore)}</dt>
              <dd className="mt-1 font-mono text-4xl font-semibold text-ink">{primaryServices.length}</dd>
              <dd className="mt-1 text-[0.7rem] leading-snug text-steel-600">{t(copy.statCoreNote)}</dd>
            </div>
            <div className="bg-white p-5">
              <dt className="text-xs text-steel-500">{t(copy.statWork)}</dt>
              <dd className="mt-1 font-mono text-4xl font-semibold text-ink">{withWork}</dd>
              <dd className="mt-1 text-[0.7rem] leading-snug text-steel-600">
                {t(copy.statWorkNote)}
              </dd>
            </div>
            <div className="col-span-2 bg-brand-50 p-4 text-xs leading-relaxed text-brand-800">
              {t(copy.statNote)}
            </div>
          </dl>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------- 06 capabilities -- */

/**
 * Supporting work, deliberately quieter than the eight core sections: these
 * are things that ship inside a project, not things a visitor buys on its own.
 * This is also where /services hands off to /solutions.
 */
function SupportingCapabilities() {
  const { t } = useLocale();
  const supportingServices = useSupportingServices();
  const [lead, accent] = t(copy.capTitle);
  return (
    <section aria-labelledby="capabilities" className="sect sect--paper relative py-section">
      <Container wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:gap-16">
          <div>
            <p className="section-code">07 / CAPABILITIES</p>
            <h2 id="capabilities" className="thai-display mt-3 text-statement font-bold text-ink">
              {lead}<span className="text-brand-700">{accent}</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel-600">
              {t(copy.capLead)}
            </p>

            <ul className="mt-8 grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-2">
              {supportingServices.map((service) => (
                <li key={service.id} className="bg-white p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-card border border-steel-200 text-steel-600">
                      <Icon name={service.icon} className="h-3.5 w-3.5" />
                    </span>
                    <p className="thai-display text-sm font-bold text-ink">{service.title}</p>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-steel-600">{service.summary}</p>
                  {isContactServiceId(service.id) ? (
                    <Link
                      to={contactHref(service.id, `service:${service.id}`)}
                      className="group mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-ink transition-colors hover:text-brand-700"
                    >
                      {t(copy.talkWork)}
                      <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-panel border border-brand-200 bg-brand-50/60 p-5 sm:p-6 lg:self-start">
            <p className="font-mono text-[0.6rem] tracking-[0.16em] text-brand-700">SYSTEM UNIVERSE</p>
            <h3 className="thai-display mt-3 text-xl font-bold text-ink">
              {t(copy.universeTitle)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-steel-700">
              {t(copy.universeBody)}
            </p>
            <Link
              to="/solutions"
              className="group mt-5 inline-flex min-h-11 items-center gap-2 rounded-pill bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {t(copy.universeCta)}
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </Link>
            <p className="mt-5 border-t border-brand-200 pt-4 text-xs leading-relaxed text-steel-600">
              {fill(t(copy.orSee), {
                n: caseStudies.length,
                link: (
                  <Link to="/work" className="font-semibold text-ink underline underline-offset-2 hover:text-brand-700">
                    {t(copy.orSeeLink)}
                  </Link>
                )
              })}
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- 07 CTA -- */

/**
 * The final CTA is aimed at the visitor this page is really for: someone with
 * a problem who does not yet know which of the eight services it maps to.
 */
function ServicesCta() {
  const { t } = useLocale();
  const [lead, accent] = t(copy.ctaTitle);
  const actions = [
    { label: `LINE ${company.lineOA}`, href: company.lineUrl, external: true, primary: true },
    { label: t(copy.ctaSend), to: '/contact', primary: false },
    { label: `${t(copy.ctaCall)} ${company.phoneDisplay}`, href: `tel:${company.phone}`, primary: false },
    { label: company.email, href: `mailto:${company.email}`, primary: false }
  ];

  return (
    <section aria-labelledby="services-cta" className="sect sect--deep relative overflow-hidden py-section text-white">
      <Container wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="section-code text-brand-300">08 / START</p>
            <h2
              id="services-cta"
              className="thai-display mt-3 max-w-3xl text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-tight"
            >
              {lead}
              <br />
              <span className="text-brand-300">{accent}</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-brand-100/70">
              {t(copy.ctaBody)}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-brand-100/55">
              {t(businessHours.days)} {t(businessHours.time)} · {t(businessHours.note)}
            </p>
            <Link
              to="/about#process"
              className="group mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-200 transition-colors hover:text-white"
            >
              {t(trustLinks.howWeWork)}
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 lg:max-w-md lg:justify-end">
            {actions.map((action) =>
              action.to ? (
                <Link
                  key={action.label}
                  to={action.to}
                  className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:border-brand-300 hover:bg-white/5"
                >
                  {action.label} <ArrowIcon />
                </Link>
              ) : (
                <a
                  key={action.label}
                  href={action.href}
                  {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-pill px-5 text-sm font-semibold transition-colors',
                    action.primary
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'border border-white/25 text-white hover:border-brand-300 hover:bg-white/5'
                  )}
                >
                  {action.label}
                  {action.external ? <span className="sr-only">{t(ui.opensInNewTab)}</span> : null}
                </a>
              )
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
