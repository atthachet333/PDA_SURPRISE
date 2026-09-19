import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { company, cta } from '@/data/company';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useEntranceReveal } from '@/hooks/useEntranceReveal';
import { usePageVisible } from '@/hooks/usePageVisible';
import { cn } from '@/lib/cn';

/**
 * BIG CTA — the conversion moment, and the loudest section on the site.
 *
 * Full-bleed green, oversized Thai type, a moving data field behind it, and a
 * device silhouette held back at low contrast so it reads as depth rather than
 * as a picture. Everything else on the page is restrained so that this lands.
 *
 * Contact details come from the central config — there is no literal phone
 * number, email or LINE id in this file.
 */
export function BigCTA({ code = '10 / START' }: { code?: string } = {}) {
  const reduced = useReducedMotion();
  const reveal = useEntranceReveal();
  const visible = usePageVisible();
  const animate = !reduced && visible;

  return (
    <section className="sect sect--immersive relative overflow-hidden py-section text-white">
      {/* Data field */}
      <div className="sect-layer" aria-hidden="true">
        <span
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(53,201,111,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        {/* Travelling connection lines */}
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-1/2 w-full"
        >
          {[
            'M0 34 C 22 30, 34 20, 52 18 S 80 12, 100 8',
            'M0 40 C 26 36, 40 28, 60 26 S 86 20, 100 18',
            'M0 26 C 18 24, 30 14, 50 10 S 78 4, 100 2'
          ].map((d, index) => (
            <g key={d}>
              <path
                d={d}
                fill="none"
                stroke="rgba(53,201,111,0.28)"
                strokeWidth="0.2"
                vectorEffect="non-scaling-stroke"
              />
              {animate ? (
                <path
                  d={d}
                  fill="none"
                  stroke="#7FD9A6"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="3 117"
                  className="animate-data-run"
                  style={{ animationDelay: `${index * 1.1}s`, animationDuration: '4.5s' }}
                />
              ) : null}
            </g>
          ))}
        </svg>

        {/* Device silhouette, deliberately low contrast */}
        <span className="absolute -bottom-24 right-[-6%] hidden h-[30rem] w-[26rem] rounded-[2.5rem] border border-brand-400/12 lg:block">
          <span className="absolute inset-6 rounded-[1.75rem] border border-brand-400/10" />
          <span className="absolute inset-x-12 top-16 h-2 rounded-pill bg-brand-400/10" />
          <span className="absolute inset-x-12 top-24 h-2 w-2/3 rounded-pill bg-brand-400/10" />
        </span>
      </div>

      <Container className="relative">
        <div className="max-w-4xl">
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-code text-brand-300"
          >
            {code}
          </motion.p>

          <h2 className="thai-display mt-6 text-mega font-bold">
            {['มีไอเดียอยู่แล้ว?', 'มาทำให้มันใช้งานได้จริงกัน'].map((line, index) => (
              <span key={line} className="block overflow-hidden py-[0.06em]">
                <motion.span
                  className={cn('block', index === 1 && 'text-brand-300')}
                  initial={reveal ? { y: '108%' } : false}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 1, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 max-w-xl text-lead text-brand-100/80"
          >
            คุยกันสั้น ๆ เพื่อประเมินขอบเขตงานและงบประมาณอย่างตรงไปตรงมา
            ถ้าเราไม่ใช่ทีมที่เหมาะกับงานนี้ เราจะบอกคุณตั้งแต่ต้น
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-11 flex flex-wrap items-center gap-3"
          >
            <ButtonLink
              to="/contact"
              size="lg"
              data-cursor="cta"
              className="bg-white text-brand-800 hover:bg-brand-50"
            >
              {cta.primary.label}
              <ArrowIcon />
            </ButtonLink>
            <ButtonLink
              to={`tel:${company.phone}`}
              size="lg"
              variant="ghost"
              className="border border-white/25 text-white hover:bg-white/10"
            >
              {cta.talk.label}
            </ButtonLink>
          </motion.div>

          {/* Technical status microcopy */}
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/12 pt-7 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-brand-200/70"
          >
            <span className="flex items-center gap-2">
              <span className={cn('h-1.5 w-1.5 rounded-full bg-brand-400', animate && 'animate-status-blink')} />
              {company.businessHours.note}
            </span>
            <span>{company.phoneDisplay}</span>
            <span className="normal-case tracking-normal">{company.email}</span>
            <span>LINE {company.lineOA}</span>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
