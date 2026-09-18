import { motion } from 'framer-motion';
import { capabilityMarkers, metrics, metricsVerified } from '@/data/company';
import { useCountUp } from '@/hooks/useCountUp';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { Container } from '@/components/shared/Layout';

/**
 * Homepage trust strip.
 *
 * Numeric metrics are only rendered once `metricsVerified` is true in
 * data/company.ts. Until the owner supplies figures they can substantiate, the
 * qualitative strip is shown instead — the layout is identical, so nothing
 * shifts when the real numbers land.
 */
export function Metrics() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.35 });

  return (
    <div ref={ref} className="border-y border-steel-200 bg-white">
      <Container>
        {metricsVerified ? (
          <dl className="grid grid-cols-2 divide-steel-200 md:grid-cols-4 md:divide-x">
            {metrics.map((metric, index) => (
              <Metric key={metric.label} {...metric} active={inView} delay={index * 140} />
            ))}
          </dl>
        ) : (
          <dl className="grid grid-cols-1 divide-y divide-steel-200 sm:grid-cols-2 sm:divide-y-0 md:grid-cols-4 md:divide-x">
            {capabilityMarkers.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="px-2 py-7 first:pl-0 md:px-8 md:py-11"
              >
                <dt className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                  <span className="h-1 w-1 rounded-full bg-brand-500" />
                  {item.label}
                </dt>
                <dd className="mt-2.5 max-w-[32ch] text-xs leading-relaxed text-steel-500">
                  {item.detail}
                </dd>
              </motion.div>
            ))}
          </dl>
        )}
      </Container>
    </div>
  );
}

function Metric({
  value,
  suffix,
  label,
  detail,
  active,
  delay
}: {
  value: number;
  suffix: string;
  label: string;
  detail: string;
  active: boolean;
  delay: number;
}) {
  const count = useCountUp(value, { active, duration: 1600 + delay });

  return (
    <div className="px-2 py-8 first:pl-0 md:px-8 md:py-12">
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block text-[clamp(2rem,3.4vw,3rem)] font-semibold tabular-nums leading-none tracking-[-0.03em] text-ink">
          {count}
          <span className="text-brand-500">{suffix}</span>
        </span>
        <span className="mt-3 block text-sm font-medium text-ink">{label}</span>
        <span className="mt-1.5 block max-w-[24ch] text-xs leading-relaxed text-steel-500">{detail}</span>
      </dd>
    </div>
  );
}
