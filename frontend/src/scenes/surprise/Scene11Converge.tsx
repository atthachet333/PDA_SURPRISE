import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { AIMark } from '@/components/surprise/AIMark';
import { anniversary } from '@/data/anniversary';
import { CONSTELLATION_MEDIA, type ConstellationItem } from '@/data/storyMedia';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';
import { cn } from '@/lib/cn';

/**
 * Scene 11 — everything at once. The second WOW.
 *
 * Staged in four acts across the scroll:
 *   1. ARRIVE   memories gather in from depth, small and soft-focused
 *   2. SETTLE   a wide, readable constellation of real memories in three
 *               depth layers — the state to stop and look at
 *   3. GRAVITY  they are pulled inward and lock into the day-count glyph
 *   4. DISSOLVE the shape gives way to light, and A&I remains
 *
 * Cards come from CONSTELLATION_MEDIA (real archive memories) with a few
 * branded A&I cards as structure (~20%). Phones get a smaller set.
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

type Depth = 0 | 1 | 2;

interface CardConfig {
  key: string;
  /** Undefined = a branded A&I structure card. */
  item?: ConstellationItem;
  /** Settled constellation position: x in vw, y in vh. */
  cloud: { x: number; y: number };
  /** Glyph cell in vmin, or null for a card that bows out before the lock. */
  target: Target | null;
  /** Fills a glyph cell the smaller phone deck cannot; never in the cloud. */
  glyphOnly?: boolean;
  depth: Depth;
  rotate: number;
  index: number;
}

const DEPTH_SCALE: Record<Depth, number> = { 0: 1.16, 1: 0.9, 2: 0.68 };
const DEPTH_OPACITY: Record<Depth, number> = { 0: 1, 1: 0.94, 2: 0.74 };
const DEPTH_PATTERN: Depth[] = [0, 1, 2, 1, 0, 2, 1];

/**
 * Real memories with a branded card every fifth slot, laid out on a sunflower
 * spiral inside a wide ellipse, so the cloud fills the frame evenly instead of
 * bunching in the centre. Deterministic: identical every visit.
 */
function buildDeck(mobile: boolean, targets: Target[]): CardConfig[] {
  const media = mobile ? CONSTELLATION_MEDIA.filter((item) => item.mobile) : CONSTELLATION_MEDIA;
  const brandCount = mobile ? 4 : 8;
  const deck: (ConstellationItem | undefined)[] = [];
  let real = 0;
  let brand = 0;
  while (real < media.length || brand < brandCount) {
    const wantBrand = brand < brandCount && (deck.length + 1) % 5 === 0;
    if (wantBrand || real >= media.length) {
      deck.push(undefined);
      brand += 1;
    } else {
      deck.push(media[real]);
      real += 1;
    }
  }

  const total = deck.length;
  const rx = mobile ? 33 : 36;
  const ry = mobile ? 31 : 35;
  /* Glyph cells go to real memories first; surplus branded cards bow out. */
  const surplus = Math.max(0, total - targets.length);
  let bowed = 0;
  let cell = 0;

  const cards: CardConfig[] = deck.map((item, index) => {
    const radius = Math.sqrt((index + 0.5) / total);
    const angle = (index * 137.508 * Math.PI) / 180;
    const depth: Depth = item ? (DEPTH_PATTERN[index % DEPTH_PATTERN.length] ?? 1) : 2;
    let target: Target | null = null;
    if (!item && bowed < surplus) bowed += 1;
    else target = targets.length ? (targets[cell++ % targets.length] ?? null) : null;
    return {
      key: `${item?.src ?? 'brand'}-${index}`,
      item,
      cloud: { x: Math.cos(angle) * radius * rx, y: Math.sin(angle) * radius * ry },
      target,
      depth,
      rotate: index % 4 === 0 ? ((index * 17) % 9) - 4 : ((index * 7) % 3) - 1,
      index
    };
  });

  /* Phones carry fewer memories than the glyph has cells: complete the shape
     with branded cells that only exist once gravity begins. */
  for (let rest = cell; rest < targets.length; rest += 1) {
    const target = targets[rest]!;
    cards.push({ key: `glyph-${rest}`, cloud: { x: 0, y: 0 }, target, glyphOnly: true, depth: 2, rotate: 0, index: cards.length });
  }
  return cards;
}

