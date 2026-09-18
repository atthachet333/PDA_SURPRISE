import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { anniversary } from '@/data/anniversary';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * Scene 03 — live time.
 *
 * Emotional job: WARM. The drama of 365 has just landed, so this scene slows
 * down and makes the number concrete: the same span of time read at four
 * scales, counted live from the configured start date.
 *
 * Presented as a celestial mechanical clock — four nested rings turning at
 * second, minute, hour and day cadences, with the figures set at different
 * depths on the dial rather than in a row of cards.
 */

const START = new Date(anniversary.relationshipStartDate);

function useElapsed() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const ms = Math.max(0, now - START.getTime());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000),
    minutes: Math.floor(ms / 60_000),
    seconds: Math.floor(ms / 1000),
    months: Math.floor(ms / 86_400_000 / 30.44)
  };
}

/** Ring radius (%), rotation period (s) and where its figure sits on the dial. */
const DIALS = [
  { id: 'days', label: 'Days', size: 100, period: 900, angle: -90, live: false },
  { id: 'hours', label: 'Hours', size: 76, period: 300, angle: 10, live: false },
  { id: 'minutes', label: 'Minutes', size: 54, period: 120, angle: 130, live: true },
  { id: 'seconds', label: 'Seconds', size: 34, period: 60, angle: 235, live: true }
] as const;

export function Scene03Journey() {
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.35 });
  const elapsed = useElapsed();
  const reduced = useReducedMotion();

  return (
    <SceneSection id="journey" ref={ref} label="Our journey so far">
      <div className="flex w-full max-w-5xl flex-col items-center text-center">
        <SceneLabel>Our journey so far</SceneLabel>
        <SceneTitle className="mt-5">Counted from the day it started.</SceneTitle>

        {/* The dial */}
        <div className="relative mt-12 aspect-square w-full max-w-[34rem]">
          <span
            aria-hidden="true"
            className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,rgba(126,200,255,0.2),transparent_70%)] blur-2xl"
          />

          {DIALS.map((dial, index) => (
            <div key={dial.id} className="absolute inset-0 flex items-center justify-center">
              {/* Rotating ring with its marker */}
              <div
                aria-hidden="true"
                className="absolute rounded-full border border-sky-200/14"
                style={{
                  width: `${dial.size}%`,
                  height: `${dial.size}%`,
                  animation: reduced ? undefined : `spin-slow ${dial.period}s linear infinite`
                }}
              >
                <span
                  className={cn(
                    'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full',
                    dial.live ? 'h-1.5 w-1.5 bg-sky-200 shadow-glow-sm' : 'h-1 w-1 bg-champagne/80'
                  )}
                />
              </div>

              {/* Figure, parked at a fixed angle on that ring */}
              <DialValue
                label={dial.label}
                value={
                  dial.id === 'days'
                    ? elapsed.days
                    : dial.id === 'hours'
                      ? elapsed.hours
                      : dial.id === 'minutes'
                        ? elapsed.minutes
                        : elapsed.seconds
                }
                live={dial.live}
                size={dial.size}
                angle={dial.angle}
                active={inView}
                delay={index * 0.14}
                emphasis={index === 0}
              />
            </div>
          ))}

          {/* Dial centre */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.5 }}
              className="font-mono text-[0.5rem] uppercase tracking-[0.28em] text-sky-100/50"
            >
              {elapsed.months} months
            </motion.span>
            <motion.span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 rounded-full bg-ivory"
              animate={reduced ? undefined : { opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="mt-10 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-ivory/35"
        >
          still counting
        </motion.p>
      </div>
    </SceneSection>
  );
}

function DialValue({
  label,
  value,
  live,
  size,
  angle,
  active,
  delay,
  emphasis
}: {
  label: string;
  value: number;
  live: boolean;
  size: number;
  angle: number;
  active: boolean;
  delay: number;
  emphasis: boolean;
}) {
  // Live units tick in real time; slower units animate once on entry.
  const animated = useCountUp(value, { active, duration: 2400 });
  const display = live ? value : animated;

  const radians = (angle * Math.PI) / 180;
  const radius = size / 2;
  const x = Math.cos(radians) * radius;
  const y = Math.sin(radians) * radius;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className="absolute flex flex-col items-center"
      style={{ left: `${50 + x}%`, top: `${50 + y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <span className="ai-surface flex flex-col items-center rounded-panel px-3.5 py-2.5 sm:px-4 sm:py-3">
        <span
          className={cn(
            'font-mono font-light tabular-nums leading-none text-ivory',
            emphasis ? 'text-[clamp(1.4rem,3.4vw,2.35rem)]' : 'text-[clamp(0.95rem,2.2vw,1.5rem)]'
          )}
        >
          {formatNumber(display)}
        </span>
        <span className="mt-1.5 font-mono text-[0.4375rem] uppercase tracking-[0.2em] text-sky-100/60 sm:text-[0.5rem]">
          {label}
        </span>
      </span>
      {live ? (
        <span aria-hidden="true" className="mt-1 h-1 w-1 rounded-full bg-sky-200/80 animate-pulse-glow" />
      ) : null}
    </motion.div>
  );
}
