import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { RevealLines } from '@/components/shared/RevealLines';
import { ProductPanel } from './ProductPanel';
import { heroVisuals } from '@/data/visuals';
import { company, cta } from '@/data/company';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocale } from '@/app/LocaleContext';
import { bigCta, channel as channelText } from '@/i18n/ui';
import { businessHours } from '@/i18n/company';
import { cn } from '@/lib/cn';

/**
 * START — the finale.
 *
 * Deep green and full-bleed, with a data horizon behind it and a floating
 * device stack on the right so the closing screen is not half empty.
 *
 * THE HEADLINE BUG THIS FIXES
 *   This heading used a framer mask reveal whose DEFAULT state was
 *   `translateY(108%)` inside `overflow: hidden`. Any failure to complete the
 *   animation — a backgrounded tab pausing rAF, a throttled browser, a
 *   `whileInView` observer that never fired — left the text clipped outside its
 *   own box, and the section rendered blank. It now uses `RevealLines`, whose
 *   resting state is visible and which disarms itself on a watchdog.
 *
 * Contact details come from the central config; nothing here is literal.
 */

const [PRIMARY, , DOCS] = heroVisuals;

export function BigCTA({ code = '12 / START' }: { code?: string } = {}) {
  const reduced = useReducedMotion();
  const { t } = useLocale();

  return (
    <section className="sect sect--immersive relative overflow-hidden py-section text-white">
      <span aria-hidden="true" className="sect-edge-top sect-edge-top--dark" />

      {/* ---------------------------------------------------- data horizon -- */}
      <div className="sect-layer" aria-hidden="true">
        <span
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(53,201,111,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.1) 1px, transparent 1px)',
            backgroundSize: '58px 58px',
            maskImage: 'radial-gradient(90% 80% at 40% 50%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(90% 80% at 40% 50%, black, transparent)'
          }}
        />

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
                stroke="rgba(53,201,111,0.3)"
                strokeWidth="0.2"
                vectorEffect="non-scaling-stroke"
              />
              {!reduced ? (
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

        {!reduced ? (
          <span className="absolute inset-y-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(53,201,111,0.1),transparent)] animate-beam-x" />
        ) : null}
      </div>

      <Container wide className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          {/* ------------------------------------------------------- copy -- */}
          <div>
            <p className="section-code text-brand-300">{code}</p>

            <RevealLines
              as="h2"
              className="thai-display mt-5 text-mega font-bold"
              /* Three explicit lines: the narrower column beside the device
                 stack wrapped the long second line mid-phrase. */
              lines={[...t(bigCta.lines)]}
              lineClassName={(index) => (index >= 1 ? 'text-brand-300' : undefined)}
            />

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-7 max-w-xl"
            >
              <p className="text-lead text-brand-100/85">{t(bigCta.lead)}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-brand-100/65">{t(bigCta.body)}</p>
            </motion.div>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <ButtonLink
                to="/contact"
                size="lg"
                data-cursor="cta"
                className="bg-white text-brand-800 hover:bg-brand-50"
              >
                {t(cta.primary.label)}
                <ArrowIcon />
              </ButtonLink>
              <ButtonLink
                to={`tel:${company.phone}`}
                size="lg"
                variant="ghost"
                className="border border-white/25 text-white hover:bg-white/10"
              >
                {t(cta.talk.label)}
              </ButtonLink>
            </motion.div>

            <ContactStrip reduced={reduced} />
          </div>

          {/* ------------------------------------------- right: device stack -- */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/3]">
              <motion.div
                className="absolute right-0 top-0 w-[68%] overflow-hidden rounded-card opacity-80 shadow-lift-lg ring-1 ring-brand-400/20"
                animate={reduced ? undefined : { y: [0, -9, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="aspect-[16/10]">
                  {DOCS ? <ProductPanel slot={DOCS} className="h-full" frame="none" /> : null}
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-0 left-0 w-[78%] overflow-hidden rounded-card shadow-lift-lg ring-1 ring-brand-400/25"
                animate={reduced ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              >
                <div className="aspect-[16/10]">
                  {PRIMARY ? <ProductPanel slot={PRIMARY} className="h-full" frame="none" /> : null}
                </div>
              </motion.div>

              {/* Schematic accent tying the two panels together */}
              <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <path
                  d="M22 62 C 40 58, 52 40, 74 26"
                  fill="none"
                  stroke="rgba(127,217,166,0.45)"
                  strokeWidth="0.4"
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx="22" cy="62" r="1.4" fill="#7FD9A6" />
                <circle cx="74" cy="26" r="1.4" fill="#7FD9A6" />
              </svg>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ contact strip -- */

/** The three real channels, at a readable size. All from the central config. */
function ContactStrip({ reduced }: { reduced: boolean }) {
  const { t } = useLocale();
  const channels = [
    { label: company.phoneDisplay, href: `tel:${company.phone}`, hint: t(channelText.phone), icon: 'phone' as const },
    { label: company.email, href: `mailto:${company.email}`, hint: t(channelText.email), icon: 'mail' as const },
    {
      label: company.lineOA,
      href: company.lineUrl,
      hint: t(channelText.line),
      icon: 'chat' as const,
      external: true
    }
  ];

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.45 }}
      className="mt-10 border-t border-white/12 pt-7"
    >
      <p className="flex items-center gap-2 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-300/70">
        <span
          className={cn('h-1.5 w-1.5 rounded-full bg-brand-400', !reduced && 'animate-status-blink')}
        />
        {t(businessHours.note)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-4">
        {channels.map((channel, index) => (
          <span key={channel.icon} className="flex items-center gap-5">
            <a
              href={channel.href}
              target={channel.external ? '_blank' : undefined}
              rel={channel.external ? 'noopener noreferrer' : undefined}
              className="group flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-brand-300 transition-colors duration-base group-hover:border-brand-400/60 group-hover:bg-brand-500/15 group-hover:text-brand-200">
                <ChannelIcon kind={channel.icon} />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[0.5rem] uppercase tracking-[0.16em] text-brand-300/60">
                  {channel.hint}
                </span>
                <span className="block truncate text-sm font-medium text-white transition-colors duration-base group-hover:text-brand-200">
                  {channel.label}
                </span>
              </span>
            </a>
            {index < channels.length - 1 ? (
              <span aria-hidden="true" className="hidden h-9 w-px bg-white/12 sm:block" />
            ) : null}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function ChannelIcon({ kind }: { kind: 'phone' | 'mail' | 'chat' }) {
  const common = {
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-4 w-4',
    'aria-hidden': true
  };
  if (kind === 'phone') {
    return (
      <svg {...common}>
        <path d="M6.5 3.5 8 6.5 6.5 8a9 9 0 0 0 5 5L13 11.5l3 1.5v3a1 1 0 0 1-1.1 1A12.5 12.5 0 0 1 3.5 4.6 1 1 0 0 1 4.5 3.5Z" />
      </svg>
    );
  }
  if (kind === 'mail') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="14" height="10" rx="2" />
        <path d="m3.8 6 6.2 4.5L16.2 6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M17 11.5a2 2 0 0 1-2 2H8l-4 3V5.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2Z" />
    </svg>
  );
}
