import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { SceneLabel, SceneText, SceneTitle } from '@/components/surprise/SceneSection';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { memoriesForScene, type Memory } from '@/data/anniversary';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';
import { preloadImages } from '@/lib/preload';
import { cn } from '@/lib/cn';

/**
 * Scene 07 — the photo tunnel.
 *
 * Emotional job: IMMERSION. Camera language is a steady forward push.
 *
 * Panels sit on rings down the Z axis and scrolling the tall section flies the
 * camera through them. Built with CSS 3D so photos stay sharp and each panel is
 * one composited layer.
 *
 * Depth cues, in order of importance: scale from perspective, a fog veil that
 * thickens with distance, blur at both extremes, and a light source at the far
 * end that the camera travels toward. Panels fade in from the fog rather than
 * popping, and the final ring dissolves into the next scene.
 */

const RING_COUNT = 8;
const PER_RING = 4;
const RING_DEPTH = 600;
const TRAVEL = RING_COUNT * RING_DEPTH;

/** Wall positions: left, right, upper, lower — repeated down the tunnel. */
const WALL = [
  { x: -36, y: -8, rotateY: 40, rotateX: 0 },
  { x: 36, y: 8, rotateY: -40, rotateX: 0 },
  { x: -11, y: -29, rotateY: 12, rotateX: 32 },
  { x: 13, y: 29, rotateY: -12, rotateX: -32 }
] as const;

export function Scene07Tunnel() {
  const container = useRef<HTMLDivElement>(null);
  const device = useDeviceProfile();
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.1 });
  const { triggerCue } = useAudio();

  const memories = useMemo(() => memoriesForScene('tunnel'), []);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  });

  const travel = useTransform(scrollYProgress, [0, 1], [0, TRAVEL]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.1, 0.19], [1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.78, 0.9, 0.98], [0, 1, 0.85]);
  // The light at the end grows as the camera approaches it.
  const endLightScale = useTransform(scrollYProgress, [0, 1], [0.35, 3.4]);
  const endLightOpacity = useTransform(scrollYProgress, [0, 0.55, 0.92, 1], [0.35, 0.6, 1, 1]);
  // Final dissolve into the next scene.
  const dissolve = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  const simplified = reduced || !device.enablePhotoTunnel;

  useEffect(() => {
    if (!inView) return;
    triggerCue('tunnel');
    // Every wall panel is visible within a couple of seconds of entering, so
    // this scene warms its whole set rather than a window.
    void preloadImages(memories.map((memory) => memory.image), 3);
  }, [inView, memories, triggerCue]);

  const panels = useMemo(
    () =>
      Array.from({ length: RING_COUNT * PER_RING }).map((_, index) => {
        const ring = Math.floor(index / PER_RING);
        const slot = index % PER_RING;
        return {
          key: `${ring}-${slot}`,
          ring,
          memory: memories[index % memories.length]!,
          position: WALL[slot] ?? WALL[0],
          index
        };
      }),
    [memories]
  );

  if (simplified) return <SimplifiedTunnel memories={memories} sentinelRef={ref} />;

  return (
    <div ref={container} id="tunnel" className="relative h-[440vh]">
      {/* Sentinel drives preloading and the music cue without owning layout. */}
      <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]" />

      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: headingOpacity }}
          className="pointer-events-none absolute z-20 max-w-xl px-6 text-center"
        >
          <SceneLabel>Through it all</SceneLabel>
          <SceneTitle className="mt-5">A year, one frame at a time.</SceneTitle>
          <SceneText className="mx-auto mt-5 max-w-sm">Keep scrolling.</SceneText>
        </motion.div>

        {/* Light at the far end of the tunnel */}
        <motion.span
          aria-hidden="true"
          style={{ scale: endLightScale, opacity: endLightOpacity }}
          className="pointer-events-none absolute h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85),rgba(126,200,255,0.35)_42%,transparent_72%)] blur-2xl"
        />

        <div className="perspective-1000 absolute inset-0">
          <div className="preserve-3d absolute inset-0">
            {panels.map((panel) => (
              <TunnelPanel
                key={panel.key}
                ring={panel.ring}
                memory={panel.memory}
                position={panel.position}
                index={panel.index}
                travel={travel}
                fog={device.enableFog}
              />
            ))}
          </div>
        </div>

        {/* Fog volume: thickens toward the walls and the edges of frame */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_58%_at_50%_50%,transparent,rgba(17,37,56,0.55)_62%,rgba(12,27,41,0.95))]"
        />

        <motion.div
          style={{ opacity: outroOpacity }}
          className="pointer-events-none absolute z-20 max-w-xl px-6 text-center"
        >
          <p className="ai-legible font-display text-[clamp(1.5rem,3.6vw,2.5rem)] font-light italic text-ivory">
            And there is still so much film left.
          </p>
        </motion.div>

        {/* Dissolve to white on exit, handing off to the timeline */}
        <motion.span
          aria-hidden="true"
          style={{ opacity: dissolve }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.9),rgba(126,200,255,0.5)_45%,transparent_78%)]"
        />
      </div>
    </div>
  );
}

