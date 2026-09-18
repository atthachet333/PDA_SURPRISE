import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { anniversary } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio, useMusicDuck } from '@/app/audioContext';

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
  const [active, setActive] = useState(false);

  const lines = anniversary.quietLines;

  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });
  const washOpacity = useTransform(scrollYProgress, [0, 0.14, 0.88, 1], [0, 0.78, 0.78, 0]);

  useEffect(() => {
    if (!inView) return;
    setActive(true);
    triggerCue('quietScene');
  }, [inView, triggerCue]);

  // Hold the music back for the length of the scene, then let it return.
  useMusicDuck(active, 0.32, 2400);

  return (
    <div ref={container} id="quiet" className="relative" style={{ height: `${lines.length * 62}vh` }}>
      <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[50vh]" />

      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-6">
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

        <div className="relative w-full max-w-2xl text-center">
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
          ? 'ai-legible absolute inset-x-0 top-1/2 -translate-y-1/2 font-display text-[clamp(1.85rem,5vw,3.5rem)] font-light leading-snug text-ivory'
          : 'ai-legible absolute inset-x-0 top-1/2 -translate-y-1/2 font-display text-[clamp(1.5rem,4vw,2.75rem)] font-light leading-snug text-ivory/85'
      }
    >
      {text}
    </motion.p>
  );
}
