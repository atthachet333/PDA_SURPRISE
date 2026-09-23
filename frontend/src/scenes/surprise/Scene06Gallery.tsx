import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SceneSection } from '@/components/surprise/SceneSection';
import { ChapterMark } from '@/components/surprise/ChapterMark';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';
import { LITTLE_MOMENTS_MEDIA } from '@/data/storyMedia';
import { memoryVideos } from '@/data/memoryVideos';
import { LivingMemory } from '@/components/surprise/LivingMemory';
import { cn } from '@/lib/cn';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Little moments — light and playful. One lead frame, and a memory strip that
 * drifts sideways on its own while one fragment at a time "lights up" with its
 * caption, like flicking through a phone roll. Tap or hover picks a fragment.
 * Reduced motion: no drift, no cycling, every caption visible.
 */
export function Scene06Gallery() {
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const { lead, reel, clipId } = LITTLE_MOMENTS_MEDIA;
  const clip = memoryVideos.find((entry) => entry.id === clipId);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (reduced || held || !pageVisible) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % reel.length), 3600);
    return () => window.clearInterval(timer);
  }, [reduced, held, pageVisible, reel.length]);

  return (
    <SceneSection id="little-moments" label="โมเมนต์เล็ก ๆ" fullHeight={false} className="overflow-hidden px-0 py-0 sm:px-0">
      <article className="ai-moments relative w-full overflow-hidden px-5 pb-20 pt-16 sm:px-8 lg:px-12 lg:pb-28 lg:pt-24">
        <span aria-hidden="true" className="ai-moments-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-[84rem] grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="min-w-0 lg:col-span-6 lg:pr-6">
            <ChapterMark index="03" label="LITTLE MOMENTS · โมเมนต์เล็ก ๆ" />
            <h2 className="thai-display mt-6 font-thai text-[clamp(2.5rem,5vw,4.6rem)] font-light leading-[1.12] text-ivory">
              เรื่องจริงของเรา<br />อยู่ในภาพพวกนี้
            </h2>
            <p className="mt-6 max-w-lg font-thai text-[clamp(1rem,1.2vw,1.12rem)] leading-8 text-ivory/75">
              ไม่ได้มีแค่วันสำคัญ บางครั้งความทรงจำที่ชัดที่สุดก็คือถนนหนึ่งเส้น ทะเลหนึ่งวัน และคนเดิมที่อยู่ข้างกัน
            </p>

            {/* The strip. On phones it is a native swipe row; on larger screens
                it drifts slowly by itself. Nothing here needs hover. */}
            <div className="relative -mx-5 mt-10 overflow-x-auto px-5 pb-2 sm:mx-0 sm:overflow-visible sm:px-0 lg:mt-14">
              <div className={cn('flex w-max gap-3 sm:w-auto sm:gap-4', reduced ? '' : 'ai-moments-drift')}>
                {/* One fragment still moves. Muted, poster-first, played only
                    on tap — the LivingMemory contract. */}
                {clip ? (
                  <div className="ai-moments-fragment relative w-[9.5rem] shrink-0 sm:w-auto sm:min-w-0 sm:flex-1">
                    <LivingMemory clip={clip} objectPosition="50% 35%" className="aspect-[3/4]" />
                    <span className="mt-3 block font-thai text-[0.82rem] leading-6 text-ivory">{clip.label}</span>
                  </div>
                ) : null}
                {reel.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => {
                      setActive(index);
                      setHeld(true);
                    }}
                    onMouseEnter={() => setActive(index)}
                    aria-pressed={active === index}
                    aria-label={item.caption}
                    className={cn(
                      'ai-moments-fragment group relative w-[9.5rem] shrink-0 text-left transition-[transform,opacity] duration-700 sm:w-auto sm:min-w-0 sm:flex-1',
                      reduced || active === index ? 'opacity-100' : 'opacity-60 hover:opacity-100',
                      index % 2 ? 'sm:translate-y-6' : ''
                    )}
                  >
                    <span className={cn('block aspect-[3/4] overflow-hidden transition-transform duration-700', active === index && !reduced ? 'scale-[1.04]' : '')}>
                      <MemoryImage photo={item.src} alt={item.caption} tone="sky" loading="lazy" objectPosition="50% 35%" />
                    </span>
                    <span
                      className={cn(
                        'mt-3 block font-thai text-[0.82rem] leading-6 transition-colors duration-700',
                        reduced || active === index ? 'text-ivory' : 'text-ivory/45'
                      )}
                    >
                      {item.caption}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.figure
            initial={reduced ? false : { opacity: 0, y: 40, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.5, ease: EASE }}
            className="order-first lg:order-none lg:col-span-6"
          >
            <div className="ai-moments-lead relative mx-auto aspect-[4/5] w-full max-w-[34rem] overflow-hidden lg:aspect-[3/4] lg:h-[min(80svh,44rem)] lg:w-auto">
              <MemoryImage photo={lead.src} alt={lead.caption} tone="sky" loading="lazy" objectPosition="50% 32%" className="ai-moments-lead-image" />
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b1522]/80 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="font-mono text-[0.52rem] uppercase tracking-[0.3em] text-champagne/90">EVERY DAY · ทุกวัน</p>
                <p className="thai-display mt-2 font-thai text-[clamp(1.3rem,2vw,1.7rem)] font-light text-ivory">{lead.caption}</p>
              </figcaption>
            </div>
          </motion.figure>
        </div>
      </article>
    </SceneSection>
  );
}
