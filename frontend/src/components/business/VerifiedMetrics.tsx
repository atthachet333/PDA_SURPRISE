import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';
import { capabilityMarkers, metrics, metricsVerified } from '@/data/company';
import { useCountUp } from '@/hooks/useCountUp';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { SectionBackdrop } from './SectionBackdrop';

/**
 * VERIFIED NUMBERS — built for exactly two figures.
 *
 * PDA BLISS can substantiate two numbers: 6 software systems and 4 websites.
 * That is the whole list. Client counts, satisfaction percentages, years in
 * business and revenue impact are NOT published, because nobody has measured
 * them — see `unverifiedMetricKeys` in data/company.ts.
 *
 * So this section is designed AROUND two figures rather than padding a
 * four-column grid with filler. Huge type, animated counters, a moving green
 * rule between them, and the qualitative capability markers underneath as
 * supporting copy rather than as fake metrics.
 *
 * `metricsVerified` still gates the numbers. If it is ever set back to false,
 * this falls through to the capability markers alone and no figure is shown.
 */
export function VerifiedMetrics({ code = '08 / NUMBERS' }: { code?: string } = {}) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.3 });
  const reduced = useReducedMotion();

  return (
    <section className="sect sect--bright relative overflow-hidden border-y border-steel-200 py-section">
      <SectionBackdrop variant="light-grid" intensity={0.55} />

      <Container className="relative">
        <div ref={ref} className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-4 text-statement font-bold text-ink">
              ตัวเลขที่ยืนยันได้
              <br />
              <span className="text-brand-600">เท่านั้น</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-steel-500">
              เราไม่แสดงจำนวนลูกค้า เปอร์เซ็นต์ความพึงพอใจ หรือจำนวนปีที่ดำเนินกิจการ
              เพราะยังไม่มีการเก็บข้อมูลที่ยืนยันได้ ตัวเลขด้านล่างคือทั้งหมดที่เรายืนยันได้จริง
            </p>
          </div>

          {metricsVerified ? (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-6">
              {metrics.map((metric, index) => (
                <Figure
                  key={metric.label}
                  value={metric.value}
                  suffix={metric.suffix}
                  label={metric.label}
                  detail={metric.detail}
                  active={inView}
                  index={index}
                  reduced={reduced}
                />
              ))}
            </div>
          ) : (
            /* No verified figure may be shown — qualitative markers only. */
            <dl className="grid gap-6 sm:grid-cols-2">
              {capabilityMarkers.map((item) => (
                <div key={item.label}>
                  <dt className="thai-display text-base font-bold text-ink">{item.label}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-steel-500">{item.detail}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Supporting capability markers, clearly not numbers */}
        {metricsVerified ? (
          <div className="mt-16 border-t border-steel-200 pt-10">
            <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              {capabilityMarkers.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.07 }}
                >
                  <dt className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className="h-1 w-1 rounded-full bg-brand-500" />
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-xs leading-relaxed text-steel-500">{item.detail}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function Figure({
  value,
  suffix,
  label,
  detail,
  active,
  index,
  reduced
}: {
  value: number;
  suffix: string;
  label: string;
  detail: string;
  active: boolean;
  index: number;
  reduced: boolean;
}) {
  const count = useCountUp(value, { active, duration: 1500 + index * 350 });

  return (
    <div className="relative">
      <div className="flex items-start">
        <span className="thai-display text-mega font-bold leading-none tabular-nums text-ink">
          {count}
          {suffix ? <span className="text-brand-500">{suffix}</span> : null}
        </span>
      </div>

      {/* Moving green rule — the only motion after the counter settles */}
      <div className="relative mt-5 h-px w-full overflow-hidden bg-steel-200">
        <motion.span
          className="absolute inset-y-0 left-0 block w-full origin-left bg-brand-500"
          initial={reduced ? false : { scaleX: 0 }}
          animate={active || reduced ? { scaleX: 1 } : undefined}
          transition={{ duration: 1.1, delay: 0.3 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
        {!reduced ? (
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-y-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.85),transparent)] animate-beam-x'
            )}
            style={{ animationDelay: `${1.4 + index * 0.4}s`, animationDuration: '5s' }}
          />
        ) : null}
      </div>

      <p className="thai-display mt-5 text-lg font-bold text-ink sm:text-xl">{label}</p>
      <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-steel-500">{detail}</p>
    </div>
  );
}
