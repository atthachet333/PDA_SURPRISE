import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { SceneSection } from '@/components/surprise/SceneSection';
import { anniversary } from '@/data/anniversary';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAudio } from '@/app/audioContext';
import { pad } from '@/lib/format';

/**
 * Scene 02 — DAY 001 to DAY 365. The signature beat.
 *
 * Emotional job: BUILD then WOW.
 *
 * The count is paced by an explicit keyframe table rather than one easing
 * curve, because the drama is entirely in where it hesitates: slow off the
 * line, a long accelerating middle, a deliberate ratchet through 360-364, then
 * a full stop before the reveal lands.
 */

const TARGET = anniversary.dayCounter.target;

/** Wall-clock seconds at which the counter should read a given day. */
const PACE: { day: number; at: number }[] = [
  { day: 1, at: 0 },
  { day: 6, at: 1.05 },   // slow off the line — every early day counted
  { day: 30, at: 1.95 },
  { day: 78, at: 2.7 },
  { day: 124, at: 3.25 },
  { day: 201, at: 3.95 }, // fastest stretch
  { day: 288, at: 4.6 },
  { day: 340, at: 5.25 },
  { day: 355, at: 5.9 },  // braking
  { day: 360, at: 6.35 }
];

/** The last five days tick individually, with air between them. */
const RATCHET = [361, 362, 363, 364];
const RATCHET_STEP = 0.34;
const RATCHET_START = 6.35;
const HOLD = 1.15; // full stop on 364 before the reveal

const COUNT_END = RATCHET_START + RATCHET.length * RATCHET_STEP;
const REVEAL_AT = COUNT_END + HOLD;

function dayAtTime(seconds: number): number {
  if (seconds <= 0) return 1;

  if (seconds >= RATCHET_START) {
    const index = Math.floor((seconds - RATCHET_START) / RATCHET_STEP);
    return RATCHET[Math.min(index, RATCHET.length - 1)] ?? 364;
  }

  for (let i = 0; i < PACE.length - 1; i += 1) {
    const from = PACE[i];
    const to = PACE[i + 1];
    if (!from || !to) break;
    if (seconds <= to.at) {
      const span = to.at - from.at || 1;
      const t = (seconds - from.at) / span;
      return Math.round(from.day + (to.day - from.day) * t);
    }
  }
  return 360;
}

export function Scene02Days() {
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.5 });
  const [day, setDay] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'counting' | 'holding' | 'revealed'>('idle');
  const reduced = useReducedMotion();
  const { play, onCue, triggerCue } = useAudio();
  const started = useRef(false);

  // A music cue can also fire the reveal when a track is present.
  useEffect(() => onCue('day365', () => setPhase('revealed')), [onCue]);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    if (reduced) {
      setDay(TARGET);
      setPhase('revealed');
      return;
    }

    triggerCue('dayStart');
    setPhase('counting');

    const began = performance.now();
    let frame = 0;
    let lastTickDay = 0;
    let impactPlayed = false;

    const tick = (now: number) => {
      const seconds = (now - began) / 1000;

      if (seconds < COUNT_END) {
        const next = dayAtTime(seconds);
        setDay(next);
        // One soft tick per visible change in the slow sections only, so the
        // fast middle does not turn into a machine-gun.
        if (next !== lastTickDay && (seconds < 1.6 || seconds > 5.6)) {
          lastTickDay = next;
          play('hover');
        }
        frame = requestAnimationFrame(tick);
        return;
      }

      if (seconds < REVEAL_AT) {
        setDay(364);
        setPhase('holding');
        frame = requestAnimationFrame(tick);
        return;
      }

      setDay(TARGET);
      setPhase('revealed');
      if (!impactPlayed) {
        impactPlayed = true;
        play('impact');
        triggerCue('day365');
      }
    };

    frame = requestAnimationFrame(tick);

    // Wall-clock safety net: if frames never arrive, still land the reveal.
    const failsafe = window.setTimeout(
      () => {
        setDay(TARGET);
        setPhase('revealed');
      },
      (REVEAL_AT + 1) * 1000
    );

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(failsafe);
    };
  }, [inView, play, reduced, triggerCue]);

  const revealed = phase === 'revealed';
  const holding = phase === 'holding';

  return (
    <SceneSection id="story" ref={ref} label="Day count" className="overflow-hidden text-center">
      {/* Radial light burst */}
      <AnimatePresence>
        {revealed ? (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.15 }}
            animate={{ opacity: [0, 0.95, 0.2], scale: [0.15, 1.6, 2.9] }}
            transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(126,200,255,0.4)_36%,transparent_70%)] blur-2xl"
          />
        ) : null}
      </AnimatePresence>

      {/* Particles thrown outward on the reveal */}
      <AnimatePresence>
        {revealed && !reduced ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {Array.from({ length: 28 }).map((_, index) => {
              const angle = (index / 28) * Math.PI * 2;
              const distance = 26 + ((index * 13) % 18);
              return (
                <motion.span
                  key={index}
                  className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-sky-100"
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: `${Math.cos(angle) * distance}vmin`,
                    y: `${Math.sin(angle) * distance}vmin`,
                    scale: [0.6, 1, 0.2]
                  }}
                  transition={{ duration: 2.4, delay: 0.1 + (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
          </div>
        ) : null}
      </AnimatePresence>

      {/* Ring system: tightens during the hold, expands on the reveal */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: revealed ? 1.18 : holding ? 0.94 : 1,
          opacity: revealed ? 1 : holding ? 0.35 : 0.55
        }}
        transition={{ duration: revealed ? 2.2 : 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {[20, 29, 40].map((size, index) => (
          <span
            key={size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/15 animate-spin-slower"
            style={{
              width: `${size}rem`,
              height: `${size}rem`,
              animationDuration: `${62 + index * 31}s`,
              animationDirection: index % 2 ? 'reverse' : 'normal'
            }}
          />
        ))}
      </motion.div>

      <div className="relative">
        <motion.p
          animate={{ opacity: holding ? 0.35 : 0.6 }}
          className="font-mono text-[0.625rem] uppercase tracking-[0.44em] text-sky-100"
        >
          Day
        </motion.p>

        <div className="relative mt-4 flex justify-center">
          <motion.span
            animate={
              revealed
                ? { scale: [1, 1.14, 1], filter: ['blur(8px)', 'blur(0px)'] }
                : holding
                  ? { scale: 0.985 }
                  : { scale: 1 }
            }
            transition={{ duration: revealed ? 1.8 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="ai-legible font-mono text-[clamp(4.5rem,19vw,12rem)] font-light leading-none tabular-nums text-ivory"
            style={{ textShadow: revealed ? '0 0 90px rgba(255,255,255,0.6)' : undefined }}
          >
            {pad(day, 3)}
          </motion.span>
        </div>

        <div className="mt-10 min-h-[7rem]">
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="ai-legible font-display text-[clamp(1.75rem,4.4vw,3rem)] font-light tracking-[0.06em] text-ivory">
                  {anniversary.dayCounter.headline}
                </p>
                {anniversary.dayCounter.subline.map((line, index) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.4, delay: 1.1 + index * 0.45 }}
                    className="mt-1.5 font-display text-[clamp(1rem,2.3vw,1.5rem)] italic text-sky-100/85"
                  >
                    {line}
                  </motion.p>
                ))}
              </motion.div>
            ) : (
              <motion.p
                key="counting"
                exit={{ opacity: 0 }}
                animate={{ opacity: holding ? 0 : 0.3 }}
                transition={{ duration: 0.6 }}
                className="font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-ivory"
              >
                counting
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SceneSection>
  );
}
