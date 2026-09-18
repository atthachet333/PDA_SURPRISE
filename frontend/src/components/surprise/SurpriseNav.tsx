import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAudio } from '@/app/audioContext';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { NAV_SECTIONS } from '@/data/surpriseNav';
import { AIMark } from './AIMark';

interface SurpriseNavProps {
  activeSection: string;
  /** Cinematic scenes hide the bar; pointer movement brings it back. */
  dimmed?: boolean;
}

/**
 * Compact glass navigation.
 *
 * It fades out after a few seconds of stillness, hides entirely during the
 * cinematic scenes, and returns whenever the pointer nears the top of the
 * screen or the visitor scrolls. On touch the controls move to a bottom bar so
 * they sit under the thumb and never cover a scene title.
 */
export function SurpriseNav({ activeSection, dimmed = false }: SurpriseNavProps) {
  const [revealed, setRevealed] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const navigate = useNavigate();
  const device = useDeviceProfile();
  const { musicEnabled, sfxEnabled, musicAvailable, toggleMusic, toggleSfx, play } = useAudio();

  useEffect(() => {
    let timer = 0;
    const sleep = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setRevealed(false), 2800);
    };
    const wake = () => {
      setRevealed(true);
      sleep();
    };
    // Reaching for the top of the screen always brings the bar back instantly.
    const onPointer = (event: PointerEvent) => {
      if (event.clientY < 96) {
        setRevealed(true);
        window.clearTimeout(timer);
        return;
      }
      wake();
    };

    wake();
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('keydown', wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);

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
    play('click');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const visible = revealed && !dimmed;
  const fullscreenSupported = typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen);

  const controls = (
    <>
      <IconToggle
        active={musicEnabled && musicAvailable}
        onClick={() => {
          play('click');
          toggleMusic();
        }}
        label={musicEnabled ? 'Turn music off' : 'Turn music on'}
        title={musicAvailable ? undefined : 'No music file added yet'}
      >
        <path d="M9 17V5l10-2v12" />
        <circle cx="6.5" cy="17" r="2.5" />
        <circle cx="16.5" cy="15" r="2.5" />
      </IconToggle>

      <IconToggle
        active={sfxEnabled}
        onClick={() => {
          play('click');
          toggleSfx();
        }}
        label={sfxEnabled ? 'Turn sound effects off' : 'Turn sound effects on'}
      >
        <path d="M4 9.5v5h3l4.5 3.5v-12L7 9.5H4Z" />
        {sfxEnabled ? <path d="M15.5 9a4 4 0 0 1 0 6" /> : <path d="M15.5 10.5 19 14M19 10.5l-3.5 3.5" />}
      </IconToggle>

      {fullscreenSupported ? (
        <IconToggle
          active={fullscreen}
          onClick={() => {
            play('click');
            void toggleFullscreen();
          }}
          label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
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
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -16 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
      >
        <div className="ai-glass mx-auto flex h-[3.25rem] max-w-4xl items-center justify-between gap-2 rounded-pill py-2 pl-2 pr-2 sm:h-14 sm:pl-3 sm:pr-3">
          <button
            type="button"
            onClick={() => goTo('entry')}
            className="flex shrink-0 items-center gap-2 rounded-pill px-1 py-1 transition-opacity duration-base hover:opacity-80"
            aria-label="Back to the beginning"
            data-cursor="interactive"
          >
            <AIMark size="nav" />
          </button>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Scenes">
            {NAV_SECTIONS.map((section) => {
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onPointerEnter={() => play('hover')}
                  onClick={() => goTo(section.id)}
                  aria-current={active ? 'true' : undefined}
                  data-cursor="interactive"
                  className={cn(
                    'relative rounded-pill px-3.5 py-1.5 text-[0.6875rem] tracking-[0.14em] transition-colors duration-base',
                    active ? 'text-ivory' : 'text-ivory/45 hover:text-ivory/85'
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="ai-nav-active"
                      className="absolute inset-0 rounded-pill bg-sky-400/18 ring-1 ring-inset ring-sky-200/25"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative uppercase">{section.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5">
            {!device.isTouch ? controls : null}
            <button
              type="button"
              onClick={() => {
                play('click');
                navigate('/');
              }}
              data-cursor="interactive"
              className="ml-0.5 rounded-pill px-3 py-1.5 text-[0.5625rem] uppercase tracking-[0.18em] text-ivory/45 transition-colors duration-base hover:bg-ivory/10 hover:text-ivory"
            >
              Exit
            </button>
          </div>
        </div>
      </motion.header>

      {/* Touch devices get the audio controls at thumb height instead. */}
      {device.isTouch ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: visible ? 'auto' : 'none' }}
        >
          <div className="ai-glass flex items-center gap-1 rounded-pill px-2 py-1.5">
            {controls}
            <span className="mx-1 h-4 w-px bg-ivory/15" />
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => goTo(section.id)}
                aria-label={`Go to ${section.label}`}
                aria-current={activeSection === section.id ? 'true' : undefined}
                className="flex h-8 w-6 items-center justify-center"
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
  title,
  children
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={title ?? label}
      data-cursor="interactive"
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-base',
        active ? 'text-ivory' : 'text-ivory/35 hover:text-ivory/70'
      )}
    >
      <span
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full transition-colors duration-base',
          active ? 'bg-sky-400/15' : 'hover:bg-ivory/10'
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
      </span>
    </button>
  );
}
