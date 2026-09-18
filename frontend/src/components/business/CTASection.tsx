import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { Container, Reveal } from '@/components/shared/Layout';
import { company, cta, ctaSection } from '@/data/company';

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-ink py-section text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(60%_70%_at_75%_10%,rgba(18,144,86,0.35),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl animate-pulse-glow"
      />
      <Container className="relative">
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow text-brand-300">{ctaSection.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-headline font-semibold">
              {ctaSection.title[0]}<br />{ctaSection.title[1]}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lead text-steel-300">
              {ctaSection.body}
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <ButtonLink to="/contact" size="lg" variant="primary">
                {cta.primary.label}
                <ArrowIcon />
              </ButtonLink>
              <ButtonLink
                to={`mailto:${company.email}`}
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                {company.email}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
