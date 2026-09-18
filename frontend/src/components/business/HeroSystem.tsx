import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * HERO — the software ecosystem.
 *
 * Several PDA BLISS products drawn as real DOM planes in a CSS 3D space, wired
 * together by animated connection paths. The point it makes is structural: we
 * do not sell one app, we build systems that talk to each other.
 *
 * Deliberately NOT WebGL. This replaced a three.js hero, which pulled the
 * entire 822KB three bundle into the corporate first load for a decorative
 * backdrop. Everything here is DOM + SVG + CSS transforms: it renders crisper
 * at any DPI, costs a fraction of the bytes, and degrades cleanly.
 *
 * Motion budget
 *   - pointer tilt on the whole rig (fine pointers only)
 *   - slow idle float per plane, each on its own period
 *   - data pulses along the connection paths
 *   - one status light and one changing figure
 * Everything stops under `prefers-reduced-motion` and on hidden tabs.
 */

interface ModuleNode {
  id: string;
  label: string;
  /** Percentage position inside the rig. */
  x: number;
  y: number;
  depth: number;
}

/** The seven primary services, placed around the rig. */
const MODULES: ModuleNode[] = [
  { id: 'erp', label: 'ERP', x: 8, y: 16, depth: 40 },
  { id: 'payroll', label: 'PAYROLL', x: 78, y: 9, depth: 70 },
  { id: 'hr', label: 'HR · LINE', x: 90, y: 47, depth: 30 },
  { id: 'docs', label: 'DOCUMENTS', x: 71, y: 85, depth: 55 },
  { id: 'web', label: 'WEBSITE', x: 4, y: 62, depth: 60 },
  { id: 'api', label: 'API', x: 30, y: 93, depth: 25 }
];

/** Connection paths, in the rig's 0-100 coordinate space. */
const LINKS: { id: string; d: string; delay: number }[] = [
  { id: 'l1', d: 'M14 20 C 30 26, 34 34, 44 40', delay: 0 },
  { id: 'l2', d: 'M78 14 C 66 22, 58 30, 52 38', delay: 0.6 },
  { id: 'l3', d: 'M88 48 C 76 48, 68 46, 60 45', delay: 1.2 },
  { id: 'l4', d: 'M70 82 C 64 70, 58 62, 54 55', delay: 0.3 },
  { id: 'l5', d: 'M10 62 C 24 58, 34 54, 42 50', delay: 0.9 },
  { id: 'l6', d: 'M32 90 C 36 76, 40 66, 44 58', delay: 1.5 }
];

