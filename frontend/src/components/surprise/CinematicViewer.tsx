import { motion, usePresence } from 'framer-motion';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useAudio } from '@/app/audioContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';
import type { MemoryVideo } from '@/data/memoryVideos';
import { cn } from '@/lib/cn';
import { pauseOtherVideos } from '@/lib/media';

/** Where the song sits while a clip's own audio is playing. */
const DUCK_LEVEL = 0.2;
const DUCK_MS = 700;

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

interface CinematicViewerProps {
  clip: MemoryVideo;
  onClose: () => void;
}

/**
 * The full-screen surface a memory opens into.
 *
 * THE SONG IS NEVER STOPPED. A clip starts muted, so by default there is
 * nothing to negotiate — the track keeps playing and the picture moves under
 * it. Only when the visitor asks for the clip's own sound does the music duck,
 * and it ducks through a separate multiplier so the scene keeps owning its own
 * level and "stop ducking" needs no remembered number.
 *
 * NOTHING HERE IS LOAD-BEARING. If the file 404s or the codec is refused, the
 * poster stays and an unavailable line appears; the viewer still closes, focus
 * still returns, the music is still restored. There is no state of this
 * component that traps someone in a black rectangle.
 */
export function CinematicViewer({ clip, onClose }: CinematicViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const { setVideoDuck, play } = useAudio();
  const titleId = useId();
  const [isPresent, safeToRemove] = usePresence();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [current, setCurrent] = useState(0);
  const [length, setLength] = useState(clip.duration);
  const [closing, setClosing] = useState(false);

  const restoreFocus = useCallback(() => {
    const target = restoreFocusTo.current;
    if (target && document.contains(target)) target.focus();
  }, []);

  /* Remember who opened this so focus can go home, then take focus. */
  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      restoreFocus();
    };
  }, [restoreFocus]);

  /* AnimatePresence normally removes this after the exit curve. A wall-clock
     fallback keeps a stalled renderer from retaining the dialog forever. */
  useEffect(() => {
    if (isPresent) return;
    const timeout = window.setTimeout(safeToRemove, reduced ? 0 : 560);
    return () => window.clearTimeout(timeout);
  }, [isPresent, reduced, safeToRemove]);

  /*
   * The duck is released on unmount no matter how the viewer closed — Escape,
   * backdrop, the close button, or the whole scene going away. Tying it to
   * cleanup rather than to each exit path is what stops a half-volume song
   * outliving the clip that caused it.
   */
  useEffect(() => () => setVideoDuck(1, DUCK_MS), [setVideoDuck]);

  useEffect(() => {
    setVideoDuck(muted ? 1 : DUCK_LEVEL, DUCK_MS);
  }, [muted, setVideoDuck]);

  /* A hidden tab keeps neither picture nor sound. */
  useEffect(() => {
    if (!pageVisible) videoRef.current?.pause();
  }, [pageVisible]);

  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    videoRef.current?.pause();
    setVideoDuck(1, DUCK_MS);
    overlayRef.current?.setAttribute('aria-hidden', 'true');
    overlayRef.current?.setAttribute('data-closing', 'true');
    panelRef.current?.setAttribute('inert', '');
    restoreFocus();
    onClose();
  }, [closing, onClose, restoreFocus, setVideoDuck]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        requestClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      /* A modal that leaks focus to the page behind it is not a modal. */
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [requestClose]);

  const toggle = useCallback(() => {
    const node = videoRef.current;
    if (!node || failed) return;
    if (node.paused) void node.play().catch(() => setFailed(true));
    else node.pause();
  }, [failed]);

  const restart = useCallback(() => {
    const node = videoRef.current;
    if (!node || failed) return;
    node.currentTime = 0;
    void node.play().catch(() => setFailed(true));
  }, [failed]);

  const seek = (value: number) => {
    const node = videoRef.current;
    if (!node || failed) return;
    node.currentTime = value;
    setCurrent(value);
  };

  return (
    <motion.div
      ref={overlayRef}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      /* An explicit duration, and zero under reduced motion. Without one the
         backdrop leaves on a default curve, and AnimatePresence keeps the whole
         dialog mounted until that curve finishes — so on a machine that is not
         painting, "close" would set the state and the viewer would stay on
         screen. Closing must not depend on an animation being able to run. */
      transition={{ duration: reduced ? 0 : 0.28 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-hidden={closing ? 'true' : undefined}
      className={cn(
        'fixed inset-0 z-[90] flex items-center justify-center bg-navy-900/96 p-4 backdrop-blur-md sm:p-8',
        closing ? 'pointer-events-none' : ''
      )}
      onClick={requestClose}
    >
      {/* Celestial surround rather than a blurred copy of the clip: portrait
          media gets space to sit in, not a fake phone body. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(120,170,255,0.14),transparent_62%)]"
      />

      <motion.div
        ref={panelRef}
        initial={reduced ? false : { scale: 0.97, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={reduced ? undefined : { scale: 0.98, y: 8 }}
        transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
        className="relative flex w-full max-w-[min(92vw,26rem)] flex-col gap-4 sm:max-w-[min(90vw,28rem)]"
      >
        <div className="relative overflow-hidden rounded-[1.75rem] bg-navy-800/60 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.9)]">
          {failed ? (
            <div className="relative">
              <img src={clip.poster} alt={clip.label} className="w-full object-contain" />
              <p className="px-5 py-4 text-center font-thai text-xs text-ivory/70">
                คลิปนี้เปิดไม่ได้บนอุปกรณ์นี้ — ภาพนิ่งยังอยู่ตรงนี้เสมอ
              </p>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={clip.video}
              poster={clip.poster}
              playsInline
              muted={muted}
              preload="metadata"
              aria-label={clip.label}
              className="max-h-[70vh] w-full bg-navy-900 object-contain"
              onLoadedMetadata={(event) => setLength(event.currentTarget.duration || clip.duration)}
              onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
              onPlay={(event) => {
                pauseOtherVideos(event.currentTarget);
                setPlaying(true);
              }}
              onPause={() => setPlaying(false)}
              onEnded={() => {
                setPlaying(false);
                /* A finished clip has no claim on the music. */
                setMuted(true);
              }}
              onError={() => setFailed(true)}
            />
          )}
        </div>

        <p id={titleId} className="font-thai text-sm text-ivory/85">
          {clip.label}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <ViewerButton onClick={toggle} disabled={failed} label={playing ? 'หยุดชั่วคราว' : 'เล่น'}>
            {playing ? 'หยุด' : 'เล่น'}
          </ViewerButton>
          <ViewerButton onClick={restart} disabled={failed} label="เริ่มใหม่">
            เริ่มใหม่
          </ViewerButton>
          {clip.hasAudio ? (
            <ViewerButton
              onClick={() => {
                play('softClick');
                setMuted((value) => !value);
              }}
              disabled={failed}
              label={muted ? 'ฟังเสียงในคลิปนี้' : 'ปิดเสียงคลิป'}
              active={!muted}
            >
              {muted ? 'ฟังเสียงนี้' : 'ปิดเสียงคลิป'}
            </ViewerButton>
          ) : null}
          <span className="ml-auto font-mono text-[0.58rem] tracking-[0.18em] text-sky-100/55">
            {clock(current)} / {clock(length)}
          </span>
        </div>

        <label className="sr-only" htmlFor={`${titleId}-seek`}>
          เลื่อนตำแหน่งคลิป
        </label>
        <input
          id={`${titleId}-seek`}
          type="range"
          min={0}
          max={Math.max(0.1, length)}
          step={0.1}
          value={Math.min(current, length)}
          disabled={failed}
          onChange={(event) => seek(Number(event.target.value))}
          className="ai-range h-11 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed"
        />

        <button
          ref={closeRef}
          type="button"
          onClick={requestClose}
          className="ai-pressable mx-auto inline-flex min-h-11 min-w-[7rem] items-center justify-center rounded-full border border-sky-200/25 px-6 font-thai text-sm text-ivory/85 hover:border-sky-200/50"
        >
          ปิด
        </button>
      </motion.div>
    </motion.div>
  );
}

function ViewerButton({
  onClick,
  children,
  label,
  disabled,
  active
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'ai-pressable inline-flex min-h-11 items-center rounded-full border px-4 font-thai text-xs disabled:opacity-40',
        active
          ? 'border-champagne/60 bg-champagne/10 text-champagne'
          : 'border-sky-200/20 text-ivory/75 hover:border-sky-200/45 hover:text-ivory'
      )}
    >
      {children}
    </button>
  );
}
