import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { company, cta } from '@/data/company';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * FLOATING CONTACT — a small dock that expands upward.
 *
 * Functionality is unchanged: consultation, LINE, phone, email. The treatment is
 * now a dark technical dock with green accents rather than a white card.
 *
 * Mobile
 *   Collapses to a single round button so it never covers content, and it sits
 *   inside the safe-area insets (see `.floating-contact-position`). Opening it
 *   shows the same four channels at full tap size.
 */

interface Channel {
  label: string;
  href: string;
  /** Internal router links use `to` instead of `href`. */
  to?: string;
  hint: string;
  primary?: boolean;
}

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const channels: Channel[] = [
    { label: cta.consult.label, href: '', to: cta.consult.to, hint: 'แบบฟอร์ม', primary: true },
    { label: `LINE ${company.lineOA}`, href: company.lineUrl, hint: 'LINE OA' },
    { label: company.phoneDisplay, href: `tel:${company.phone}`, hint: 'โทร' },
    { label: company.email, href: `mailto:${company.email}`, hint: 'อีเมล' }
  ];

  return (
    <div className="floating-contact-position fixed z-40">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-[min(19rem,calc(100vw-2.5rem))] overflow-hidden rounded-panel border border-brand-400/25 bg-[linear-gradient(160deg,rgba(6,59,42,0.97),rgba(4,26,19,0.98))] shadow-lift-lg backdrop-blur-xl"
          >
            <div className="border-b border-brand-400/15 px-5 py-4">
              <p className="flex items-center gap-2 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-300">
                <span
                  className={cn('h-1.5 w-1.5 rounded-full bg-brand-400', !reduced && 'animate-status-blink')}
                />
                contact
              </p>
              <p className="thai-display mt-2.5 text-base font-bold text-white">
                คุยเรื่องโปรเจกต์กับเรา
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-brand-100/60">
                {company.businessHours.note}
              </p>
            </div>

            <div className="p-3">
              {channels.map((channel, index) => {
                const inner = (
                  <>
                    <span className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-brand-300/60">
                      {channel.hint}
                    </span>
                    <span
                      className={cn(
                        'mt-1 block truncate text-sm font-medium',
                        channel.primary ? 'text-brand-800' : 'text-white'
                      )}
                    >
                      {channel.label}
                    </span>
                  </>
                );

                const className = cn(
                  'block rounded-card px-4 py-3 transition-colors duration-base',
                  channel.primary
                    ? 'bg-brand-400 hover:bg-brand-300'
                    : 'hover:bg-brand-400/10'
                );

                return (
                  <motion.div
                    key={channel.label}
                    initial={reduced ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 + index * 0.05 }}
                  >
                    {channel.to ? (
                      <Link to={channel.to} className={className}>
                        {inner}
                      </Link>
                    ) : (
                      <a
                        href={channel.href}
                        className={className}
                        target={channel.href.startsWith('http') ? '_blank' : undefined}
                        rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {inner}
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'ปิดช่องทางติดต่อ' : 'เปิดช่องทางติดต่อ'}
        className={cn(
          'ml-auto flex items-center justify-center gap-2.5 border border-brand-400/30 bg-[linear-gradient(150deg,#063B2A,#04261B)] text-white shadow-lift transition-all duration-base ease-smooth hover:-translate-y-0.5 hover:border-brand-400/60',
          // Round on mobile so it never covers content; labelled from sm up.
          'h-13 w-13 rounded-full sm:h-14 sm:w-auto sm:rounded-pill sm:px-5'
        )}
      >
        {/* Mobile is icon-only, so it needs a real icon — a bare status dot is
            not a recognisable affordance at 52px. From sm up the label returns
            and the dot goes back to signalling "we are open". */}
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-brand-400 sm:hidden"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 12.5a2 2 0 0 1-2 2H7l-4 3v-12a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
          <path d="M7 7.5h6M7 10.5h4" />
        </svg>
        <span
          className={cn(
            'hidden h-2 w-2 shrink-0 rounded-full bg-brand-400 shadow-brand-glow sm:block',
            !reduced && 'animate-status-blink'
          )}
        />
        <span className="thai-display hidden text-sm font-semibold sm:inline">ติดต่อเรา</span>
      </button>
    </div>
  );
}
