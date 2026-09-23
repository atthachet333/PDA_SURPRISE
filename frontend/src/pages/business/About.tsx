import { motion } from 'framer-motion';
import { PageHeader } from '@/components/business/PageHeader';
import { StrengthStatements } from '@/components/business/StrengthStatements';
import { VerifiedMetrics } from '@/components/business/VerifiedMetrics';
import { ProcessPath } from '@/components/business/ProcessPath';
import { BigCTA } from '@/components/business/BigCTA';
import { Container } from '@/components/shared/Layout';
import { aboutIntro, aftercare, philosophy, standards, statement, whoWeAre } from '@/data/about';
import { company, targetMarket } from '@/data/company';
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

  return (
    <>
      <PageHeader
        eyebrow="01 / ABOUT"
        title={<>เกี่ยวกับเรา</>}
        lead={aboutIntro.body[0]}
      />

      {/* ------------------------------------------------- the big statement -- */}
      <section className="sect sect--bright relative overflow-hidden py-section">
        <Container className="relative">
          <p className="section-code">02 / STATEMENT</p>

          <RevealLines
            as="h2"
            className="thai-display mt-6 max-w-4xl text-mega font-bold text-ink"
            lines={[...aboutIntro.title]}
            lineClassName={(index) => (index === 1 ? 'text-brand-600' : undefined)}
          />

          <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
            <div>
              <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-steel-400">
                {whoWeAre.heading}
              </p>
              <p className="mt-6 text-lead text-steel-700">{whoWeAre.body}</p>
              {aboutIntro.body.slice(1).map((paragraph) => (
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
                เราไม่ได้เริ่มจากฟีเจอร์ เราเริ่มจาก Workflow ปัญหา ข้อมูล
                และคนที่ต้องใช้งานระบบจริง
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
                    “{statement.quote[0]}
                    <br />
                    <span className="text-brand-400">{statement.quote[1]}</span>”
                  </p>
                  <p className="mt-7 text-sm leading-7 text-brand-100/70">{statement.support}</p>
                  <p className="mt-9 border-t border-white/10 pt-6 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-300/60">
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
            หลักที่ใช้ตัดสินใจในทุกโปรเจกต์
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
                  {item.heading}
                </h3>
                <p className="max-w-prose leading-7 text-steel-600">{item.body}</p>
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
                {targetMarket.headline[0]}
                <br />
                <span className="text-brand-600">{targetMarket.headline[1]}</span>
              </h2>
            </div>
            <div>
              <p className="text-lead text-steel-600">{targetMarket.lead}</p>
              <ul className="mt-10 grid gap-px overflow-hidden border border-steel-200 bg-steel-200 sm:grid-cols-2">
                {targetMarket.groups.map((group) => (
                  <li key={group.label} className="bg-white p-5">
                    <p className="thai-display text-sm font-bold text-ink">{group.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-steel-500">{group.note}</p>
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
            สร้างให้ดูแลต่อได้ตั้งแต่วันแรก
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
                  {item.heading}
                </h3>
                <p className="max-w-prose text-sm leading-7 text-brand-100/65">{item.body}</p>
              </motion.li>
            ))}
          </ul>

          <div className="mt-16">
            <h3 className="thai-display text-statement font-bold text-white">{aftercare.heading}</h3>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-brand-100/65">{aftercare.body}</p>
            <dl className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
              {aftercare.items.map((item) => (
                <div key={item.label} className="on-dark bg-[#04261B] p-5">
                  <dt className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-brand-400">
                    {item.label}
                  </dt>
                  <dd className="mt-3 text-xs leading-6 text-brand-100/70">{item.value}</dd>
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
