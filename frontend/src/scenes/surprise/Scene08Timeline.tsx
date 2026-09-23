import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SceneSection } from '@/components/surprise/SceneSection';
import { ChapterMark } from '@/components/surprise/ChapterMark';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { anniversary, type TimelineMoment } from '@/data/anniversary';
import { MILESTONE_IDS } from '@/data/storyMedia';
import { aspectOf } from '@/lib/mediaAspect';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';
import { preloadImages } from '@/lib/preload';
import { cn } from '@/lib/cn';

/**
 * Scene 08 — the journey. "We kept going places together."
 *
 * Forward movement: the section pins and vertical scroll carries a reel of
 * travel frames sideways along one thread of light. Stops are numbered and in
 * date order; the two openings (Peak, TURR) are small look-backs at the start
 * of the road. The thread is a story line, not a geographic route.
 *
 * Reduced motion never pins: the same reel becomes a native horizontal scroller
 * with every frame and caption fully visible.
 */
const PROLOGUE = new Set(['t1', 't2']);
const MOMENTS = anniversary.timeline.filter((moment) => !(MILESTONE_IDS as readonly string[]).includes(moment.id));
const PROLOGUE_MOMENTS = MOMENTS.filter((moment) => PROLOGUE.has(moment.id));
const STOPS = MOMENTS.filter((moment) => !PROLOGUE.has(moment.id));

export function Scene08Timeline() {
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.05 });
  const { triggerCue } = useAudio();
  const prologue = PROLOGUE_MOMENTS;
  const stops = STOPS;

  useEffect(() => {
    if (!inView) return;
    triggerCue('timeline');
    void preloadImages(MOMENTS.map((moment) => moment.image));
  }, [inView, triggerCue]);

  return (
    <SceneSection id="journey" label="เส้นทางของเรา" fullHeight={false} className="overflow-visible px-0 py-0 sm:px-0">
      <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40" />
      {reduced ? (
        <div className="ai-journey relative w-full py-20">
          <JourneyHeader />
          <div className="mt-10 overflow-x-auto px-5 pb-6 sm:px-8 lg:px-12">
            <Reel prologue={prologue} stops={stops} progress={null} />
          </div>
        </div>
      ) : (
        <PinnedReel prologue={prologue} stops={stops} />
      )}
    </SceneSection>
  );
}

function JourneyHeader() {
  return (
    <div className="relative z-10 px-5 sm:px-8 lg:px-12">
      <ChapterMark index="04" label="JOURNEY · เส้นทางของเรา" />
      <h2 className="thai-display mt-5 font-thai text-[clamp(2.3rem,4.6vw,4.2rem)] font-light leading-[1.1] text-ivory">
        จากวันแรก มาถึงวันนี้
      </h2>
    </div>
  );
}

function PinnedReel({ prologue, stops }: { prologue: TimelineMoment[]; stops: TimelineMoment[] }) {
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const node = track.current;
      if (!node) return;
      setDistance(Math.max(0, node.scrollWidth - window.innerWidth));
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (observer && track.current) observer.observe(track.current);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0.02, 0.98], [0, -distance]);

  return (
    <div ref={container} className="ai-journey relative w-full" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden py-10">
        <span aria-hidden="true" className="ai-journey-drift pointer-events-none absolute inset-0" />
        <JourneyHeader />
        <motion.div ref={track} style={{ x }} className="relative mt-8 w-max px-5 sm:px-8 lg:mt-10 lg:px-12">
          <Reel prologue={prologue} stops={stops} progress={scrollYProgress} />
        </motion.div>
      </div>
    </div>
  );
}

