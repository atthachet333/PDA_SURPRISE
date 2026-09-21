import { useId, useState } from 'react';
import type { CaseFlowStep } from '@/data/caseStudies';
import { cn } from '@/lib/cn';

/**
 * A semantic, touch-friendly process navigator. The ordered list remains the
 * source of truth; selection only expands the explanation for one step.
 */
export function CaseStudyFlow({ steps }: { steps: readonly CaseFlowStep[] }) {
  const [activeId, setActiveId] = useState(steps[0]?.id ?? '');
  const detailId = useId();
  const active = steps.find((step) => step.id === activeId) ?? steps[0];

  if (!active) return null;

  return (
    <div>
      <ol className="grid gap-2 md:grid-flow-col md:auto-cols-fr md:gap-3">
        {steps.map((step, index) => {
          const selected = step.id === active.id;
          const completed = steps.findIndex((candidate) => candidate.id === active.id) >= index;
          return (
            <li key={step.id} className="relative">
              <button
                type="button"
                aria-pressed={selected}
                aria-controls={detailId}
                onClick={() => setActiveId(step.id)}
                onFocus={() => setActiveId(step.id)}
                className={cn(
                  'relative flex min-h-[5.5rem] w-full items-center gap-3 rounded-card border p-3 text-left transition-colors duration-base md:min-h-[8.5rem] md:flex-col md:items-start md:justify-between md:p-4',
                  selected
                    ? 'border-brand-500 bg-brand-700 text-white shadow-soft'
                    : completed
                      ? 'border-brand-200 bg-brand-50 text-brand-900'
                      : 'border-steel-200 bg-white text-steel-500'
                )}
              >
                <span className={cn('font-mono text-[.6rem] tabular-nums', selected ? 'text-brand-200' : 'text-brand-600')}>{String(index + 1).padStart(2, '0')}</span>
                <span className="thai-display text-sm font-semibold md:text-base">{step.title}</span>
                <span className={cn('ml-auto text-[.65rem] md:ml-0', selected ? 'text-brand-100/70' : 'text-steel-400')}>{step.actor}</span>
              </button>
              {index < steps.length - 1 ? <span aria-hidden="true" className={cn('absolute left-6 top-full h-2 w-px md:left-full md:top-1/2 md:h-px md:w-3', completed ? 'bg-brand-400' : 'bg-steel-200')} /> : null}
            </li>
          );
        })}
      </ol>

      <div id={detailId} aria-live="polite" className="mt-4 grid gap-4 rounded-panel border border-brand-200 bg-white p-5 shadow-soft sm:grid-cols-[minmax(0,1fr)_minmax(12rem,.42fr)] sm:p-6">
        <div>
          <p className="font-mono text-[.6rem] tracking-[.15em] text-brand-600">WHAT HAPPENS</p>
          <h3 className="thai-display mt-2 text-xl font-bold text-ink">{active.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-steel-600">{active.description}</p>
        </div>
        <div className="border-t border-steel-200 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <p className="font-mono text-[.6rem] tracking-[.15em] text-steel-400">OUTPUT</p>
          <p className="thai-display mt-2 text-sm font-semibold text-brand-800">{active.output}</p>
          <p className="mt-2 text-xs text-steel-500">ผู้ดำเนินการ: {active.actor}</p>
        </div>
      </div>
    </div>
  );
}
