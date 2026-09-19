import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * STAGE VISUALS — one abstract diagram per delivery stage.
 *
 * Extracted from ProcessPath when that section was made compact, so the
 * diagrams can be reused (and so ProcessPath stays readable). These are
 * deliberately abstract: they show the SHAPE of each stage — notes being
 * gathered, a workflow drawn, commits stacking, checks passing, a deploy
 * pipeline, uptime — without inventing any client data.
 */

import type { StageKind } from '@/lib/processStages';

/** Abstract diagram of what happens at a given stage. */
export function StageVisual({
  stage,
  active,
  reduced
}: {
  stage: StageKind;
  active: boolean;
  reduced: boolean;
}) {
  const line = 'rounded-pill bg-steel-200';

  if (stage === 'discover') {
    // Scattered notes being gathered.
    return (
      <div className="grid h-full grid-cols-3 content-center gap-2.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.span
            key={index}
            className={cn(
              'flex h-10 flex-col justify-end gap-1 rounded-[5px] border p-1.5',
              index % 4 === 0 ? 'border-brand-300 bg-brand-50' : 'border-steel-200'
            )}
            initial={reduced ? false : { opacity: 0, rotate: index % 2 ? -4 : 4 }}
            animate={active ? { opacity: 1, rotate: 0 } : undefined}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <span className={cn(line, 'h-1 w-full')} />
          </motion.span>
        ))}
      </div>
    );
  }

  if (stage === 'map') {
    // A workflow being drawn out.
    return (
      <div className="flex h-full flex-col justify-center gap-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-2">
            {[0, 1, 2, 3].map((node) => (
              <span key={node} className="flex flex-1 items-center gap-2">
                <motion.span
                  className={cn(
                    'h-5 flex-1 rounded-[4px] border',
                    row === 1 && node === 2 ? 'border-brand-400 bg-brand-50' : 'border-steel-200'
                  )}
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={active ? { scaleX: 1 } : undefined}
                  transition={{ duration: 0.4, delay: (row * 4 + node) * 0.03 }}
                  style={{ originX: 0 }}
                />
                {node < 3 ? <span className="h-px w-1.5 bg-steel-300" /> : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (stage === 'design') {
    // A schema / wireframe.
    return (
      <div className="flex h-full gap-3">
        <div className="flex w-1/3 flex-col gap-1.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className={cn(line, 'h-2 w-full')} />
          ))}
        </div>
        <div className="flex-1 rounded-[6px] border border-brand-200 bg-brand-50/40 p-3">
          <span className="block h-2 w-2/3 rounded-pill bg-brand-300" />
          <span className="mt-2 block h-1.5 w-full rounded-pill bg-brand-200/70" />
          <span className="mt-1.5 block h-1.5 w-5/6 rounded-pill bg-brand-200/70" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="h-6 rounded-[4px] border border-brand-200" />
            <span className="h-6 rounded-[4px] border border-brand-200" />
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'build') {
    // Commits stacking up.
    return (
      <div className="flex h-full flex-col justify-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2.5"
            initial={reduced ? false : { opacity: 0, x: -12 }}
            animate={active ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.4, delay: index * 0.07 }}
          >
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                index === 0 ? 'bg-brand-500' : 'bg-steel-300'
              )}
            />
            <span className={cn(line, 'h-1.5', index === 0 ? 'w-3/4 bg-brand-200' : 'w-1/2')} />
            <span className="ml-auto font-mono text-[0.5rem] text-steel-400">
              +{(5 - index) * 14}
            </span>
          </motion.div>
        ))}
      </div>
    );
  }

  if (stage === 'test') {
    // A checklist resolving to pass.
    return (
      <div className="flex h-full flex-col justify-center gap-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2.5"
            initial={reduced ? false : { opacity: 0 }}
            animate={active ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: index * 0.12 }}
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-brand-300 bg-brand-50">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-brand-600" fill="none">
                <path
                  d="M2.5 6.2 5 8.7l4.5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={cn(line, 'h-1.5 flex-1')} />
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.1em] text-brand-600">
              pass
            </span>
          </motion.div>
        ))}
      </div>
    );
  }

  if (stage === 'ship') {
    // A deploy pipeline.
    return (
      <div className="flex h-full items-center gap-2">
        {['build', 'test', 'stage', 'prod'].map((label, index) => (
          <span key={label} className="flex flex-1 items-center gap-2">
            <motion.span
              className={cn(
                'flex h-14 flex-1 flex-col items-center justify-center gap-1.5 rounded-[6px] border',
                index === 3 ? 'border-brand-400 bg-brand-50' : 'border-steel-200'
              )}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={active ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  index === 3 ? 'bg-brand-500' : 'bg-steel-300'
                )}
              />
              <span className="font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
                {label}
              </span>
            </motion.span>
            {index < 3 ? <span className="h-px w-2 shrink-0 bg-steel-300" /> : null}
          </span>
        ))}
      </div>
    );
  }

  // care — uptime + a response clock.
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="flex items-end gap-1">
        {Array.from({ length: 16 }).map((_, index) => (
          <motion.span
            key={index}
            className={cn(
              'flex-1 rounded-t-[2px]',
              index === 15 ? 'bg-brand-500' : 'bg-brand-200'
            )}
            initial={reduced ? false : { height: '20%' }}
            animate={active ? { height: `${60 + ((index * 7) % 35)}%` } : undefined}
            transition={{ duration: 0.6, delay: index * 0.02 }}
            style={{ minHeight: 8 }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-steel-100 pt-3">
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-steel-400">
          monitoring
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-brand-600">
          <span className={cn('h-1.5 w-1.5 rounded-full bg-brand-500', !reduced && 'animate-status-blink')} />
          active
        </span>
      </div>
    </div>
  );
}
