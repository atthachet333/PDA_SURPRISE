import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { SceneSection } from '@/components/surprise/SceneSection';
import { ChapterMark } from '@/components/surprise/ChapterMark';
import { LivingMemory } from '@/components/surprise/LivingMemory';
import { SecretCats } from '@/components/surprise/SecretCats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { FAMILY_MEDIA, PORSCHE_MEDIA, PRESENT_MEDIA } from '@/data/storyMedia';
import { livingMemoryFor } from '@/data/memoryVideos';
import { cn } from '@/lib/cn';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Life: two chapters under one navigation entry.
 *
 *   HOME   — warm and breathing. The household: us, หนมถ้วย, ถ้วยฟู and
 *            ปอร์เช่. Cats sit in arched "window" portraits, the quiet clip
 *            is a small moving window, and Porsche has a soft light of its own.
 *   TODAY  — the heaviest, slowest chapter. A centre-stage portrait with two
 *            2026 frames drifting in behind it; the personal line arrives last.
 */
export function Scene07Life() {
  const reduced = useReducedMotion();
  return (
    <SceneSection id="life" label="ชีวิตของเรา" fullHeight={false} className="overflow-hidden px-0 py-0 sm:px-0">
      <FamilyChapter reduced={reduced} />
      <PresentChapter reduced={reduced} />
    </SceneSection>
  );
}

/* ================================================================ HOME == */

function FamilyChapter({ reduced }: { reduced: boolean }) {
  const clip = livingMemoryFor('life');
  const porsche = PORSCHE_MEDIA[0];

  return (
    <article id="family" className="ai-family relative w-full overflow-hidden px-5 pb-20 pt-16 sm:px-8 lg:px-12 lg:pb-28 lg:pt-24">
      <span aria-hidden="true" className="ai-family-warmth pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[84rem]">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-5 lg:pb-10">
            <ChapterMark index="11" label="HOME · บ้านของเรา" />
            <h2 className="thai-display mt-6 font-thai text-[clamp(2.7rem,5.6vw,5rem)] font-light leading-[1.08] text-ivory">
              บ้านของเรา
            </h2>
            <p className="mt-5 max-w-md font-thai text-[clamp(1.02rem,1.3vw,1.18rem)] leading-9 text-champagne">
              บ้านที่มีเรา หนมถ้วย ถ้วยฟู<br />และเจ้าตัวเล็กของเรา
            </p>
          </div>

          <motion.figure
            initial={reduced ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.8, ease: EASE }}
            className="ai-family-hero relative -mx-5 aspect-[4/5] overflow-hidden sm:mx-0 lg:col-span-7 lg:aspect-[5/4]"
          >
            <MemoryImage photo={FAMILY_MEDIA.hero} alt="เราสองคนกับแมวของเราบนเตียงที่บ้าน" tone="cream" loading="lazy" objectPosition="50% 46%" className="ai-family-hero-image" />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b1522]/70 to-transparent" />
            <figcaption className="absolute bottom-5 left-5 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-ivory/80 sm:bottom-7 sm:left-7">HOME · US · ทุกวันธรรมดา</figcaption>
          </motion.figure>
        </div>

        {/* The household, one member at a time. Arches read as the windows of
            one home rather than as a gallery of tiles. */}
        <div className="relative mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:mt-16 lg:grid-cols-12 lg:items-end lg:gap-8">
          <CatPortrait photo={FAMILY_MEDIA.kanomtuay} name="หนมถ้วย" note="ตัวเล็กที่ชอบขึ้นที่สูง" objectPosition="50% 30%" index={0} reduced={reduced} className="lg:col-span-3" />
          <CatPortrait photo={FAMILY_MEDIA.tuayfu} name="ถ้วยฟู" note="ตัวที่นอนเก่งที่สุดในบ้าน" objectPosition="46% 55%" index={1} reduced={reduced} className="lg:col-span-3 lg:mb-12" />

          {clip ? (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
              className="col-span-2 lg:col-span-3"
            >
              <LivingMemory clip={clip} objectPosition="50% 40%" className="ai-family-window aspect-[4/5] w-full lg:aspect-[3/4]" />
              <p className="mt-3 font-thai text-sm text-ivory/70">{clip.label}</p>
            </motion.div>
          ) : null}

          <PorscheLight reduced={reduced} photo={porsche} className="col-span-2 mt-4 lg:col-span-3 lg:mt-0 lg:self-end lg:px-2" />
        </div>

        <SecretCats className="mx-auto mt-10 h-12 w-full max-w-sm" />
      </div>
    </article>
  );
}

