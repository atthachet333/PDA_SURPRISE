import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useId, useRef } from 'react';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * SECTION BACKDROP — one ambient layer per section.
 *
 * Light sections were reading as blank white. These add depth without turning
 * the page dark and without competing with the content: everything here sits at
 * low opacity behind a `z-index: -1` layer and is `aria-hidden`.
 *
 * THE ONE-SYSTEM RULE
 *   A section gets ONE backdrop, never a stack of them. Each variant already
 *   combines a static texture with a single ambient motion, which is the whole
 *   motion budget for that section's background.
 *
 * MOTION AND INPUT
 *   - `prefers-reduced-motion` drops every animation and leaves the static
 *     texture, so nothing is lost, only stilled.
 *   - Pointer parallax is desktop-only and deliberately tiny (a few percent);
 *     it is driven straight onto motion values so moving the mouse never
 *     re-renders React.
 *   - CSS animations are paused by the browser itself on hidden tabs.
 */

export type BackdropVariant =
  | 'light-grid'
  | 'aurora'
  | 'data-field'
  | 'topographic'
  | 'system-lines'
  | 'mesh-dark';

interface SectionBackdropProps {
  variant: BackdropVariant;
  /** Desktop pointer parallax. Off for dense sections that already move. */
  pointer?: boolean;
  /** Global multiplier, for sections that need it quieter still. */
  intensity?: number;
  className?: string;
}

