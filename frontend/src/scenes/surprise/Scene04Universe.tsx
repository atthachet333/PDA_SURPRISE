import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { AIMark } from '@/components/surprise/AIMark';
import { memoriesForScene, type Memory } from '@/data/anniversary';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';
import { preloadImages } from '@/lib/preload';
import { cn } from '@/lib/cn';

/**
 * Scene 04 — the memory universe.
 *
 * Emotional job: WONDER, and the first scene the visitor can touch.
 *
 * Pseudo-3D by design: photos are placed on orbit bands with CSS transforms so
 * they stay real DOM images (crisp, selectable, accessible) and run on a phone,
 * where a WebGL equivalent costs far more for the same reading.
 *
 * Three orbit bands turn at different speeds — motion hierarchy inside a single
 * scene. Dragging spins the whole system with inertia. Selecting a memory pulls
 * it to the camera while everything else blurs back.
 */

const BANDS = [
  { radius: 1, speed: 1, yScale: 1 },
  { radius: 0.72, speed: 1.55, yScale: 0.6 },
  { radius: 1.24, speed: 0.68, yScale: 1.35 }
] as const;

const IDLE_SPEED = 0.016; // degrees per ms
const HINT_KEY = 'ai:universe-hint';

interface Placed extends Memory {
  theta: number;
  y: number;
  band: (typeof BANDS)[number];
  bandIndex: number;
  index: number;
}

function placeMemories(memories: Memory[]): Placed[] {
  return memories.map((memory, index) => {
    const bandIndex = index % BANDS.length;
    const band = BANDS[bandIndex]!;
    // Spread each band's members evenly around their own ring.
    const inBand = Math.floor(index / BANDS.length);
    const bandCount = Math.ceil(memories.length / BANDS.length);
    return {
      ...memory,
      band,
      bandIndex,
      index,
      theta: (360 / bandCount) * inBand + bandIndex * 26,
      y: (bandIndex - 1) * 62 * band.yScale + ((index * 17) % 34) - 17
    };
  });
}

