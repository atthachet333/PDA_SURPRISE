import { motion } from 'framer-motion';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { Container, Reveal, Section } from '@/components/shared/Layout';
import { CTASection } from '@/components/business/CTASection';
import { MiniChart, MiniFlow, MiniKanban, MiniTable } from '@/components/business/UIPreview';
import { caseStudies, caseStudiesVerified, getCaseStudy, unverifiedResultLabel } from '@/data/work';

const SCREEN_PREVIEW = {
  dashboard: MiniChart,
  table: MiniTable,
  flow: MiniFlow,
  mobile: MiniKanban
} as const;

export default function WorkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const study = slug ? getCaseStudy(slug) : undefined;

  if (!study) return <Navigate to="/work" replace />;

  const index = caseStudies.findIndex((item) => item.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <>
      <section className="relative overflow-hidden border-b border-steel-200 pb-16 pt-32 sm:pt-40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hairline-grid opacity-60 [mask-image:radial-gradient(60%_80%_at_30%_0%,black,transparent)]"
        />
        <Container className="relative">
          <Link
            to="/work"
            className="group inline-flex items-center gap-2 text-sm text-steel-500 transition-colors hover:text-ink"
          >
            <ArrowIcon className="rotate-180 transition-transform duration-base group-hover:-translate-x-1" />
            กลับไปหน้าผลงาน
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-steel-400">
            <span className="rounded-pill border border-steel-200 px-3 py-1 font-medium text-steel-600">
              {study.projectType}
            </span>
            <span>{study.industry}</span>
            <span className="h-3 w-px bg-steel-200" />
            <span className="font-mono">{study.year}</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-4xl text-display font-semibold text-ink"
          >
            {study.title}
          </motion.h1>

          <p className="mt-7 max-w-2xl text-lead text-steel-600">{study.summary}</p>

          {caseStudiesVerified ? <dl className="mt-12 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-3">
            {study.results.map((result) => (
              <div key={result.label} className="bg-white p-6">
                <dt className="text-xs text-steel-500">{result.label}</dt>
                <dd className="mt-2 text-2xl font-semibold tabular-nums text-ink">{result.value}</dd>
              </div>
            ))}
          </dl> : <div className="mt-10 inline-flex rounded-pill border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">{unverifiedResultLabel} · ไม่มีการแสดงผลลัพธ์ที่ยังไม่ผ่านการยืนยัน</div>}
        </Container>
      </section>

      <Section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <Reveal>
              <div>
                <h2 className="eyebrow">โจทย์ของระบบ</h2>
                <p className="mt-5 text-[0.975rem] leading-relaxed text-steel-600">{study.problem}</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <h2 className="eyebrow">แนวทางที่ออกแบบ</h2>
                <p className="mt-5 text-[0.975rem] leading-relaxed text-steel-600">{study.solution}</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="mt-16 border-t border-steel-200 pt-8">
              <h2 className="eyebrow">เทคโนโลยี</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {study.technology.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-pill border border-steel-200 px-3.5 py-1.5 text-xs font-medium text-steel-600"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="muted" className="py-20 sm:py-24">
        <Container>
          <h2 className="eyebrow">ภาพจำลองระบบ</h2>
          <p className="mt-4 max-w-xl text-lead text-steel-600">
            ภาพหน้าจอด้านล่างเป็นแบบจำลองเพื่อสื่อสารแนวทางเท่านั้น ไม่ใช่ข้อมูล Production ของลูกค้า
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {study.screens.map((screen, screenIndex) => {
              const Preview = SCREEN_PREVIEW[screen.kind];
              return (
                <motion.figure
                  key={screen.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: screenIndex * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden rounded-panel border border-steel-200 bg-white"
                >
                  <div className="flex items-center gap-1.5 border-b border-steel-200 px-4 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-steel-200" />
                    <span className="h-2 w-2 rounded-full bg-steel-200" />
                    <span className="h-2 w-2 rounded-full bg-steel-200" />
                    <span className="ml-2 truncate text-[0.625rem] text-steel-400">{screen.title}</span>
                  </div>
                  <div className="h-40 p-5">
                    <Preview />
                  </div>
                  <figcaption className="border-t border-steel-100 px-5 py-4 text-xs leading-relaxed text-steel-500">
                    {screen.caption}
                  </figcaption>
                </motion.figure>
              );
            })}
          </div>
        </Container>
      </Section>

      {next ? (
        <Section className="py-16">
          <Container>
            <Link
              to={`/work/${next.slug}`}
              className="group flex flex-wrap items-end justify-between gap-6 rounded-panel border border-steel-200 bg-white p-8 transition-all duration-slow ease-smooth hover:-translate-y-1 hover:shadow-lift"
            >
              <div>
                <p className="eyebrow">ตัวอย่างถัดไป</p>
                <p className="mt-3 text-title font-semibold text-ink">{next.title}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-steel-200 text-ink transition-colors group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600">
                <ArrowIcon className="h-5 w-5" />
              </span>
            </Link>
          </Container>
        </Section>
      ) : null}

      <CTASection />
    </>
  );
}

export function WorkDetailFallback() {
  return (
    <Container className="py-40">
      <ButtonLink to="/work">Back to work</ButtonLink>
    </Container>
  );
}