function CatPortrait({
  photo,
  name,
  note,
  objectPosition,
  index,
  reduced,
  className
}: {
  photo: string;
  name: string;
  note: string;
  objectPosition: string;
  index: number;
  reduced: boolean;
  className?: string;
}) {
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1.5, delay: index * 0.18, ease: EASE }}
      className={cn('relative', className)}
    >
      <div className="ai-family-arch relative aspect-[3/4] overflow-hidden" style={{ animationDelay: `${index * -3}s` }}>
        <MemoryImage photo={photo} alt={name} tone="cream" loading="lazy" objectPosition={objectPosition} />
      </div>
      <figcaption className="mt-4">
        <p className="thai-display font-thai text-[clamp(1.35rem,2vw,1.8rem)] font-light text-ivory">{name}</p>
        <p className="mt-1 font-thai text-sm leading-6 text-ivory/65">{note}</p>
      </figcaption>
    </motion.figure>
  );
}

/**
 * Porsche. The privacy-cropped scan sits inside a circle of light, the same
 * visual weight as the cat portraits; a soft cream/blue halo breathes behind
 * it. Without media it falls back to the light alone, never an empty box.
 */
function PorscheLight({ reduced, photo, className }: { reduced: boolean; photo?: { src: string; alt: string }; className?: string }) {
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 2, delay: 0.45, ease: EASE }}
      className={cn('relative', className)}
    >
      <div className="ai-porsche-float relative mx-auto w-full max-w-[19rem] lg:max-w-none">
        <span aria-hidden="true" className="ai-porsche-halo pointer-events-none absolute -inset-[14%] rounded-full" />
        <div className="ai-porsche-orb relative aspect-square w-full overflow-hidden rounded-full bg-black">
          {photo ? (
            <MemoryImage photo={photo.src} alt={photo.alt} tone="navy" loading="lazy" objectPosition="64% 48%" className="ai-porsche-scan" />
          ) : (
            <span aria-hidden="true" className="ai-porsche-core absolute inset-0 rounded-full" />
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(12,27,41,0.75)]" />
        </div>
      </div>
      <figcaption className="mt-6 text-center lg:text-left">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.3em] text-champagne/85">PORSCHE</p>
        <p className="thai-display mt-2 font-thai text-[clamp(1.5rem,2.3vw,2.1rem)] font-light leading-snug text-ivory">ปอร์เช่</p>
        <p className="mt-1 font-thai text-base text-champagne">เจ้าตัวเล็กของเรา</p>
      </figcaption>
    </motion.figure>
  );
}

/* =============================================================== TODAY == */

