import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useMemo, useState } from 'react';
import { LocaleLink as Link } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { insightsCopy } from '@/i18n/home';
import { localizeInsight } from '@/i18n/insights';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { insightCategories, insights, isInsightPublished, type Insight, type InsightCategory } from '@/data/insights';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

interface InsightStripProps {
  items?: Insight[];
  variant?: 'strip' | 'grid';
  code?: string;
}

export function InsightStrip({ items, variant = 'strip', code = '11 / INSIGHTS' }: InsightStripProps) {
  const { t, content } = useLocale();
  const source = useMemo(() => (items ?? insights).map((insight) => localizeInsight(insight, content)), [items, content]);
  const reduced = useReducedMotion();
  const [active, setActive] = useState<InsightCategory | 'all'>('all');
  const featured = source[0];
  const featuredId = featured?.id;
  const filtered = useMemo(
    () => source.filter((item) => item.id !== featuredId && (active === 'all' || item.category === active)),
    [active, featuredId, source]
  );
  if (!featured) return null;

  if (variant === 'strip') {
    return (
      <section className="sect sect--paper relative overflow-hidden py-section">
        <PaperBackground />
        <Container className="relative">
          <SectionHeading code={code} allLink />
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
            <FeaturedArticle insight={featured} reduced={reduced} />
            <div className="grid gap-3">
              {source.slice(1, 4).map((insight, index) => <CompactArticle key={insight.id} insight={insight} index={index} reduced={reduced} />)}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="sect sect--paper relative overflow-hidden py-section">
      <PaperBackground />
      <Container wide className="relative">
        <SectionHeading code={code} />

        <div className="mt-10">
          <FeaturedArticle insight={featured} reduced={reduced} wide />
        </div>

        <div className="mt-12 border-y border-steel-300/60 py-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label={t(insightsCopy.categories)}>
            {(['all', ...insightCategories] as const).map((category) => {
              const selected = active === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(category)}
                  className={cn('relative shrink-0 rounded-pill border px-4 py-2 text-xs transition-colors', selected ? 'border-brand-700 bg-brand-700 text-white' : 'border-steel-300 bg-white/70 text-steel-600 hover:border-brand-300 hover:text-brand-700')}
                >
                  {category === 'all' ? t(insightsCopy.all) : category}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div layout={!reduced} className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((insight, index) => (
              <ArticleCard key={insight.id} insight={insight} index={index} reduced={reduced} />
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  );
}

function SectionHeading({ code, allLink = false }: { code: string; allLink?: boolean }) {
  const { t } = useLocale();
  const [first, second, third] = t(insightsCopy.title);
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="section-code">{code}</p><h2 className="thai-display mt-3 text-statement font-bold text-ink">{first}<br /><span className="text-brand-700">{second}<br />{third}</span></h2></div>
      {allLink ? <Link to="/insights" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-brand-700">{t(insightsCopy.viewAll)}<ArrowIcon className="transition-transform group-hover:translate-x-1" /></Link> : null}
    </div>
  );
}

function PaperBackground() {
  return (
    <div className="sect-layer" aria-hidden="true">
      <span className="absolute -right-24 top-20 h-96 w-96 rounded-full bg-brand-200/25 blur-3xl" />
    </div>
  );
}

function InsightVisual({ insight, compact = false }: { insight: Insight; compact?: boolean }) {
  const token = insight.image.split(':')[1]?.slice(0, 3).toUpperCase() ?? 'PDA';
  return (
    <div className="on-dark relative h-full min-h-[11rem] overflow-hidden bg-[linear-gradient(145deg,#063B2A,#0B5137_55%,#04261B)]">
      <span aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(53,201,111,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(53,201,111,.14) 1px,transparent 1px)', backgroundSize: compact ? '28px 28px' : '42px 42px' }} />
      <motion.span aria-hidden="true" className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-brand-300/25" animate={{ rotate: 360 }} transition={{ duration: 36, repeat: Infinity, ease: 'linear' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('select-none font-mono font-bold tracking-[-.06em] text-white/[.1]', compact ? 'text-5xl' : 'text-7xl sm:text-8xl')}>{token}</span>
      </div>
      <svg viewBox="0 0 100 40" className="absolute inset-x-0 bottom-5 w-full" aria-hidden="true"><path d="M-5 34 C 20 34, 22 8, 48 18 S 75 34, 106 5" fill="none" stroke="rgba(127,217,166,.55)" strokeWidth=".5" strokeDasharray="2 3" /></svg>
      <span className="absolute bottom-4 left-4 rounded-pill border border-brand-300/30 bg-brand-900/55 px-3 py-1 font-mono text-[.5rem] uppercase tracking-[.15em] text-brand-200">{insight.category}</span>
    </div>
  );
}

function PublicationState({ insight }: { insight: Insight }) {
  const { t } = useLocale();
  return isInsightPublished(insight) ? (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-700">{t(insightsCopy.read)}<ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
  ) : (
    <span className="font-mono text-[.5625rem] uppercase tracking-[.14em] text-steel-400">{t(insightsCopy.preparing)}</span>
  );
}

function FeaturedArticle({ insight, reduced, wide = false }: { insight: Insight; reduced: boolean; wide?: boolean }) {
  const published = isInsightPublished(insight);
  const inner = (
    <><InsightVisual insight={insight} /><div className="flex flex-col justify-center p-6 sm:p-8"><p className="font-mono text-[.5625rem] uppercase tracking-[.18em] text-brand-700">FEATURED</p><h3 className="thai-display mt-3 text-xl font-bold text-ink sm:text-2xl">{insight.titleTh}</h3><p className="mt-4 text-sm leading-relaxed text-steel-600">{insight.excerpt}</p><div className="mt-6 border-t border-steel-200 pt-5"><PublicationState insight={insight} /></div></div></>
  );
  const classes = cn('group grid overflow-hidden rounded-panel border border-steel-300/70 bg-white', wide ? 'lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)]' : 'grid-rows-[auto_1fr]');
  return <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { duration: .7 }}>{published ? <Link to={`/insights/${insight.slug}`} className={cn(classes, 'transition-shadow hover:shadow-lift')}>{inner}</Link> : <article className={classes}>{inner}</article>}</motion.div>;
}

function CompactArticle({ insight, index, reduced }: { insight: Insight; index: number; reduced: boolean }) {
  const published = isInsightPublished(insight);
  const inner = <><div className="h-24 w-28 shrink-0 overflow-hidden rounded-card sm:h-28 sm:w-36"><InsightVisual insight={insight} compact /></div><div className="min-w-0 py-1"><p className="font-mono text-[.5rem] uppercase tracking-[.14em] text-brand-700">{insight.category}</p><h3 className="thai-display mt-2 text-sm font-bold text-ink sm:text-base">{insight.titleTh}</h3><div className="mt-2"><PublicationState insight={insight} /></div></div></>;
  return <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { delay: index * .06 }}>{published ? <Link to={`/insights/${insight.slug}`} className="group flex gap-4 rounded-card border border-steel-300/60 bg-white p-3 transition-shadow hover:shadow-soft">{inner}</Link> : <article className="flex gap-4 rounded-card border border-steel-300/60 bg-white p-3">{inner}</article>}</motion.div>;
}

/* forwardRef: AnimatePresence `popLayout` measures its children through a ref. */
const ArticleCard = forwardRef<HTMLDivElement, { insight: Insight; index: number; reduced: boolean }>(function ArticleCard({ insight, index, reduced }, ref) {
  const published = isInsightPublished(insight);
  const inner = <><div className="h-44"><InsightVisual insight={insight} compact /></div><div className="flex flex-1 flex-col p-5"><h3 className="thai-display text-base font-bold text-ink">{insight.titleTh}</h3><p className="mt-3 text-xs leading-relaxed text-steel-600">{insight.excerpt}</p><div className="mt-auto pt-5"><PublicationState insight={insight} /></div></div></>;
  const shell = 'group flex h-full flex-col overflow-hidden rounded-card border border-steel-300/60 bg-white';
  return <motion.div ref={ref} layout={!reduced} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, scale: .98 }} transition={{ duration: .4, delay: (index % 3) * .04 }}>{published ? <Link to={`/insights/${insight.slug}`} className={cn(shell, 'transition duration-slow hover:-translate-y-1 hover:shadow-lift')}>{inner}</Link> : <article className={shell}>{inner}</article>}</motion.div>;
});
