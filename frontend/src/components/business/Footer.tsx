import { Link } from 'react-router-dom';
import { activeSocials, company, cta, footer, navigation } from '@/data/company';
import { Container } from '@/components/shared/Layout';
import { Logo } from './Logo';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(55%_70%_at_85%_15%,rgba(29,170,97,.45),transparent)]" aria-hidden="true" />
      <Container className="relative pb-8 pt-16 sm:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.35fr_.8fr_1fr_1fr]">
          <div className="max-w-md">
            <Logo inverted />
            <p className="mt-6 text-sm leading-7 text-steel-300">{company.footerBlurb}</p>
            <Link to={cta.primary.to} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-300 hover:text-white">{cta.primary.label}<span aria-hidden="true">→</span></Link>
          </div>
          <FooterColumn title={footer.menuHeading}>
            {navigation.map((item) => <li key={item.to}><Link className="footer-link" to={item.to}>{item.label}</Link></li>)}
          </FooterColumn>
          <FooterColumn title={footer.servicesHeading}>
            {footer.servicesLinks.map((item) => <li key={item.to}><Link className="footer-link" to={item.to}>{item.label}</Link></li>)}
          </FooterColumn>
          <FooterColumn title={footer.contactHeading}>
            <li><a className="footer-link" href={`tel:${company.phone}`}>{company.phoneDisplay}</a></li>
            <li><a className="footer-link break-all" href={`mailto:${company.email}`}>{company.email}</a></li>
            <li><a className="footer-link" href={company.lineUrl} target="_blank" rel="noreferrer">LINE {company.lineOA}</a></li>
            <li className="pt-2 text-xs leading-6 text-steel-400">{company.businessHours.days}<br />{company.businessHours.time}</li>
            {activeSocials.map((item) => <li key={item.label}><a className="footer-link" href={item.href} target="_blank" rel="noreferrer">{item.label}</a></li>)}
          </FooterColumn>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-xs text-steel-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {company.legalName}. All rights reserved.</p>
          <p>{company.legalNameTh} · {company.addressNote}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="text-2xs font-semibold uppercase tracking-[.18em] text-brand-300">{title}</h3><ul className="mt-5 space-y-3 [&_.footer-link]:text-sm [&_.footer-link]:text-steel-300 [&_.footer-link]:transition-colors hover:[&_.footer-link]:text-white">{children}</ul></div>;
}
