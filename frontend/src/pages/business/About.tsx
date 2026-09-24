import { PageHeader } from '@/components/business/PageHeader';
import { ProcessPath } from '@/components/business/ProcessPath';
import { BigCTA } from '@/components/business/BigCTA';
import { CompanyInfo } from '@/components/business/TrustSections';
import {
  AboutEvidence,
  AboutStory,
  AboutSupport,
  HowWeThink,
  TechQuality,
  WhatWeBuild
} from '@/components/business/AboutSections';
import { ArrowIcon } from '@/components/shared/Button';
import { LocaleLink } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { company } from '@/data/company';
import { aboutPage as copy } from '@/i18n/about';
import { addressNote } from '@/i18n/company';
import { useHashTarget } from '@/hooks/useHashTarget';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';

/**
 * /about — who PDA BLISS is, how it thinks, why the work is credible.
 *
 * EP41 made the page a story rather than a second Services or Trust page:
 * each section summarises and links out instead of repeating another page.
 *
 *   01 about        hero: a practical software team that starts from real problems
 *   02 story        why we build this way (owner's words) + our position
 *   03 build        five capability groups → /services
 *   04 think        four principles
 *   05 evidence     verified figures + three case studies → /work
 *   06 process      #process — the canonical seven steps (+ link to /services#scope)
 *   07 tech+quality #technology #quality — delivered tools, checks, data disclosure
 *   08 support      #support — aftercare and an honest support model
 *   09 company      #company — registered name and real contact channels
 *      CTA
 *
 * Every EP40 anchor (#process #technology #quality #support #company) still
 * resolves, so links from Home, Services, Work and Contact keep working.
 */
export default function About() {
  usePageMeta(pageMeta.about);
  useHashTarget();
  const { t } = useLocale();
  const [heroLead, heroAccent] = t(copy.heroTitle);

  return (
    <>
      <PageHeader
        eyebrow="01 / ABOUT"
        title={
          <>
            {heroLead}
            <br />
            <span className="text-brand-700">{heroAccent}</span>
          </>
        }
        lead={t(copy.heroLead)}
      >
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel-500">
          <span>{company.legalName}</span>
          <span aria-hidden="true">·</span>
          <span lang="th" className="normal-case tracking-normal">{company.legalNameTh}</span>
          <span aria-hidden="true">·</span>
          <span className="normal-case tracking-normal">{t(addressNote)}</span>
        </p>
      </PageHeader>

      <AboutStory code="02 / OUR STORY" />
      <WhatWeBuild code="03 / WHAT WE BUILD" />
      <HowWeThink code="04 / HOW WE THINK" />
      <AboutEvidence code="05 / EVIDENCE" />
      <ProcessPath
        code="06 / HOW WE WORK"
        id="process"
        note={
          <LocaleLink
            to="/services#scope"
            className="group mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-700"
          >
            {t(copy.scopeLink)}
            <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
          </LocaleLink>
        }
      />
      <TechQuality code="07 / TECHNOLOGY & QUALITY" />
      <AboutSupport code="08 / SUPPORT" />
      <CompanyInfo code="09 / COMPANY" />
      <BigCTA code="10 / START" />
    </>
  );
}
