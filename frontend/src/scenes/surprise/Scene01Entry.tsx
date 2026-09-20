import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SceneSection } from '@/components/surprise/SceneSection';
import { AIMark } from '@/components/surprise/AIMark';
import { anniversary } from '@/data/anniversary';
import { useAudio } from '@/app/audioContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ArrivalWhisper } from '@/components/surprise/ArrivalWhisper';

/**
 * Scene 01 — arrival.
 *
 * Emotional job: CALM. The visitor has just come through the portal, so this
 * scene resolves rather than escalates. A white flash settles into sky, the
 * mark assembles from light, then the copy arrives one line at a time and the
 * single call to action appears last.
 */

type Stage = 'flash' | 'mark' | 'copy' | 'ready';

const { intro } = anniversary;

export function Scene01Entry({ onEnter }: { onEnter: () => void }) {
  const { play, triggerCue } = useAudio();
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>(reduced ? 'ready' : 'flash');

  useEffect(() => {
    if (reduced) return;
    // Wall-clock staging, so a throttled tab still arrives at 'ready'.
    const timers = [
      window.setTimeout(() => setStage('mark'), 700),
      window.setTimeout(() => setStage('copy'), 2600),
      window.setTimeout(() => {
        setStage('ready');
        triggerCue('entry');
      }, 4200)
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reduced, triggerCue]);

  return (
    <SceneSection id="entry" label="00 · Arrival" className="text-center">
      {/* The portal hands over on white; it opens into sky here. */}
      <AnimatePresence>
        {stage === 'flash' ? (
          <motion.span
            key="flash"
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[5] bg-ivory"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <AIMark size="hero" />
        </motion.div>

        <motion.p
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.25 }}
          className="ai-wordmark mt-7 text-[clamp(1rem,2vw,1.35rem)]"
        >
          Atthachet &amp; Isariya
        </motion.p>

        <ArrivalWhisper className="mt-5 min-h-6 font-thai text-sm tracking-[0.04em] text-sky-100/65" />

        <div className="mt-7 flex flex-col items-center px-2">
          {intro.title.map((line, index) => (
            <motion.p
              key={line}
              initial={false}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.6, delay: index * 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="thai-display ai-legible font-thai text-[clamp(1.75rem,4.2vw,2.75rem)] font-light text-ivory"
            >
              {line}
            </motion.p>
          ))}

          <motion.p
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.9 }}
            className="mt-7 flex max-w-[18rem] flex-col items-center justify-center gap-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-sky-100/70 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1 sm:text-[0.625rem] sm:tracking-[0.3em]"
          >
            {intro.subtitle.map((line, index) => (
              <span key={line} className="flex items-center gap-3">
                {index > 0 ? <span className="hidden h-1 w-1 rounded-full bg-sky-200/40 sm:block" /> : null}
                {line}
              </span>
            ))}
          </motion.p>

        </div>

        <motion.button
          type="button"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: 'auto' }}
          onClick={() => {
            play('airWhoosh');
            onEnter();
          }}
          data-cursor="interactive"
          className="ai-button-primary group mt-14 min-h-12 px-9"
        >
          <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(220,239,255,0.28),transparent)] transition-transform duration-[1500ms] ease-smooth group-hover:translate-x-full" />
          <span className="absolute inset-0 rounded-pill bg-sky-400/0 transition-colors duration-slow group-hover:bg-sky-400/10" />
          <span className="relative flex items-center gap-3">{intro.cta}<span aria-hidden="true" className="transition-transform duration-base group-hover:translate-x-1">→</span></span>
        </motion.button>
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === 'ready' ? [0, 0.55, 0] : 0 }}
        transition={{ duration: 3.4, delay: 1.2, repeat: Infinity }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.3em] text-ivory/40">เลื่อนลง</span>
        <span className="h-9 w-px bg-gradient-to-b from-sky-200/60 to-transparent" />
      </motion.div>
    </SceneSection>
  );
}
