import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';
import { Icon } from '@/components/shared/Icon';
import { ArrowIcon } from '@/components/shared/Button';
import { ProductPanel } from './ProductPanel';
import type { PrimaryService } from '@/data/services';
import type { CaseStudy } from '@/data/caseStudies';
import { LocaleLink as Link } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { useCaseStudies, usePrimaryServices, useServiceDistinctions } from '@/i18n/useContent';
import { servicesPage as copy } from '@/i18n/services';
import { cta as ctaText } from '@/i18n/ui';
import { fill, fillText } from '@/i18n/fill';
import { visualForService } from '@/data/visuals';
import { contactHref } from '@/data/contactRouting';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * SERVICES — the capability map and the eight service sections.
 *
 * The overview is a scan-first map: eight rows a visitor can read in a few
 * seconds. Each service then gets a full section built on one content model —
 * PROBLEM → WHAT WE BUILD → GOOD FOR → RELATED WORK — so every service answers
 * the same four questions in the same order.
 *
 * Related work is looked up from `caseStudies.ts` by slug. Nothing about a
 * project is restated here, and a service with no public case study shows a
 * conversation prompt instead of a fabricated one.
 */

/** Resolves a service's related case studies from the canonical project data. */
function relatedCases(service: PrimaryService, studies: readonly CaseStudy[]) {
  return service.relatedProjects
    .map((slug) => studies.find((study) => study.slug === slug))
    .filter((study): study is CaseStudy => Boolean(study));
}

function serviceContactHref(service: PrimaryService): string {
  return contactHref(service.id, `service:${service.id}`);
}

/* ------------------------------------------------------------- overview -- */

/**
 * The capability map: every service at a glance, numbered, with the business
 * value on the same line. Anchors jump to the matching section below rather
 * than opening a second route.
 */
