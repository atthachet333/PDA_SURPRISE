import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { solutions } from '@/data/solutions';
import { visualForSolution } from '@/data/visuals';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ProductPanel } from './ProductPanel';

export function FeaturedSolution({ code = '02 / FEATURED' }: { code?: string }) {
  const reduced = useReducedMotion();
  const solution = solutions.find((item) => item.id === 'erp');
  if (!solution) return null;

  return (
    <section className="sect sect--field relative overflow-hidden py-section">
      <span aria-hidden="true" className="sect-edge-top" />
      <Container wide className="relative">
        <div className="overflow-hidden rounded-panel border border-steel-200 bg-white shadow-lift">
          <div className="grid lg:grid-cols-[minmax(0,.68fr)_minmax(0,1fr)]">
            <motion.div
              initial={reduced ? false : { opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-center p-7 sm:p-10 lg:p-12"
            >
              <p className="section-code">{code}</p>
              <p className="mt-7 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-brand-600">
                {solution.eyebrow} · FEATURED SOLUTION
              </p>
              <h2 className="thai-display mt-3 text-statement font-bold text-ink">{solution.title}</h2>
              <p className="mt-5 text-sm leading-relaxed text-steel-600">{solution.summary}</p>
              <ul className="mt-7 space-y-3">
                {solution.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-steel-700">
                    <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="group mt-8 inline-flex items-center gap-2 self-start text-sm font-semibold text-brand-700">
                คุยเรื่องระบบ ERP
                <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.985 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-[24rem] overflow-hidden bg-brand-900 p-5 sm:p-8 lg:min-h-[36rem] lg:p-10"
            >
              <span aria-hidden="true" className="absolute inset-0 horizon-grid opacity-70" />
              <span aria-hidden="true" className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
              <div className="relative flex h-full items-center">
                <div className="w-full overflow-hidden rounded-card shadow-lift-lg ring-1 ring-brand-300/25">
                  <div className="aspect-[16/10]">
                    <ProductPanel slot={visualForSolution(solution.id)} className="h-full" frame="none" showMockNotice />
                  </div>
                </div>
                {!reduced ? <span aria-hidden="true" className="absolute inset-y-[18%] -left-1 w-px bg-[linear-gradient(transparent,#35C96F,transparent)] animate-pulse-glow" /> : null}
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
