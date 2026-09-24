import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { LocaleLink } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { caseStudies } from '@/data/caseStudies';
import { metrics, techStack } from '@/data/company';
import { aboutPage as copy, aftercareText, buildGroups, evidenceCases, philosophyText } from '@/i18n/about';
import { qualityCopy, techText } from '@/i18n/trust';
import { metricText } from '@/i18n/work';
import { useCaseStudies } from '@/i18n/useContent';
import { SupportScope } from './TrustSections';

/**
 * ============================================================================
 * ABOUT SECTIONS (EP41) — who PDA BLISS is, told concisely
 * ============================================================================
 *   AboutStory      why we build software this way (owner's words + quote)
 *   WhatWeBuild     five capability groups, each a link into /services
 *   HowWeThink      the four principles
 *   AboutEvidence   verified figures + three case studies, link to /work
 *   TechQuality     tools from delivered work, checks, data disclosure
 *   AboutSupport    aftercare, post-handover work, honest support model
 *
 * Each uses a different composition so the page does not read as one long
 * two-column template. Numbers are read from data, never typed; all copy is
 * localised; all surfaces use theme tokens.
 * ============================================================================
 */

const textLink =
  'group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-700';

/* ------------------------------------------------------------- story -- */

export function AboutStory({ code }: { code: string }) {
  const { t } = useLocale();
  const [quoteLead, quoteAccent] = t(copy.quote);

  return (
    <section aria-labelledby="about-story" className="sect sect--bright relative overflow-hidden py-section">
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <p className="section-code">{code}</p>
            <h2 id="about-story" className="thai-display mt-4 text-statement font-bold text-ink">
              {t(copy.storyTitle)}
            </h2>
            <p className="mt-6 max-w-prose text-lead text-steel-700">{t(copy.whoBody)}</p>
            <p className="mt-5 max-w-prose leading-8 text-steel-600">{t(copy.secondParagraph)}</p>
          </div>

          <blockquote className="on-dark relative self-start overflow-hidden rounded-panel border border-brand-400/20 bg-[linear-gradient(155deg,#063B2A_0%,#0B5137_52%,#04261B_100%)] p-8 text-white sm:p-10">
            <span
              aria-hidden="true"
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(53,201,111,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.1) 1px, transparent 1px)',
                backgroundSize: '48px 48px'
              }}
            />
            <div className="relative">
              <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand-300">our position</p>
              <p className="thai-display mt-6 text-2xl font-bold leading-snug sm:text-3xl">
                “{quoteLead}
                <br />
                <span className="text-brand-300">{quoteAccent}</span>”
              </p>
              <p className="mt-6 text-sm leading-7 text-brand-100/75">{t(copy.quoteSupport)}</p>
            </div>
          </blockquote>
        </div>
      </Container>
    </section>
  );
}

/* ----------------------------------------------------- what we build -- */

