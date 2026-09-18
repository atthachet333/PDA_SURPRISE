import { motion } from 'framer-motion';
import type { PortfolioCategory, PortfolioItem } from '@/data/portfolio';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * PROJECT VISUAL — branded placeholder for a real system.
 *
 * No portfolio screenshot has cleared the privacy review yet (see
 * `docs/SCREENSHOT_PRIVACY.md`): payroll and document systems in particular
 * cannot be shown without masking employee and client data first. So instead of
 * a grey "image missing" box, each category gets a deliberate, branded
 * composition that reads as that kind of software.
 *
 * When a reviewed screenshot does arrive, set it on the item's `screenshots[]`
 * and this component renders the real image instead — the layout is identical,
 * so nothing shifts.
 */

const CATEGORY_LABEL: Record<PortfolioCategory, string> = {
  erp: 'ERP',
  payroll: 'PAYROLL',
  website: 'WEBSITE',
  'web-application': 'WEB APP',
  application: 'APPLICATION',
  'hr-line-bot': 'HR LINE BOT',
  'document-storage': 'DOCUMENT SYSTEM'
};

interface ProjectVisualProps {
  item: PortfolioItem;
  className?: string;
  /** Larger compositions get more detail. */
  density?: 'compact' | 'full';
}

export function ProjectVisual({ item, className, density = 'full' }: ProjectVisualProps) {
  const reduced = useReducedMotion();
  const screenshot = item.publicSafe ? item.screenshots.find((shot) => shot.reviewed) : undefined;

  if (screenshot) {
    return (
      <img
        src={screenshot.src}
        alt={screenshot.caption}
        loading="lazy"
        decoding="async"
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden bg-[linear-gradient(150deg,#063B2A_0%,#0B5137_48%,#04261B_100%)]',
        className
      )}
      role="img"
      aria-label={`ภาพประกอบระบบ ${item.titleTh}`}
    >
      {/* Technical mesh */}
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(53,201,111,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.14) 1px, transparent 1px)',
          backgroundSize: '44px 44px'
        }}
      />
      {/* Light pool */}
      <span
        aria-hidden="true"
        className="absolute -right-1/4 -top-1/3 h-[130%] w-[80%] rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.32),transparent_66%)] blur-2xl"
      />

      {/* Travelling beam */}
      {!reduced ? (
        <span aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <span className="absolute inset-y-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(53,201,111,0.16),transparent)] animate-beam-x" />
        </span>
      ) : null}

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-pill border border-brand-400/30 bg-brand-900/50 px-3 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-200">
            {CATEGORY_LABEL[item.category]}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-300/70">
            <span
              className={cn('h-1.5 w-1.5 rounded-full bg-brand-400', !reduced && 'animate-status-blink')}
            />
            system
          </span>
        </div>

        {/* Abstract module composition, keyed to the category */}
        <div className="flex-1 py-6">
          <CategoryComposition category={item.category} density={density} reduced={reduced} />
        </div>

        <div>
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand-300/60">
            {item.titleEn}
          </p>
          <p className="thai-display mt-2 max-w-md text-lg font-bold leading-snug text-white sm:text-2xl">
            {item.titleTh}
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryComposition({
  category,
  density,
  reduced
}: {
  category: PortfolioCategory;
  density: 'compact' | 'full';
  reduced: boolean;
}) {
  const rows = density === 'full' ? 4 : 3;
  const bar = 'rounded-pill bg-brand-400/25';

  if (category === 'payroll') {
    // A pay-run: rows of figures resolving to a total.
    return (
      <div className="flex h-full flex-col justify-center gap-2">
        {Array.from({ length: rows }).map((_, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3"
            initial={reduced ? false : { opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <span className={cn(bar, 'h-1.5 w-16')} />
            <span className={cn(bar, 'h-1.5 flex-1')} />
            <span
              className={cn(
                'h-4 w-14 rounded-[3px]',
                index === rows - 1 ? 'bg-brand-400/70' : 'bg-brand-400/20'
              )}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  if (category === 'erp') {
    // Production lines feeding a stock ledger.
    return (
      <div className="flex h-full items-end gap-2">
        {[38, 56, 44, 72, 52, 84, 64].map((height, index) => (
          <motion.span
            key={index}
            className={cn(
              'flex-1 rounded-t-[3px]',
              index === 5 ? 'bg-brand-400/80' : 'bg-brand-400/25'
            )}
            initial={reduced ? false : { height: '10%' }}
            whileInView={{ height: `${height}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    );
  }

  if (category === 'document-storage') {
    // A grid of documents, one selected.
    return (
      <div className="grid h-full grid-cols-4 content-center gap-2.5">
        {Array.from({ length: density === 'full' ? 8 : 4 }).map((_, index) => (
          <motion.span
            key={index}
            className={cn(
              'flex aspect-[3/4] flex-col justify-end gap-1 rounded-[4px] border p-1.5',
              index === 2 ? 'border-brand-400/70 bg-brand-400/15' : 'border-brand-400/20'
            )}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
          >
            <span className={cn(bar, 'h-1 w-full')} />
            <span className={cn(bar, 'h-1 w-2/3')} />
          </motion.span>
        ))}
      </div>
    );
  }

  if (category === 'website') {
    // A page skeleton.
    return (
      <div className="flex h-full flex-col justify-center gap-3">
        <motion.span
          className="h-2.5 w-2/3 rounded-pill bg-brand-400/70"
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: 0 }}
        />
        <span className={cn(bar, 'h-1.5 w-full')} />
        <span className={cn(bar, 'h-1.5 w-5/6')} />
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((card) => (
            <motion.span
              key={card}
              className="h-10 rounded-[4px] border border-brand-400/25"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + card * 0.08 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // hr-line-bot / application / web-application — a connected flow.
  return (
    <div className="flex h-full items-center justify-between gap-2">
      {[0, 1, 2, 3].map((step) => (
        <span key={step} className="flex flex-1 items-center gap-2">
          <motion.span
            className={cn(
              'h-10 flex-1 rounded-[5px] border',
              step === 3 ? 'border-brand-400/70 bg-brand-400/20' : 'border-brand-400/25'
            )}
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: step * 0.1 }}
          />
          {step < 3 ? <span className="h-px w-3 shrink-0 bg-brand-400/50" /> : null}
        </span>
      ))}
    </div>
  );
}
