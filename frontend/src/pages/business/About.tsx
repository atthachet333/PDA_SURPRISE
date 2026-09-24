import { motion } from 'framer-motion';
import { PageHeader } from '@/components/business/PageHeader';
import { StrengthStatements } from '@/components/business/StrengthStatements';
import { VerifiedMetrics } from '@/components/business/VerifiedMetrics';
import { ProcessPath } from '@/components/business/ProcessPath';
import { BigCTA } from '@/components/business/BigCTA';
import { Container } from '@/components/shared/Layout';
import { aftercare, philosophy, standards } from '@/data/about';
import { company, targetMarket } from '@/data/company';
import { useLocale } from '@/app/LocaleContext';
import { aboutPage as copy, aftercareText, marketGroupText, philosophyText, standardText } from '@/i18n/about';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RevealLines } from '@/components/shared/RevealLines';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';

/**
 * /about — editorial, not a company bio block.
 *
 * One enormous statement carries the page; everything else is set as an essay
 * with a lot of air around it. The numbered philosophy items and the standards
 * are hairline rows rather than cards, so the only things that feel like objects
 * on this page are the statement and the one visual.
 */
export default function About() {
  usePageMeta(pageMeta.about);

  const reduced = useReducedMotion();
  const { t } = useLocale();
  const [quoteLead, quoteAccent] = t(copy.quote);
  const [marketLead, marketAccent] = t(copy.marketHeadline);

  return (
    <>
      <PageHeader
        eyebrow="01 / ABOUT"
        title={<>{t(copy.title)}</>}
        lead={t(copy.lead)}
      />

      {/* ------------------------------------------------- the big statement -- */}
      <section className="sect sect--bright relative overflow-hidden py-section">
        <Container className="relative">
          <p className="section-code">02 / STATEMENT</p>

          <RevealLines
            as="h2"
            className="thai-display mt-6 max-w-4xl text-mega font-bold text-ink"
            lines={[...t(copy.statementTitle)]}
            lineClassName={(index) => (index === 1 ? 'text-brand-600' : undefined)}
          />

          <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
            <div>
              <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-steel-400">
                {t(copy.whoHeading)}
              </p>
              <p className="mt-6 text-lead text-steel-700">{t(copy.whoBody)}</p>
              {[t(copy.secondParagraph)].map((paragraph) => (
                <motion.p
                  key={paragraph}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="mt-7 max-w-prose leading-8 text-steel-600"
                >
                  {paragraph}
                </motion.p>
              ))}

              <p className="mt-10 max-w-prose leading-8 text-steel-600">
                {t(copy.closing)}
              </p>
            </div>

            {/* The one strong visual on this page */}
            <div>
              <blockquote className="on-dark relative overflow-hidden rounded-panel border border-brand-400/20 bg-[linear-gradient(155deg,#063B2A_0%,#0B5137_52%,#04261B_100%)] p-8 text-white sm:p-10">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(53,201,111,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.1) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.3),transparent_66%)] blur-2xl"
                />
                <div className="relative">
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand-300">
                    our position
                  </p>
                  <p className="thai-display mt-6 text-statement font-bold leading-tight">
                    “{quoteLead}
                    <br />
                    <span className="text-brand-400">{quoteAccent}</span>”
                  </p>
                  <p className="mt-7 text-sm leading-7 text-brand-100/70">{t(copy.quoteSupport)}</p>
                  <p lang="th" className="mt-9 border-t border-white/10 pt-6 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-300/60">
                    {company.legalNameTh}
                  </p>
                </div>
              </blockquote>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------- philosophy -- */}
      <section className="sect sect--field relative overflow-hidden py-section">
        <div className="sect-layer field-lines opacity-70" aria-hidden="true" />
        <Container className="relative">
          <p className="section-code">03 / PHILOSOPHY</p>
          <h2 className="thai-display mt-4 max-w-2xl text-statement font-bold text-ink">
            {t(copy.philosophyTitle)}
          </h2>

          <ul className="mt-14 border-t border-steel-300/60">
            {philosophy.map((item, index) => (
              <motion.li
                key={item.heading}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.06 }}
                className="grid gap-4 border-b border-steel-300/60 py-9 lg:grid-cols-[4rem_minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10"
              >
                <span className="font-mono text-[0.6875rem] tabular-nums text-brand-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="thai-display text-lg font-bold text-ink sm:text-xl">
                  {philosophyText[index] ? t(philosophyText[index]!.heading) : item.heading}
                </h3>
                <p className="max-w-prose leading-7 text-steel-600">{philosophyText[index] ? t(philosophyText[index]!.body) : item.body}</p>
              </motion.li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ----------------------------------------------------- who we serve -- */}
      <section className="sect sect--bright relative overflow-hidden py-section">
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <p className="section-code">04 / WHO WE WORK WITH</p>
              <h2 className="thai-display mt-4 text-statement font-bold text-ink">
                {marketLead}
                <br />
                <span className="text-brand-600">{marketAccent}</span>
              </h2>
            </div>
            <div>
              <p className="text-lead text-steel-600">{t(copy.marketLead)}</p>
              <ul className="mt-10 grid gap-px overflow-hidden border border-steel-200 bg-steel-200 sm:grid-cols-2">
                {targetMarket.groups.map((group, index) => (
                  <li key={group.label} className="bg-white p-5">
                    <p className="thai-display text-sm font-bold text-ink">{marketGroupText[index] ? t(marketGroupText[index]!.label) : group.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-steel-500">{marketGroupText[index] ? t(marketGroupText[index]!.note) : group.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <StrengthStatements code="05 / WHY US" />
      <VerifiedMetrics code="06 / NUMBERS" />
      <ProcessPath code="07 / PROCESS" />

      {/* -------------------------------------------- standards + aftercare -- */}
      <section className="sect sect--deep relative overflow-hidden py-section text-white">
        <div
          className="sect-layer opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(53,201,111,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.07) 1px, transparent 1px)',
            backgroundSize: '72px 72px'
          }}
        />
        <Container className="relative">
          <p className="section-code text-brand-400">08 / STANDARDS</p>
          <h2 className="thai-display mt-4 max-w-2xl text-statement font-bold">
            {t(copy.standardsTitle)}
          </h2>

          <ul className="mt-14 border-t border-white/10">
            {standards.items.map((item, index) => (
              <motion.li
                key={item.heading}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="grid gap-4 border-b border-white/10 py-8 lg:grid-cols-[4rem_minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10"
              >
                <span className="font-mono text-[0.6875rem] tabular-nums text-brand-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="thai-display text-base font-bold text-white sm:text-lg">
                  {standardText[index] ? t(standardText[index]!.heading) : item.heading}
                </h3>
                <p className="max-w-prose text-sm leading-7 text-brand-100/65">{standardText[index] ? t(standardText[index]!.body) : item.body}</p>
              </motion.li>
            ))}
          </ul>

          <div className="mt-16">
            <h3 className="thai-display text-statement font-bold text-white">{t(copy.aftercareHeading)}</h3>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-brand-100/65">{t(copy.aftercareBody)}</p>
            <dl className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
              {aftercare.items.map((item, index) => (
                <div key={item.label} className="on-dark bg-[#04261B] p-5">
                  <dt className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-brand-400">
                    {aftercareText[index] ? t(aftercareText[index]!.label) : item.label}
                  </dt>
                  <dd className="mt-3 text-xs leading-6 text-brand-100/70">{aftercareText[index] ? t(aftercareText[index]!.value) : item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <BigCTA code="09 / START" />
    </>
  );
}
