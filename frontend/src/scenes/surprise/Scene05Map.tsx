import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SceneLabel, SceneSection } from '@/components/surprise/SceneSection';
import { anniversary } from '@/data/anniversary';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';
import { cn } from '@/lib/cn';

/** Coordinate-free by design: only owner-approved place names are visualised. */
export function Scene05Map() {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.2 });
  const { play, triggerCue } = useAudio();
  const { importantPlaces, visitedPlaces, provinces } = anniversary.journey;

  useEffect(() => {
    if (inView) triggerCue('journey');
  }, [inView, triggerCue]);

  return (
    <SceneSection id="places" ref={ref} label="สถานที่ของเรา" fullHeight={false} className="py-28 sm:py-36">
      <div className="w-full max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <SceneLabel>06 · สถานที่ที่เราไปด้วยกัน</SceneLabel>
          <h2 className="thai-display ai-legible mt-5 font-thai text-[clamp(2.2rem,5vw,4.2rem)] font-light text-ivory">บางที่เป็นแค่ชื่อบนแผนที่<br />จนเราไปด้วยกัน</h2>
          <p className="mt-5 font-thai text-base leading-8 text-ivory/60">ทุกชื่อบนเส้นทางนี้ คือสถานที่ที่เราเคยไปด้วยกัน</p>
        </div>

        <div className="relative mt-16 overflow-hidden rounded-panel border border-sky-200/15 bg-navy-900/35 px-5 py-10 sm:px-10 lg:px-14">
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-45" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-30 390 C150 210 230 410 405 245 S710 105 1040 250" fill="none" stroke="rgba(126,200,255,.34)" strokeWidth="2" strokeDasharray="7 12" />
            <path d="M-20 455 C180 340 300 485 520 320 S780 255 1030 95" fill="none" stroke="rgba(235,217,188,.18)" strokeWidth="1" />
          </svg>
          <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {importantPlaces.map((place, index) => {
              const selected = active === index;
              return (
                <motion.button key={place.id} type="button" onClick={() => { setActive(index); play('memoryFocus'); }} whileHover={{ y: -4 }} data-cursor="interactive" className={cn('relative min-h-32 rounded-card border p-5 text-left backdrop-blur-md transition-colors duration-base', selected ? 'border-sky-200/55 bg-sky-400/16 shadow-glow' : 'border-sky-200/15 bg-navy-800/55 hover:bg-sky-400/10')}>
                  <span className="flex items-center justify-between font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sky-100/55"><span>PLACE {String(index + 1).padStart(2, '0')}</span><span className={cn('h-2 w-2 rounded-full', selected ? 'bg-ivory shadow-glow-sm' : 'bg-sky-300/45')} /></span>
                  <strong className="mt-7 block font-thai text-xl font-normal text-ivory">{place.label}</strong>
                  {place.province ? <span className="mt-1 block text-xs text-ivory/45">{place.province}</span> : null}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="ai-glass rounded-panel p-7"><p className="font-mono text-[0.5625rem] uppercase tracking-[0.28em] text-sky-100/65">10 PROVINCES</p><div className="mt-5 flex flex-wrap gap-2">{provinces.map((province) => <span key={province} className="rounded-pill border border-sky-200/15 px-3 py-1.5 font-thai text-xs text-ivory/65">{province}</span>)}</div></div>
          <div className="ai-glass rounded-panel p-7"><p className="font-mono text-[0.5625rem] uppercase tracking-[0.28em] text-sky-100/65">18 PLACES TOGETHER</p><ol className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">{visitedPlaces.map((place, index) => <li key={place.id} className="flex items-baseline gap-2 font-thai text-sm text-ivory/70"><span className="font-mono text-[0.5rem] text-sky-200/45">{String(index + 1).padStart(2, '0')}</span><span>{place.label}</span></li>)}</ol></div>
        </div>
      </div>
    </SceneSection>
  );
}
