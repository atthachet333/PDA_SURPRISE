import { motion } from 'framer-motion';
import { BigCTA } from '@/components/business/BigCTA';
import { CategoryLegend, SystemUniverse } from '@/components/business/SystemUniverse';
import { SectionBackdrop } from '@/components/business/SectionBackdrop';
import { Container } from '@/components/shared/Layout';
import { RevealLines } from '@/components/shared/RevealLines';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pageMeta } from '@/lib/seo';
import { useLocale } from '@/app/LocaleContext';
import { universePreview } from '@/i18n/systemUniverse';
import { businessFlows, solutionsPage as copy } from '@/i18n/solutionsPage';

export default function Solutions() {
  usePageMeta(pageMeta.solutions);
  const reduced = useReducedMotion();
  const { t } = useLocale();
  const [flowLead, flowAccent] = t(copy.flowTitle);

  return (
    <>
      <section className="sect sect--hero relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-36">
        <SectionBackdrop variant="aurora" pointer />
        <Container wide className="relative">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.7fr)] lg:gap-16">
            <div>
              <p className="section-code">01 / PDA SYSTEM UNIVERSE</p>
              <RevealLines as="h1" lines={[...t(universePreview.title)]} className="thai-display mt-6 text-mega font-bold text-ink" lineClassName={(index) => index === 1 ? 'text-brand-700' : undefined} />
              <motion.p initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .25 }} className="mt-7 max-w-2xl text-lead text-steel-600">{t(copy.heroLead)}</motion.p>
            </div>
            <div className="rounded-panel border border-brand-200 bg-white/80 p-5 shadow-soft backdrop-blur-sm sm:p-6">
              <p className="font-mono text-[.62rem] tracking-[.18em] text-brand-600">ECOSYSTEM CAPABLE</p>
              <p className="thai-display mt-3 text-lg font-semibold text-ink">{t(copy.capableTitle)}</p>
              <p className="mt-3 text-sm leading-relaxed text-steel-500">{t(copy.capableBody)}</p>
            </div>
          </div>
          <div className="mt-10"><CategoryLegend /></div>
        </Container>
      </section>

      <SystemUniverse />

      <section className="sect sect--paper relative overflow-hidden py-section">
        <span aria-hidden="true" className="sect-edge-top" />
        <Container wide>
          <div className="grid gap-8 lg:grid-cols-[minmax(16rem,.56fr)_minmax(0,1.44fr)] lg:gap-16">
            <div>
              <p className="section-code">03 / BUSINESS FLOW</p>
              <h2 className="thai-display mt-4 text-statement font-bold text-ink">{flowLead}<br /><span className="text-brand-700">{flowAccent}</span></h2>
              <p className="mt-4 text-sm leading-relaxed text-steel-600">{t(copy.flowLead)}</p>
            </div>
            <div className="space-y-5">
              {businessFlows.map((flow) => (
                <article key={flow.code} className="rounded-panel border border-steel-200 bg-white p-5 shadow-soft sm:p-7">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between"><p className="font-mono text-[.62rem] tracking-[.16em] text-brand-600">{flow.code}</p><h3 className="thai-display text-lg font-bold text-ink">{t(flow.title)}</h3></div>
                  <ol className="mt-6 grid gap-2 sm:grid-cols-4">
                    {t(flow.steps).map((step, index, steps) => <li key={step} className="relative flex min-h-20 items-center rounded-card border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800"><span className="mr-3 font-mono text-[.6rem] text-brand-500">0{index + 1}</span>{step}{index < steps.length - 1 ? <span aria-hidden="true" className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-brand-500 sm:block">→</span> : null}</li>)}
                  </ol>
                  <p className="mt-4 text-xs leading-relaxed text-steel-500">{t(flow.note)}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <BigCTA code="04 / START" />
    </>
  );
}