export function HeroSystem({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const device = useDeviceProfile();
  const visible = usePageVisible();
  const animate = !reduced && visible;

  // Pointer tilt. Motion values are driven directly, never through state, so
  // moving the mouse does not re-render the tree.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 20, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 70, damping: 20, mass: 0.7 });

  const rotateY = useTransform(sx, [-1, 1], [13, -13]);
  const rotateX = useTransform(sy, [-1, 1], [-9, 9]);

  useEffect(() => {
    if (reduced || device.isTouch) return;
    const onMove = (event: PointerEvent) => {
      px.set((event.clientX / window.innerWidth) * 2 - 1);
      py.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [device.isTouch, px, py, reduced]);

  return (
    <div className={cn('relative select-none', className)} aria-hidden="true">
      {/* Ambient light behind the rig */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <span className="h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.22),transparent_68%)] blur-2xl" />
      </div>

      <motion.div
        className="relative h-full w-full preserve-3d"
        style={
          reduced || device.isTouch
            ? { perspective: 1400 }
            : { perspective: 1400, rotateX, rotateY }
        }
      >
        <ConnectionLayer animate={animate} />

        {/* Primary plane — an operations dashboard */}
        <Plane
          className="left-[16%] top-[22%] w-[62%] sm:w-[58%]"
          depth={0}
          float={animate ? 7.5 : 0}
        >
          <DashboardPlane animate={animate} />
        </Plane>

        {/* Mobile plane — front left, closest to the viewer */}
        <Plane
          className="left-[2%] top-[42%] w-[26%] sm:w-[22%]"
          depth={90}
          float={animate ? 6 : 0}
          delay={0.8}
        >
          <MobilePlane />
        </Plane>

        {/* Document plane — right, set back */}
        <Plane
          className="right-[1%] top-[16%] w-[32%] sm:w-[29%]"
          depth={-60}
          float={animate ? 9 : 0}
          delay={1.6}
        >
          <DocumentPlane />
        </Plane>

        {/* Module chips */}
        {MODULES.map((module, index) => (
          <ModuleChip key={module.id} module={module} index={index} animate={animate} />
        ))}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ planes -- */

function Plane({
  className,
  children,
  depth,
  float,
  delay = 0
}: {
  className?: string;
  children: React.ReactNode;
  depth: number;
  float: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn('absolute', className)}
      style={{ transform: `translateZ(${depth}px)` }}
      animate={float ? { y: [0, -float, 0] } : undefined}
      transition={{ duration: 9 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  );
}

/** Frame shared by every plane, so they read as one product family. */
function PlaneFrame({
  children,
  label,
  className
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-steel-200 bg-white shadow-lift',
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-steel-100 bg-steel-50/80 px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-steel-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-steel-300" />
        <span className="ml-1 truncate font-mono text-[0.5rem] uppercase tracking-[0.16em] text-steel-400">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function DashboardPlane({ animate }: { animate: boolean }) {
  const bars = useMemo(() => [42, 58, 36, 72, 50, 84, 63, 91, 74], []);

  return (
    <PlaneFrame label="operations">
      <div className="p-3 sm:p-4">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="ORDERS" value={1284} animate={animate} />
          <Kpi label="QUEUE" value={7} animate={false} />
          <Kpi label="UPTIME" literal="99.9%" />
        </div>

        {/* Chart */}
        <div className="mt-3 flex h-16 items-end gap-1 sm:h-20 sm:gap-1.5">
          {bars.map((height, index) => (
            <motion.span
              key={index}
              className={cn(
                'flex-1 rounded-t-[2px]',
                index === bars.length - 1 ? 'bg-brand-500' : 'bg-steel-200'
              )}
              initial={{ height: '10%' }}
              animate={{ height: `${height}%` }}
              transition={{
                duration: 1,
                delay: 0.4 + index * 0.05,
                ease: [0.16, 1, 0.3, 1]
              }}
            />
          ))}
        </div>

        {/* Rows */}
        <div className="mt-3 space-y-1">
          {['MO-4821', 'MO-4822', 'MO-4823'].map((row, index) => (
            <div key={row} className="flex items-center justify-between">
              <span className="font-mono text-[0.5rem] text-steel-400 sm:text-[0.5625rem]">
                {row}
              </span>
              <span className="mx-2 h-px flex-1 bg-steel-100" />
              <span
                className={cn(
                  'rounded-pill px-1.5 py-px text-[0.4375rem] font-medium sm:text-[0.5rem]',
                  index === 0 ? 'bg-brand-50 text-brand-700' : 'bg-steel-100 text-steel-500'
                )}
              >
                {index === 0 ? 'RUNNING' : 'QUEUED'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PlaneFrame>
  );
}

function Kpi({
  label,
  value,
  literal,
  animate = false
}: {
  label: string;
  value?: number;
  literal?: string;
  animate?: boolean;
}) {
  const [shown, setShown] = useState(value ?? 0);

  // A single figure drifts, so the dashboard reads as live rather than static.
  useEffect(() => {
    if (!animate || value === undefined) return;
    const timer = window.setInterval(() => {
      setShown(value + Math.floor(Math.random() * 9) - 4);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [animate, value]);

  return (
    <div className="rounded-[6px] border border-steel-100 bg-steel-50/60 px-1.5 py-1.5">
      <span className="block font-mono text-[0.4375rem] uppercase tracking-[0.14em] text-steel-400 sm:text-[0.5rem]">
        {label}
      </span>
      <span className="mt-0.5 block text-[0.6875rem] font-semibold tabular-nums text-ink sm:text-sm">
        {literal ?? shown.toLocaleString('en-US')}
      </span>
    </div>
  );
}

function MobilePlane() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-steel-200 bg-white shadow-lift-lg">
      <div className="flex items-center justify-between bg-brand-800 px-2 py-1.5">
        <span className="font-mono text-[0.4375rem] uppercase tracking-[0.14em] text-brand-200">
          HR · LINE
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-status-blink" />
      </div>
      <div className="space-y-1.5 p-2">
        {/* Inbound bubble */}
        <span className="block w-[78%] rounded-[8px] rounded-tl-[2px] bg-steel-100 px-1.5 py-1">
          <span className="block h-1 w-full rounded-pill bg-steel-300" />
          <span className="mt-1 block h-1 w-2/3 rounded-pill bg-steel-300" />
        </span>
        {/* Outbound bubble */}
        <span className="ml-auto block w-[68%] rounded-[8px] rounded-br-[2px] bg-brand-500 px-1.5 py-1">
          <span className="block h-1 w-full rounded-pill bg-white/70" />
          <span className="mt-1 block h-1 w-1/2 rounded-pill bg-white/70" />
        </span>
        {/* Action row */}
        <span className="mt-2 flex gap-1">
          <span className="flex-1 rounded-[5px] border border-brand-200 bg-brand-50 py-1 text-center font-mono text-[0.4375rem] text-brand-700">
            ลงเวลา
          </span>
          <span className="flex-1 rounded-[5px] border border-steel-200 py-1 text-center font-mono text-[0.4375rem] text-steel-500">
            ลา
          </span>
        </span>
      </div>
    </div>
  );
}

function DocumentPlane() {
  return (
    <PlaneFrame label="documents">
      <div className="space-y-1 p-2.5">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-1.5">
            <span
              className={cn(
                'flex h-4 w-3.5 shrink-0 items-center justify-center rounded-[2px] border',
                row === 0 ? 'border-brand-300 bg-brand-50' : 'border-steel-200 bg-steel-50'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1 rounded-[1px]',
                  row === 0 ? 'bg-brand-400' : 'bg-steel-300'
                )}
              />
            </span>
            <span className="flex-1 space-y-0.5">
              <span className="block h-1 w-full rounded-pill bg-steel-200" />
              <span className="block h-1 w-1/2 rounded-pill bg-steel-100" />
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-[0.4375rem] text-steel-400">v.4</span>
          <span className="font-mono text-[0.4375rem] text-brand-600">SYNCED</span>
        </div>
      </div>
    </PlaneFrame>
  );
}

/* ------------------------------------------------------------- connections -- */

function ConnectionLayer({ animate }: { animate: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      style={{ transform: 'translateZ(-30px)' }}
    >
      {LINKS.map((link) => (
        <g key={link.id}>
          {/* Static hairline */}
          <path
            d={link.d}
            fill="none"
            stroke="rgba(29,170,97,0.28)"
            strokeWidth="0.25"
            vectorEffect="non-scaling-stroke"
          />
          {/* Travelling data pulse */}
          {animate ? (
            <path
              d={link.d}
              fill="none"
              stroke="#1DAA61"
              strokeWidth="0.9"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="4 116"
              className="animate-data-run"
              style={{ animationDelay: `${link.delay}s`, animationDuration: '3.2s' }}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

function ModuleChip({
  module,
  index,
  animate
}: {
  module: ModuleNode;
  index: number;
  animate: boolean;
}) {
  return (
    <motion.span
      className="absolute flex items-center gap-1.5 rounded-pill border border-brand-200/80 bg-white/95 px-2 py-1 shadow-soft backdrop-blur-sm"
      style={{
        left: `${module.x}%`,
        top: `${module.y}%`,
        transform: `translate(-50%,-50%) translateZ(${module.depth}px)`
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5 + index * 0.09, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className={cn('h-1 w-1 shrink-0 rounded-full bg-brand-500', animate && 'animate-status-blink')}
        style={{ animationDelay: `${index * 0.4}s` }}
      />
      <span className="whitespace-nowrap font-mono text-[0.4375rem] font-medium uppercase tracking-[0.14em] text-brand-800 sm:text-[0.5rem]">
        {module.label}
      </span>
    </motion.span>
  );
}