function TunnelPanel({
  ring,
  memory,
  position,
  index,
  travel,
  fog
}: {
  ring: number;
  memory: Memory;
  position: (typeof WALL)[number];
  index: number;
  travel: MotionValue<number>;
  fog: boolean;
}) {
  const base = -ring * RING_DEPTH - 420;
  const z = useTransform(travel, (value) => base + value);

  // Long fade-in from the fog, hard cut once past the camera.
  const opacity = useTransform(z, [-2900, -2000, -420, 120], [0, 1, 1, 0]);
  const blurValue = useTransform(z, [-2900, -1500, -300, 100], [7, 0, 0, 5]);
  const filter = useTransform(blurValue, (value) => `blur(${value.toFixed(2)}px)`);
  // Distant panels are washed toward the fog colour.
  const veil = useTransform(z, [-2900, -1200], [0.85, 0]);

  return (
    <motion.figure
      className={cn(
        'absolute left-1/2 top-1/2 w-[12.5rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden',
        'ai-surface rounded-panel shadow-glow sm:w-[17rem]'
      )}
      style={{
        z,
        opacity,
        filter,
        x: `${position.x}vw`,
        y: `${position.y}vh`,
        rotateY: position.rotateY,
        rotateX: position.rotateX
      }}
    >
      <span className="relative block aspect-[4/5]">
        <MemoryImage
          photo={memory.image}
          alt={memory.title}
          tone={memory.tone}
          label={memory.date}
          index={index}
        />
        {fog ? (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 bg-navy-800"
            style={{ opacity: veil }}
          />
        ) : null}
      </span>
      <figcaption className="border-t border-sky-200/10 px-3 py-2 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ivory/50">
        {memory.date}
      </figcaption>
    </motion.figure>
  );
}

/**
 * Reduced-motion and low-power fallback. Designed as its own composition — an
 * offset contact sheet that drifts gently — rather than a stripped-down tunnel.
 */
function SimplifiedTunnel({
  memories,
  sentinelRef
}: {
  memories: Memory[];
  sentinelRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <section id="tunnel" aria-label="Photo tunnel" className="relative px-6 py-28">
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40" />
      <div className="mx-auto max-w-4xl text-center">
        <SceneLabel>Through it all</SceneLabel>
        <SceneTitle className="mt-5">A year, one frame at a time.</SceneTitle>
      </div>

      <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {memories.slice(0, 9).map((memory, index) => (
          <motion.figure
            key={memory.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 0.85, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
            // Every other column sits lower, so the grid reads as a drift.
            className={cn('ai-surface overflow-hidden rounded-card', index % 3 === 1 && 'sm:mt-8')}
          >
            <span className="block aspect-[3/4]">
              <MemoryImage
                photo={memory.image}
                alt={memory.title}
                tone={memory.tone}
                label={memory.date}
                index={index}
              />
            </span>
            <figcaption className="px-2.5 py-2 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ivory/45">
              {memory.date}
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <p className="mx-auto mt-14 max-w-sm text-center font-display text-[clamp(1.25rem,3vw,1.75rem)] font-light italic text-ivory/80">
        And there is still so much film left.
      </p>
    </section>
  );
}