export function ServiceMap({ code = '02 / CAPABILITY MAP' }: { code?: string } = {}) {
  const reduced = useReducedMotion();
  const { t } = useLocale();
  const primaryServices = usePrimaryServices();

  return (
    <section aria-labelledby="service-map" className="sect sect--paper relative py-section">
      <Container wide>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 id="service-map" className="thai-display mt-3 text-statement font-bold text-ink">
              {fill(t(copy.mapTitle), {
                count: <span className="text-brand-700">{fillText(t(copy.mapCount), { n: primaryServices.length })}</span>
              })}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-steel-600">
            {t(copy.mapLead)}
          </p>
        </div>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 md:grid-cols-2">
          {primaryServices.map((service, index) => (
            <motion.li
              key={service.id}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: Math.min(index, 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white"
            >
              <a
                href={`#${service.id}`}
                className="group flex h-full min-h-11 items-start gap-4 p-5 transition-colors hover:bg-brand-50/60 focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-600 sm:p-6"
              >
                <span className="font-mono text-[0.7rem] tabular-nums text-brand-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-brand-200 bg-brand-50 text-brand-700">
                  <Icon name={service.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="thai-display block text-base font-bold text-ink group-hover:text-brand-700">
                    {service.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-steel-600">{service.summary}</span>
                </span>
                <ArrowIcon className="mt-1 shrink-0 rotate-90 text-steel-400 transition-transform duration-base group-hover:translate-y-1" />
              </a>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------- sections -- */

/** All eight service sections, alternating surface so they read as separate. */
export function ServiceSections({ code = '03 / SERVICES' }: { code?: string } = {}) {
  const { t } = useLocale();
  const primaryServices = usePrimaryServices();
  const studies = useCaseStudies();
  const [lead, accent] = t(copy.sectionsTitle);
  return (
    <section aria-labelledby="service-detail" className="sect sect--bright relative py-section">
      {/* EP43: the route these eight sections hang on. */}
      <span aria-hidden="true" className="atm-rail" />
      <Container wide>
        <p className="section-code">{code}</p>
        <h2 id="service-detail" className="thai-display mt-3 text-statement font-bold text-ink">
          {lead}<span className="text-brand-700">{accent}</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel-600">
          {t(copy.sectionsLead)}
        </p>

        <div className="mt-14 space-y-16 lg:mt-20 lg:space-y-24">
          {primaryServices.map((service, index) => (
            <ServiceBlock key={service.id} service={service} index={index} studies={studies} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ServiceBlock({ service, index, studies }: { service: PrimaryService; index: number; studies: readonly CaseStudy[] }) {
  const reduced = useReducedMotion();
  const { t } = useLocale();
  const flip = index % 2 === 1;
  const cases = relatedCases(service, studies);
  const leadCase = cases[0];
  const visual = visualForService(service.id);

  return (
    <article
      id={service.id}
      className="scroll-mt-28 border-t border-steel-200 pt-10 lg:grid lg:grid-cols-12 lg:gap-12 lg:pt-14"
    >
      {/* ------------------------------------------------ heading + visual -- */}
      <div className={cn('lg:col-span-5', flip && 'lg:order-2')}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.7rem] tabular-nums text-brand-600">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-brand-200 bg-brand-50 text-brand-700">
            <Icon name={service.icon} className="h-4 w-4" />
          </span>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-steel-600">
            {service.eyebrow}
          </span>
        </div>

        <h3 className="thai-display mt-4 text-[clamp(1.5rem,2.4vw,2.1rem)] font-bold leading-tight text-ink">
          {service.title}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-steel-700">{service.summary}</p>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'mt-7 overflow-hidden rounded-panel shadow-lift-lg ring-1 ring-black/5',
            visual.mock === 'hrLine' ? 'mx-auto aspect-[10/15] max-w-[15rem]' : 'aspect-[16/11]'
          )}
        >
          {/*
            Illustration, not a toy. Eight interactive mocks on one page would
            put dozens of tiny unlabelled buttons into the tab order, so the
            mock's controls render as spans here.
          */}
          <ProductPanel slot={visual} className="h-full" showMockNotice interactive={false} />
        </motion.div>
      </div>

      {/* ------------------------------------------------------------ body -- */}
      <div className={cn('mt-10 lg:col-span-7 lg:mt-0', flip && 'lg:order-1')}>
        <div className="rounded-panel border border-brand-100 bg-brand-50/60 p-5 sm:p-6">
          <p className="font-mono text-[0.58rem] tracking-[0.16em] text-brand-700">{t(copy.labelProblem)}</p>
          <p className="thai-display mt-3 text-lg font-semibold leading-snug text-ink">{service.problem}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {service.problems.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-steel-700">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7 grid gap-7 sm:grid-cols-2 [&>*]:min-w-0">
          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.16em] text-steel-600">{t(copy.labelBuild)}</p>
            <p className="mt-3 text-sm leading-relaxed text-steel-700">{service.detail}</p>
            <ul className="mt-4 space-y-2">
              {service.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-[2px] bg-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.16em] text-steel-600">{t(copy.labelFor)}</p>
            <ul className="mt-3 space-y-2">
              {service.targetUsers.map((item) => (
                <li
                  key={item}
                  className="rounded-card border border-steel-200 bg-white p-3 text-sm leading-relaxed text-steel-700"
                >
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-6 font-mono text-[0.58rem] tracking-[0.16em] text-steel-600">
              {t(copy.labelWork)}
            </p>
            {cases.length ? (
              <ul className="mt-3 space-y-2">
                {cases.map((study) => (
                  <li key={study.slug}>
                    <Link
                      to={`/work/${study.slug}`}
                      className="group flex min-h-11 items-center gap-3 rounded-card border border-steel-200 bg-white p-3 transition-colors hover:border-brand-300"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[0.55rem] tracking-[0.13em] text-brand-600">
                          {study.projectType}
                        </span>
                        <span className="thai-display mt-1 block truncate text-sm font-semibold text-ink group-hover:text-brand-700">
                          {study.title}
                        </span>
                      </span>
                      <ArrowIcon className="shrink-0 text-steel-400 transition-transform duration-base group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              /* No public case study exists for this service. We say so rather
                 than dressing an unrelated project up as one. */
              <p className="mt-3 rounded-card border border-dashed border-steel-300 bg-white p-3 text-sm leading-relaxed text-steel-600">
                {t(copy.noWork)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            to={serviceContactHref(service)}
            className="group inline-flex min-h-11 items-center gap-2 rounded-pill bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t(copy.talkSystem)}
            <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
          </Link>
          {leadCase ? (
            <Link
              to={`/work/${leadCase.slug}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-steel-300 px-5 text-sm font-semibold text-ink transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              {t(ctaText.seeRelatedWork)}
              <ArrowIcon />
            </Link>
          ) : null}
          <ul className="flex flex-wrap gap-1.5" aria-label={fillText(t(copy.techIn), { title: service.title })}>
            {service.tech.map((item) => (
              <li
                key={item}
                className="rounded-pill border border-steel-200 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-steel-600"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------- differentiation -- */

/**
 * "เว็บไซต์ กับ เว็บแอป ต่างกันยังไง" — the question that decides whether a
 * visitor asks for the right thing. Five families, one row each, stated in
 * plain language with a link into the matching service.
 */
export function ServiceDistinctions({ code = '04 / NOT THE SAME THING' }: { code?: string } = {}) {
  const { t } = useLocale();
  const serviceDistinctions = useServiceDistinctions();
  const [lead, accent] = t(copy.distinctTitle);
  return (
    <section aria-labelledby="service-distinctions" className="sect sect--field relative py-section">
      <Container wide>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 id="service-distinctions" className="thai-display mt-3 text-statement font-bold text-ink">
              {lead}<br />
              <span className="text-brand-700">{accent}</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-steel-600">
            {t(copy.distinctLead)}
          </p>
        </div>

        <ul className="mt-10 space-y-3">
          {serviceDistinctions.map((entry) => (
            <li
              key={entry.id}
              className="grid gap-3 rounded-panel border border-steel-200 bg-white p-5 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)_minmax(0,1fr)] sm:items-start sm:gap-6 sm:p-6"
            >
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-brand-600">{entry.nameEn}</p>
                <p className="thai-display mt-1.5 text-lg font-bold text-ink">{entry.label}</p>
              </div>
              <p className="text-sm leading-relaxed text-steel-700">{entry.is}</p>
              <div>
                <p className="font-mono text-[0.55rem] tracking-[0.14em] text-steel-600">{t(copy.usedBy)}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-steel-700">{entry.forWhom}</p>
                <a
                  href={`#${entry.serviceId}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-brand-700"
                >
                  {t(ctaText.learnMore)}
                  <ArrowIcon />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
