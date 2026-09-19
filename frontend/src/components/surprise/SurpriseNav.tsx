import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAudio } from '@/app/audioContext';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSecret } from '@/hooks/useSecret';
import { anniversary } from '@/data/anniversary';
import { SecretReveal } from './SecretReveal';
import { NAV_SECTIONS } from '@/data/surpriseNav';
import { AIMark } from './AIMark';

interface SurpriseNavProps {
  activeSection: string;
  /** Cinematic scenes hide the bar; pointer movement brings it back. */
  dimmed?: boolean;
  sceneNumber: number;
  sceneCount: number;
}

/**
 * Compact glass navigation.
 *
 * It fades out after a few seconds of stillness, hides entirely during the
 * cinematic scenes, and returns whenever the pointer nears the top of the
 * screen or the visitor scrolls. On touch the controls move to a bottom bar so
 * they sit under the thumb and never cover a scene title.
 */
export function SurpriseNav({ activeSection, dimmed = false, sceneNumber, sceneCount }: SurpriseNavProps) {
  const [revealed, setRevealed] = useState(true);
  const [focused, setFocused] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const idleTimer = useRef(0);
  const scrollTimer = useRef(0);
  const markTaps = useRef(0);
  const markTapAt = useRef(0);
  const navigate = useNavigate();
  const device = useDeviceProfile();
  const {
    musicEnabled,
    sfxEnabled,
    musicAvailable,
    status,
    volume,
    toggleMusic,
    toggleSfx,
    setVolume,
    play
  } = useAudio();
  const reduced = useReducedMotion();

  useEffect(() => {
    const sleep = () => {
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setRevealed(false), 3200);
    };
    const wake = () => {
      setRevealed(true);
      sleep();
    };
    // Reaching for the top of the screen always brings the bar back instantly.
    const onPointer = (event: PointerEvent) => {
      if (event.clientY < 96) {
        setRevealed(true);
        sleep();
        return;
      }
      if (!dimmed) wake();
    };
    const onScroll = () => {
      setRevealed(!dimmed);
      setScrolling(true);
      window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => setScrolling(false), 180);
      sleep();
    };

    if (dimmed) setRevealed(false);
    else wake();
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', wake);
    return () => {
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(scrollTimer.current);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', wake);
    };
  }, [dimmed]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Blocked by policy or unsupported; everything else still works.
    }
  }, []);

  const goTo = (id: string) => {
    play('softClick');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const MARK = anniversary.secrets.mark;
  const markSecret = useSecret(MARK.id, { duration: MARK.duration });

  /**
   * The mark secret.
   *
   * The mark's real job - take me back to the beginning - runs on EVERY tap,
   * unchanged. The counting happens alongside it, so someone who taps it five
   * times because they want to go back five times is not punished with a
   * hijacked control, and someone who is poking at it out of curiosity finds
   * something. Taps must be consecutive within a short window, so five taps
   * spread over a long read do not trip it by accident.
   */
  const onMarkTap = () => {
    goTo('entry');
    if (markSecret.discovered) return;

    const now = Date.now();
    markTaps.current = now - markTapAt.current > MARK.windowMs ? 1 : markTaps.current + 1;
    markTapAt.current = now;

    if (markTaps.current >= MARK.taps) {
      markTaps.current = 0;
      markSecret.discover();
    }
  };

  const visible = revealed || focused;
  const fullscreenSupported = typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen);

  /*
   * MUSIC vs SOUND are two independent controls, and the label each one shows is
   * read from the engine rather than guessed. `unavailable` disables the music
   * control outright instead of offering a toggle that cannot do anything.
   *
   * Toggling music PAUSES and RESUMES: the position is held, so turning it off
   * to take a call and back on again continues the song rather than restarting
   * the journey.
   */
  const unavailable = !musicAvailable;
  const musicState = unavailable
    ? '—'
    : status === 'loading'
      ? '···'
      : status === 'blocked'
        ? 'Tap'
        : musicEnabled && status === 'playing'
          ? 'On'
          : musicEnabled
            ? 'Ready'
            : 'Off';

  const controls = (
    <>
      <IconToggle
        active={musicEnabled && status === 'playing'}
        disabled={unavailable}
        onClick={() => {
          play('softClick');
          toggleMusic();
        }}
        label={musicEnabled ? 'Turn music off' : 'Turn music on'}
        shortLabel="Music"
        stateLabel={musicState}
        title={unavailable ? 'ยังไม่มีไฟล์เพลงในเครื่องนี้' : undefined}
        /* Small elegant motion only while genuinely audible, never on a paused
           or loading track, and never under reduced motion. */
        alive={!reduced && status === 'playing' && musicEnabled}
        loading={status === 'loading'}
      >
        <path d="M9 17V5l10-2v12" />
        <circle cx="6.5" cy="17" r="2.5" />
        <circle cx="16.5" cy="15" r="2.5" />
      </IconToggle>

      <VolumeControl
        value={volume}
        disabled={unavailable}
        onChange={(next) => setVolume(next, 'master')}
      />

      <IconToggle
        active={sfxEnabled}
        onClick={() => {
          play('softClick');
          toggleSfx();
        }}
        label={sfxEnabled ? 'Turn sound effects off' : 'Turn sound effects on'}
        shortLabel="Sound"
        stateLabel={sfxEnabled ? 'On' : 'Off'}
      >
        <path d="M4 9.5v5h3l4.5 3.5v-12L7 9.5H4Z" />
        {sfxEnabled ? <path d="M15.5 9a4 4 0 0 1 0 6" /> : <path d="M15.5 10.5 19 14M19 10.5l-3.5 3.5" />}
      </IconToggle>

      {fullscreenSupported ? (
        <IconToggle
          active={fullscreen}
          onClick={() => {
            play('softClick');
            void toggleFullscreen();
          }}
          label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          shortLabel="Full"
          stateLabel={fullscreen ? 'On' : 'Off'}
        >
          {fullscreen ? (
            <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
          ) : (
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          )}
        </IconToggle>
      ) : null}
    </>
  );

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[60] px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pt-4"
        animate={{ opacity: visible ? (scrolling ? 0.58 : 1) : 0, y: visible ? 0 : -16 }}
        onFocusCapture={() => {
          setFocused(true);
          setRevealed(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
      >
        <div className="ai-glass mx-auto flex h-[3.25rem] max-w-5xl items-center justify-between gap-2 rounded-2xl py-2 pl-2 pr-2 sm:h-14 sm:pl-3 sm:pr-3">
          <button
            type="button"
            onClick={onMarkTap}
            className="relative flex shrink-0 items-center gap-2 rounded-pill px-1 py-1 transition-all duration-base hover:opacity-80 active:scale-95"
            aria-label="Back to the beginning"
            data-cursor="interactive"
          >
            <AIMark size="nav" excited={markSecret.revealing} />
            <SecretReveal
              show={markSecret.revealing}
              text={MARK.message}
              className="absolute left-full top-1/2 ml-3 -translate-y-1/2"
            />
          </button>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Scenes">
            {NAV_SECTIONS.map((section) => {
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goTo(section.id)}
                  aria-current={active ? 'true' : undefined}
                  data-cursor="interactive"
                  className={cn(
                    'ai-pressable relative px-3.5 py-2 font-thai text-xs',
                    active ? 'text-ivory' : 'text-ivory/45 hover:text-ivory/85'
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="ai-nav-active"
                      className="absolute inset-x-3 -bottom-1 h-px bg-gradient-to-r from-transparent via-sky-100 to-transparent shadow-glow"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative">{section.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5">
            {!device.isTouch ? <span className="hidden items-center md:flex">{controls}</span> : null}
            <button
              type="button"
              onClick={() => {
                play('softClick');
                navigate('/');
              }}
              data-cursor="interactive"
              className="ai-pressable ml-0.5 rounded-pill px-3 py-1.5 text-[0.5625rem] uppercase tracking-[0.18em] text-ivory/45 hover:bg-ivory/10 hover:text-ivory"
            >
              Exit
            </button>
          </div>
        </div>
        <div className="mx-auto mt-2 flex max-w-5xl justify-end px-3">
          <CelestialProgress sceneNumber={sceneNumber} sceneCount={sceneCount} />
        </div>
      </motion.header>

      {/* Touch devices get the audio controls at thumb height instead. */}
      {device.isTouch ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
          animate={{ opacity: visible ? (scrolling ? 0.58 : 1) : 0, y: visible ? 0 : 16 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: visible ? 'auto' : 'none' }}
        >
          <div className="ai-glass flex items-center gap-1 rounded-2xl px-2 py-1.5">
            <span className="mr-1 font-mono text-[0.5rem] tracking-[0.16em] text-sky-100/65">{String(sceneNumber).padStart(2, '0')}</span>
            {controls}
            <span className="mx-1 h-4 w-px bg-ivory/15" />
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => goTo(section.id)}
                aria-label={`Go to ${section.label}`}
                aria-current={activeSection === section.id ? 'true' : undefined}
                className="ai-pressable flex h-9 w-7 items-center justify-center"
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-all duration-base',
                    activeSection === section.id ? 'scale-125 bg-sky-200' : 'bg-ivory/25'
                  )}
                />
              </button>
            ))}
          </div>
        </motion.div>
      ) : null}
    </>
  );
}

