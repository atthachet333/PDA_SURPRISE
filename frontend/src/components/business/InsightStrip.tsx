import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { SectionBackdrop } from './SectionBackdrop';
import { insights, type Insight } from '@/data/insights';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * INSIGHTS — an editorial section, on paper rather than on white.
 *
 * One featured article with a large illustration, the rest as a compact index
 * beside it. Warm paper ground with grain so it reads as a magazine page
 * instead of another content block between two white sections.
 *
 * HONESTY
 *   There is no CMS and nothing is published yet. An unpublished card shows
 *   "เร็ว ๆ นี้", is NOT a link, and carries no hover affordance. No fabricated
 *   publication date and no invented byline — `published`, `date` and `author`
 *   come from the locked data and stay empty until they are real. Read time is
 *   prefixed with ~ because it is an estimate of a planned piece.
 */

interface InsightStripProps {
  items?: Insight[];
  /** 'strip' is the homepage teaser; 'grid' is the full /insights listing. */
  variant?: 'strip' | 'grid';
  code?: string;
}

export function InsightStrip({
  items,
  variant = 'strip',
  code = '11 / INSIGHTS'
}: InsightStripProps) {
  const reduced = useReducedMotion();
  const list = items ?? (variant === 'strip' ? insights.slice(0, 4) : insights);
  const [featured, ...rest] = list;

  if (!featured) return null;

  return (
    <section className="sect sect--paper relative overflow-hidden py-section">
      <span aria-hidden="true" className="sect-edge-top" />
      <SectionBackdrop variant="topographic" intensity={0.55} />

      {/* Paper grain */}
      <span
        aria-hidden="true"
        className="sect-layer opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
        }}
      />

      <Container className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
          <FeaturedCard insight={featured} reduced={reduced} />
          <ul className="flex flex-col divide-y divide-steel-300/50 border-y border-steel-300/50">
            {(variant === 'strip' ? rest : rest.slice(0, 4)).map((insight, index) => (
              <SecondaryCard key={insight.slug} insight={insight} index={index} reduced={reduced} />
            ))}
          </ul>

          {variant === 'grid' && rest.length > 4 ? (
            <ul className="grid gap-px overflow-hidden border border-steel-300/60 bg-steel-300/60 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
              {rest.slice(4).map((insight, index) => (
                <TertiaryCard key={insight.slug} insight={insight} index={index} reduced={reduced} />
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- featured -- */

function FeaturedCard({ insight, reduced }: { insight: Insight; reduced: boolean }) {
  const inner = (
    <>
      {/* Editorial illustration. Abstract on purpose — an invented photo would
          imply a source this article does not have. */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(140deg,#063B2A,#0B5137_55%,#04261B)]">
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(rgba(53,201,111,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.14) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <span
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.34),transparent_66%)] blur-2xl"
        />
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
          animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="thai-display select-none text-[6rem] font-bold leading-none text-white/[0.08] sm:text-[8rem]">
            {insight.category.slice(0, 3).toUpperCase()}
          </span>
        </motion.span>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
          <span className="rounded-pill border border-brand-400/40 bg-brand-900/60 px-3 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-200 backdrop-blur-sm">
            {insight.category}
          </span>
          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-brand-200/70">
            featured
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="thai-display text-xl font-bold leading-snug text-ink sm:text-2xl">
          {insight.title}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel-600">{insight.excerpt}</p>

        <div className="mt-6 flex items-center justify-between border-t border-steel-200 pt-5">
          {insight.published ? (
            <>
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-400">
                {insight.date}
                {insight.author ? ` · ${insight.author}` : ''}
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-ink">
                อ่านบทความ
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-base group-hover:translate-x-1" />
              </span>
            </>
          ) : (
            <>
              <span className="rounded-pill border border-steel-300 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-steel-500">
                เร็ว ๆ นี้
              </span>
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-400">
                ~{insight.minutes} นาที
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );

  const shell = 'group block overflow-hidden rounded-panel border border-steel-300/60 bg-white';

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {insight.published ? (
        <Link
          to={`/insights/${insight.slug}`}
          className={cn(shell, 'transition-shadow duration-slow hover:shadow-lift')}
        >
          {inner}
        </Link>
      ) : (
        <article className={shell}>{inner}</article>
      )}
    </motion.div>
  );
}

/* --------------------------------------------------------------- secondary -- */

function SecondaryCard({
  insight,
  index,
  reduced
}: {
  insight: Insight;
  index: number;
  reduced: boolean;
}) {
  const inner = (
    <>
      <span className="font-mono text-[0.625rem] tabular-nums text-steel-300">
        {String(index + 2).padStart(2, '0')}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[0.5rem] uppercase tracking-[0.16em] text-brand-600">
          {insight.category}
        </span>
        <span className="thai-display mt-1.5 block text-[0.9375rem] font-bold leading-snug text-ink">
          {insight.title}
        </span>
        <span className="mt-2 block">
          {insight.published ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
              อ่าน
              <ArrowIcon className="h-3 w-3 transition-transform duration-base group-hover:translate-x-1" />
            </span>
          ) : (
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-steel-400">
              เร็ว ๆ นี้ · ~{insight.minutes} นาที
            </span>
          )}
        </span>
      </span>
    </>
  );

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
    >
      {insight.published ? (
        <Link
          to={`/insights/${insight.slug}`}
          className="group flex gap-4 py-5 transition-colors duration-base hover:text-brand-700"
        >
          {inner}
        </Link>
      ) : (
        <div className="flex gap-4 py-5">{inner}</div>
      )}
    </motion.li>
  );
}

/* ---------------------------------------------------------------- tertiary -- */

function TertiaryCard({
  insight,
  index,
  reduced
}: {
  insight: Insight;
  index: number;
  reduced: boolean;
}) {
  const inner = (
    <>
      <span>
        <span className="block font-mono text-[0.5rem] uppercase tracking-[0.16em] text-brand-600">
          {insight.category}
        </span>
        <span className="thai-display mt-3 block text-base font-bold leading-snug text-ink">
          {insight.title}
        </span>
        <span className="mt-2.5 block text-xs leading-relaxed text-steel-500">
          {insight.excerpt}
        </span>
      </span>
      <span className="mt-5 block border-t border-steel-200 pt-4">
        {insight.published ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
            อ่านบทความ
            <ArrowIcon className="h-3 w-3 transition-transform duration-base group-hover:translate-x-1" />
          </span>
        ) : (
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-steel-400">
            เร็ว ๆ นี้ · ~{insight.minutes} นาที
          </span>
        )}
      </span>
    </>
  );

  const shell = 'group flex h-full flex-col justify-between p-6';

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
      className="bg-white"
    >
      {insight.published ? (
        <Link
          to={`/insights/${insight.slug}`}
          className={cn(shell, 'transition-colors duration-slow hover:bg-steel-50')}
        >
          {inner}
        </Link>
      ) : (
        <div className={shell}>{inner}</div>
      )}
    </motion.li>
  );
}
