import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { AIMark } from '@/components/surprise/AIMark';
import { anniversary, memoriesForScene, type Memory } from '@/data/anniversary';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';
import { cn } from '@/lib/cn';

/**
 * Scene 11 — everything at once. The second WOW.
 *
 * Staged in four acts across the scroll:
 *   1. ARRIVE   memories come out of depth, scattered but controlled
 *   2. DRIFT    they float freely — chaotic, never random
 *   3. GRAVITY  they are pulled inward and lock into the glyph 365
 *   4. DISSOLVE the shape gives way to light, and A&I remains
 *
 * The glyph is sampled from a 3x5 bitmap per digit rather than hand-placed, so
 * the shape is genuinely readable and changing the glyph is a data edit.
 */

const DIGITS: Record<string, number[][]> = {
  '0': [[1, 1, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 1, 1]],
  '1': [[0, 1, 0], [1, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  '2': [[1, 1, 1], [0, 0, 1], [1, 1, 1], [1, 0, 0], [1, 1, 1]],
  '3': [[1, 1, 1], [0, 0, 1], [0, 1, 1], [0, 0, 1], [1, 1, 1]],
  '4': [[1, 0, 1], [1, 0, 1], [1, 1, 1], [0, 0, 1], [0, 0, 1]],
  '5': [[1, 1, 1], [1, 0, 0], [1, 1, 1], [0, 0, 1], [1, 1, 1]],
  '6': [[1, 1, 1], [1, 0, 0], [1, 1, 1], [1, 0, 1], [1, 1, 1]],
  '7': [[1, 1, 1], [0, 0, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
  '8': [[1, 1, 1], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 1, 1]],
  '9': [[1, 1, 1], [1, 0, 1], [1, 1, 1], [0, 0, 1], [1, 1, 1]]
};

interface Target {
  x: number;
  y: number;
}

/** Samples the configured glyph into vmin-space target cells. */
function buildTargets(glyph: string, cellW: number, cellH: number): Target[] {
  const digits = [...glyph].filter((char) => DIGITS[char]);
  if (digits.length === 0) return [];

  const gap = cellW * 0.7;
  const digitW = 3 * cellW + gap;
  const totalW = digits.length * digitW - gap;
  const cells: Target[] = [];

  digits.forEach((digit, digitIndex) => {
    DIGITS[digit]?.forEach((row, rowIndex) => {
      row.forEach((filled, colIndex) => {
        if (!filled) return;
        cells.push({
          x: digitIndex * digitW + colIndex * cellW - totalW / 2 + cellW / 2,
          y: rowIndex * cellH - (5 * cellH) / 2 + cellH / 2
        });
      });
    });
  });

  return cells;
}

export function Scene11Converge() {
  const container = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.15 });
  const device = useDeviceProfile();
  const reduced = useReducedMotion();
  const { triggerCue, play } = useAudio();
  const impactFired = useRef(false);

  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });
  const memories = useMemo(() => memoriesForScene('converge'), []);

  const cellW = device.isMobile ? 4.4 : 3.5;
  const cellH = device.isMobile ? 5.4 : 4.3;
  const targets = useMemo(
    () => buildTargets(anniversary.convergence.glyph, cellW, cellH),
    [cellH, cellW]
  );

  useEffect(() => {
    if (inView) triggerCue('convergence');
  }, [inView, triggerCue]);

  // One impact when the glyph locks.
  useEffect(
    () =>
      scrollYProgress.on('change', (value) => {
        if (value > 0.52 && value < 0.72 && !impactFired.current) {
          impactFired.current = true;
          play('softImpact');
        }
        if (value < 0.3) impactFired.current = false;
      }),
    [play, scrollYProgress]
  );

  const cards = useMemo(
    () =>
      targets.map((target, index) => {
        const memory = memories[index % memories.length]!;
        // Golden-angle scatter: dense but never clumped, identical every visit.
        const angle = (index * 137.508 * Math.PI) / 180;
        const spread = 30 + ((index * 23) % 24);
        return {
          key: `${memory.id}-${index}`,
          memory,
          target,
          origin: { x: Math.cos(angle) * spread, y: Math.sin(angle) * spread * 0.6 },
          drift: { x: Math.cos(angle * 1.7) * 6, y: Math.sin(angle * 2.3) * 6 },
          rotate: ((index * 47) % 44) - 22,
          index
        };
      }),
    [memories, targets]
  );

  const flash = useTransform(scrollYProgress, [0.52, 0.64, 0.8], [0, 0.85, 0.12]);
  const markOpacity = useTransform(scrollYProgress, [0.76, 0.9], [0, 1]);
  const markScale = useTransform(scrollYProgress, [0.76, 1], [0.85, 1]);
  const captionOpacity = useTransform(scrollYProgress, [0.84, 0.95], [0, 1]);
  const glyphGlow = useTransform(scrollYProgress, [0.48, 0.6, 0.74], [0, 0.6, 0]);
  const glyphOpacity = useTransform(scrollYProgress, [0.5, 0.58, 0.76, 0.86], [0, 0.16, 0.16, 0]);

  if (reduced) {
    return (
      <section id="converge" aria-label="Everything at once" className="px-6 py-28 text-center">
        <div ref={ref} aria-hidden="true" className="h-px" />
        <p className="mb-10 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-sky-100/55">10 · ทุกอย่างที่เราเป็น</p>
        <div className="mx-auto grid max-w-2xl grid-cols-6 gap-1.5">
          {cards.slice(0, 30).map((card) => (
            <span key={card.key} className="ai-surface aspect-[3/4] overflow-hidden rounded-[4px]">
              <MemoryImage photo={card.memory.image} alt="" tone={card.memory.tone} index={card.index} objectPosition={card.memory.objectPosition} cropMode={card.memory.cropMode} />
            </span>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center">
          <AIMark size="loader" />
          <p className="mt-6 font-display text-xl italic text-ivory/75">
            {anniversary.convergence.caption}
          </p>
        </div>
      </section>
    );
  }

  return (
    <div ref={container} id="converge" className="relative h-[380vh]">
      <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[50vh]" />

      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        <p className="pointer-events-none absolute top-24 z-30 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-sky-100/55">10 · ทุกอย่างที่เราเป็น</p>
        {/* Light released as the glyph locks */}
        <motion.span
          aria-hidden="true"
          style={{ opacity: flash }}
          className="pointer-events-none absolute h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.65),rgba(126,200,255,0.28)_42%,transparent_72%)] blur-3xl"
        />

        {/* A quiet silhouette makes the completed form legible immediately;
            the photo cards remain the substance of the glyph. */}
        <motion.p
          aria-hidden="true"
          style={{ opacity: glyphOpacity }}
          className="pointer-events-none absolute z-0 font-display text-[clamp(7rem,25vw,18rem)] font-light leading-none tracking-[0.02em] text-sky-100"
        >
          {anniversary.convergence.glyph}
        </motion.p>

        {/* Glow held behind the assembled shape */}
        <motion.span
          aria-hidden="true"
          style={{ opacity: glyphGlow }}
          className="pointer-events-none absolute h-[26rem] w-[38rem] rounded-full bg-[radial-gradient(ellipse,rgba(126,200,255,0.3),transparent_70%)] blur-2xl"
        />

        <div className="absolute inset-0">
          {cards.map((card) => (
            <ConvergeCard
              key={card.key}
              card={card}
              progress={scrollYProgress}
              total={cards.length}
              small={device.isMobile}
            />
          ))}
        </div>

        <motion.div
          style={{ opacity: markOpacity, scale: markScale }}
          className="pointer-events-none relative z-20"
        >
          <AIMark size="hero" />
        </motion.div>

        <motion.p
          style={{ opacity: captionOpacity }}
          className="ai-legible pointer-events-none absolute bottom-20 px-6 text-center font-display text-[clamp(1.1rem,2.6vw,1.75rem)] italic text-ivory/80"
        >
          {anniversary.convergence.caption}
        </motion.p>
      </div>
    </div>
  );
}

interface CardConfig {
  memory: Memory;
  target: Target;
  origin: { x: number; y: number };
  drift: { x: number; y: number };
  rotate: number;
  index: number;
}

function ConvergeCard({
  card,
  progress,
  total,
  small
}: {
  card: CardConfig;
  progress: MotionValue<number>;
  total: number;
  small: boolean;
}) {
  // Staggered so the field assembles in waves rather than all at once.
  const offset = (card.index / total) * 0.16;

  const arrive = 0.03 + offset;   // out of depth
  const drift = 0.22 + offset;    // free float
  const gravity = 0.42 + offset;  // pulled inward
  const locked = 0.58;            // glyph readable
  const hold = 0.76;              // held long enough to read
  const gone = 0.88;              // dissolved

  const x = useTransform(
    progress,
    [arrive, drift, gravity, locked],
    [card.origin.x, card.origin.x + card.drift.x, card.target.x * 1.5, card.target.x]
  );
  const y = useTransform(
    progress,
    [arrive, drift, gravity, locked],
    [card.origin.y, card.origin.y + card.drift.y, card.target.y * 1.5, card.target.y]
  );
  const scale = useTransform(
    progress,
    [arrive, drift, locked, hold, gone],
    [0.3, 1.05, 0.44, 0.44, 0.16]
  );
  const rotate = useTransform(progress, [arrive, gravity, locked], [card.rotate * 2, card.rotate, 0]);
  const opacity = useTransform(
    progress,
    [arrive - 0.03, arrive + 0.05, hold, gone],
    [0, 1, 1, 0]
  );
  const blurValue = useTransform(progress, [arrive, arrive + 0.06, gone - 0.05, gone], [10, 0, 0, 8]);
  const filter = useTransform(blurValue, (value) => `blur(${value.toFixed(2)}px)`);

  const translateX = useTransform(x, (value) => `calc(-50% + ${value}vmin)`);
  const translateY = useTransform(y, (value) => `calc(-50% + ${value}vmin)`);

  return (
    <motion.figure
      aria-hidden="true"
      className={cn('absolute left-1/2 top-1/2 overflow-hidden rounded-[7px] border border-sky-200/25 bg-navy-700/50')}
      style={{ x: translateX, y: translateY, scale, rotate, opacity, filter }}
    >
      <span className="block" style={{ width: small ? '4.6rem' : '7rem', aspectRatio: '3 / 4' }}>
        <MemoryImage photo={card.memory.image} alt="" tone={card.memory.tone} index={card.index} objectPosition={card.memory.objectPosition} cropMode={card.memory.cropMode} />
      </span>
    </motion.figure>
  );
}
