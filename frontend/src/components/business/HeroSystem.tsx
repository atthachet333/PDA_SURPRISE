import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { ProductPanel } from './ProductPanel';
import { heroVisuals } from '@/data/visuals';
import { metrics } from '@/data/company';
import { useLocale } from '@/app/LocaleContext';
import { hero } from '@/i18n/home';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * HERO RIG — the software ecosystem, at a size you can actually read.
 *
 * A layered product composition: a large ERP dashboard as the anchor, the HR
 * LINE phone in front of it, a document panel set back and above, and a small
 * live status card floating clear of the stack. Connection lines run behind.
 *
 * WHAT CHANGED AND WHY
 *   The previous rig used percentage-positioned chips and tiny planes inside a
 *   tall column, so at 1440x900 the whole thing sat below the fold and the
 *   panels were too small to read as software. It is now a fixed-aspect stage
 *   with the primary panel taking ~72% of the width, sized so the dashboard is
 *   legible at a glance. A visitor should register "this company builds real
 *   systems" without scrolling.
 *
 * Deliberately not WebGL: DOM panels stay crisp, cost a fraction of the bytes,
 * and keep three.js out of the corporate bundle entirely.
 *
 * Motion budget — pointer tilt on the stage, one slow float per plane, data
 * pulses on the lines. All of it stops under reduced motion or on a hidden tab.
 */

const [PRIMARY, PHONE, DOCS] = heroVisuals;

/** Connection paths in the stage's own 0-100 space. */
const LINKS = [
  { id: 'l1', d: 'M6 74 C 20 66, 26 52, 34 44', delay: 0 },
  { id: 'l2', d: 'M92 20 C 78 26, 68 32, 58 38', delay: 0.7 },
  { id: 'l3', d: 'M94 78 C 82 74, 70 66, 60 58', delay: 1.4 }
];

export function HeroSystem({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const device = useDeviceProfile();
  const visible = usePageVisible();
  const animate = !reduced && visible;

  // Driven straight onto motion values so pointer movement never re-renders.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 22, mass: 0.8 });
  const sy = useSpring(py, { stiffness: 60, damping: 22, mass: 0.8 });

  // Restrained tilt: enough to feel alive, never enough to skew the UI text.
  const rotateY = useTransform(sx, [-1, 1], [7, -7]);
  const rotateX = useTransform(sy, [-1, 1], [-5, 5]);

  useEffect(() => {
    if (reduced || device.isTouch) return;
    const onMove = (event: PointerEvent) => {
      px.set((event.clientX / window.innerWidth) * 2 - 1);
      py.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [device.isTouch, px, py, reduced]);

  if (!PRIMARY || !PHONE || !DOCS) return null;

  return (
    <div className={cn('relative', className)}>
      {/* Ambient light behind the stack */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <span className="h-[78%] w-[86%] rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.2),transparent_70%)] blur-2xl" />
      </div>

      <motion.div
        className="relative h-full w-full preserve-3d"
        style={
          reduced || device.isTouch
            ? { perspective: 1600 }
            : { perspective: 1600, rotateX, rotateY }
        }
      >
        <ConnectionLayer animate={animate} />

        {/* ---------------------------------------- primary: ERP dashboard -- */}
        <motion.div
          className="absolute left-0 top-[7%] w-[78%] sm:w-[76%]"
          style={{ transform: 'translateZ(0px)' }}
          animate={animate ? { y: [0, -7, 0] } : undefined}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="aspect-[16/10] overflow-hidden rounded-card shadow-lift-lg ring-1 ring-black/5">
            <ProductPanel slot={PRIMARY} className="h-full" />
          </div>
        </motion.div>

        {/* ------------------------------------- document panel, set back -- */}
        <motion.div
          className="absolute right-0 top-0 w-[34%] sm:w-[32%]"
          style={{ transform: 'translateZ(-70px)' }}
          animate={animate ? { y: [0, -10, 0] } : undefined}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
        >
          <div className="aspect-[4/3] overflow-hidden rounded-card shadow-lift ring-1 ring-black/5">
            <ProductPanel slot={DOCS} className="h-full" />
          </div>
        </motion.div>

        {/* --------------------------------------- HR phone, front-left -- */}
        <motion.div
          className="absolute bottom-0 left-[6%] w-[23%] sm:w-[21%]"
          style={{ transform: 'translateZ(90px)' }}
          animate={animate ? { y: [0, -6, 0] } : undefined}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
          <div className="aspect-[9/17]">
            <ProductPanel slot={PHONE} className="h-full" />
          </div>
        </motion.div>

        {/* ------------------------------------------ floating status card -- */}
        <motion.div
          className="absolute bottom-[10%] right-[2%] w-[42%] sm:w-[36%]"
          style={{ transform: 'translateZ(120px)' }}
          animate={animate ? { y: [0, -5, 0] } : undefined}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2.1 }}
        >
          <StatusCard animate={animate} />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* --------------------------------------------------------------- sub-parts -- */

function StatusCard({ animate }: { animate: boolean }) {
  const { t } = useLocale();
  return (
    <div className="rounded-card border border-steel-200 bg-white/95 p-3 shadow-lift backdrop-blur-sm sm:p-3.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-steel-400">
          systems
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={cn('h-1.5 w-1.5 rounded-full bg-brand-500', animate && 'animate-status-blink')}
          />
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-brand-600">
            live
          </span>
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {metrics.map((metric, index) => ({ label: t(hero.rigStats)[index] ?? '', value: String(metric.value) })).map((stat) => (
          <div key={stat.label}>
            <p className="text-lg font-semibold leading-none tabular-nums text-ink">{stat.value}</p>
            <p className="thai-display mt-1 truncate text-[0.625rem] text-steel-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-1 border-t border-steel-100 pt-2">
        {['ERP', 'PAYROLL', 'HR', 'DOCS'].map((tag) => (
          <span
            key={tag}
            className="truncate rounded-pill bg-steel-100 px-1.5 py-0.5 font-mono text-[0.4375rem] uppercase tracking-[0.08em] text-steel-500"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function ConnectionLayer({ animate }: { animate: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ transform: 'translateZ(-40px)' }}
      aria-hidden="true"
    >
      {LINKS.map((link) => (
        <g key={link.id}>
          <path
            d={link.d}
            fill="none"
            stroke="rgba(29,170,97,0.3)"
            strokeWidth="0.25"
            vectorEffect="non-scaling-stroke"
          />
          {animate ? (
            <path
              d={link.d}
              fill="none"
              stroke="#1DAA61"
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="4 116"
              className="animate-data-run"
              style={{ animationDelay: `${link.delay}s`, animationDuration: '3.6s' }}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}
