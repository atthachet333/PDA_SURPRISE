import { motion } from 'framer-motion';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { SceneSection } from '@/components/surprise/SceneSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE = [0.16, 1, 0.3, 1] as const;
const PHOTOS = {
  hero: '/images/memories/together-now-01.webp',
  family: '/images/memories/cat-together-01.webp',
  kanomtuay: '/images/memories/cat-01.webp',
  tuayfu: '/images/memories/cat-02.webp'
} as const;

/** The present-day payoff: one lead image, three controlled family details. */
export function Scene07Life() {
  const reduced = useReducedMotion();

  return (
    <SceneSection id="life" label="เรายังอยู่ด้วยกัน" fullHeight={false} className="overflow-hidden px-0 py-0 sm:px-0">
      <article className="ai-prototype-present relative flex min-h-[100svh] w-full items-center overflow-hidden px-6 py-24 sm:px-8 lg:px-12">
        <span aria-hidden="true" className="ai-present-glow pointer-events-none absolute left-[38%] top-[42%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />

        <div className="relative mx-auto grid w-full max-w-[86rem] gap-10 lg:grid-cols-12 lg:items-center lg:gap-7 xl:gap-9">
          <motion.figure
            initial={reduced ? false : { opacity: 0, x: -42, scale: 1.025 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.6, ease: EASE }}
            className="relative lg:col-span-7"
          >
            <div className="ai-prototype-photo ai-present-hero relative aspect-[4/5] max-h-[78svh] overflow-hidden sm:aspect-[3/4] lg:aspect-[6/5] lg:max-h-[68svh]">
              <MemoryImage photo={PHOTOS.hero} alt="วันนี้ — เรายังอยู่ด้วยกันกับครอบครัวของเรา" tone="cream" loading="eager" objectPosition="50% 38%" className="ai-present-hero-image" />
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-navy-900/75 via-navy-900/18 to-transparent" />
              <figcaption className="absolute bottom-6 left-6 font-mono text-[0.5rem] uppercase tracking-[0.28em] text-ivory/65 sm:bottom-8 sm:left-8">HOME · FAMILY · TODAY</figcaption>
            </div>
          </motion.figure>

          <div className="lg:col-span-5 lg:pl-3">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 1.25, delay: 0.12, ease: EASE }}
            >
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.34em] text-sky-100/70">STILL US · วันนี้</p>
              <span aria-hidden="true" className="mt-5 block h-px w-20 bg-champagne/70" />
              <h2 className="thai-display mt-6 font-thai text-[clamp(3rem,5.1vw,5rem)] font-light leading-[1.02] text-ivory">เรายังอยู่ด้วยกัน</h2>
              <p className="mt-5 max-w-xl font-thai text-[clamp(1rem,1.25vw,1.125rem)] leading-8 text-champagne">ผ่านทั้งวันที่ดี วันที่เหนื่อย วันที่เข้าใจกัน<br className="hidden xl:block" /> และวันที่อาจไม่เข้าใจกันเลย</p>
              <p className="mt-4 max-w-xl font-thai text-[clamp(1rem,1.2vw,1.1rem)] leading-8 text-ivory/72">แต่สุดท้าย เราก็ยังเลือกที่จะอยู่ข้างกัน<br />และผมก็ยังอยากให้ทุกวันต่อจากนี้มีเปรี้ยวอยู่ด้วย</p>
            </motion.div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
              <SupportPhoto photo={PHOTOS.family} alt="เราและครอบครัวของเรา" index={0} reduced={reduced} className="col-span-2 aspect-[4/3] sm:col-span-1 sm:aspect-[3/4] lg:aspect-[4/3]" objectPosition="50% 42%" />
              <SupportPhoto photo={PHOTOS.kanomtuay} alt="หนมถ้วย" index={1} reduced={reduced} className="aspect-[3/4] lg:aspect-[4/3]" objectPosition="50% 34%" />
              <SupportPhoto photo={PHOTOS.tuayfu} alt="ถ้วยฟู" index={2} reduced={reduced} className="aspect-[3/4] lg:aspect-[4/3]" objectPosition="50% 46%" />
            </div>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.75, ease: EASE }}
              className="ai-present-close mt-6 font-thai text-[clamp(1.15rem,1.6vw,1.4rem)] leading-8 text-ivory"
            >
              รักเปรี้ยวมาก ๆ เลย<br /><span className="text-champagne">และรักปอร์เช่ด้วย</span>
            </motion.p>
          </div>
        </div>
      </article>
    </SceneSection>
  );
}

function SupportPhoto({ photo, alt, index, reduced, className, objectPosition }: { photo: string; alt: string; index: number; reduced: boolean; className: string; objectPosition: string }) {
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1.1, delay: 0.26 + index * 0.11, ease: EASE }}
      className={`ai-present-support relative overflow-hidden ${className}`}
      style={{ animationDelay: `${index * -2.2}s` }}
    >
      <MemoryImage photo={photo} alt={alt} tone="cream" objectPosition={objectPosition} />
    </motion.figure>
  );
}
