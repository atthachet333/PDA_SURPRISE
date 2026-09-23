import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { company, cta } from '@/data/company';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { ContactIcon } from './Footer';
import { Logo } from './Logo';

type DockIcon = 'phone' | 'line' | 'mail' | 'calendar';
type Channel = { icon: DockIcon; eyebrow: string; label: string; detail: string; href?: string; to?: string; bright?: boolean };

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const channels: Channel[] = [
    { icon: 'phone', eyebrow: 'โทรหาเรา', label: company.phoneDisplay, detail: 'โทรศัพท์', href: `tel:${company.phone}` },
    { icon: 'line', eyebrow: 'LINE OA', label: company.lineOA, detail: 'เปิดแชต LINE', href: company.lineUrl, bright: true },
    { icon: 'mail', eyebrow: 'ส่งอีเมล', label: company.email, detail: 'อีเมล', href: `mailto:${company.email}` },
    { icon: 'calendar', eyebrow: 'ขอรับคำปรึกษา', label: 'นัดหมายพูดคุยเกี่ยวกับโปรเจกต์', detail: 'Consultation', to: cta.consult.to }
  ];

  return (
    <>
      <AnimatePresence>{open ? <motion.button type="button" aria-label="ปิดช่องทางติดต่อ" onClick={() => setOpen(false)} className="fixed inset-0 z-[54] bg-ink/35 backdrop-blur-[2px] sm:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /> : null}</AnimatePresence>
      <div className="floating-contact-position fixed z-[55]">
        <AnimatePresence>
          {open ? (
            <motion.section
              role="dialog"
              aria-modal="false"
              aria-label="ช่องทางติดต่อ PDA BLISS"
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
                  <div className="flex items-center gap-3"><Logo compact inverted /><div><p className="thai-display text-sm font-bold text-white">พร้อมช่วยเรื่องโปรเจกต์ของคุณ</p><p className="mt-1 text-xs text-brand-100/55">{company.businessHours.note}</p></div></div>
                  <button type="button" onClick={() => setOpen(false)} aria-label="ปิด" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:bg-white/10 hover:text-white">×</button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {channels.map((channel, index) => {
                  const content = <><span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all', channel.bright ? 'border-brand-300/40 bg-brand-400/15 text-brand-200' : 'border-white/10 bg-white/[.04] text-brand-300 group-hover:border-brand-400/35 group-hover:text-brand-200')}><ContactIcon name={channel.icon} /></span><span className="min-w-0 flex-1"><span className="block text-xs text-brand-100/50">{channel.eyebrow}</span><span className="mt-0.5 block truncate text-sm font-semibold text-white">{channel.label}</span></span><span aria-hidden="true" className="text-brand-300/55 transition-transform group-hover:translate-x-1">→</span></>;
                  const classes = 'group flex min-h-16 items-center gap-3 rounded-card border border-transparent px-3 py-2.5 transition-colors hover:border-brand-400/15 hover:bg-brand-400/[.07]';
                  return <motion.div key={channel.eyebrow} initial={reduced ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .25, delay: .08 + index * .045 }}>{channel.to ? <Link to={channel.to} className={classes}>{content}</Link> : <a href={channel.href} target={channel.href?.startsWith('http') ? '_blank' : undefined} rel={channel.href?.startsWith('http') ? 'noopener noreferrer' : undefined} className={classes}>{content}</a>}</motion.div>;
                })}
              </div>

              <div className="mt-3 flex items-center gap-3 border-t border-white/10 px-3 pt-4"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-brand-300"><ContactIcon name="clock" /></span><p className="text-xs leading-5 text-brand-100/60"><span className="text-white">{company.businessHours.days}</span><br />{company.businessHours.time}</p></div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'ปิดช่องทางติดต่อ' : 'เปิดช่องทางติดต่อ'} className="group ml-auto flex h-13 w-13 items-center justify-center gap-2.5 rounded-full border border-brand-400/35 on-dark bg-[linear-gradient(150deg,#063B2A,#031b13)] text-white shadow-lift transition-all duration-base hover:-translate-y-1 hover:border-brand-300/60 hover:shadow-brand-glow sm:h-14 sm:w-auto sm:rounded-pill sm:px-5">
          <motion.span animate={open && !reduced ? { rotate: 24 } : { rotate: 0 }} className="text-brand-300"><ContactIcon name="chat" className="h-5 w-5" /></motion.span>
          <span className={cn('hidden h-2 w-2 rounded-full bg-brand-400 shadow-brand-glow sm:block', !reduced && 'animate-status-blink')} />
          <span className="thai-display hidden text-sm font-semibold sm:inline">ติดต่อเรา</span>
        </button>
      </div>
    </>
  );
}