function IconToggle({
  active,
  onClick,
  label,
  shortLabel,
  stateLabel,
  title,
  disabled = false,
  alive = false,
  loading = false,
  children
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  shortLabel: string;
  stateLabel: string;
  title?: string;
  /** No file - the control stops offering something it cannot do. */
  disabled?: boolean;
  /** Genuinely audible right now: a small breath of motion. */
  alive?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={title ?? label}
      data-cursor={disabled ? undefined : 'interactive'}
      className={cn(
        'ai-pressable group relative flex h-9 items-center justify-center gap-1.5 rounded-full px-2 xl:px-2.5',
        disabled
          ? 'cursor-default text-ivory/20'
          : active
            ? 'text-ivory'
            : 'text-ivory/35 hover:text-ivory/70'
      )}
    >
      {/* Playing indicator: one soft breath, no waveform, no analyser. */}
      {alive ? (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-sky-400/10"
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      {loading ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-2 bottom-1 h-px overflow-hidden bg-ivory/10"
        >
          <span className="block h-full w-1/3 animate-beam-x bg-sky-200/60" />
        </span>
      ) : null}
      <span
        className={cn(
          'relative flex h-full items-center justify-center gap-1.5 rounded-full transition-colors duration-base',
          active ? 'bg-sky-400/15' : !disabled && 'hover:bg-ivory/10'
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[1.05rem] w-[1.05rem]"
          aria-hidden="true"
        >
          {children}
        </svg>
        <span className="hidden font-mono text-[0.48rem] uppercase tracking-[0.12em] lg:inline">{shortLabel}</span>
        <span className={cn('hidden font-mono text-[0.42rem] uppercase tracking-[0.08em] xl:inline', active ? 'text-sky-100/55' : 'text-ivory/25')}>{stateLabel}</span>
      </span>
    </button>
  );
}

function CelestialProgress({ sceneNumber, sceneCount }: { sceneNumber: number; sceneCount: number }) {
  const progress = sceneNumber / Math.max(1, sceneCount - 1);
  const angle = -120 + progress * 240;
  const x = 18 + Math.cos((angle * Math.PI) / 180) * 12;
  const y = 18 + Math.sin((angle * Math.PI) / 180) * 12;
  return (
    <div className="flex items-center gap-2 text-sky-100/55" aria-label={`ฉาก ${sceneNumber} จาก ${sceneCount - 1}`}>
      <span className="font-mono text-[0.5rem] tracking-[0.18em]">{String(sceneNumber).padStart(2, '0')} / {String(sceneCount - 1).padStart(2, '0')}</span>
      <svg viewBox="0 0 36 36" className="h-8 w-8" aria-hidden="true">
        <circle cx="18" cy="18" r="12" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.75" strokeDasharray="2 3" />
        <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r="1.7" fill="currentColor" />
        <circle cx="18" cy="18" r="1" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  );
}

/**
 * Minimal expandable volume. Collapsed to a single icon so it never occupies
 * screen space in a cinematic scene; the slider appears beside it only while in
 * use, and closes on blur or pointer-leave.
 *
 * It is a real range input: keyboard-operable, announced by a screen reader, and
 * carrying its value. The engine persists the preference.
 */
function VolumeControl({
  value,
  disabled,
  onChange
}: {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const percent = Math.round(value * 100);

  // Nothing to set the level of.
  if (disabled) return null;

  return (
    <span
      className="relative flex items-center"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onPointerLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onPointerEnter={() => setOpen(true)}
        aria-expanded={open}
        aria-label={`ระดับเสียง ${percent}%`}
        data-cursor="interactive"
        className="ai-pressable flex h-9 items-center justify-center rounded-full px-2 text-ivory/35 hover:bg-ivory/10 hover:text-ivory/70"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          className="h-[1.05rem] w-[1.05rem]"
          aria-hidden="true"
        >
          <path d="M5 10v4M9.5 7.5v9M14 5v14M18.5 9v6" />
        </svg>
      </button>

      <motion.span
        className="overflow-hidden"
        initial={false}
        animate={{ width: open ? 76 : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percent}
          tabIndex={open ? 0 : -1}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
          aria-label="ระดับเสียงรวม"
          className="ai-volume-slider w-[4.25rem] cursor-pointer align-middle"
        />
      </motion.span>
    </span>
  );
}
