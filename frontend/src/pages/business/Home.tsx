import { motion } from 'framer-motion';
import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import { HeroSystem } from '@/components/business/HeroSystem';
import { KineticMarquee } from '@/components/business/KineticMarquee';
import { SystemUniverse } from '@/components/business/SystemUniverse';
import { ServiceExplorer } from '@/components/business/ServiceExplorer';
import { SolutionShowcase } from '@/components/business/SolutionShowcase';
import { WorkShowcase } from '@/components/business/WorkShowcase';
import { ProcessPath } from '@/components/business/ProcessPath';
import { StrengthStatements } from '@/components/business/StrengthStatements';
import { VerifiedMetrics } from '@/components/business/VerifiedMetrics';
import { TechDiagram } from '@/components/business/TechDiagram';
import { InsightStrip } from '@/components/business/InsightStrip';
import { BigCTA } from '@/components/business/BigCTA';
import { company, cta, targetMarket } from '@/data/company';
import { portfolio } from '@/data/portfolio';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * HOME — a sequence of distinct compositions, not a stack of card grids.
 *
 *   01 hero            cinematic, oversized Thai type + a live system rig
 *      marquee         the seven services as kinetic display type
 *   02 system universe the signature interactive graph
 *   03 services        three-column explorer
 *   04 solutions       sticky visual, scrolling stories
 *   05 work            immersive editorial bands
 *   06 process         scroll-driven path
 *   07 why us          oversized single-word statements
 *   08 numbers         the two verified figures, nothing else
 *   09 stack           capability diagram
 *   10 insights        editorial cards
 *      CTA             full-bleed green
 *
 * No two adjacent sections share a ground or a layout.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <KineticMarquee />
      <SystemUniverse />
      <ServiceExplorer showAllLink />
      <SolutionShowcase />
      <WorkShowcase items={portfolio.slice(0, 3)} showAllLink />
      <ProcessPath />
      <StrengthStatements />
      <VerifiedMetrics />
      <TechDiagram />
      <InsightStrip />
      <BigCTA />
    </>
  );
}

/* --------------------------------------------------------------------- hero -- */

/**
 * The headline is split into explicit lines rather than left to wrap, because
 * Thai has no inter-word spaces: a browser given one long string will break it
 * mid-word at this size. Each line masks and rises independently.
 */
const HEADLINE = ['ไอเดียของคุณ', 'เราทำให้มัน', 'ใช้งานได้จริง'];

function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="sect sect--hero relative overflow-hidden pb-20 pt-32 sm:pb-24 sm:pt-40 lg:pb-32 lg:pt-44">
      {/* Aurora + network ground */}
      <div className="sect-layer" aria-hidden="true">
        <span
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,59,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(6,59,42,0.045) 1px, transparent 1px)',
            backgroundSize: '84px 84px',
            maskImage: 'radial-gradient(75% 65% at 50% 28%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(75% 65% at 50% 28%, black, transparent)'
          }}
        />
        <span
          className={`absolute -right-[12%] -top-[18%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.2),transparent_66%)] blur-2xl ${
            reduced ? '' : 'animate-aurora-drift'
          }`}
        />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-8">
          {/* ---------------------------------------------------- headline -- */}
          <div>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <span className="rounded-pill border border-brand-200 bg-brand-50 px-3 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-700">
                {company.foundedVerified ? `SINCE ${company.founded}` : company.heroBadge}
              </span>
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-steel-400">
                {company.legalName}
              </span>
            </motion.div>

            <h1 className="thai-display mt-8 text-giant font-bold text-ink">
              {HEADLINE.map((line, index) => (
                <span key={line} className="block overflow-hidden py-[0.04em]">
                  <motion.span
                    className="block"
                    initial={reduced ? false : { y: '106%' }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 1.05,
                      delay: 0.08 + index * 0.11,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    {index === HEADLINE.length - 1 ? (
                      <span className="relative inline-block">
                        <span className="relative z-10 text-brand-600">{line}</span>
                        {/* Emphasis rule under the payoff line */}
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-[0.12em] block h-[0.14em] origin-left bg-brand-400/35"
                          initial={reduced ? false : { scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </span>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 max-w-xl text-lead text-steel-600"
            >
              พัฒนาซอฟต์แวร์ ระบบธุรกิจ เว็บแอปพลิเคชัน และระบบภายในองค์กร
              จาก Workflow ที่ใช้งานจริงของธุรกิจ
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="mt-11 flex flex-wrap items-center gap-3"
            >
              <ButtonLink to="/contact" size="lg" data-cursor="cta">
                {cta.primary.label}
                <ArrowIcon />
              </ButtonLink>
              <ButtonLink to="/work" size="lg" variant="secondary">
                {cta.secondary.label}
              </ButtonLink>
            </motion.div>

            {/* Who it is for — the locked target-market groups, as a quiet strip */}
            <motion.ul
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.85 }}
              className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-steel-200/80 pt-6"
            >
              {targetMarket.groups.slice(0, 5).map((group) => (
                <li
                  key={group.label}
                  className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-400"
                >
                  {group.label}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ------------------------------------------------- system rig -- */}
          <HeroSystem className="h-[20rem] sm:h-[26rem] lg:h-[34rem]" />
        </div>
      </Container>
    </section>
  );
}