export function Scene04Universe() {
  const device = useDeviceProfile();
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const { play, triggerCue } = useAudio();
  const [sectionRef, inView] = useInViewOnce<HTMLElement>({ threshold: 0.25 });

  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState<Placed | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showHint, setShowHint] = useState(() => {
    try {
      return window.localStorage.getItem(HINT_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const rotationRef = useRef(0);
  const velocity = useRef(0);
  const lastPointer = useRef<number | null>(null);
  const lastTime = useRef(0);
  const dragDistance = useRef(0);

  const memories = useMemo(() => memoriesForScene('universe'), []);
  const placed = useMemo(() => placeMemories(memories), [memories]);
  const radius = device.isMobile ? 170 : device.tier === 'medium' ? 275 : 325;

  const acknowledgeHint = useCallback(() => {
    setShowHint(false);
    try {
      window.localStorage.setItem(HINT_KEY, '1');
    } catch {
      // The hint can reappear in private browsing without affecting interaction.
    }
  }, []);

  // Warm this scene's photos as it comes into view.
  useEffect(() => {
    if (!inView) return;
    triggerCue('memoryUniverse');
    /*
     * One subtle spatial pass, the first time the Universe opens. `useInViewOnce`
     * guarantees this fires once — orbiting and dragging stay silent, because a
     * continuous loop under a continuous motion becomes irritating within
     * seconds.
     */
    play('orbitPass');
    void preloadImages(memories.map((memory) => memory.image));
  }, [inView, memories, play, triggerCue]);

  // One loop drives idle rotation and drag inertia.
  useEffect(() => {
    if (reduced || !visible || !inView) return;
    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(48, now - previous);
      previous = now;

      if (!dragging && !selected) {
        rotationRef.current += (IDLE_SPEED + velocity.current) * delta;
        velocity.current *= 0.945;
        if (Math.abs(velocity.current) < 0.0004) velocity.current = 0;
        setRotation(rotationRef.current);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dragging, inView, reduced, selected, visible]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    acknowledgeHint();
    setDragging(true);
    lastPointer.current = event.clientX;
    lastTime.current = performance.now();
    dragDistance.current = 0;
    velocity.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [acknowledgeHint]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging || lastPointer.current === null) return;
      const now = performance.now();
      const dx = event.clientX - lastPointer.current;
      const dt = Math.max(1, now - lastTime.current);

      dragDistance.current += Math.abs(dx);
      rotationRef.current += dx * 0.26;
      velocity.current = (dx * 0.26) / dt;
      setRotation(rotationRef.current);

      lastPointer.current = event.clientX;
      lastTime.current = now;
    },
    [dragging]
  );

  const endDrag = useCallback(() => {
    setDragging(false);
    lastPointer.current = null;
  }, []);

  const openMemory = useCallback(
    (memory: Placed) => {
      // Ignore the click that ends a drag.
      if (dragDistance.current > 6) return;
      acknowledgeHint();
      // Very small focus cue — the memory coming into view, nothing more.
      play('memoryFocus');
      setSelected(memory);
    },
    [acknowledgeHint, play]
  );

  const closeMemory = useCallback(() => {
    play('softClick');
    setSelected(null);
  }, [play]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMemory();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMemory, selected]);

  return (
    <SceneSection id="memories" ref={sectionRef} label="Memory universe" className="overflow-hidden">
      <div className="relative flex w-full max-w-6xl flex-col items-center">
        <motion.div
          className="text-center"
          animate={{ opacity: selected ? 0.25 : 1, y: selected ? -12 : 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <SceneLabel>05 · จักรวาลความทรงจำ</SceneLabel>
          <SceneTitle className="thai-display mt-5 font-thai">ถ้าแต่ละความทรงจำ<br />เป็นดาวหนึ่งดวง...</SceneTitle>
        </motion.div>

        <div
          onPointerDown={selected ? undefined : onPointerDown}
          onPointerMove={selected ? undefined : onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          data-cursor={selected ? undefined : 'drag'}
          className={cn(
            'perspective-1000 relative mt-12 h-[26rem] w-full touch-pan-y select-none sm:h-[32rem]',
            !selected && (dragging ? 'cursor-grabbing' : 'cursor-grab')
          )}
          role="group"
          aria-label="Memory universe. Drag to rotate, then select a memory to open it."
        >
          {/* Centre mark — recedes when a memory takes the camera */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center"
            animate={{ opacity: selected ? 0 : 1, scale: selected ? 0.8 : 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <AIMark size="inline" />
            <span className="mt-3 block font-mono text-[0.5rem] uppercase tracking-[0.28em] text-sky-100/45">
              {memories.length} ความทรงจำ
            </span>
          </motion.div>

          {/* Orbit guides, each turning with its own band */}
          {!reduced
            ? BANDS.map((band, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/10"
                  style={{
                    width: `${radius * band.radius * 2}px`,
                    height: `${radius * band.radius * 0.62}px`,
                    opacity: selected ? 0.2 : 1,
                    transition: 'opacity 700ms ease'
                  }}
                />
              ))
            : null}

          <motion.div
            className="preserve-3d absolute inset-0"
            animate={{
              scale: selected ? 1.14 : 1,
              filter: selected ? 'blur(7px)' : 'blur(0px)',
              opacity: selected ? 0.32 : 1
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {placed.map((memory) => {
              // Each band advances at its own rate off the shared rotation.
              const angle = (memory.theta + rotation * memory.band.speed) % 360;
              const radians = (angle * Math.PI) / 180;
              const bandRadius = radius * memory.band.radius;
              const z = Math.cos(radians) * bandRadius;
              const x = Math.sin(radians) * bandRadius;
              const depth = (z / bandRadius + 1) / 2; // 0 = behind, 1 = front
              const scale = 0.54 + depth * 0.56;
              const opacity = 0.16 + depth * 0.84;
              // Cards tilt to face the camera as they come round.
              const tilt = Math.sin(radians) * -16;

              return (
                <button
                  key={memory.id}
                  type="button"
                  onClick={() => openMemory(memory)}
                  aria-label={`${memory.title}, ${memory.date}`}
                  data-cursor="open"
                  className="group absolute left-1/2 top-1/2 origin-center rounded-card focus-visible:outline-offset-4"
                  style={{
                    transform: `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${memory.y}px), 0) scale(${scale.toFixed(3)}) rotateY(${tilt.toFixed(1)}deg)`,
                    opacity,
                    zIndex: Math.round(depth * 100),
                    pointerEvents: depth > 0.4 && !selected ? 'auto' : 'none',
                    transition: dragging ? 'none' : 'opacity 300ms linear'
                  }}
                >
                  <span className="ai-frame-orbit block w-[8rem] overflow-hidden shadow-glow transition-transform duration-slow ease-entrance group-hover:scale-[1.06] sm:w-[10.5rem]">
                    <span
                      className={cn('block aspect-[4/5]', !reduced && 'animate-drift')}
                      style={{
                        animationDelay: `${memory.index * 0.6}s`,
                        animationDuration: `${9 + (memory.index % 5)}s`
                      }}
                    >
                      <MemoryImage
                        photo={memory.image}
                        alt={memory.title}
                        tone={memory.tone}
                        label={memory.date}
                        index={memory.index}
                        objectPosition={memory.objectPosition}
                        cropMode={memory.cropMode}
                      />
                    </span>
                    <span className="block truncate px-2.5 py-2 text-left font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ivory/55">
                      {memory.date}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Focused memory — the camera has come to it */}
          <AnimatePresence>
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, scale: 0.86, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-30 flex items-center justify-center px-2"
                role="dialog"
                aria-modal="true"
                aria-label={selected.title}
              >
                <div className="ai-glass ai-photo-spill relative flex w-full max-w-lg flex-col overflow-hidden rounded-panel sm:flex-row">
                  <div className="aspect-[4/3] w-full shrink-0 sm:aspect-auto sm:w-1/2">
                    <MemoryImage
                      photo={selected.image}
                      alt={selected.title}
                      tone={selected.tone}
                      loading="eager"
                      label={selected.date}
                      index={selected.index}
                      instant
                      objectPosition={selected.objectPosition}
                      cropMode={selected.cropMode}
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <p className="font-mono text-[0.5rem] uppercase tracking-[0.26em] text-sky-100/70">
                      {selected.date}
                      {selected.location ? ` · ${selected.location}` : ''}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-light leading-tight text-ivory">
                      {selected.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ivory/70">{selected.caption}</p>
                    <button
                      type="button"
                      onClick={closeMemory}
                      data-cursor="interactive"
                      className="mt-6 self-start rounded-pill border border-sky-200/30 px-4 py-2 text-[0.5625rem] uppercase tracking-[0.2em] text-ivory/70 transition-colors duration-base hover:border-sky-200/60 hover:text-ivory"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Click-away layer sits under the card, above the orbit */}
          {selected ? (
            <button
              type="button"
              className="absolute inset-0 z-20 cursor-default"
              onClick={closeMemory}
              aria-label="Close memory"
              tabIndex={-1}
            />
          ) : null}
        </div>

        <motion.p
          animate={{ opacity: selected || !showHint ? 0 : 0.52 }}
          className="mt-6 font-mono text-[0.5rem] uppercase tracking-[0.28em] text-ivory"
        >
          {device.isTouch ? 'ปัดเพื่อหมุน · แตะเพื่อเปิด' : 'ลากเพื่อหมุน · คลิกเพื่อเปิด'}
        </motion.p>
      </div>
    </SceneSection>
  );
}

