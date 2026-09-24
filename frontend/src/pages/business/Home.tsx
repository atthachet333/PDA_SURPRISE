import { motion } from 'framer-motion';
import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import { HeroSystem } from '@/components/business/HeroSystem';
import { KineticMarquee } from '@/components/business/KineticMarquee';
import { SystemShowreel } from '@/components/business/SystemShowreel';
import { SystemUniversePreview } from '@/components/business/SystemUniversePreview';
import { ServiceExplorer } from '@/components/business/ServiceExplorer';
import { SolutionShowcase } from '@/components/business/SolutionShowcase';
import { WorkShowcase } from '@/components/business/WorkShowcase';
import { ProcessPath } from '@/components/business/ProcessPath';
import { StrengthStatements } from '@/components/business/StrengthStatements';
import { VerifiedMetrics } from '@/components/business/VerifiedMetrics';
import { TrustPreview } from '@/components/business/TrustPreview';
import { InsightStrip } from '@/components/business/InsightStrip';
import { BigCTA } from '@/components/business/BigCTA';
import { company, cta } from '@/data/company';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RevealLines } from '@/components/shared/RevealLines';
import { SectionBackdrop } from '@/components/business/SectionBackdrop';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';
import { useLocale } from '@/app/LocaleContext';
import { hero } from '@/i18n/home';
import { useHomeServices } from '@/i18n/useContent';

/**
 * HOME
 *
 *   01 hero        balanced text + a legible software rig, above the fold
 *      marquee     compact kinetic service strip
 *   02 showreel    six real interfaces, fanned — product evidence, early
 *   03 universe    the connected-systems graph (the one dark section up here)
 *   04 services    interactive explorer, visual-led
 *   05 solutions   sticky product storytelling
 *   06 work        large project visuals
 *   07 process     scroll-driven sequence
 *   08 why us      strengths
 *   09 numbers     the two verified figures
 *   10 trust       what a visitor can verify: work, process, company, support
 *                  (the technology diagram moved to /about as evidence, EP40)
 *   11 insights    editorial cards
 *      CTA         full-bleed green
 *
 * Light-to-dark rhythm is roughly 70/30 by area: only the universe, work, CTA
 * and footer are dark, so the dark green reads as emphasis rather than default.
 */
export default function Home() {
  usePageMeta(pageMeta.home);
  const homeServicePreview = useHomeServices();

  return (
    <>
      <Hero />
      <KineticMarquee />
      <SystemShowreel code="02 / SYSTEMS" />
      <SystemUniversePreview code="03 / CONNECTED" />
      <ServiceExplorer code="04 / SERVICES" items={homeServicePreview} showAllLink />
      <SolutionShowcase code="05 / SOLUTIONS" />
      <WorkShowcase code="06 / WORK" showAllLink />
      <ProcessPath code="07 / PROCESS" />
      <StrengthStatements code="08 / WHY US" />
      <VerifiedMetrics code="09 / NUMBERS" />
      <TrustPreview code="10 / TRUST" />
      <InsightStrip code="11 / INSIGHTS" />
      <BigCTA code="12 / START" />
    </>
  );
}

/* --------------------------------------------------------------------- hero -- */

function Hero() {
  const reduced = useReducedMotion();
  const { t } = useLocale();
  /*
   * Explicit line breaks, not wrapping: Thai has no inter-word spaces, so a
   * browser handed one long string will break it mid-word at display size.
   * Each locale supplies its own three lines (i18n/home.ts).
   */
  const HEADLINE = t(hero.headline);
  const CAPABILITIES = t(hero.proof);

  return (
    <section
      className="sect sect--hero relative flex items-center overflow-hidden pb-14 pt-24 sm:pb-16 sm:pt-28 lg:min-h-[max(38rem,calc(100vh-5rem))] lg:max-h-[56rem] lg:pb-20 lg:pt-32"
    >
      {/* Soft green atmosphere that tracks the pointer — light, not a dark slab. */}
      <SectionBackdrop variant="aurora" pointer />

      <Container wide className="relative w-full">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10 xl:gap-14">
          {/* ---------------------------------------------------- left: copy -- */}
          <div className="max-w-xl">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <span className="rounded-pill border border-brand-200 bg-brand-50 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-700">
                {company.foundedVerified ? `SINCE ${company.founded}` : company.heroBadge}
              </span>
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-400">
                {company.legalName}
              </span>
            </motion.div>

            {/* `RevealLines` rests VISIBLE — the reveal can never clip the
                headline out of its own box. See RevealLines for the bug this
                pattern replaced. */}
            <RevealLines
              as="h1"
              className="thai-display mt-6 text-giant font-bold text-ink"
              lines={HEADLINE.map((line, index) =>
                index === HEADLINE.length - 1 ? (
                  <span key={line} className="relative inline-block">
                    <span className="relative z-10 text-brand-600">{line}</span>
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-[0.1em] block h-[0.12em] origin-left bg-brand-400/35"
                      initial={reduced ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                ) : (
                  line
                )
              )}
              stagger={90}
              duration={950}
            />

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-lg text-lead text-steel-600"
            >
              {t(hero.lead)}
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 flex flex-wrap items-center gap-2.5"
            >
              <ButtonLink to={cta.primary.to} size="lg" data-cursor="cta" data-cta="primary">
                {t(cta.primary.label)}
                <ArrowIcon />
              </ButtonLink>
              <ButtonLink to={cta.secondary.to} size="lg" variant="secondary">
                {t(cta.secondary.label)}
              </ButtonLink>
            </motion.div>

            {/* Capability indicators — small, factual, no invented numbers */}
            <motion.ul
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.66 }}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-steel-200/80 pt-5"
            >
              {CAPABILITIES.map((item) => (
                <li
                  key={item}
                  className="thai-display flex items-center gap-2 text-xs text-steel-500"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ------------------------------------------- right: the software -- */}
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative -mx-2 sm:mx-0"
          >
            <HeroSystem className="aspect-[13/10] w-full sm:aspect-[14/10]" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
