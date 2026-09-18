import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { services } from '@/data/services';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/shared/Icon';
import { useAudio } from '@/app/audioContext';

/**
 * Services as an expandable ledger rather than a grid of identical cards.
 * One row opens at a time; the open row reveals what is actually delivered.
 */
export function ServiceList() {
  const [openId, setOpenId] = useState<string | null>(services[0]?.id ?? null);
  const { play } = useAudio();

  return (
    <div className="divide-y divide-steel-200 border-y border-steel-200">
      {services.map((service, index) => {
        const open = openId === service.id;
        return (
          <div key={service.id} id={service.id} className="scroll-mt-28">
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`service-panel-${service.id}`}
                onPointerEnter={() => play('hover')}
                onClick={() => {
                  play('click');
                  setOpenId(open ? null : service.id);
                }}
                className="group flex w-full items-center gap-5 py-7 text-left transition-colors duration-base hover:bg-steel-50/70 sm:gap-8 sm:px-4"
              >
                <span className="hidden w-10 shrink-0 font-mono text-xs text-steel-300 sm:block">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-card border transition-all duration-base',
                    open
                      ? 'border-brand-200 bg-brand-50 text-brand-600'
                      : 'border-steel-200 bg-white text-steel-500 group-hover:border-steel-300 group-hover:text-ink'
                  )}
                >
                  <Icon name={service.icon} className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-lg font-semibold transition-colors duration-base sm:text-xl',
                      open ? 'text-ink' : 'text-ink/90 group-hover:text-ink'
                    )}
                  >
                    {service.title}
                  </span>
                  <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-steel-500">
                    {service.summary}
                  </span>
                </span>

                <span
                  className={cn(
                    'relative hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-base sm:flex',
                    open ? 'rotate-45 border-brand-200 bg-brand-50 text-brand-600' : 'border-steel-200 text-steel-400'
                  )}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={`service-panel-${service.id}`}
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-8 pb-9 sm:px-4 lg:grid-cols-[1.4fr_1fr] lg:gap-16 lg:pl-[7.25rem]">
                    <div><p className="max-w-prose text-[0.95rem] leading-relaxed text-steel-600">{service.detail}</p><div className="mt-5 flex flex-wrap gap-2">{service.tech.map((tech)=><span key={tech} className="rounded-pill bg-steel-100 px-3 py-1 text-2xs font-medium text-steel-600">{tech}</span>)}</div></div>
                    <ul className="space-y-2.5">
                      {service.deliverables.map((item, itemIndex) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + itemIndex * 0.06, duration: 0.4 }}
                          className="flex items-start gap-3 text-sm text-steel-600"
                        >
                          <span className="mt-[0.4rem] h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
