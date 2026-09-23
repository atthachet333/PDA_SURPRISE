import { motion } from 'framer-motion';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { SceneSection } from '@/components/surprise/SceneSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PRESENT_MEDIA } from '@/data/storyMedia';
import { cn } from '@/lib/cn';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The present-day payoff. One dominant photograph carries the headline in its
 * own lower-right safe zone; three family details sit beside it as a quiet,
 * asymmetric cluster. The slowest scene of the three: long drifts, a breathing
 * light behind the headline, and the personal line arriving last.
 */
export function Scene07Life() {
  const reduced = useReducedMotion();

  return (
    <SceneSection id="life" label="เรายังอยู่ด้วยกัน" fullHeight={false} className="overflow-hidden px-0 py-0 sm:px-0">
      <article className="ai-present relative w-full overflow-hidden px-5 pb-20 pt-10 sm:px-8 lg:flex lg:min-h-[100svh] lg:items-center lg:px-12 lg:py-16">
        <span aria-hidden="true" className="ai-present-warmth pointer-events-none absolute inset-0" />

        <div className="relative mx-auto grid w-full max-w-[86rem] gap-8 lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-14">
          <motion.figure
            initial={reduced ? false : { opacity: 0, scale: 1.03 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 2.2, ease: EASE }}
            className="ai-present-hero relative -mx-5 aspect-[4/5] overflow-hidden sm:mx-0 lg:col-span-7 lg:aspect-auto lg:h-[min(86svh,56rem)]"
          >
            <MemoryImage
              photo={PRESENT_MEDIA.hero}
              alt="วันนี้ — เรายังอยู่ด้วยกันกับครอบครัวของเรา"
              tone="cream"
              loading="eager"
              objectPosition="50% 56%"
              className="ai-present-hero-image"
            />
            {/* Localized scrim: the lower third only, so the faces stay bright. */}
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#0b1522]/90 via-[#0b1522]/45 to-transparent" />
            <span aria-hidden="true" className="ai-present-breath pointer-events-none absolute bottom-[4%] left-[6%] h-40 w-[70%] rounded-full" />

            <figcaption className="absolute inset-x-0 bottom-0 px-5 pb-7 sm:px-8 sm:pb-9 lg:px-10 lg:pb-11">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.34em] text-champagne/90">STILL US · วันนี้</p>
              <span aria-hidden="true" className="mt-4 block h-px w-16 bg-champagne/75" />
              <h2 className="thai-display ai-present-title mt-4 font-thai text-[clamp(2.8rem,6.2vw,5.6rem)] font-light leading-[1.04] text-ivory">
                เรายังอยู่ด้วยกัน
              </h2>
            </figcaption>
          </motion.figure>

          <div className="relative lg:col-span-5">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 1.8, delay: 0.3, ease: EASE }}
            >
              <p className="max-w-md font-thai text-[clamp(1.05rem,1.35vw,1.22rem)] leading-9 text-champagne">
                ผ่านทั้งวันที่ดี วันที่เหนื่อย วันที่เข้าใจกัน<br />และวันที่อาจไม่เข้าใจกันเลย
              </p>
            </motion.div>

            <div className="mt-8 grid grid-cols-[1.25fr_1fr] gap-3 sm:gap-4">
              <SupportPhoto
                photo={PRESENT_MEDIA.family}
                alt="เราสองคนกับแมวของเรา"
                caption="HOME"
                index={0}
                reduced={reduced}
                objectPosition="50% 45%"
                className="row-span-2 aspect-[3/4]"
              />
              <SupportPhoto
                photo={PRESENT_MEDIA.kanomtuay}
                alt="หนมถ้วย"
                caption="หนมถ้วย"
                index={1}
                reduced={reduced}
                objectPosition="50% 30%"
                className="aspect-[4/3] lg:translate-y-6"
              />
              <SupportPhoto
                photo={PRESENT_MEDIA.tuayfu}
                alt="ถ้วยฟู"
                caption="ถ้วยฟู"
                index={2}
                reduced={reduced}
                objectPosition="50% 55%"
                className="aspect-[4/3] lg:translate-y-6"
              />
            </div>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -6% 0px' }}
              transition={{ duration: 1.8, delay: 0.7, ease: EASE }}
              className="mt-10 max-w-md font-thai text-[clamp(1rem,1.2vw,1.12rem)] leading-9 text-ivory/80 lg:mt-12"
            >
              แต่สุดท้าย เราก็ยังเลือกที่จะอยู่ข้างกัน<br />และผมก็ยังอยากให้ทุกวันต่อจากนี้มีเปรี้ยวอยู่ด้วย
            </motion.p>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 12, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, delay: 1.6, ease: EASE }}
              className="ai-present-close thai-display mt-6 font-thai text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.5] text-ivory"
            >
              รักเปรี้ยวมาก ๆ เลย<br /><span className="text-champagne">และรักปอร์เช่ด้วย</span>
            </motion.p>
          </div>
        </div>
      </article>
    </SceneSection>
  );
}

function SupportPhoto({
  photo,
  alt,
  caption,
  index,
  reduced,
  className,
  objectPosition
}: {
  photo: string;
  alt: string;
  caption: string;
  index: number;
  reduced: boolean;
  className: string;
  objectPosition: string;
}) {
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1.7, delay: 0.45 + index * 0.18, ease: EASE }}
      className={cn('ai-present-support relative overflow-hidden', className)}
      style={{ animationDelay: `${index * -4}s` }}
    >
      <MemoryImage photo={photo} alt={alt} tone="cream" objectPosition={objectPosition} />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b1522]/70 to-transparent" />
      <figcaption className="absolute bottom-2.5 left-3 font-thai text-[0.7rem] tracking-[0.08em] text-ivory/85">{caption}</figcaption>
    </motion.figure>
  );
}
