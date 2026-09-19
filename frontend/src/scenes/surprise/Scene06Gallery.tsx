import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { memoriesForScene } from '@/data/anniversary';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';
import { preloadImages } from '@/lib/preload';
import { cn } from '@/lib/cn';

/**
 * Scene 06 — the rotating gallery.
 *
 * Emotional job: BROWSE. Camera language is circular.
 *
 * Depth is expressed on four axes at once — scale, blur, opacity and
 * saturation — so the ring reads as physical rather than as a row of scaled
 * images. The centre card snaps with a short spring; everything else glides.
 *
 * Auto-rotation is slow and yields immediately to any interaction, resuming a
 * few seconds after the visitor stops.
 */

const AUTO_INTERVAL = 5200;
const RESUME_DELAY = 6000;
const VISIBLE_DEPTH = 3;

export function Scene06Gallery() {
  const memories = useMemo(() => memoriesForScene('gallery'), []);
  const [active, setActive] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const device = useDeviceProfile();
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.3 });
  const { play, triggerCue } = useAudio();

  const resumeTimer = useRef(0);
  const dragStart = useRef<number | null>(null);
  const wheelLock = useRef(0);

  const step = useCallback(
    (direction: 1 | -1) => {
      setActive((current) => (current + direction + memories.length) % memories.length);
      play('memoryFocus');
    },
    [memories.length, play]
  );

  const pause = useCallback(() => {
    setInteracting(true);
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setInteracting(false), RESUME_DELAY);
  }, []);

  useEffect(() => {
    if (!inView) return;
    triggerCue('gallery');
    void preloadImages(memories.map((memory) => memory.image));
  }, [inView, memories, triggerCue]);

  useEffect(() => {
    if (reduced || interacting || !pageVisible || !inView) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % memories.length),
      AUTO_INTERVAL
    );
    return () => window.clearInterval(timer);
  }, [inView, interacting, memories.length, pageVisible, reduced]);

  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      pause();
      step(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      pause();
      step(-1);
    }
  };

  // Horizontal wheel / trackpad swipe, throttled so one gesture is one step.
  const onWheel = (event: React.WheelEvent) => {
    if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;
    const now = performance.now();
    if (now - wheelLock.current < 420) return;
    wheelLock.current = now;
    pause();
    step(event.deltaX > 0 ? 1 : -1);
  };

  const radius = device.isMobile ? 230 : 430;
  const current = memories[active];

  return (
    <SceneSection id="little-moments" ref={ref} label="โมเมนต์เล็ก ๆ" className="overflow-hidden">
      <div className="flex w-full max-w-6xl flex-col items-center">
        <div className="text-center">
          <SceneLabel>03 · โมเมนต์เล็ก ๆ ของเรา</SceneLabel>
          <SceneTitle className="thai-display mt-5 font-thai">เรื่องเล็ก ๆ ที่อยากจำไว้นาน ๆ</SceneTitle>
        </div>

        <div
          className="perspective-1000 relative mt-14 h-[23rem] w-full touch-pan-y select-none sm:h-[28rem]"
          tabIndex={0}
          role="group"
          aria-label="Memory carousel. Use the left and right arrow keys to move between memories."
          data-cursor="drag"
          onKeyDown={onKeyDown}
          onWheel={onWheel}
          onPointerDown={(event) => {
            dragStart.current = event.clientX;
            pause();
          }}
          onPointerUp={(event) => {
            if (dragStart.current === null) return;
            const dx = event.clientX - dragStart.current;
            if (Math.abs(dx) > 44) step(dx < 0 ? 1 : -1);
            dragStart.current = null;
          }}
          onPointerLeave={() => {
            dragStart.current = null;
          }}
        >
          <div className="preserve-3d absolute inset-0">
            {memories.map((memory, index) => {
              // Shortest signed distance around the ring.
              let offset = index - active;
              if (offset > memories.length / 2) offset -= memories.length;
              if (offset < -memories.length / 2) offset += memories.length;

              const distance = Math.abs(offset);
              const hidden = distance > VISIBLE_DEPTH;
              const angle = offset * (device.isMobile ? 28 : 21);
              const radians = (angle * Math.PI) / 180;
              const x = Math.sin(radians) * radius;
              const z = (Math.cos(radians) - 1) * radius * 0.72;
              const isActive = offset === 0;

              return (
                <motion.button
                  key={memory.id}
                  type="button"
                  aria-hidden={hidden}
                  tabIndex={isActive ? 0 : -1}
                  data-cursor={isActive ? 'interactive' : 'drag'}
                  onClick={() => {
                    pause();
                    if (!isActive) {
                      setActive(index);
                      play('memoryFocus');
                    }
                  }}
                  className="absolute left-1/2 top-1/2 origin-center"
                  animate={{
                    x: x - (device.isMobile ? 80 : 118),
                    y: device.isMobile ? -160 : -196,
                    z,
                    rotateY: -angle * 0.9,
                    scale: isActive ? 1 : Math.max(0.55, 0.84 - distance * 0.06),
                    opacity: hidden ? 0 : isActive ? 1 : Math.max(0.15, 0.6 - distance * 0.13),
                    filter: isActive
                      ? 'blur(0px) saturate(1)'
                      : `blur(${Math.min(5, distance * 1.6)}px) saturate(${Math.max(0.45, 1 - distance * 0.2)})`
                  }}
                  // Centre card arrives with a short spring; the rest glide.
                  transition={
                    isActive
                      ? { type: 'spring', stiffness: 180, damping: 22, mass: 0.9 }
                      : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
                  }
                  style={{ zIndex: 50 - distance, pointerEvents: hidden ? 'none' : 'auto' }}
                >
                  <span
                    className={cn(
                      'ai-frame-memory block w-[10rem] overflow-hidden transition-shadow duration-slow sm:w-[14.75rem]',
                      isActive ? 'ai-photo-spill shadow-glow-lg ring-1 ring-sky-200/35' : ''
                    )}
                  >
                    <span className="block aspect-[3/4]">
                      <MemoryImage
                        photo={memory.image}
                        alt={memory.title}
                        tone={memory.tone}
                        loading={distance <= 1 ? 'eager' : 'lazy'}
                        label={memory.date}
                        index={index}
                        objectPosition={memory.objectPosition}
                        cropMode={memory.cropMode}
                      />
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-5 sm:gap-6">
          <CarouselButton
            label="Previous memory"
            onClick={() => {
              pause();
              step(-1);
            }}
          >
            <path d="M12 4 6 10l6 6" />
          </CarouselButton>

          <div className="min-w-[12rem] text-center sm:min-w-[15rem]">
            <motion.div
              key={current?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="ai-legible font-display text-xl font-light text-ivory">{current?.title}</p>
              <p className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.24em] text-sky-100/60">
                {current?.date}
                {current?.location ? ` · ${current.location}` : ''}
              </p>
            </motion.div>
          </div>

          <CarouselButton
            label="Next memory"
            onClick={() => {
              pause();
              step(1);
            }}
          >
            <path d="m8 4 6 6-6 6" />
          </CarouselButton>
        </div>

        <motion.p
          key={`${current?.id}-caption`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-5 max-w-sm text-center text-sm italic leading-relaxed text-ivory/55"
        >
          {current?.caption}
        </motion.p>

        {/* Position indicator doubles as the auto-rotate state */}
        <div className="mt-7 flex items-center gap-1.5" aria-hidden="true">
          {memories.map((memory, index) => (
            <span
              key={memory.id}
              className={cn(
                'h-1 rounded-full transition-all duration-slow ease-entrance',
                index === active ? 'w-5 bg-sky-200' : 'w-1 bg-ivory/20'
              )}
            />
          ))}
        </div>
      </div>
    </SceneSection>
  );
}

function CarouselButton({
  label,
  onClick,
  children
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-cursor="interactive"
      className="group flex h-11 w-11 items-center justify-center rounded-full border border-sky-200/20 text-ivory/70 transition-all duration-base hover:border-sky-200/50 hover:bg-sky-400/10 hover:text-ivory active:scale-95"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 transition-transform duration-base group-hover:scale-110"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}
