import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useAudio } from '@/app/audioContext';

const SEEN_KEY = 'ai:sound-prompt';
const FULLSCREEN_KEY = 'ai:fullscreen-hint';
const PREFS_KEY = 'ai:audio';

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

/** True once the visitor has actually expressed a sound preference. */
function hasStoredPreference(): boolean {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return false;
    return typeof (JSON.parse(raw) as { musicEnabled?: unknown }).musicEnabled === 'boolean';
  } catch {
    return false;
  }
}

/**
 * First-visit sound choice. Deliberately not a modal: a single low, glassy bar
 * at the bottom of the screen that never blocks the scene behind it.
 *
 * It is shown ONCE and only when there is genuinely nothing to go on. An
 * existing preference is respected in silence, and a visitor who came through
 * the gateway — where opening the project already started the music — is not
 * asked to turn on something they can already hear. Either way this never nags:
 * dismissing it, choosing silence, or arriving with the music already up all
 * end with the same remembered state.
 */
export function SoundPrompt() {
  const [visible, setVisible] = useState(false);
  const { unlock, start, setMusicEnabled, setSfxEnabled, play, status } = useAudio();

  useEffect(() => {
    if (hasSeen(SEEN_KEY) || hasStoredPreference()) return;
    const timer = window.setTimeout(() => {
      // Music is already up — the choice was made by entering the story.
      if (status === 'playing') {
        remember(SEEN_KEY);
        return;
      }
      setVisible(true);
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [status]);

  /**
   * Synchronous by design: `unlock()` and `start()` must run inside this click
   * for iOS Safari to honour the playback. Nothing is awaited.
   */
  const choose = useCallback(
    (withSound: boolean) => {
      remember(SEEN_KEY);
      setVisible(false);
      unlock();
      setMusicEnabled(withSound);
      setSfxEnabled(withSound);
      if (withSound) {
        start();
        play('lightSparkle');
      }
    },
    [play, setMusicEnabled, setSfxEnabled, start, unlock]
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
          aria-label="ตั้งค่าเสียง"
        >
          <div className="ai-glass flex w-full max-w-md flex-col items-center gap-4 rounded-panel px-4 py-5 text-center sm:flex-row sm:gap-5 sm:px-6 sm:text-left">
            <p className="flex-1 font-thai text-sm leading-relaxed text-ivory/80">
              เปิดเสียงไว้หน่อยนะ<br />เรื่องนี้จะสมบูรณ์ขึ้นอีกนิด
            </p>
            <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:shrink-0">
              <button
                type="button"
                onClick={() => choose(true)}
                className="ai-pressable min-h-11 rounded-pill border border-sky-200/40 bg-sky-400/15 px-3 py-2 font-thai text-[0.75rem] text-ivory hover:border-sky-200/70 hover:bg-sky-400/25 sm:px-4"
              >
                เปิดเสียง
              </button>
              <button
                type="button"
                onClick={() => choose(false)}
                className="ai-pressable min-h-11 rounded-pill px-3 py-2 font-thai text-[0.75rem] text-ivory/50 hover:text-ivory/80 sm:px-4"
              >
                ดูแบบเงียบ ๆ
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Shown only when the visitor WANTS music and the browser has refused it —
 * typically /us opened directly, with no gesture yet to authorise playback.
 *
 * This exists so the refusal is never met with a retry loop. One quiet
 * invitation, and the next tap anywhere on the page arms playback (see the
 * direct-entry handler in Experience), which makes this disappear. It says
 * nothing when the visitor chose silence, and nothing when there is no file.
 */
export function MusicUnlockPrompt() {
  const { status, musicEnabled, unlock, start } = useAudio();
  const [dismissed, setDismissed] = useState(false);
  const show = musicEnabled && status === 'blocked' && !dismissed;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[80] flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            onClick={() => {
              // Synchronous, inside the gesture — see `choose` above.
              unlock();
              start();
              setDismissed(true);
            }}
            className="ai-pressable ai-glass flex min-h-11 items-center gap-2.5 rounded-pill px-4 py-2.5 font-thai text-[0.8125rem] text-ivory/85 hover:text-ivory"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sky-300" />
            แตะเพื่อเปิดเพลง
          </button>
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
          className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-[70] px-8 text-center font-thai text-xs leading-relaxed text-sky-100/70"
        >
          ถ้าดูเต็มจอ อาจเห็นเรื่องราวได้ชัดขึ้นอีกหน่อย
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
