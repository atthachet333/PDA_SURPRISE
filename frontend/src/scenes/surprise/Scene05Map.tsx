import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { SceneLabel, SceneSection } from '@/components/surprise/SceneSection';
import { MemoryFrame } from '@/components/surprise/MemoryFrame';
import { anniversary, type JourneyPhoto } from '@/data/anniversary';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAudio } from '@/app/audioContext';
import { preloadImages } from '@/lib/preload';
import { cn } from '@/lib/cn';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * A photograph is evidence, not a required card field. Four verified places
 * become a small asymmetric photo essay; TURR is carried by words because no
 * confirmed photograph exists. The complete owner-supplied roster stays
 * visible as one quiet index, without manufacturing an identical tile for
 * every entry. Counts derive from the canonical rosters below.
 */
export function Scene05Map() {
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.12 });
  const reduced = useReducedMotion();
  const { triggerCue } = useAudio();
  const { photoStories, rememberedPlaces, visitedPlaces, provinces } = anniversary.journey;

  useEffect(() => {
    if (!inView) return;
    triggerCue('journey');
    void preloadImages(photoStories.map((place) => place.image));
  }, [inView, photoStories, triggerCue]);

  return (
    <SceneSection id="places" ref={ref} label="สถานที่ของเรา" fullHeight={false} className="overflow-hidden py-28 sm:py-36">
      <div className="w-full max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <SceneLabel>06 · สถานที่ที่เราไปด้วยกัน</SceneLabel>
          <h2 className="thai-display ai-legible mt-5 font-thai text-[clamp(2.2rem,5vw,4.2rem)] font-light text-ivory">
            บางที่มีรูป
            <br />
            บางที่เหลือแค่ความทรงจำ
          </h2>
          <p className="mt-6 font-thai text-base leading-8 text-ivory/60">
            แต่ทุกชื่อยังเป็นส่วนหนึ่งของเส้นทางเดียวกัน
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl border-y border-sky-200/15">
          {rememberedPlaces.map((place, index) => (
            <motion.article
              key={place.id}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -15% 0px' }}
              transition={{ duration: 1, delay: index * 0.12, ease: EASE }}
              className="px-5 py-9 text-center sm:px-10 sm:py-11"
            >
              <span className="font-mono text-[0.5rem] uppercase tracking-[0.28em] text-sky-100/45">ความทรงจำที่ไม่มีภาพยืนยัน</span>
              <h3 className="mt-4 font-thai text-2xl font-light text-ivory">{place.label}</h3>
              <p className="mt-3 font-thai text-sm leading-7 text-ivory/55">{place.note}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {photoStories.map((place, index) => (
            <PlacePlate
              key={place.id}
              place={place}
              index={index}
              reduced={reduced}
              className={cn(
                index === 0 && 'sm:col-span-2 lg:col-span-7',
                index === 1 && 'lg:col-span-5 lg:mt-20',
                index === 2 && 'lg:col-span-5 lg:col-start-2 lg:-mt-16',
                index === 3 && 'lg:col-span-6 lg:col-start-7 lg:mt-10'
              )}
            />
          ))}
        </div>

        <div className="mt-24 grid gap-12 border-t border-sky-200/15 pt-12 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16">
          <div>
            <p className="font-display text-[clamp(3.2rem,8vw,6.5rem)] font-light leading-none text-ivory">{provinces.length}</p>
            <p className="mt-2 font-thai text-sm text-ivory/55">จังหวัดที่ไปด้วยกัน</p>
            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2">
              {provinces.map((province) => (
                <span key={province} className="font-thai text-xs text-sky-100/55">{province}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="font-display text-[clamp(3.2rem,8vw,6.5rem)] font-light leading-none text-ivory">{visitedPlaces.length}</p>
                <p className="mt-2 font-thai text-sm text-ivory/55">สถานที่ที่จดไว้</p>
              </div>
              <span className="hidden font-mono text-[0.5rem] uppercase tracking-[0.24em] text-sky-100/35 sm:block">PLACES TOGETHER</span>
            </div>
            <ol className="mt-8 columns-2 gap-x-8 sm:columns-3">
              {visitedPlaces.map((place, index) => (
                <li key={place.id} className="mb-3 break-inside-avoid font-thai text-sm leading-6 text-ivory/65">
                  <span className="mr-2 font-mono text-[0.48rem] text-sky-200/35">{String(index + 1).padStart(2, '0')}</span>
                  {place.label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </SceneSection>
  );
}

function PlacePlate({
  place,
  index,
  reduced,
  className
}: {
  place: JourneyPhoto;
  index: number;
  reduced: boolean;
  className?: string;
}) {
  return (
    <motion.figure
      /* The entrance moves the frame; it does NOT reveal it. Opacity is
         deliberately absent: with `opacity: 0` here, every photograph in the
         story was measured sitting invisible whenever the entrance did not
         resolve. A photo that slides is a nice touch; a photo that is missing
         is a broken page. */
      initial={reduced ? false : { y: 34, rotate: index % 2 ? 1.2 : -0.8 }}
      whileInView={{ y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.2, delay: index * 0.08, ease: EASE }}
      className={cn('group', className)}
    >
      <div className="ai-frame-memory ai-photo-spill relative overflow-hidden shadow-glow transition-transform duration-slow ease-entrance motion-safe:group-hover:-translate-y-1">
        <MemoryFrame
          photo={place.image}
          alt={place.label}
          shape="editorial"
          label={place.date}
          tone={index === 0 ? 'champagne' : 'sky'}
          loading="lazy"
          objectPosition={place.objectPosition}
        />
      </div>
      <figcaption className="mt-4 flex items-start justify-between gap-5 px-1">
        <div>
          <h3 className="font-thai text-xl font-light text-ivory">{place.label}</h3>
          <p className="mt-1 font-thai text-sm text-ivory/55">{place.caption}</p>
        </div>
        <span className="shrink-0 pt-1 font-mono text-[0.48rem] uppercase tracking-[0.18em] text-sky-100/45">
          {place.province ?? place.date}
        </span>
      </figcaption>
    </motion.figure>
  );
}