function Reel({
  prologue,
  stops,
  progress
}: {
  prologue: TimelineMoment[];
  stops: TimelineMoment[];
  progress: MotionValue<number> | null;
}) {
  return (
    <div className="relative flex w-max items-end gap-8 pb-16 sm:gap-12 lg:gap-16">
      <Thread progress={progress} />
      <div className="relative flex items-end gap-4 sm:gap-5">
        {prologue.map((moment, index) => (
          <Prologue key={moment.id} moment={moment} number={index + 1} />
        ))}
      </div>
      {stops.map((moment, index) => (
        <Stop key={moment.id} moment={moment} number={prologue.length + index + 1} />
      ))}
      <div className="relative flex h-[40svh] w-[min(70vw,22rem)] flex-col justify-end pb-2">
        <p className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] italic leading-tight text-champagne">and we kept going</p>
        <p className="mt-3 font-thai text-base leading-7 text-ivory/75">ยังมีอีกหลายที่ที่เราไปด้วยกัน</p>
        <span aria-hidden="true" className="absolute -bottom-[3.05rem] left-0 h-2.5 w-2.5 rounded-full border border-champagne bg-navy-900" />
      </div>
    </div>
  );
}

/** One continuous line under the reel; its lit part advances with the scroll. */
function Thread({ progress }: { progress: MotionValue<number> | null }) {
  const settled = useMotionValue(1);
  const scaleX = useTransform(progress ?? settled, [0, 1], [0.04, 1]);
  return (
    <span aria-hidden="true" className="pointer-events-none absolute bottom-[1.1rem] left-0 right-0 h-px">
      <span className="absolute inset-0 bg-sky-200/20" />
      <motion.span style={{ scaleX }} className="ai-journey-thread absolute inset-0 origin-left" />
    </span>
  );
}

function Prologue({ moment, number }: { moment: TimelineMoment; number: number }) {
  return (
    <figure className="relative w-[8.5rem] sm:w-[10rem] lg:w-[11.5rem]">
      <div className="ai-journey-print bg-[#f7f1e8] p-1.5 pb-6">
        <div className="aspect-[3/4] overflow-hidden">
          <MemoryImage photo={moment.image} alt={moment.title} tone="navy" loading="lazy" objectPosition={moment.objectPosition} />
        </div>
      </div>
      <figcaption className="mt-3">
        <p className="font-mono text-[0.5rem] uppercase tracking-[0.26em] text-ivory/55">{String(number).padStart(2, '0')} · {moment.label}</p>
        <p className="mt-1 font-thai text-sm leading-6 text-ivory/85">{moment.title}</p>
      </figcaption>
      <StopNode />
    </figure>
  );
}

function Stop({ moment, number }: { moment: TimelineMoment; number: number }) {
  const aspect = aspectOf(moment.image);
  const landscape = aspect > 1.1;
  return (
    <figure className="relative">
      <div
        className={cn('ai-journey-frame relative overflow-hidden', landscape ? 'h-[min(46svh,26rem)]' : 'h-[min(52svh,30rem)]')}
        style={{ aspectRatio: landscape ? '3 / 2' : '3 / 4' }}
      >
        <MemoryImage photo={moment.image} alt={`${moment.title} ${moment.label}`} tone="sky" loading="lazy" objectPosition={moment.objectPosition ?? '50% 45%'} className="ai-journey-image" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b1522]/80 to-transparent" />
        <span aria-hidden="true" className="absolute right-4 top-2 font-display text-[clamp(3rem,5vw,4.6rem)] font-light leading-none text-ivory/85">
          {String(number).padStart(2, '0')}
        </span>
        <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.26em] text-champagne/90">
            {moment.label}{moment.location ? ` · ${moment.location}` : ''}
          </p>
          <p className="thai-display mt-1.5 font-thai text-[clamp(1.35rem,2vw,1.8rem)] font-light leading-snug text-ivory">{moment.title}</p>
          <p className="mt-0.5 font-thai text-sm text-ivory/75">{moment.body}</p>
        </figcaption>
      </div>
      <StopNode />
    </figure>
  );
}

function StopNode() {
  return <span aria-hidden="true" className="ai-journey-node absolute -bottom-[3.05rem] left-4 h-2.5 w-2.5 rounded-full bg-champagne" />;
}
