import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useAudio } from '@/app/audioContext';

const SEEN_KEY = 'ai:sound-prompt';
const FULLSCREEN_KEY = 'ai:fullscreen-hint';

function remember(key: string): void {
  try {
    window.localStorage.setItem(key, '1');
  } catch {
    // Private mode: the prompt reappears next visit, which is acceptable.
  }
}

function hasSeen(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/**
 * First-visit sound choice. Deliberately not a modal: a single low, glassy bar
 * at the bottom of the screen that never blocks the scene behind it, shown once
 * and then remembered.
 */
export function SoundPrompt() {
  const [visible, setVisible] = useState(false);
  const { unlock, setMusicEnabled, setSfxEnabled, play } = useAudio();

  useEffect(() => {
    if (hasSeen(SEEN_KEY)) return;
    const timer = window.setTimeout(() => setVisible(true), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  const choose = useCallback(
    async (withSound: boolean) => {
      remember(SEEN_KEY);
      setVisible(false);
      await unlock();
      setMusicEnabled(withSound);
      setSfxEnabled(withSound);
      if (withSound) play('sparkle');
    },
    [play, setMusicEnabled, setSfxEnabled, unlock]
  );

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[80] flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          role="dialog"
          aria-label="Sound preference"
        >
          <div className="ai-glass flex w-full max-w-md flex-col items-center gap-4 rounded-panel px-6 py-5 text-center sm:flex-row sm:gap-5 sm:text-left">
            <p className="flex-1 text-[0.8125rem] leading-relaxed text-ivory/80">
              For the full experience,
              <br className="hidden sm:block" /> turn your sound on.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => void choose(true)}
                className="rounded-pill border border-sky-200/40 bg-sky-400/15 px-4 py-2 text-[0.6875rem] uppercase tracking-[0.16em] text-ivory transition-colors duration-base hover:border-sky-200/70 hover:bg-sky-400/25"
              >
                Sound on
              </button>
              <button
                type="button"
                onClick={() => void choose(false)}
                className="rounded-pill px-4 py-2 text-[0.6875rem] uppercase tracking-[0.16em] text-ivory/50 transition-colors duration-base hover:text-ivory/80"
              >
                Continue quietly
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * A single, one-time whisper that the experience suits fullscreen. Never forces
 * it — the Fullscreen API requires a gesture anyway, and hijacking the viewport
 * on arrival would be hostile.
 */
export function FullscreenHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasSeen(FULLSCREEN_KEY)) return;
    if (!document.documentElement.requestFullscreen) return;
    // Only after the sound choice has been made and the entry has settled.
    const show = window.setTimeout(() => setVisible(true), 9000);
    const hide = window.setTimeout(() => {
      setVisible(false);
      remember(FULLSCREEN_KEY);
    }, 16000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4 }}
          className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-[70] text-center font-mono text-[0.5625rem] uppercase tracking-[0.28em] text-sky-100/70"
        >
          Best experienced in fullscreen
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
