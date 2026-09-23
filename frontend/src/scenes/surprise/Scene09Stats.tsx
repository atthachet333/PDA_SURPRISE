import { motion } from 'framer-motion';
import { SceneSection } from '@/components/surprise/SceneSection';
import { ChapterMark } from '@/components/surprise/ChapterMark';
import { anniversary, type StatItem } from '@/data/anniversary';
import { useCountUp } from '@/hooks/useCountUp';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * Scene 09 — our story in numbers, set as editorial evidence rather than
 * analytics: large numerals on one baseline, thin rules between them, and each
 * caption as a footnote. A single point of light travels the top rule.
 */
export function Scene09Stats() {
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.25 });
  const stats = anniversary.statistics;

  return (
    <SceneSection id="stats" ref={ref} label="เรื่องของเราในตัวเลข" fullHeight={false} className="overflow-hidden px-0 py-0 sm:px-0">
      <article className="ai-stats relative w-full px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="relative mx-auto w-full max-w-[84rem]">
          <ChapterMark index="13" label="IN NUMBERS · เรื่องของเราในตัวเลข" />
          <h2 className="thai-display mt-6 max-w-3xl font-thai text-[clamp(2.2rem,4.4vw,3.9rem)] font-light leading-[1.15] text-ivory">
            บางอย่างของเรา นับเป็นตัวเลขได้
          </h2>

          <div className="relative mt-16 lg:mt-20">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-ivory/15" />
            <span aria-hidden="true" className="ai-stats-spark absolute top-[-2px] h-[5px] w-[5px] rounded-full bg-champagne" />
            <dl className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Evidence key={stat.id} stat={stat} active={inView} index={index} />
              ))}
            </dl>
          </div>
        </div>
      </article>
    </SceneSection>
  );
}

function Evidence({ stat, active, index }: { stat: StatItem; active: boolean; index: number }) {
  const reduced = useReducedMotion();
  const numeric = typeof stat.value === 'number';
  const animated = useCountUp(numeric ? (stat.value as number) : 0, { active: active && numeric, duration: 2200 + index * 240 });

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col border-ivory/15 pb-10 pt-8 lg:pb-4 lg:pt-10',
        index % 2 ? 'border-l pl-5 sm:pl-8' : 'pr-5 sm:pr-8',
        index > 0 && 'lg:border-l lg:pl-8 xl:pl-10',
        index >= 2 && 'border-t lg:border-t-0'
      )}
    >
      <dt className="font-display text-[clamp(3.4rem,7vw,6.2rem)] font-light leading-[0.9] tracking-[-0.02em] text-ivory tabular-nums">
        {numeric ? formatNumber(animated) : stat.value}
        {stat.suffix ? <span className="text-champagne">{stat.suffix}</span> : null}
      </dt>
      <dd className="mt-4 font-thai text-[clamp(1rem,1.3vw,1.15rem)] text-ivory">{stat.label}</dd>
      {stat.caption ? (
        <dd className="mt-2 font-thai text-sm leading-6 text-ivory/60">
          <sup aria-hidden="true" className="mr-1 font-display text-champagne">{index + 1}</sup>
          {stat.caption}
        </dd>
      ) : null}
    </motion.div>
  );
}
