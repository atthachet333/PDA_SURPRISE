import { motion } from 'framer-motion';
import { HeroSystem } from '@/components/business/HeroSystem';
import { SolutionGrid } from '@/components/business/SolutionGrid';
import { BigCTA } from '@/components/business/BigCTA';
import { FeaturedSolution } from '@/components/business/FeaturedSolution';
import { BusinessValueStrip } from '@/components/business/BusinessValueStrip';
import { Container } from '@/components/shared/Layout';
import { RevealLines } from '@/components/shared/RevealLines';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function Solutions() {
  const reduced = useReducedMotion();

  return (
    <>
      <section className="sect sect--hero relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-36">
        <div className="sect-layer" aria-hidden="true">
          <span className="solution-hero-grid absolute inset-0 opacity-60" />
          <svg viewBox="0 0 1200 520" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-45">
            <path d="M-80 430 C 220 380, 300 150, 610 250 S 980 360, 1280 70" fill="none" stroke="rgba(29,170,97,.18)" strokeWidth="1" />
            {!reduced ? <path d="M-80 430 C 220 380, 300 150, 610 250 S 980 360, 1280 70" fill="none" stroke="#1DAA61" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 220" className="animate-data-run" /> : null}
          </svg>
        </div>

        <Container wide className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:gap-8">
            <div>
              <p className="section-code">01 / SOLUTIONS</p>
              <RevealLines
                as="h1"
                lines={['โซลูชันที่ออกแบบ', 'จากปัญหา', 'การทำงานจริง']}
                className="thai-display mt-6 max-w-2xl text-mega font-bold text-ink"
                lineClassName={(index) => (index >= 1 ? 'text-brand-700' : undefined)}
              />
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.25 }}
                className="mt-7 max-w-lg whitespace-pre-line text-lead text-steel-600"
              >
                {'ระบบที่ช่วยลดงานซ้ำ\nรวมข้อมูล ติดตามสถานะ\nและทำให้ทีมทำงานง่ายขึ้น'}
              </motion.p>
            </div>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="h-[20rem] sm:h-[27rem] lg:h-[31rem]"
            >
              <HeroSystem className="h-full" />
            </motion.div>
          </div>
        </Container>
      </section>

      <FeaturedSolution code="02 / FEATURED" />
      <SolutionGrid code="03 / INDEX" />
      <BusinessValueStrip code="04 / BUSINESS VALUE" />
      <BigCTA code="05 / START" />
    </>
  );
}