export function WhatWeBuild({ code }: { code: string }) {
  const { t } = useLocale();

  return (
    <section aria-labelledby="about-build" className="sect sect--paper relative py-section">
      <Container className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 id="about-build" className="thai-display mt-4 text-statement font-bold text-ink">
              {t(copy.buildTitle)}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-steel-600">{t(copy.buildLead)}</p>
          </div>
          <LocaleLink to="/services" className={textLink}>
            {t(copy.buildAll)}
            <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
          </LocaleLink>
        </div>

        <ol className="mt-10 border-t border-steel-300/60">
          {buildGroups.map((group, index) => (
            <li key={group.to} className="border-b border-steel-300/60">
              <LocaleLink
                to={group.to}
                className="group grid min-h-11 gap-1 py-5 transition-colors hover:text-brand-700 sm:grid-cols-[3rem_minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-baseline sm:gap-6"
              >
                <span className="font-mono text-[0.6875rem] tabular-nums text-brand-600">{String(index + 1).padStart(2, '0')}</span>
                <span className="thai-display text-lg font-bold text-ink group-hover:text-brand-700">{t(group.label)}</span>
                <span className="text-sm leading-relaxed text-steel-600">{t(group.line)}</span>
                <ArrowIcon className="hidden text-steel-400 transition-transform duration-base group-hover:translate-x-1 sm:block" />
              </LocaleLink>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------ how we think -- */

export function HowWeThink({ code }: { code: string }) {
  const { t } = useLocale();

  return (
    <section aria-labelledby="about-think" className="sect sect--field relative overflow-hidden py-section">
      <Container className="relative">
        <p className="section-code">{code}</p>
        <h2 id="about-think" className="thai-display mt-4 max-w-2xl text-statement font-bold text-ink">
          {t(copy.thinkTitle)}
        </h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 md:grid-cols-2">
          {philosophyText.map((item, index) => (
            <li key={item.heading.th} className="bg-white p-6 sm:p-7">
              <span className="font-mono text-[0.6875rem] tabular-nums text-brand-600">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="thai-display mt-3 text-lg font-bold text-ink">{t(item.heading)}</h3>
              <p className="mt-2 text-sm leading-7 text-steel-600">{t(item.body)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------- evidence -- */

export function AboutEvidence({ code }: { code: string }) {
  const { t } = useLocale();
  const studies = useCaseStudies();
  const figures = [
    ...metrics.map((metric, index) => ({
      value: metric.value,
      label: metricText[index] ? t(metricText[index]!.label) : metric.label,
      detail: metricText[index] ? t(metricText[index]!.detail) : metric.detail
    })),
    { value: caseStudies.length, label: t(copy.casesLabel), detail: t(copy.casesDetail) }
  ];
  const examples = evidenceCases
    .map((slug) => studies.find((study) => study.slug === slug))
    .filter((study) => study !== undefined);

  return (
    <section aria-labelledby="about-evidence" className="sect sect--deep relative overflow-hidden py-section text-white">
      <Container className="relative">
        <p className="section-code text-brand-400">{code}</p>
        <h2 id="about-evidence" className="thai-display mt-4 max-w-2xl text-statement font-bold text-white">
          {t(copy.evidenceTitle)}
        </h2>

        <dl className="mt-10 grid gap-8 border-y border-white/10 py-8 sm:grid-cols-3">
          {figures.map((figure) => (
            /* dt before dd in the markup; the figure is lifted visually with flex order. */
            <div key={figure.label} className="flex flex-col">
              <dt className="thai-display order-2 mt-3 text-base font-bold text-white">{figure.label}</dt>
              <dd className="order-1 font-mono text-5xl font-semibold tabular-nums text-white">{figure.value}</dd>
              <dd className="order-3 mt-1 text-sm leading-relaxed text-brand-100/65">{figure.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-brand-100/55">{t(copy.evidenceNote)}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1.6fr)] lg:items-start">
          <h3 className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-300">{t(copy.examplesTitle)}</h3>
          <div>
            <ul className="grid gap-3 md:grid-cols-3">
              {examples.map((study) => (
                <li key={study.slug}>
                  <LocaleLink
                    to={`/work/${study.slug}`}
                    className="group flex h-full min-h-11 flex-col rounded-card border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-brand-300/40 hover:bg-white/[0.07]"
                  >
                    <span className="font-mono text-[0.55rem] tracking-[0.13em] text-brand-300">{study.projectType}</span>
                    <span className="thai-display mt-2 text-sm font-semibold leading-snug text-white">{study.title}</span>
                  </LocaleLink>
                </li>
              ))}
            </ul>
            <LocaleLink to="/work" className="group mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-200 transition-colors hover:text-white">
              {t(copy.evidenceAll)}
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </LocaleLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------ technology + quality -- */

export function TechQuality({ code }: { code: string }) {
  const { t } = useLocale();
  const studies = useCaseStudies();
  const [lead, accent] = t(copy.techQualityTitle);
  /* The delivered projects behind each group — evidence, named once per group. */
  const usedIn = (evidence: readonly string[]) =>
    [...new Set(evidence)]
      .map((slug) => studies.find((study) => study.slug === slug)?.title)
      .filter(Boolean)
      .join(' · ');

  return (
    <section id="technology" aria-labelledby="about-tech" className="sect sect--bright relative scroll-mt-24 py-section">
      <Container wide className="relative">
        <p className="section-code">{code}</p>
        <h2 id="about-tech" className="thai-display mt-4 max-w-3xl text-statement font-bold text-ink">
          {lead}
          <br />
          <span className="text-brand-700">{accent}</span>
        </h2>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
          {/* Technology — secondary evidence, grouped, never a logo wall. */}
          <div className="rounded-panel border border-steel-200 bg-white p-6">
            <h3 className="thai-display text-lg font-bold text-ink">{t(copy.techHeading)}</h3>
            <dl className="mt-4 divide-y divide-steel-200">
              {techStack.map((group) => (
                <div key={group.group} className="py-3">
                  <dt className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-brand-600">
                    {techText[group.group] ? t(techText[group.group]!.group) : group.groupTh}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-ink">{group.items.map((item) => item.name).join(' · ')}</dd>
                  <dd className="mt-1 text-xs leading-relaxed text-steel-500">
                    {t(copy.usedIn)}
                    {usedIn(group.items.flatMap((item) => item.evidence))}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 border-t border-steel-200 pt-3 text-xs leading-relaxed text-steel-500">{t(copy.techNote)}</p>
          </div>

          <div id="quality" className="scroll-mt-28 rounded-panel border border-steel-200 bg-white p-6">
            <h3 className="thai-display text-lg font-bold text-ink">{t(qualityCopy.practicesTitle)}</h3>
            <ul className="mt-4 space-y-2.5">
              {t(qualityCopy.practices).map((practice) => (
                <li key={practice} className="flex items-start gap-2.5 text-sm leading-relaxed text-steel-700">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-[2px] bg-brand-500" />
                  {practice}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-steel-200 pt-3 text-xs leading-relaxed text-steel-500">{t(qualityCopy.practicesNote)}</p>
          </div>

          <div className="rounded-panel border border-brand-200 bg-brand-50 p-6">
            <h3 className="thai-display text-lg font-bold text-ink">{t(qualityCopy.privacyTitle)}</h3>
            <ul className="mt-4 space-y-2.5">
              {t(qualityCopy.privacy).map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-steel-700">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  {point}
                </li>
              ))}
            </ul>
            <LocaleLink to="/privacy" className={`${textLink} mt-2`}>
              {t(qualityCopy.privacyLink)}
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </LocaleLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ----------------------------------------------------------- support -- */

/** Aftercare: handover and ongoing care only — the two commitments the rest of the site already makes. */
const AFTERCARE_SHOWN = [3, 4] as const;

export function AboutSupport({ code }: { code: string }) {
  const { t } = useLocale();

  return (
    <section id="support" aria-labelledby="about-support" className="sect sect--deep relative scroll-mt-24 overflow-hidden py-section text-white">
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="section-code text-brand-400">{code}</p>
            <h2 id="about-support" className="thai-display mt-4 text-statement font-bold text-white">
              {t(copy.aftercareHeading)}
            </h2>
            <p className="mt-5 text-sm leading-7 text-brand-100/70">{t(copy.aftercareBody)}</p>
            <dl className="mt-8 space-y-5">
              {AFTERCARE_SHOWN.map((index) => {
                const item = aftercareText[index];
                return item ? (
                  <div key={index}>
                    <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-400">{t(item.label)}</dt>
                    <dd className="mt-1.5 text-sm leading-6 text-brand-100/80">{t(item.value)}</dd>
                  </div>
                ) : null;
              })}
            </dl>
          </div>
          <div className="lg:pt-10">
            <SupportScope />
          </div>
        </div>
      </Container>
    </section>
  );
}
