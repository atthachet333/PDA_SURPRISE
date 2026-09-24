import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';
import { ProductPanel } from './ProductPanel';
import { capabilityMarkers, metrics, metricsVerified } from '@/data/company';
import { showreelVisuals } from '@/data/visuals';
import { useCountUp } from '@/hooks/useCountUp';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { useLocale } from '@/app/LocaleContext';
import { capabilityMarkerText, metricsCopy } from '@/i18n/home';
import { metricText } from '@/i18n/work';

/**
 * NUMBERS — the two verified figures, on their own dark ground.
 *
 * WHY DARK
 *   This was a plain white two-column band between other white sections, so it
 *   read as more of the same page rather than as a claim. Deep green gives the
 *   only two numbers PDA BLISS can substantiate somewhere to land, and breaks a
 *   long light run.
 *
 * WHAT IS PUBLISHED
 *   6 software systems and 4 websites. That is the entire list. Client counts,
 *   satisfaction percentages, years in business and revenue impact are NOT
 *   shown because nobody has measured them — see `unverifiedMetricKeys` in
 *   data/company.ts. `metricsVerified` still gates the figures: set it false and
 *   this falls back to qualitative markers with no number anywhere.
 *
 * The thumbnails drifting behind the figures are the same product mocks used
 * elsewhere, at low opacity — real product surfaces, not invented decoration.
 */
export function VerifiedMetrics({ code = '09 / NUMBERS' }: { code?: string } = {}) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.3 });
  const reduced = useReducedMotion();
  const { t } = useLocale();

  return (
    <section className="sect sect--deep relative overflow-hidden py-section text-white">
      <span aria-hidden="true" className="sect-edge-top sect-edge-top--dark" />

      {/* ---------------------------------------------------------- ground -- */}
      <div className="sect-layer" aria-hidden="true">
        <span
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'linear-gradient(rgba(53,201,111,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.09) 1px, transparent 1px)',
            backgroundSize: '54px 54px',
            maskImage: 'radial-gradient(80% 70% at 50% 50%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(80% 70% at 50% 50%, black, transparent)'
          }}
        />

        {/* System thumbnails drifting behind the figures */}
        <div className="absolute inset-y-0 right-0 hidden w-[46%] items-center lg:flex">
          <motion.div
            className="flex gap-6 opacity-[0.15]"
            animate={reduced ? undefined : { x: ['0%', '-50%'] }}
            transition={{ duration: 68, repeat: Infinity, ease: 'linear' }}
          >
            {/* Four slots, duplicated for the seamless -50% loop. `interactive
                = false` is required: this layer is aria-hidden, so real buttons
                here would be invisible keyboard traps. */}
            {[...showreelVisuals.slice(0, 4), ...showreelVisuals.slice(0, 4)].map((slot, index) => (
              <span
                key={`${slot.id}-${index}`}
                className="w-64 shrink-0 overflow-hidden rounded-card ring-1 ring-brand-400/25"
              >
                <span className="block aspect-[16/10]">
                  <ProductPanel slot={slot} className="h-full" frame="none" interactive={false} />
                </span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Data particles */}
        {!reduced
          ? [12, 34, 58, 76, 88].map((left, index) => (
              <span
                key={left}
                className="absolute h-1 w-1 rounded-full bg-brand-400/50 animate-plane-float"
                style={{
                  left: `${left}%`,
                  top: `${18 + ((index * 17) % 60)}%`,
                  animationDuration: `${7 + index * 1.6}s`,
                  animationDelay: `${index * 0.9}s`
                }}
              />
            ))
          : null}
      </div>

      <Container className="relative">
        <div ref={ref} className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="section-code text-brand-400">{code}</p>
            <h2 className="thai-display mt-3 text-statement font-bold text-white">
              {t(metricsCopy.title)[0]}
              <br />
              <span className="text-brand-400">{t(metricsCopy.title)[1]}</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-100/65">
              {t(metricsCopy.lead)}
            </p>
          </div>

          {metricsVerified ? (
            <div className="grid gap-10 sm:grid-cols-2 sm:gap-8">
              {metrics.map((metric, index) => (
                <Figure
                  key={metric.label}
                  value={metric.value}
                  suffix={metric.suffix}
                  label={metricText[index] ? t(metricText[index]!.label) : metric.label}
                  detail={metricText[index] ? t(metricText[index]!.detail) : metric.detail}
                  active={inView}
                  index={index}
                  reduced={reduced}
                />
              ))}
            </div>
          ) : (
            /* No verified figure may be shown — qualitative markers only. */
            <dl className="grid gap-6 sm:grid-cols-2">
              {capabilityMarkers.map((item, index) => (
                <div key={item.label}>
                  <dt className="thai-display text-base font-bold text-white">{capabilityMarkerText[index] ? t(capabilityMarkerText[index]!.label) : item.label}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-brand-100/65">{capabilityMarkerText[index] ? t(capabilityMarkerText[index]!.detail) : item.detail}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {metricsVerified ? (
          <div className="mt-14 border-t border-white/10 pt-9">
            <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              {capabilityMarkers.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.07 }}
                >
                  <dt className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="h-1 w-1 rounded-full bg-brand-400" />
                    {capabilityMarkerText[index] ? t(capabilityMarkerText[index]!.label) : item.label}
                  </dt>
                  <dd className="mt-2 text-xs leading-relaxed text-brand-100/60">{capabilityMarkerText[index] ? t(capabilityMarkerText[index]!.detail) : item.detail}</dd>
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
      <span className="thai-display block text-mega font-bold leading-none tabular-nums text-white">
        {count}
        {suffix ? <span className="text-brand-400">{suffix}</span> : null}
      </span>

      {/* Glowing rule that draws in under the figure */}
      <div className="relative mt-5 h-px w-full overflow-hidden bg-white/12">
        <motion.span
          className="absolute inset-y-0 left-0 block w-full origin-left bg-brand-400 shadow-brand-glow"
          initial={reduced ? false : { scaleX: 0 }}
          animate={active || reduced ? { scaleX: 1 } : undefined}
          transition={{ duration: 1.1, delay: 0.3 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
        {!reduced ? (
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-y-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)] animate-beam-x'
            )}
            style={{ animationDelay: `${1.4 + index * 0.4}s`, animationDuration: '5s' }}
          />
        ) : null}
      </div>

      <p className="thai-display mt-5 text-lg font-bold text-white sm:text-xl">{label}</p>
      <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-brand-100/60">{detail}</p>
    </div>
  );
}
