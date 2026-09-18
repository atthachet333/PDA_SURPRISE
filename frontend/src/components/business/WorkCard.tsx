import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { caseStudiesVerified, unverifiedResultLabel, type CaseStudy } from '@/data/work';
import { cn } from '@/lib/cn';
import { MiniChart, MiniFlow, MiniKanban, MiniTable } from './UIPreview';

const ACCENTS: Record<CaseStudy['accent'], string> = {
  green: 'from-brand-600 via-brand-500 to-brand-700',
  graphite: 'from-ink via-steel-800 to-ink',
  mint: 'from-brand-400 via-brand-300 to-brand-600',
  slate: 'from-steel-700 via-steel-600 to-steel-900'
};

const COVER_PREVIEW = {
  dashboard: MiniChart,
  table: MiniTable,
  flow: MiniFlow,
  mobile: MiniKanban
} as const;

interface WorkCardProps {
  study: CaseStudy;
  /** Large cards get a taller cover and a two-column body. */
  featured?: boolean;
  index?: number;
}

export function WorkCard({ study, featured = false, index = 0 }: WorkCardProps) {
  const firstScreen = study.screens[0];
  const Preview = COVER_PREVIEW[firstScreen?.kind ?? 'dashboard'];

  return (
    <motion.article
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn('group relative', featured && 'lg:col-span-2')}
    >
      <Link
        to={`/work/${study.slug}`}
        className="block overflow-hidden rounded-panel border border-steel-200 bg-white transition-all duration-slow ease-smooth hover:-translate-y-1 hover:border-steel-300 hover:shadow-lift"
      >
        <div
          className={cn(
            'relative overflow-hidden bg-gradient-to-br p-6',
            ACCENTS[study.accent],
            featured ? 'aspect-[16/8]' : 'aspect-[16/10]'
          )}
        >
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_20%_20%,white,transparent_55%)]" />
          <div className="relative flex h-full items-end">
            <div className="w-full max-w-md translate-y-2 rounded-card border border-white/25 bg-white/95 p-3.5 shadow-lift transition-transform duration-slow ease-smooth group-hover:translate-y-0">
              <p className="text-[0.5625rem] font-medium uppercase tracking-[0.14em] text-steel-400">
                {firstScreen?.title ?? 'Overview'}
              </p>
              <div className="mt-2.5 h-20">
                <Preview />
              </div>
            </div>
          </div>
          <span className="absolute right-5 top-5 rounded-pill bg-white/15 px-3 py-1 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            {study.projectType}
          </span>
        </div>

        <div className={cn('p-6 sm:p-7', featured && 'lg:grid lg:grid-cols-[1.3fr_1fr] lg:gap-10')}>
          <div>
            <div className="flex items-center gap-3 text-xs text-steel-400">
              <span>{study.industry}</span>
              <span className="h-3 w-px bg-steel-200" />
              <span className="font-mono">{study.year}</span>
            </div>
            <h3 className="mt-3 text-title font-semibold text-ink">{study.title}</h3>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel-500">{study.summary}</p>
          </div>

          {caseStudiesVerified ? <dl
            className={cn(
              'mt-6 grid grid-cols-3 gap-4 border-t border-steel-200 pt-5',
              featured && 'lg:mt-0 lg:grid-cols-1 lg:gap-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0'
            )}
          >
            {study.results.map((result) => (
              <div key={result.label}>
                <dt className="sr-only">{result.label}</dt>
                <dd>
                  <span className="block text-lg font-semibold tabular-nums leading-tight text-ink">
                    {result.value}
                  </span>
                  <span className="mt-1 block text-[0.6875rem] leading-snug text-steel-500">
                    {result.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl> : <div className={cn('mt-6 border-t border-steel-200 pt-5', featured && 'lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0')}><span className="inline-flex rounded-pill bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">{unverifiedResultLabel}</span><p className="mt-3 text-xs leading-relaxed text-steel-500">แสดงเพื่ออธิบายแนวทางและรูปแบบระบบ ไม่ใช่ผลลัพธ์ของลูกค้าที่เผยแพร่แล้ว</p></div>}
        </div>
      </Link>
    </motion.article>
  );
}
