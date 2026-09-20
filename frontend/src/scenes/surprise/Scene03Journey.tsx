import { motion } from 'framer-motion';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { SceneLabel, SceneSection } from '@/components/surprise/SceneSection';
import { anniversary } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** The beginning — one real date, two people, and room for the first photos. */
export function Scene03Journey() {
  const reduced = useReducedMotion();
  /* The first real photograph in the experience, so it loads eagerly rather
     than waiting for an observer. */
  const hero = anniversary.heroImages[0];

  return (
    <SceneSection id="beginning" label="จุดเริ่มต้น" className="overflow-hidden">
      <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '0px 0px -18% 0px' }}
          transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
          className="order-2 lg:order-1"
        >
          <SceneLabel>02 · จุดเริ่มต้น</SceneLabel>
          <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-sky-100/70">12 OCT 2025</p>
          <h2 className="thai-display ai-legible mt-5 font-thai text-[clamp(2.25rem,5.5vw,4.5rem)] font-light text-ivory">
            ทุกอย่างเริ่มจากตรงนี้
          </h2>
          <p className="mt-7 max-w-lg font-thai text-[clamp(1rem,1.7vw,1.25rem)] leading-8 text-ivory/70">
            ไม่ได้เริ่มจากเรื่องยิ่งใหญ่ แค่คนสองคนที่ค่อย ๆ เลือกอยู่ข้างกัน แล้วปล่อยให้วันธรรมดากลายเป็นเรื่องสำคัญ
          </p>
          <div className="mt-10 flex items-center gap-5">
            <span className="font-display text-4xl font-light text-ivory">{anniversary.couple.shortA}</span>
            <span aria-hidden="true" className="h-px w-16 bg-gradient-to-r from-sky-200/20 via-sky-200/80 to-sky-200/20" />
            <span className="font-display text-4xl font-light text-ivory">{anniversary.couple.shortB}</span>
          </div>
        </motion.div>

        <motion.figure
          initial={reduced ? false : { opacity: 0, y: 44, rotate: 2 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
          viewport={{ once: true, margin: '0px 0px -18% 0px' }}
          transition={{ duration: 1.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="ai-frame-cinematic ai-photo-spill order-1 relative mx-auto w-full max-w-xl overflow-hidden shadow-glow-lg lg:order-2"
        >
          <span className="block aspect-[4/5] sm:aspect-[5/4]">
            <MemoryImage photo={hero?.image} alt="ภาพเริ่มต้นของ A และ I" label="THE BEGINNING" tone="cream" loading="eager" objectPosition={hero?.objectPosition} cropMode={hero?.cropMode} />
          </span>
          <figcaption className="flex items-center justify-between border-t border-sky-200/10 px-5 py-4 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-ivory/50">
            <span>{anniversary.couple.initials}</span><span>DAY 001</span>
          </figcaption>
        </motion.figure>
      </div>
    </SceneSection>
  );
}
