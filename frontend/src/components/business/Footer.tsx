import { Link } from 'react-router-dom';
import { activeSocials, company, cta, footer, navigation } from '@/data/company';
import { Container } from '@/components/shared/Layout';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * FOOTER — the final scene, not a sitemap dump.
 *
 * Near-black green ground, a slow data grid fading up from the bottom, a green
 * beam travelling across the seam, and a giant PDA BLISS wordmark cropped by the
 * bottom edge so the page feels like it continues past the viewport.
 *
 * Every contact detail comes from the central config. Nothing here is literal.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const reduced = useReducedMotion();

  return (
    <footer className="sect sect--horizon relative overflow-hidden text-white">
      {/* Data horizon */}
      <div className="sect-layer" aria-hidden="true">
        <span className="horizon-grid absolute inset-0" />
      </div>

      {/* Beam travelling across the top seam */}
      <div className="relative h-px w-full overflow-hidden bg-brand-400/15" aria-hidden="true">
        {!reduced ? (
          <span className="absolute inset-y-0 w-1/4 bg-[linear-gradient(90deg,transparent,rgba(53,201,111,0.9),transparent)] animate-beam-x" />
        ) : null}
      </div>

      <Container className="relative pb-10 pt-20 sm:pt-24">
        {/* ------------------------------------------------------- top row -- */}
        <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-[1.4fr_0.75fr_0.9fr_1fr]">
          <div className="max-w-md">
            <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand-300/70">
              {company.legalName}
            </p>
            <p className="thai-display mt-5 text-statement font-bold leading-tight text-white">
              เปลี่ยนไอเดีย
              <br />
              <span className="text-brand-400">ให้ใช้งานได้จริง</span>
            </p>
            <p className="mt-6 text-sm leading-7 text-brand-100/60">{company.footerBlurb}</p>
            <Link
              to={cta.primary.to}
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-300 transition-colors hover:text-white"
            >
              {cta.primary.label}
              <span aria-hidden="true" className="transition-transform duration-base group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <FooterColumn title={footer.menuHeading}>
            {navigation.map((item) => (
              <li key={item.to}>
                <Link className="footer-link" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title={footer.servicesHeading}>
            {footer.servicesLinks.map((item) => (
              <li key={item.to}>
                <Link className="footer-link" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title={footer.contactHeading}>
            <li>
              <a className="footer-link" href={`tel:${company.phone}`}>
                {company.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="footer-link break-all" href={`mailto:${company.email}`}>
                {company.email}
              </a>
            </li>
            <li>
              <a className="footer-link" href={company.lineUrl} target="_blank" rel="noopener noreferrer">
                LINE {company.lineOA}
              </a>
            </li>
            {activeSocials.map((item) => (
              <li key={item.label}>
                <a className="footer-link" href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-4">
              <address className="not-italic text-xs leading-6 text-brand-100/50">
                {company.address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </li>
            <li className="pt-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-brand-300/50">
              {company.businessHours.days} · {company.businessHours.time}
            </li>
          </FooterColumn>
        </div>

        {/* ------------------------------------------------ status microcopy -- */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-8 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-300/50">
          <span className="flex items-center gap-2">
            <span
              className={cn('h-1.5 w-1.5 rounded-full bg-brand-400', !reduced && 'animate-status-blink')}
            />
            systems operational
          </span>
          <span>tz · asia/bangkok</span>
          <span>{company.businessHours.note}</span>
        </div>

        {/* ------------------------------------------------ giant wordmark -- */}
        <div className="relative select-none overflow-hidden pt-6" aria-hidden="true">
          <span className="block translate-y-[14%] whitespace-nowrap text-center text-[clamp(3.5rem,17vw,15rem)] font-bold leading-[0.8] tracking-[-0.045em] text-white/[0.07]">
            PDA BLISS
          </span>
        </div>

        {/* -------------------------------------------------------- legal -- */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-brand-100/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legalName}
          </p>
          <p className="thai-display">
            {company.legalNameTh} · {company.addressNote}
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand-400">
        {title}
      </h3>
      <ul className="mt-6 space-y-3 [&_.footer-link]:text-sm [&_.footer-link]:text-brand-100/65 [&_.footer-link]:transition-colors [&_.footer-link]:duration-base hover:[&_.footer-link]:text-white">
        {children}
      </ul>
    </div>
  );
}
