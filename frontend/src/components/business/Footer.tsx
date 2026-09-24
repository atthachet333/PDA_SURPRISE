import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { company, footer, navigation } from '@/data/company';
import { Container } from '@/components/shared/Layout';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { LocaleLink } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { footer as footerText, ui } from '@/i18n/ui';
import { addressLines, addressNote, businessHours } from '@/i18n/company';

export function Footer() {
  const reduced = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ['start end', 'end start'] });
  const wordmarkY = useTransform(scrollYProgress, [0, 1], [-14, 22]);
  const { t } = useLocale();
  const address = t(addressLines);

  /*
   * `on-dark`: the footer keeps its dark green ground in BOTH themes, so the
   * corporate tokens stay pinned to their light values inside it. Without it
   * the ground would stay dark while `text-white` inverted to dark.
   */
  return (
    <footer ref={footerRef} className="on-dark relative overflow-hidden text-white">
      {/*
        EP42: no second closing CTA here. Every page already ends with one
        (BigCTA, or the Services / Work closing block), so a footer CTA only
        repeated the same button a screen apart. The footer keeps the real
        contact details instead.
      */}
      {/* B — informational footer: quieter and denser than the CTA. */}
      <section className="relative bg-[#031b13] py-14 sm:py-16">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_.72fr_1fr_1.12fr]">
            <div>
              <Logo inverted className="h-9" />
              <p className="thai-display mt-7 text-sm font-semibold text-white" lang="th">{company.legalNameTh}</p>
              <p className="mt-1 font-mono text-[.5625rem] uppercase tracking-[.16em] text-brand-300/55">{company.legalName}</p>
              <p className="mt-6 max-w-xs text-sm leading-7 text-brand-100/60">{t(footerText.blurb)}</p>
            </div>
            <FooterColumn title={t(footerText.menuHeading)}>{navigation.map((item) => <li key={item.to}><LocaleLink className="footer-link" to={item.to}>{t(item.label)}</LocaleLink></li>)}</FooterColumn>
            <FooterColumn title={t(footerText.servicesHeading)}>{footer.servicesLinks.map((item) => <li key={item.to}><LocaleLink className="footer-link" to={item.to}>{t(item.label)}</LocaleLink></li>)}</FooterColumn>
            <FooterColumn title={t(footerText.contactHeading)}>
              {/* EP42: LINE, phone, email — the same order as every direct-channel row; 44px targets. */}
              <ContactItem icon="line" tall><a className="footer-link -my-2 inline-flex min-h-11 items-center" href={company.lineUrl} target="_blank" rel="noopener noreferrer">{company.lineOA}<span className="sr-only">{t(ui.opensInNewTab)}</span></a></ContactItem>
              <ContactItem icon="phone" tall><a className="footer-link -my-2 inline-flex min-h-11 items-center" href={`tel:${company.phone}`}>{company.phoneDisplay}</a></ContactItem>
              <ContactItem icon="mail" tall><a className="footer-link -my-2 inline-flex min-h-11 items-center break-all" href={`mailto:${company.email}`}>{company.email}</a></ContactItem>
              <ContactItem icon="map">{company.mapUrl ? <a href={company.mapUrl} target="_blank" rel="noopener noreferrer" className="footer-link"><address className="not-italic text-xs leading-6">{address.map((line) => <span key={line} className="block">{line}</span>)}</address></a> : <address className="not-italic text-xs leading-6 text-brand-100/55">{address.map((line) => <span key={line} className="block">{line}</span>)}</address>}</ContactItem>
              <ContactItem icon="clock"><span className="text-xs leading-6 text-brand-100/55">{t(businessHours.days)}<br />{t(businessHours.time)}</span></ContactItem>
            </FooterColumn>
          </div>
        </Container>
      </section>

      {/* C — brand finale. */}
      <section className="sect sect--horizon relative overflow-hidden border-t border-white/8">
        <FooterAtmosphere reduced={reduced} finale />
        <Container wide className="relative pt-8">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[.5625rem] uppercase tracking-[.18em] text-brand-300/50"><span>PDA BLISS · DIGITAL SYSTEMS</span><span>tz · asia/bangkok</span><span>{t(businessHours.note)}</span></div>
          <motion.div style={reduced ? undefined : { y: wordmarkY }} className="relative mt-8 select-none overflow-hidden" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-35"><Logo compact inverted className="h-10 w-10" /></div>
            <span className="block translate-y-[14%] whitespace-nowrap text-center text-[clamp(3.5rem,17vw,15rem)] font-bold leading-[.8] tracking-[-.045em] text-white/[.07]">PDA BLISS</span>
          </motion.div>
          <div className="flex flex-col gap-4 border-t border-white/10 py-7 text-xs text-brand-100/45 lg:flex-row lg:items-center lg:justify-between">
            <div><p>© {new Date().getFullYear()} {company.legalName}</p><p className="thai-display mt-1"><span lang="th">{company.legalNameTh}</span> · {t(addressNote)}</p></div>
            <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label={t(footerText.legalNav)}>{footer.legalLinks.map((item) => <LocaleLink key={item.to} to={item.to} className="transition-colors hover:text-white">{t(item.label)}</LocaleLink>)}</nav>
          </div>
        </Container>
      </section>
    </footer>
  );
}

