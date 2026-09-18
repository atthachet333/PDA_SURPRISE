import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { MiniChart, MiniFlow, MiniTable } from './UIPreview';
import { cn } from '@/lib/cn';

/**
 * Floating product panels built from real DOM UI in a CSS 3D space.
 * Crisper than a texture, honest about what we build, and cheap to render.
 */
export function HeroPanels({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const device = useDeviceProfile();

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 80, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 80, damping: 18, mass: 0.6 });

  const rotateY = useTransform(sx, [-1, 1], [10, -10]);
  const rotateX = useTransform(sy, [-1, 1], [-7, 7]);

  useEffect(() => {
    if (reduced || device.isTouch) return;
    const onMove = (event: PointerEvent) => {
      px.set((event.clientX / window.innerWidth) * 2 - 1);
      py.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [device.isTouch, px, py, reduced]);

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 32, rotateX: -6 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    transition: { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] as const }
  });

  return (
    <div className={cn('perspective-1000 relative', className)}>
      <motion.div
        className="preserve-3d relative h-full w-full"
        style={reduced ? undefined : { rotateX, rotateY }}
      >
        {/* Primary console */}
        <motion.div
          {...enter(0.15)}
          className="preserve-3d absolute left-[6%] top-[12%] w-[74%] rounded-panel border border-steel-200/90 bg-white/95 p-4 shadow-lift backdrop-blur-sm sm:w-[68%]"
          style={{ transform: 'translateZ(40px)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              <span className="text-xs font-medium text-ink">Operations console</span>
            </div>
            <span className="font-mono text-[0.625rem] text-steel-400">live</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="Throughput" value="1,284" trend="+12%" />
            <Stat label="Queue" value="7" trend="-38%" positive={false} />
            <Stat label="Uptime" value="99.98%" trend="30d" neutral />
          </div>
          <div className="mt-4 h-24 rounded-card border border-steel-200 bg-steel-50 p-3">
            <MiniChart />
          </div>
        </motion.div>

        {/* Secondary: approval flow */}
        <motion.div
          {...enter(0.32)}
          className="absolute right-[2%] top-[2%] hidden w-[46%] rounded-card border border-steel-200/90 bg-white/95 p-3.5 shadow-lift md:block"
          style={{ transform: 'translateZ(80px)' }}
        >
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-steel-400">
            Approval routing
          </p>
          <div className="mt-3 h-10">
            <MiniFlow />
          </div>
        </motion.div>

        {/* Tertiary: document ledger */}
        <motion.div
          {...enter(0.46)}
          className="absolute bottom-[4%] right-[6%] hidden w-[44%] rounded-card border border-steel-200/90 bg-white/95 p-3.5 shadow-lift sm:block"
          style={{ transform: 'translateZ(110px)' }}
        >
          <div className="h-28">
            <MiniTable />
          </div>
        </motion.div>

        {/* Floating status chip */}
        <motion.div
          {...enter(0.6)}
          className="absolute bottom-[26%] left-0 hidden items-center gap-2 rounded-pill border border-steel-200 bg-white px-3.5 py-2 shadow-soft lg:flex"
          style={{ transform: 'translateZ(140px)' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          <span className="text-[0.6875rem] font-medium text-ink">Deploy succeeded</span>
          <span className="font-mono text-[0.625rem] text-steel-400">2m ago</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Stat({
  label,
  value,
  trend,
  positive = true,
  neutral = false
}: {
  label: string;
  value: string;
  trend: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  return (
    <div className="rounded-card border border-steel-200 bg-white p-2.5">
      <p className="text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-steel-400">{label}</p>
      <p className="mt-1.5 text-base font-semibold tabular-nums text-ink">{value}</p>
      <p
        className={cn(
          'mt-0.5 font-mono text-[0.5625rem]',
          neutral ? 'text-steel-400' : positive ? 'text-brand-600' : 'text-steel-500'
        )}
      >
        {trend}
      </p>
    </div>
  );
}
