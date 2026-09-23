import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { anniversary } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';

/**
 * Scene 10 — the pause.
 *
 * Emotional job: STILLNESS. This is the one scene that deliberately takes
 * things away.
 *
 * Everything else in the experience moves; here the backdrop is stilled by the
 * parent (`alive={false}`), the music ducks to a third, the navigation hides,
 * and there are no photographs at all. Six short lines, each alone on screen,
 * paced by scroll so the visitor sets the speed.
 */
export function Scene10Quiet() {
  const container = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.2 });
  const reduced = useReducedMotion();
  const { triggerCue } = useAudio();

  const lines = anniversary.quietLines;

  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });
  const washOpacity = useTransform(scrollYProgress, [0, 0.14, 0.88, 1], [0, 0.78, 0.78, 0]);
  const counter = useTransform(scrollYProgress, (value) => {
    const line = Math.min(lines.length, Math.max(1, Math.floor(value * lines.length) + 1));
    return `${String(line).padStart(2, '0')} / ${String(lines.length).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (!inView) return;
    triggerCue('quietScene');
  }, [inView, triggerCue]);

  /*
   * The music is NOT ducked from here any more.
   *
   * The scene mix map holds `quiet` at 0.42 with a 3.5s ramp — the slowest fade
   * in the story — and `converge` then climbs to 0.98 over 3.2s. Driving both
   * from one place is what makes the recovery feel like a build rather than a
   * level being restored: this scene no longer snaps the music back on exit, the
   * next scene takes it from where Quiet left it.
   */

  return (
    <div ref={container} id="quiet" className="relative" style={{ height: `${lines.length * 62}vh` }}>
      <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[50vh]" />

      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden px-7 sm:px-10">
        <p className="pointer-events-none absolute left-7 top-24 z-20 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-sky-100/45 sm:left-10 lg:left-[max(2.5rem,calc((100vw-56rem)/2))]">14 · ไม่ใช่ทุกวันที่ง่าย</p>
        {/* Softening wash: the celestial layer recedes for this scene only */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 bg-navy-900"
          style={{ opacity: washOpacity }}
        />

        {/* A single slow point of light, so the frame is not completely dead */}
        <motion.span
          aria-hidden="true"
          className="absolute h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(126,200,255,0.12),transparent_70%)] blur-3xl"
          animate={reduced ? undefined : { opacity: [0.4, 0.75, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Designed stillness: one horizon, one star, one quiet count. */}
        <span aria-hidden="true" className="ai-quiet-horizon absolute inset-x-[8%] bottom-[22%] h-px" />
        <span aria-hidden="true" className="ai-quiet-star absolute right-[18%] top-[26%] h-1 w-1 rounded-full bg-ivory" />
        <motion.span aria-hidden="true" className="absolute bottom-10 right-7 font-display text-sm italic tracking-[0.18em] text-ivory/45 sm:right-10 lg:right-[max(2.5rem,calc((100vw-56rem)/2))]">
          {counter}
        </motion.span>

        <div className="relative w-full max-w-4xl text-left">
          {lines.map((line, index) => {
            const start = index / lines.length;
            const end = (index + 1) / lines.length;
            return (
              <QuietLine
                key={line}
                text={line}
                progress={scrollYProgress}
                start={start}
                end={end}
                reduced={reduced}
                // The turn in the middle of the sequence gets the accent.
                emphasis={index === lines.length - 1}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuietLine({
  text,
  progress,
  start,
  end,
  reduced,
  emphasis
}: {
  text: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  reduced: boolean;
  emphasis: boolean;
}) {
  const span = end - start;
  const fadeIn = start + span * 0.28;
  const fadeOut = end - span * 0.28;

  const opacity = useTransform(progress, [start, fadeIn, fadeOut, end], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, end], [14, -14]);
  const blur = useTransform(progress, [start, fadeIn, fadeOut, end], [6, 0, 0, 6]);
  const filter = useTransform(blur, (value) => `blur(${value.toFixed(2)}px)`);

  return (
    <motion.p
      style={reduced ? { opacity } : { opacity, y, filter }}
      className={
        emphasis
          ? 'thai-display ai-legible absolute inset-x-0 top-1/2 max-w-3xl -translate-y-1/2 font-thai text-[clamp(2rem,5vw,3.5rem)] font-light text-ivory'
          : 'thai-display ai-legible absolute inset-x-0 top-1/2 max-w-3xl -translate-y-1/2 font-thai text-[clamp(1.65rem,4vw,2.8rem)] font-light text-ivory/85'
      }
    >
      {text}
    </motion.p>
  );
}
