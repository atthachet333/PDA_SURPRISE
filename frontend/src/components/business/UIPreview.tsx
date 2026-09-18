import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useInViewOnce } from '@/hooks/useInViewOnce';

/**
 * Small, honest product-UI vignettes drawn with real DOM elements.
 * They are deliberately abstract: no fabricated client data, no fake
 * screenshots, but they read as software rather than decoration.
 */

const BARS = [38, 62, 45, 78, 56, 88, 71, 94];

export function MiniChart({ className, animate = true }: { className?: string; animate?: boolean }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  const active = animate ? inView : true;

  return (
    <div ref={ref} className={cn('flex h-full flex-col justify-between', className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-steel-400">
          Throughput
        </span>
        <span className="font-mono text-[0.625rem] text-brand-600">+18.4%</span>
      </div>
      <div className="mt-3 flex h-full items-end gap-1.5">
        {BARS.map((height, index) => (
          <motion.span
            key={index}
            className={cn(
              'flex-1 rounded-t-[3px]',
              index === BARS.length - 1 ? 'bg-brand-500' : 'bg-steel-200'
            )}
            initial={{ height: '8%' }}
            animate={{ height: active ? `${height}%` : '8%' }}
            transition={{ duration: 0.9, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    </div>
  );
}

export function MiniTable({ className }: { className?: string }) {
  const rows = [
    { id: 'INV-2291', status: 'Posted', tone: 'ok' },
    { id: 'INV-2292', status: 'Review', tone: 'warn' },
    { id: 'INV-2293', status: 'Posted', tone: 'ok' },
    { id: 'INV-2294', status: 'Draft', tone: 'idle' }
  ];

  return (
    <div className={cn('flex h-full flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between border-b border-steel-200 pb-1.5 text-[0.5625rem] font-medium uppercase tracking-[0.14em] text-steel-400">
        <span>Document</span>
        <span>Status</span>
      </div>
      {rows.map((row, index) => (
        <motion.div
          key={row.id}
          className="flex items-center justify-between rounded-md px-1.5 py-1 text-[0.6875rem]"
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, duration: 0.5 }}
        >
          <span className="font-mono text-steel-600">{row.id}</span>
          <span
            className={cn(
              'rounded-pill px-2 py-0.5 text-[0.5625rem] font-medium',
              row.tone === 'ok' && 'bg-brand-50 text-brand-700',
              row.tone === 'warn' && 'bg-amber-50 text-amber-700',
              row.tone === 'idle' && 'bg-steel-100 text-steel-500'
            )}
          >
            {row.status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function MiniKanban({ className }: { className?: string }) {
  const columns = [
    { label: 'Lead', cards: 3 },
    { label: 'Quote', cards: 2 },
    { label: 'Won', cards: 1 }
  ];

  return (
    <div className={cn('grid h-full grid-cols-3 gap-2', className)}>
      {columns.map((column, colIndex) => (
        <div key={column.label} className="flex flex-col gap-1.5">
          <span className="text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-steel-400">
            {column.label}
          </span>
          {Array.from({ length: column.cards }).map((_, cardIndex) => (
            <motion.span
              key={cardIndex}
              className={cn(
                'block h-5 rounded-[5px] border border-steel-200 bg-white',
                colIndex === 2 && cardIndex === 0 && 'border-brand-200 bg-brand-50'
              )}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: colIndex * 0.1 + cardIndex * 0.06, duration: 0.45 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function MiniFlow({ className }: { className?: string }) {
  const nodes = ['Request', 'Manager', 'Finance', 'Done'];

  return (
    <div className={cn('flex h-full items-center justify-between gap-1', className)}>
      {nodes.map((node, index) => (
        <div key={node} className="flex flex-1 items-center gap-1">
          <motion.div
            className={cn(
              'flex h-8 flex-1 items-center justify-center rounded-md border text-[0.5625rem] font-medium',
              index === nodes.length - 1
                ? 'border-brand-200 bg-brand-50 text-brand-700'
                : 'border-steel-200 bg-white text-steel-500'
            )}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12, duration: 0.4 }}
          >
            {node}
          </motion.div>
          {index < nodes.length - 1 ? (
            <svg viewBox="0 0 12 8" className="h-2 w-3 shrink-0 text-steel-300" aria-hidden="true">
              <path d="M0 4h9M7 1.5 10 4 7 6.5" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function MiniCalendar({ className }: { className?: string }) {
  const marked = new Set([3, 4, 9, 15, 16, 22]);

  return (
    <div className={cn('grid h-full grid-cols-7 content-center gap-1', className)}>
      {Array.from({ length: 28 }).map((_, index) => (
        <motion.span
          key={index}
          className={cn(
            'aspect-square rounded-[3px]',
            marked.has(index) ? 'bg-brand-400' : 'bg-steel-100'
          )}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.012, duration: 0.3 }}
        />
      ))}
    </div>
  );
}

export function MiniCards({ className }: { className?: string }) {
  return (
    <div className={cn('grid h-full grid-cols-2 gap-2', className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.div
          key={index}
          className="flex flex-col justify-between rounded-md border border-steel-200 bg-white p-2"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.07, duration: 0.45 }}
        >
          <span className={cn('h-1.5 w-8 rounded-pill', index === 0 ? 'bg-brand-400' : 'bg-steel-200')} />
          <span className="h-1 w-full rounded-pill bg-steel-100" />
        </motion.div>
      ))}
    </div>
  );
}

export const PREVIEWS = {
  chart: MiniChart,
  table: MiniTable,
  kanban: MiniKanban,
  flow: MiniFlow,
  calendar: MiniCalendar,
  cards: MiniCards
} as const;

export type PreviewKind = keyof typeof PREVIEWS;
