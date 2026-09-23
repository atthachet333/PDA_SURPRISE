import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { SceneSection } from '@/components/surprise/SceneSection';
import { ChapterMark } from '@/components/surprise/ChapterMark';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { anniversary, type JourneyPhoto } from '@/data/anniversary';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAudio } from '@/app/audioContext';
import { preloadImages } from '@/lib/preload';
import { cn } from '@/lib/cn';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Places — memory first, geography second. The two canonical counts carry the
 * chapter as editorial numerals, four photographed places sit in a staggered
 * contact row, and the full roster reads as one constellation of names. No
 * coordinates, routes or map shapes are drawn: none have been confirmed.
 */
const PHOTO_PLACES = new Set(['น้ำตกสาริกา', 'ชะอำ', 'พัทยา']);

export function Scene05Map() {
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.12 });
  const reduced = useReducedMotion();
  const { triggerCue } = useAudio();
  const { photoStories, visitedPlaces, provinces } = anniversary.journey;

  useEffect(() => {
    if (!inView) return;
    triggerCue('journey');
    void preloadImages(photoStories.map((place) => place.image));
  }, [inView, photoStories, triggerCue]);

  return (
    <SceneSection id="places" ref={ref} label="สถานที่ของเรา" fullHeight={false} className="overflow-hidden px-0 py-0 sm:px-0">
      <article className="ai-places relative w-full overflow-hidden px-5 pb-24 pt-20 sm:px-8 lg:px-12 lg:pb-32 lg:pt-28">
        <div className="relative mx-auto w-full max-w-[84rem]">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <ChapterMark index="05" label="PLACES · สถานที่ของเรา" />
              <h2 className="thai-display mt-6 font-thai text-[clamp(1.85rem,4.8vw,4.3rem)] font-light leading-[1.2] text-ivory">
                บางที่มีรูป<br />บางที่เหลือแค่ความทรงจำ
              </h2>
              <p className="mt-5 font-thai text-[clamp(1rem,1.2vw,1.12rem)] leading-8 text-champagne">แต่ทุกชื่อยังเป็นส่วนหนึ่งของเส้นทางเดียวกัน</p>
            </div>
            <div className="flex items-end gap-10 lg:col-span-5 lg:justify-end lg:gap-14">
              <Figure value={visitedPlaces.length} label="สถานที่ที่จดไว้" sub="PLACES" />
              <span aria-hidden="true" className="mb-4 h-20 w-px bg-gradient-to-b from-transparent via-champagne/50 to-transparent" />
              <Figure value={provinces.length} label="จังหวัดที่ไปด้วยกัน" sub="PROVINCES" />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:gap-6 lg:mt-20 lg:grid-cols-4 lg:gap-8">
            {photoStories.map((place, index) => (
              <PlacePlate key={place.id} place={place} index={index} reduced={reduced} />
            ))}
          </div>

          {/* The whole roster, as one constellation of names. */}
          <div className="mt-20 border-t border-sky-200/15 pt-12 lg:mt-24">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-sky-100/60">ALL {visitedPlaces.length} · ทุกที่ที่จดไว้</p>
            <ol className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-4 sm:gap-x-9 sm:gap-y-5">
              {visitedPlaces.map((place, index) => (
                <li key={place.id} className="flex items-baseline gap-2">
                  <span aria-hidden="true" className="ai-places-star h-1 w-1 translate-y-[-0.3em] rounded-full bg-champagne" style={{ animationDelay: `${(index % 7) * -0.9}s` }} />
                  <span className="font-mono text-[0.5rem] text-sky-200/45">{String(index + 1).padStart(2, '0')}</span>
                  <span className={cn('font-thai text-[clamp(1rem,1.5vw,1.3rem)] leading-7', PHOTO_PLACES.has(place.label) ? 'text-champagne' : 'text-ivory/80')}>
                    {place.label}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-14">
              <span aria-hidden="true" className="ai-places-horizon block h-px w-full" />
              <ul className="mt-5 flex flex-wrap justify-between gap-x-6 gap-y-2">
                {provinces.map((province) => (
                  <li key={province} className="font-thai text-xs tracking-[0.04em] text-sky-100/65 sm:text-sm">{province}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </article>
    </SceneSection>
  );
}

function Figure({ value, label, sub }: { value: number; label: string; sub: string }) {
  return (
    <div>
      <p className="font-display text-[clamp(4.2rem,9vw,8rem)] font-light leading-[0.85] tracking-[-0.03em] text-ivory">{value}</p>
      <p className="mt-3 font-mono text-[0.52rem] uppercase tracking-[0.3em] text-champagne/85">{sub}</p>
      <p className="mt-1 font-thai text-sm text-ivory/70">{label}</p>
    </div>
  );
}

function PlacePlate({ place, index, reduced }: { place: JourneyPhoto; index: number; reduced: boolean }) {
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.3, delay: index * 0.12, ease: EASE }}
      className={cn(index % 2 ? 'mt-10 lg:mt-16' : '')}
    >
      <div className="ai-places-plate relative aspect-[3/4] overflow-hidden" style={{ animationDelay: `${index * -2.5}s` }}>
        <MemoryImage photo={place.image} alt={place.label} tone="sky" loading="lazy" objectPosition={place.objectPosition ?? '50% 42%'} />
        <span aria-hidden="true" className="absolute left-3 top-3 font-display text-2xl font-light text-ivory/85">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <figcaption className="mt-3">
        <p className="font-mono text-[0.5rem] uppercase tracking-[0.26em] text-sky-100/60">{place.date}{place.province ? ` · ${place.province}` : ''}</p>
        <p className="mt-1 font-thai text-lg font-light text-ivory">{place.label}</p>
        <p className="font-thai text-sm text-ivory/60">{place.caption}</p>
      </figcaption>
    </motion.figure>
  );
}