export function Scene11Converge() {
  const container = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.15 });
  const device = useDeviceProfile();
  const reduced = useReducedMotion();
  const { triggerCue, play } = useAudio();
  const impactFired = useRef(false);

  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });
  const mobile = device.isMobile;

  const cellW = mobile ? 4.4 : 3.5;
  const cellH = mobile ? 5.4 : 4.3;
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

  const cards = useMemo(() => buildDeck(mobile, targets), [mobile, targets]);

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
        <p className="mb-10 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-sky-100/55">15 · ทุกอย่างที่เราเป็น</p>
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2 sm:grid-cols-6">
          {cards.filter((card) => !card.glyphOnly).map((card) => (
            <span key={card.key} className="ai-surface aspect-[3/4] overflow-hidden rounded-[4px]">
              <MemoryImage photo={card.item?.src} alt="" tone="sky" index={card.index} objectPosition="50% 40%" />
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
        <p className="pointer-events-none absolute top-24 z-30 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-sky-100/55">15 · ทุกอย่างที่เราเป็น</p>
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
            <ConvergeCard key={card.key} card={card} progress={scrollYProgress} total={cards.length} small={mobile} />
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
  const offset = (card.index / total) * 0.1;

  const arrive = 0.02 + offset;   // out of depth
  const settled = 0.16 + offset;  // constellation readable
  const release = 0.42;           // gravity begins
  const locked = 0.58;            // glyph readable
  const hold = 0.76;              // held long enough to read
  const gone = 0.88;              // dissolved

  const bows = card.target === null;
  const glyphOnly = Boolean(card.glyphOnly);
  const depthScale = DEPTH_SCALE[card.depth];
  const lift = (2 - card.depth) * 1.6; // nearer layers drift further while settled

  /* Cloud in vw/vh (uses the whole frame); glyph in vmin (keeps its shape). */
  const cloudX = useTransform(progress, [arrive, settled, release, locked], [card.cloud.x * 1.45, card.cloud.x, card.cloud.x * 1.02, 0]);
  const cloudY = useTransform(progress, [arrive, settled, release, locked], [card.cloud.y * 1.45, card.cloud.y, card.cloud.y - lift, 0]);
  const glyphX = useTransform(progress, [release, locked], [0, card.target?.x ?? 0]);
  const glyphY = useTransform(progress, [release, locked], [0, card.target?.y ?? 0]);
  const translateX = useTransform([cloudX, glyphX], ([a, b]) => `calc(-50% + ${a as number}vw + ${b as number}vmin)`);
  const translateY = useTransform([cloudY, glyphY], ([a, b]) => `calc(-50% + ${a as number}vh + ${b as number}vmin)`);

  const scale = useTransform(progress, [arrive, settled, release, locked, hold, gone], [0.3, depthScale, depthScale, 0.4, 0.4, 0.16]);
  const rotate = useTransform(progress, [arrive, settled, release, locked], [card.rotate * 3, card.rotate, card.rotate, 0]);
  const restOpacity = card.item ? DEPTH_OPACITY[card.depth] : 0.62;
  const opacity = useTransform(
    progress,
    glyphOnly
      ? [release, locked, hold, gone]
      : bows
        ? [arrive - 0.02, settled, release, release + 0.08]
        : [arrive - 0.02, settled, release, locked, hold, gone],
    glyphOnly ? [0, 0.7, 0.7, 0] : bows ? [0, restOpacity, restOpacity, 0] : [0, restOpacity, restOpacity, 1, 1, 0]
  );
  const blurValue = useTransform(progress, [arrive, settled, gone - 0.05, gone], [8, card.depth === 2 ? 0.6 : 0, 0, 8]);
  const filter = useTransform(blurValue, (value) => `blur(${value.toFixed(2)}px)`);

  return (
    <motion.figure
      aria-hidden="true"
      className="absolute left-1/2 top-1/2"
      style={{ x: translateX, y: translateY, scale, rotate, opacity, filter, zIndex: 3 - card.depth }}
    >
      <span
        className={cn(
          'ai-constellation-card relative block overflow-hidden rounded-[7px] border',
          card.item ? 'border-champagne/25 bg-navy-700/50' : 'border-sky-200/20 bg-navy-700/40'
        )}
        style={{
          width: small ? '5.4rem' : '7.2rem',
          aspectRatio: '3 / 4',
          animationDuration: `${[9, 12, 16][card.depth]}s`,
          animationDelay: `${(card.index % 6) * -1.7}s`
        }}
      >
        <MemoryImage photo={card.item?.src} alt="" tone="sky" index={card.index} objectPosition="50% 40%" />
        {card.item?.video ? (
          <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy-900/60">
            <span className="ml-0.5 h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-ivory/90" />
          </span>
        ) : null}
      </span>
    </motion.figure>
  );
}