function PresentChapter({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const leftY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [60, -60]);
  const rightY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [90, -40]);
  const heroY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [24, -24]);

  return (
    <article ref={ref} id="today" className="ai-present relative w-full overflow-hidden px-5 pb-24 pt-10 sm:px-8 lg:px-12 lg:pb-32 lg:pt-16">
      <span aria-hidden="true" className="ai-present-warmth pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[84rem]">
        <ChapterMark index="12" label="STILL US · วันนี้" className="mx-auto items-center" />

        {/* Centre-stage portrait. The two 2026 frames sit behind it at
            different depths and drift into place — the story arriving at now. */}
        <div className="relative mx-auto mt-10 grid max-w-[76rem] grid-cols-[1fr] items-center lg:mt-14 lg:grid-cols-[1fr_1.55fr_1fr]">
          <motion.figure
            style={{ y: leftY }}
            initial={reduced ? false : { opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 2.4, delay: 0.5, ease: EASE }}
            className="ai-present-side relative hidden aspect-[3/4] overflow-hidden lg:-mr-10 lg:block"
          >
            <MemoryImage photo={PRESENT_MEDIA.home} alt="เราสองคนที่บ้าน ปี 2026" tone="cream" loading="lazy" objectPosition="50% 42%" />
          </motion.figure>

          <motion.figure
            style={{ y: heroY }}
            initial={reduced ? false : { opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 2.6, ease: EASE }}
            className="ai-present-hero relative z-10 -mx-5 aspect-[4/5] overflow-hidden sm:mx-0"
          >
            <MemoryImage photo={PRESENT_MEDIA.hero} alt="วันนี้ — เรายังอยู่ด้วยกัน" tone="cream" loading="lazy" objectPosition="50% 52%" className="ai-present-hero-image" />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-[#0b1522]/85 to-transparent" />
          </motion.figure>

          <motion.figure
            style={{ y: rightY }}
            initial={reduced ? false : { opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 2.4, delay: 0.8, ease: EASE }}
            className="ai-present-side relative hidden aspect-[3/4] overflow-hidden lg:-ml-10 lg:block"
          >
            <MemoryImage photo={PRESENT_MEDIA.ordinary} alt="อีกหนึ่งวันธรรมดาของเรา ปี 2026" tone="cream" loading="lazy" objectPosition="50% 40%" />
          </motion.figure>
        </div>

        {/* The headline sits across the foot of the portrait, never over faces. */}
        <div className="relative z-20 -mt-12 text-center sm:-mt-16 lg:-mt-20">
          <span aria-hidden="true" className="ai-present-breath pointer-events-none absolute inset-x-0 top-1/2 mx-auto -mt-16 h-32 w-[min(90%,36rem)] rounded-full" />
          <h2 className="thai-display ai-present-title relative font-thai text-[clamp(2.6rem,6.4vw,5.8rem)] font-light leading-[1.1] text-ivory">
            เรายังอยู่ด้วยกัน
          </h2>
        </div>

        {/* Phones: the two 2026 frames follow the portrait as a quiet pair. */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
          <div className="ai-present-side relative aspect-[3/4] overflow-hidden">
            <MemoryImage photo={PRESENT_MEDIA.home} alt="เราสองคนที่บ้าน ปี 2026" tone="cream" loading="lazy" objectPosition="50% 42%" />
          </div>
          <div className="ai-present-side relative mt-8 aspect-[3/4] overflow-hidden">
            <MemoryImage photo={PRESENT_MEDIA.ordinary} alt="อีกหนึ่งวันธรรมดาของเรา ปี 2026" tone="cream" loading="lazy" objectPosition="50% 40%" />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-2xl text-center lg:mt-12">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 1.8, ease: EASE }}
            className="font-thai text-[clamp(1.1rem,1.5vw,1.32rem)] leading-9 text-champagne"
          >
            ผ่านทั้งวันที่ดี วันที่เหนื่อย วันที่เข้าใจกัน<br />และวันที่อาจไม่เข้าใจกันเลย
          </motion.p>
          <span aria-hidden="true" className="ai-present-rule mx-auto mt-10 block h-px w-24 bg-champagne/60" />
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 2, delay: 0.6, ease: EASE }}
            className="mt-10 font-thai text-[clamp(1.05rem,1.35vw,1.2rem)] leading-9 text-ivory/85"
          >
            แต่สุดท้าย เราก็ยังเลือกที่จะอยู่ข้างกัน<br />และผมก็ยังอยากให้ทุกวันต่อจากนี้มีเปรี้ยวอยู่ด้วย
          </motion.p>
          {/* The personal line comes after a deliberate stillness. */}
          <motion.p
            initial={reduced ? false : { opacity: 0, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 2.6, delay: 2.4, ease: EASE }}
            className="ai-present-close thai-display mt-12 font-thai text-[clamp(1.6rem,2.6vw,2.3rem)] leading-[1.5] text-ivory"
          >
            รักเปรี้ยวมาก ๆ เลย<br /><span className="text-champagne">และรักปอร์เช่ด้วย</span>
          </motion.p>
        </div>
      </div>
    </article>
  );
}
