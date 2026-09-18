import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { Container, Reveal, Section, SectionHeading } from '@/components/shared/Layout';
import { Icon } from '@/components/shared/Icon';
import { HeroCanvas } from '@/components/business/HeroCanvas';
import { HeroPanels } from '@/components/business/HeroPanels';
import { Metrics } from '@/components/business/Metrics';
import { WorkCard } from '@/components/business/WorkCard';
import { CTASection } from '@/components/business/CTASection';
import { capabilities, company, cta, process, techStack } from '@/data/company';
import { services } from '@/data/services';
import { caseStudies, workIntro } from '@/data/work';

export default function Home() {
  return (
    <>
      <Hero />
      <Metrics />
      <ServicesPreview />
      <SelectedWork />
      <Process />
      <Technology />
      <Capabilities />
      <CTASection />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40 lg:pb-36 lg:pt-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hairline-grid opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]"
      />
      <HeroCanvas className="pointer-events-none absolute inset-0 -z-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-brand-100/50 blur-3xl"
      />

      <Container className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 rounded-pill border border-steel-200 bg-white/80 py-1.5 pl-1.5 pr-4 backdrop-blur"
            >
              <span className="rounded-pill bg-brand-50 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-700">
                {company.foundedVerified ? `SINCE ${company.founded}` : company.heroBadge}
              </span>
              <span className="text-xs text-steel-500">Software &amp; Business Systems · Thailand</span>
            </motion.div>

            <h1 className="mt-7 text-display font-semibold text-ink">
              {['เปลี่ยนไอเดียของคุณ', 'ให้เป็นระบบ', 'ที่ใช้งานได้จริง'].map((word, index) => (
                <span key={word} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, delay: 0.1 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {index === 2 ? <span className="text-gradient-brand">{word}</span> : word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-xl text-lead text-steel-600"
            >
              {company.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.56, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <ButtonLink to="/contact" size="lg">
                {cta.primary.label}
                <ArrowIcon />
              </ButtonLink>
              <ButtonLink to="/work" size="lg" variant="secondary">
                {cta.secondary.label}
              </ButtonLink>
            </motion.div>
          </div>

          <HeroPanels className="h-[22rem] sm:h-[26rem] lg:h-[32rem]" />
        </div>
      </Container>
    </section>
  );
}

function ServicesPreview() {
  const featured = services.slice(0, 6);

  return (
    <Section tone="muted">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="บริการของเรา"
            title="ซอฟต์แวร์ที่เริ่มจากงานจริง ไม่ใช่รายการฟีเจอร์"
            lead="ทีมเดียวดูแลตั้งแต่ทำความเข้าใจ Workflow ออกแบบ พัฒนา เชื่อมต่อ ไปจนถึงดูแลหลังใช้งาน"
          />
          <Reveal delay={0.2}>
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-brand-600"
            >
              ดูบริการทั้งหมด
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-white p-7 transition-colors duration-slow hover:bg-steel-50"
            >
              <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-brand-500 transition-transform duration-slow ease-smooth group-hover:scale-x-100" />
              <span className="flex h-11 w-11 items-center justify-center rounded-card border border-steel-200 bg-white text-steel-500 transition-colors duration-base group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-base font-semibold text-ink">{service.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-steel-500">{service.summary}</p>
              <Link
                to={`/services#${service.id}`}
                className="absolute inset-0"
              aria-label={`ดูรายละเอียด ${service.title}`}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function SelectedWork() {
  const selected = caseStudies.slice(0, 3);

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow={workIntro.eyebrow}
          title={<>{workIntro.title[0]}<br />{workIntro.title[1]}</>}
          lead={workIntro.lead}
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {selected.map((study, index) => (
            <WorkCard key={study.slug} study={study} index={index} featured={index === 0} />
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-12">
            <ButtonLink to="/work" variant="secondary" size="md">
              ดูตัวอย่างทั้งหมด
              <ArrowIcon />
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function Process() {
  return (
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="กระบวนการทำงาน"
          title="หกขั้นตอนที่มองเห็นความคืบหน้าได้ตลอด"
          lead="เริ่มจากการเข้าใจงานจริง ส่งมอบเป็นรอบ และวางแผนดูแลต่อหลังระบบขึ้น Production"
        />

        <ol className="mt-16 grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 md:grid-cols-2 lg:grid-cols-3">
          {process.map((step, index) => (
            <motion.li
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col bg-white p-7"
            >
              <span className="font-mono text-xs text-brand-500">{step.step}</span>
              <h3 className="mt-5 text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel-500">{step.body}</p>
              <span
                aria-hidden="true"
                className="mt-6 block h-px w-0 bg-brand-500 transition-all duration-cinematic ease-smooth group-hover:w-full"
              />
            </motion.li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function Technology() {
  return (
    <Section>
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading
            eyebrow="TRUSTED TECHNOLOGY"
            title="เลือกเทคโนโลยีเพื่อปีที่สอง ไม่ใช่แค่ Sprint แรก"
            lead="เครื่องมือที่มีชุมชนแข็งแรง รองรับระยะยาว และหาทีมดูแลต่อได้ เพื่อให้ระบบยังพัฒนาได้หลังส่งมอบ"
          />

          <div className="grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-2">
            {techStack.map((group, index) => (
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
                className="bg-white p-6"
              >
                <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-steel-400">
                  {group.group}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item.name}
                      className="rounded-pill border border-steel-200 px-3 py-1.5 text-xs font-medium text-steel-600 transition-colors duration-base hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <span title={item.note}>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Capabilities() {
  return (
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="สิ่งที่คุณได้รับ"
          title="การส่งมอบที่ไม่จบแค่วันขึ้นระบบ"
          align="center"
        />
        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2">
          {capabilities.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.07 }}
              className="rounded-panel border border-steel-200 bg-white p-7"
            >
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                    <path
                      d="M2.5 6.2 5 8.7l4.5-5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel-500">{item.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
