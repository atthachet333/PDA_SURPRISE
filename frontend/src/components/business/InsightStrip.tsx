import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { insights, type Insight } from '@/data/insights';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { SectionBackdrop } from './SectionBackdrop';

/**
 * INSIGHTS — large editorial cards.
 *
 * There is no CMS and nothing is published yet, so this is honest about it: a
 * card for an unpublished article shows "เร็ว ๆ นี้" and is NOT a link. No
 * fabricated publication date and no invented author byline — `published`,
 * `date` and `author` come from the locked data and stay empty until real.
 *
 * Read time is shown because `minutes` is an editorial estimate of the planned
 * piece, labelled as such, not a computed figure presented as fact.
 */

interface InsightStripProps {
  items?: Insight[];
  /** Full grid for /insights; a 3-up strip for the homepage. */
  variant?: 'strip' | 'grid';
  code?: string;
}

export function InsightStrip({ items, variant = 'strip', code = '10 / INSIGHTS' }: InsightStripProps) {
  const reduced = useReducedMotion();
  const list = items ?? (variant === 'strip' ? insights.slice(0, 3) : insights);

  return (
    <section className="sect sect--bright relative overflow-hidden py-section">
      <SectionBackdrop variant="aurora" intensity={0.6} />

      <Container className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-3 text-statement font-bold text-ink">
              บทความและมุมมอง
              <br />
              <span className="text-brand-600">จากงานที่ทำจริง</span>
            </h2>
          </div>
          {variant === 'strip' ? (
            <Link
              to="/insights"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-600"
            >
              ดูบทความทั้งหมด
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </Link>
          ) : null}
        </div>

        <div
          className={cn(
            'mt-14 grid gap-px overflow-hidden border border-steel-200 bg-steel-200',
            variant === 'strip' ? 'lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {list.map((insight, index) => (
            <InsightCard key={insight.slug} insight={insight} index={index} reduced={reduced} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function InsightCard({
  insight,
  index,
  reduced
}: {
  insight: Insight;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      /*
        Only a PUBLISHED article is a link, so only a published card gets hover
        treatment. An unpublished card used to light up and slide its arrow
        while doing nothing at all — a fake affordance.
      */
      className={cn(
        'group relative flex min-h-[15.5rem] flex-col justify-between bg-white p-6 sm:p-8',
        insight.published && 'transition-colors duration-slow hover:bg-steel-50'
      )}
    >
      {insight.published ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brand-500 transition-transform duration-slow ease-smooth group-hover:scale-x-100"
        />
      ) : (
        /* Unpublished: a flat, obviously inert top rule. */
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-steel-200" />
      )}

      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-600">
            {insight.category}
          </span>
          <span className="font-mono text-[0.5625rem] tabular-nums text-steel-300">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h3 className="thai-display mt-5 text-lg font-bold leading-snug text-ink sm:text-xl">
          {insight.title}
        </h3>

        <p className="mt-4 text-sm leading-relaxed text-steel-500">{insight.excerpt}</p>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-steel-100 pt-5">
        {insight.published ? (
          <>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-400">
              {/* Only rendered when both are real. */}
              {insight.date}
              {insight.author ? ` · ${insight.author}` : ''}
            </span>
            <Link
              to={`/insights/${insight.slug}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink after:absolute after:inset-0 hover:text-brand-600"
            >
              อ่านบทความ
              <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-base group-hover:translate-x-1" />
            </Link>
          </>
        ) : (
          <>
            <span className="rounded-pill border border-steel-200 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-steel-400">
              เร็ว ๆ นี้
            </span>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-400">
              ~{insight.minutes} นาที
            </span>
          </>
        )}
      </div>
    </motion.article>
  );
}
