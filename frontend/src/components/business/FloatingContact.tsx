import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { company, cta } from '@/data/company';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { ContactIcon } from './Footer';
import { Logo } from './Logo';
import { LocaleLink } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { dock, ui } from '@/i18n/ui';
import { splitLocalePath } from '@/i18n/locales';
import { businessHours } from '@/i18n/company';

type DockIcon = 'phone' | 'line' | 'mail' | 'chat';
type Channel = { icon: DockIcon; eyebrow: string; label: string; href?: string; to?: string; bright?: boolean };

/**
 * FLOATING CONTACT — the mobile-first shortcut to a real channel.
 *
 * EP42: direct channels first (LINE, phone, email), then the form under the
 * site's one primary label. No "book a call" — there is no booking system.
 * No attention-seeking pulse, and it stays out of the way on /contact, where
 * the same channels are already on the page beside the form.
 */
export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const reduced = useReducedMotion();
  const { t } = useLocale();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const onContactPage = splitLocalePath(location.pathname).path === '/contact';

  useEffect(() => setOpen(false), [location.pathname]);
  /* Opening moves focus into the panel; closing returns it to the button. */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) panel.current?.querySelector<HTMLElement>('a[href]')?.focus();
    else if (wasOpen.current) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const channels: Channel[] = [
    { icon: 'line', eyebrow: t(dock.lineEyebrow), label: company.lineOA, href: company.lineUrl, bright: true },
    { icon: 'phone', eyebrow: t(dock.callEyebrow), label: company.phoneDisplay, href: `tel:${company.phone}` },
    { icon: 'mail', eyebrow: t(dock.mailEyebrow), label: company.email, href: `mailto:${company.email}` },
    { icon: 'chat', eyebrow: t(dock.formEyebrow), label: t(cta.primary.label), to: cta.primary.to }
  ];

  if (onContactPage) return null;

  return (
    <>
      <AnimatePresence>{open ? <motion.button type="button" aria-label={t(dock.close)} onClick={() => setOpen(false)} className="fixed inset-0 z-[54] bg-ink/35 backdrop-blur-[2px] sm:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /> : null}</AnimatePresence>
      <div className="floating-contact-position fixed z-[55]">
        <AnimatePresence>
          {open ? (
            <motion.section
              ref={panel}
              role="dialog"
              aria-modal="false"
              aria-label={t(dock.dialog)}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: .94, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: .97 }}
              transition={{ duration: reduced ? 0 : .38, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] max-h-[78dvh] overflow-y-auto rounded-panel border border-brand-300/20 on-dark bg-[linear-gradient(155deg,rgba(5,47,34,.98),rgba(3,22,16,.99))] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lift-lg backdrop-blur-xl sm:absolute sm:inset-auto sm:bottom-full sm:right-0 sm:mb-3 sm:w-[22rem] sm:p-4"
            >
              <span className="mx-auto mb-3 block h-1 w-10 rounded-pill bg-white/20 sm:hidden" />
              <div className="relative overflow-hidden rounded-card border border-brand-400/15 bg-white/[.04] p-4">
                <span aria-hidden="true" className="absolute inset-0 mesh-lines opacity-25" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3"><Logo compact inverted /><div><p className="thai-display text-sm font-bold text-white">{t(dock.title)}</p><p className="mt-1 text-xs text-brand-100/55">{t(businessHours.note)}</p></div></div>
                  <button type="button" onClick={() => setOpen(false)} aria-label={t(dock.closeShort)} className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:bg-white/10 hover:text-white">×</button>
                </div>
              </div>

              <p className="mt-4 px-3 font-mono text-[.5625rem] uppercase tracking-[.16em] text-brand-300/70">{t(dock.channels)}</p>
              <div className="mt-1 space-y-1">
                {channels.map((channel, index) => {
                  const content = <><span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all', channel.bright ? 'border-brand-300/40 bg-brand-400/15 text-brand-200' : 'border-white/10 bg-white/[.04] text-brand-300 group-hover:border-brand-400/35 group-hover:text-brand-200')}><ContactIcon name={channel.icon} /></span><span className="min-w-0 flex-1"><span className="block text-xs text-brand-100/50">{channel.eyebrow}</span><span className="mt-0.5 block truncate text-sm font-semibold text-white">{channel.label}</span></span>{channel.href?.startsWith('http') ? <span className="sr-only">{t(ui.opensInNewTab)}</span> : null}<span aria-hidden="true" className="text-brand-300/55 transition-transform group-hover:translate-x-1">→</span></>;
                  const classes = 'group flex min-h-16 items-center gap-3 rounded-card border border-transparent px-3 py-2.5 transition-colors hover:border-brand-400/15 hover:bg-brand-400/[.07]';
                  return <motion.div key={channel.icon} className={channel.to ? 'mt-2 border-t border-white/10 pt-2' : undefined} initial={reduced ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .25, delay: .08 + index * .045 }}>{channel.to ? <LocaleLink to={channel.to} className={classes}>{content}</LocaleLink> : <a href={channel.href} target={channel.href?.startsWith('http') ? '_blank' : undefined} rel={channel.href?.startsWith('http') ? 'noopener noreferrer' : undefined} className={classes}>{content}</a>}</motion.div>;
                })}
              </div>

              <div className="mt-3 flex items-center gap-3 border-t border-white/10 px-3 pt-4"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-brand-300"><ContactIcon name="clock" /></span><p className="text-xs leading-5 text-brand-100/60"><span className="text-white">{t(businessHours.days)}</span><br />{t(businessHours.time)}</p></div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <button ref={trigger} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="dialog" aria-label={t(open ? dock.close : dock.open)} className="group ml-auto flex h-13 w-13 items-center justify-center gap-2.5 rounded-full border border-brand-400/35 on-dark bg-[linear-gradient(150deg,#063B2A,#031b13)] text-white shadow-lift transition-all duration-base hover:-translate-y-1 hover:border-brand-300/60 hover:shadow-brand-glow sm:h-14 sm:w-auto sm:rounded-pill sm:px-5">
          <motion.span animate={open && !reduced ? { rotate: 24 } : { rotate: 0 }} className="text-brand-300"><ContactIcon name="chat" className="h-5 w-5" /></motion.span>
          <span className="thai-display hidden text-sm font-semibold sm:inline">{t(dock.button)}</span>
        </button>
      </div>
    </>
  );
}
