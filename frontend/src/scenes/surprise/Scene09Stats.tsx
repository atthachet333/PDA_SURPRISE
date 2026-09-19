import { motion } from 'framer-motion';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { anniversary, type StatItem } from '@/data/anniversary';
import { useCountUp } from '@/hooks/useCountUp';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * Scene 09 — our story in numbers.
 *
 * Emotional job: LIGHT RELIEF before the pause.
 *
 * No dashboard cards: each figure sits on a circular glass plate with its own
 * orbiting mote, sized by importance, so the grid keeps breathing long after
 * the counters have settled. The last plate is deliberately not a number.
 */
export function Scene09Stats() {
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.25 });
  const stats = anniversary.statistics;

  return (
    <SceneSection id="stats" ref={ref} label="เรื่องของเราในตัวเลข">
      <div className="flex w-full max-w-5xl flex-col items-center text-center">
        <SceneLabel>08 · เรื่องของเราในตัวเลข</SceneLabel>
        <SceneTitle className="thai-display mt-5 font-thai">บางอย่างของเรา นับเป็นตัวเลขได้</SceneTitle>

        <div className="mt-16 grid w-full grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 lg:grid-cols-4 lg:gap-10">
          {stats.map((stat, index) => (
            <StatPlate key={stat.id} stat={stat} active={inView} index={index} />
          ))}
        </div>
      </div>
    </SceneSection>
  );
}

function StatPlate({ stat, active, index }: { stat: StatItem; active: boolean; index: number }) {
  const reduced = useReducedMotion();
  const numeric = typeof stat.value === 'number';
  const animated = useCountUp(numeric ? (stat.value as number) : 0, {
    active: active && numeric,
    duration: 2200 + index * 240
  });

  const accent = stat.id === 'cats';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
    >
      <div className="relative flex aspect-square w-full max-w-[11rem] items-center justify-center">
        {/* Glass plate */}
        <span
          className={cn(
            'absolute inset-0 rounded-full border backdrop-blur-sm',
            accent
              ? 'border-champagne/30 bg-[radial-gradient(circle_at_32%_28%,rgba(235,217,188,0.2),rgba(23,50,77,0.4)_62%)]'
              : 'border-sky-200/18 bg-[radial-gradient(circle_at_32%_28%,rgba(220,239,255,0.16),rgba(17,37,56,0.42)_62%)]'
          )}
        />

        {/* Orbit and mote, each plate on its own period */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-[-7%] rounded-full border',
            accent ? 'border-champagne/20' : 'border-sky-200/14'
          )}
          style={{
            animation: reduced ? undefined : `spin-slow ${36 + index * 11}s linear infinite`,
            animationDirection: index % 2 ? 'reverse' : 'normal'
          }}
        >
          <span
            className={cn(
              'absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
              accent ? 'bg-champagne' : 'bg-sky-200'
            )}
          />
        </span>

        <span
          className={cn(
            'relative font-display font-light tabular-nums',
            accent ? 'text-[clamp(2rem,5vw,3rem)] text-champagne' : 'text-[clamp(1.5rem,4vw,2.5rem)] text-ivory'
          )}
        >
          {numeric ? formatNumber(animated) : stat.value}
          {stat.suffix ? <span className="text-sky-100/70">{stat.suffix}</span> : null}
        </span>
      </div>

      <p className="ai-legible mt-5 font-mono text-[0.5rem] uppercase tracking-[0.24em] text-sky-100/80 sm:text-[0.5625rem]">
        {stat.label}
      </p>
      {stat.caption ? (
        <p className="ai-legible mt-2 max-w-[20ch] text-xs leading-relaxed text-ivory/70">{stat.caption}</p>
      ) : null}
    </motion.div>
  );
}