function FooterAtmosphere({ reduced, finale = false }: { reduced: boolean; finale?: boolean }) {
  return <div className="sect-layer" aria-hidden="true"><span className={cn('horizon-grid absolute -inset-[10%]', !reduced && 'footer-grid-drift')} /><span className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_bottom,rgba(53,201,111,.18),transparent_68%)]" />{!reduced ? <><span className="absolute inset-y-0 w-1/3 animate-beam-x bg-[linear-gradient(90deg,transparent,rgba(53,201,111,.1),transparent)]" />{finale ? <><span className="footer-particle absolute left-[18%] top-[35%] h-1 w-1 rounded-full bg-brand-300/50" /><span className="footer-particle absolute right-[22%] top-[48%] h-1 w-1 rounded-full bg-brand-300/45 [animation-delay:2s]" /></> : null}</> : null}</div>;
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="font-mono text-[.5625rem] uppercase tracking-[.2em] text-brand-400">{title}</h3><ul className="mt-6 space-y-3 [&_.footer-link]:text-sm [&_.footer-link]:text-brand-100/65 [&_.footer-link]:transition-colors hover:[&_.footer-link]:text-white">{children}</ul></div>;
}

function ContactItem({ icon, tall = false, children }: { icon: ContactIconName; tall?: boolean; children: React.ReactNode }) {
  return <li className={cn('group flex gap-3', tall ? 'items-center' : 'items-start')}><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-400/15 text-brand-300/60 transition group-hover:border-brand-400/40 group-hover:text-brand-300"><ContactIcon name={icon} /></span><div>{children}</div></li>;
}

type ContactIconName = 'phone' | 'mail' | 'line' | 'map' | 'clock';
export function ContactIcon({ name, className }: { name: ContactIconName | 'calendar' | 'chat' | 'up'; className?: string }) {
  const paths: Record<ContactIconName | 'calendar' | 'chat' | 'up', React.ReactNode> = {
    phone: <path d="M5 3.5 7 7 5.5 8.5a10 10 0 0 0 5 5L12 12l3.5 2v2.5a1.5 1.5 0 0 1-1.7 1.5A13.5 13.5 0 0 1 3.5 5.2 1.5 1.5 0 0 1 5 3.5Z" />,
    mail: <><rect x="3" y="5" width="14" height="10" rx="2" /><path d="m4 6 6 4.5L16 6" /></>,
    line: <><path d="M17 10a6.5 6.5 0 0 1-7 6.5L6 18l1-3A6.5 6.5 0 1 1 17 10Z" /><path d="M7 10h.01M10 10h.01M13 10h.01" /></>,
    map: <><path d="M10 18s5-4.7 5-9a5 5 0 1 0-10 0c0 4.3 5 9 5 9Z" /><circle cx="10" cy="9" r="1.5" /></>,
    clock: <><circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.5 1.5" /></>,
    calendar: <><rect x="3" y="5" width="14" height="12" rx="2" /><path d="M6 3v4M14 3v4M3 9h14" /></>,
    chat: <><path d="M17 12.5a2 2 0 0 1-2 2H7l-4 3v-12a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" /><path d="M7 8h6M7 11h4" /></>,
    up: <><path d="m5 11 5-5 5 5" /><path d="M10 6v9" /></>
  };
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn('h-4 w-4', className)}>{paths[name]}</svg>;
}