export function SectionBackdrop({
  variant,
  pointer = false,
  intensity = 1,
  className
}: SectionBackdropProps) {
  const reduced = useReducedMotion();
  const device = useDeviceProfile();

  /*
    Ambient motion here is pure CSS, and browsers already pause CSS animations
    on a backgrounded tab — so this deliberately does NOT gate on page
    visibility. An earlier version did, which meant the classes were never even
    rendered in any context reporting `document.hidden`, leaving the backdrops
    permanently static. The only thing that should silence them is the visitor
    asking for reduced motion.
  */
  const animate = !reduced;
  const interactive = pointer && !reduced && !device.isTouch;

  const hostRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 24, mass: 1 });
  const sy = useSpring(py, { stiffness: 40, damping: 24, mass: 1 });

  // Small on purpose: this is depth, not a parallax showcase.
  const shiftX = useTransform(sx, [-1, 1], ['-2.5%', '2.5%']);
  const shiftY = useTransform(sy, [-1, 1], ['-2%', '2%']);
  const bloomX = useTransform(sx, [-1, 1], ['-8%', '8%']);
  const bloomY = useTransform(sy, [-1, 1], ['-6%', '6%']);

  useEffect(() => {
    if (!interactive) return;
    const node = hostRef.current;
    if (!node) return;

    // Track relative to the SECTION, not the window, so each backdrop reacts to
    // the pointer where it actually is rather than to global cursor position.
    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      if (rect.height === 0) return;
      px.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
      py.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [interactive, px, py]);

  return (
    <div ref={hostRef} className={cn('sect-layer', className)} aria-hidden="true">
      {variant === 'light-grid' ? (
        <LightGrid animate={animate} intensity={intensity} shiftX={shiftX} shiftY={shiftY} interactive={interactive} />
      ) : null}
      {variant === 'aurora' ? (
        <Aurora animate={animate} intensity={intensity} bloomX={bloomX} bloomY={bloomY} interactive={interactive} />
      ) : null}
      {variant === 'data-field' ? (
        <DataField animate={animate} intensity={intensity} shiftX={shiftX} shiftY={shiftY} interactive={interactive} />
      ) : null}
      {variant === 'topographic' ? <Topographic animate={animate} intensity={intensity} /> : null}
      {variant === 'system-lines' ? <SystemLines animate={animate} intensity={intensity} /> : null}
      {variant === 'mesh-dark' ? (
        <MeshDark animate={animate} intensity={intensity} bloomX={bloomX} bloomY={bloomY} interactive={interactive} />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ shared -- */

type Shift = ReturnType<typeof useTransform<number, string>>;

/* -------------------------------------------------------------- light grid -- */

/** Ultra-light technical grid with green nodes and one travelling pulse. */
function LightGrid({
  animate,
  intensity,
  shiftX,
  shiftY,
  interactive
}: {
  animate: boolean;
  intensity: number;
  shiftX: Shift;
  shiftY: Shift;
  interactive: boolean;
}) {
  return (
    <>
      <motion.span
        className="absolute inset-[-4%]"
        style={{
          opacity: 0.6 * intensity,
          backgroundImage:
            'linear-gradient(rgba(6,59,42,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(6,59,42,0.055) 1px, transparent 1px)',
          backgroundSize: '68px 68px',
          maskImage: 'radial-gradient(85% 75% at 50% 40%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(85% 75% at 50% 40%, black, transparent)',
          ...(interactive ? { x: shiftX, y: shiftY } : {})
        }}
      />
      {/* Grid intersections */}
      <span
        className="absolute inset-[-4%]"
        style={{
          opacity: 0.5 * intensity,
          backgroundImage: 'radial-gradient(circle, rgba(29,170,97,0.34) 1.2px, transparent 1.4px)',
          backgroundSize: '136px 136px',
          maskImage: 'radial-gradient(70% 65% at 50% 40%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(70% 65% at 50% 40%, black, transparent)'
        }}
      />
      {animate ? (
        <span className="absolute inset-x-0 top-0 h-full overflow-hidden">
          <span
            className="absolute inset-x-0 h-px bg-[linear-gradient(90deg,transparent,rgba(29,170,97,0.5),transparent)] animate-scan-y"
            style={{ opacity: 0.8 * intensity }}
          />
        </span>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ aurora -- */

/** Soft green blooms that drift, plus a pointer-tracked highlight. */
function Aurora({
  animate,
  intensity,
  bloomX,
  bloomY,
  interactive
}: {
  animate: boolean;
  intensity: number;
  bloomX: Shift;
  bloomY: Shift;
  interactive: boolean;
}) {
  return (
    <>
      <motion.span
        className={cn(
          'absolute -left-[12%] top-[-18%] h-[36rem] w-[36rem] rounded-full blur-3xl',
          animate && 'animate-aurora-drift'
        )}
        style={{
          opacity: 0.85 * intensity,
          background: 'radial-gradient(circle, rgba(53,201,111,0.2), transparent 68%)',
          ...(interactive ? { x: bloomX, y: bloomY } : {})
        }}
      />
      <span
        className={cn(
          'absolute -right-[10%] bottom-[-22%] h-[32rem] w-[32rem] rounded-full blur-3xl',
          animate && 'animate-aurora-drift'
        )}
        style={{
          opacity: 0.7 * intensity,
          background: 'radial-gradient(circle, rgba(29,170,97,0.16), transparent 70%)',
          animationDelay: '-12s'
        }}
      />
      <span
        className="absolute inset-0"
        style={{
          opacity: 0.4 * intensity,
          backgroundImage:
            'linear-gradient(rgba(6,59,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,59,42,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(75% 70% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(75% 70% at 50% 50%, black, transparent)'
        }}
      />
    </>
  );
}

/* -------------------------------------------------------------- data field -- */

/** A field of dots with a few connection lines; the dots drift on pointer. */
function DataField({
  animate,
  intensity,
  shiftX,
  shiftY,
  interactive
}: {
  animate: boolean;
  intensity: number;
  shiftX: Shift;
  shiftY: Shift;
  interactive: boolean;
}) {
  const id = useId();
  return (
    <>
      <motion.span
        className="absolute inset-[-6%]"
        style={{
          opacity: 0.85 * intensity,
          backgroundImage: 'radial-gradient(circle, rgba(6,59,42,0.14) 1.1px, transparent 1.3px)',
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(80% 75% at 50% 45%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(80% 75% at 50% 45%, black, transparent)',
          ...(interactive ? { x: shiftX, y: shiftY } : {})
        }}
      />
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.9 * intensity }}
      >
        <defs>
          <linearGradient id={`${id}-l`} x1="0" x2="1">
            <stop offset="0%" stopColor="#1DAA61" stopOpacity="0" />
            <stop offset="50%" stopColor="#1DAA61" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1DAA61" stopOpacity="0" />
          </linearGradient>
        </defs>
        {['M0 46 C 24 40, 38 26, 58 22 S 86 14, 100 10', 'M0 18 C 20 22, 34 34, 56 38 S 84 46, 100 50'].map(
          (d, index) => (
            <g key={d}>
              <path d={d} fill="none" stroke={`url(#${id}-l)`} strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
              {animate ? (
                <path
                  d={d}
                  fill="none"
                  stroke="#35C96F"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="2 118"
                  className="animate-data-run"
                  style={{ animationDelay: `${index * 2.4}s`, animationDuration: '7s', opacity: 0.55 }}
                />
              ) : null}
            </g>
          )
        )}
      </svg>
    </>
  );
}

/* ------------------------------------------------------------- topographic -- */

/** Thin contour lines that drift slowly sideways. */
function Topographic({ animate, intensity }: { animate: boolean; intensity: number }) {
  return (
    <span
      className={cn('absolute inset-[-10%]', animate && 'animate-contour-drift')}
      style={{
        opacity: 0.7 * intensity,
        backgroundImage: `repeating-radial-gradient(circle at 30% 45%, transparent 0 22px, rgba(6,59,42,0.05) 22px 23px),
           repeating-radial-gradient(circle at 78% 62%, transparent 0 26px, rgba(6,59,42,0.04) 26px 27px)`,
        maskImage: 'radial-gradient(85% 80% at 50% 50%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(85% 80% at 50% 50%, black, transparent)'
      }}
    />
  );
}

/* ------------------------------------------------------------ system lines -- */

/** One animated SVG path system, very subtle — for the process section. */
function SystemLines({ animate, intensity }: { animate: boolean; intensity: number }) {
  const id = useId();
  const paths = [
    'M-2 24 H 30 L 42 12 H 74 L 86 26 H 102',
    'M-2 52 H 18 L 30 40 H 62 L 74 54 H 102',
    'M-2 78 H 46 L 58 66 H 102'
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      style={{ opacity: 0.85 * intensity }}
    >
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" x2="1">
          <stop offset="0%" stopColor="#063B2A" stopOpacity="0" />
          <stop offset="30%" stopColor="#063B2A" stopOpacity="0.1" />
          <stop offset="70%" stopColor="#063B2A" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#063B2A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {paths.map((d, index) => (
        <g key={d}>
          <path d={d} fill="none" stroke={`url(#${id}-fade)`} strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
          {animate ? (
            <path
              d={d}
              fill="none"
              stroke="#1DAA61"
              strokeWidth="0.8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="3 157"
              className="animate-data-run"
              style={{ animationDelay: `${index * 3.1}s`, animationDuration: '9s', opacity: 0.5 }}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------------- mesh dark -- */

/** The dark counterpart: technical mesh with a pointer-tracked bloom. */
function MeshDark({
  animate,
  intensity,
  bloomX,
  bloomY,
  interactive
}: {
  animate: boolean;
  intensity: number;
  bloomX: Shift;
  bloomY: Shift;
  interactive: boolean;
}) {
  return (
    <>
      <span
        className="absolute inset-0"
        style={{
          opacity: 0.9 * intensity,
          backgroundImage:
            'linear-gradient(rgba(53,201,111,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.09) 1px, transparent 1px)',
          backgroundSize: '62px 62px',
          maskImage: 'radial-gradient(75% 65% at 55% 45%, black, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(75% 65% at 55% 45%, black, transparent 82%)'
        }}
      />
      <motion.span
        className={cn('absolute left-[45%] top-[30%] h-[34rem] w-[34rem] rounded-full blur-3xl', animate && 'animate-pulse-glow')}
        style={{
          opacity: 0.55 * intensity,
          background: 'radial-gradient(circle, rgba(53,201,111,0.3), transparent 70%)',
          ...(interactive ? { x: bloomX, y: bloomY } : {})
        }}
      />
    </>
  );
}
