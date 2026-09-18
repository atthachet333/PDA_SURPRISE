import { motion } from 'framer-motion';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowIcon } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import { BigCTA } from '@/components/business/BigCTA';
import { ProjectVisual } from '@/components/business/ProjectVisual';
import { MiniChart, MiniFlow, MiniKanban, MiniTable } from '@/components/business/UIPreview';
import { getPortfolioItem, portfolio, type PortfolioItem } from '@/data/portfolio';
import {
  caseStudies,
  caseStudiesVerified,
  getCaseStudy,
  unverifiedResultLabel,
  type CaseStudy
} from '@/data/work';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * /work/:slug — editorial case study.
 *
 * Resolves against BOTH sources, in order:
 *   1. `data/portfolio.ts`  a REAL system (matched on `id`)
 *   2. `data/work.ts`       an ILLUSTRATIVE approach example (matched on `slug`)
 *
 * They render as the same editorial structure but say different things, and the
 * page never blurs the two: a real system carries no outcome figures because
 * none were measured, and an approach example carries a badge saying it is not a
 * named client project.
 *
 * Numbered sections, oversized numerals, full-bleed visual moments, sticky
 * metadata. Screenshots appear only when a reviewed, public-safe one exists;
 * otherwise the branded ProjectVisual stands in (see docs/SCREENSHOT_PRIVACY.md).
 */

const SCREEN_PREVIEW = {
  dashboard: MiniChart,
  table: MiniTable,
  flow: MiniFlow,
  mobile: MiniKanban
} as const;

export default function WorkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? getPortfolioItem(slug) : undefined;
  const study = !item && slug ? getCaseStudy(slug) : undefined;

  if (item) return <RealSystem item={item} />;
  if (study) return <ApproachExample study={study} />;
  return <Navigate to="/work" replace />;
}

/* ------------------------------------------------------------- real system -- */

function RealSystem({ item }: { item: PortfolioItem }) {
  const reduced = useReducedMotion();
  const index = portfolio.findIndex((entry) => entry.id === item.id);
  const next = portfolio[(index + 1) % portfolio.length];
  const reviewed = item.publicSafe ? item.screenshots.filter((shot) => shot.reviewed) : [];

  return (
    <>
      {/* ---------------------------------------------------- 01 ภาพรวม -- */}
      <section className="sect sect--deep relative overflow-hidden pb-16 pt-32 text-white sm:pt-40">
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
          <BackLink dark />

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="rounded-pill border border-brand-400/30 px-3 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-300">
              {item.titleEn}
            </span>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-400/70">
              {item.category}
            </span>
          </div>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="thai-display mt-7 max-w-4xl text-mega font-bold"
          >
            {item.titleTh}
          </motion.h1>

          <p className="mt-8 max-w-2xl text-lead text-brand-100/75">{item.summary}</p>
        </Container>
      </section>

      {/* Full-bleed visual moment */}
      <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[21/8]">
        <ProjectVisual item={item} />
      </div>

      <section className="sect sect--bright relative py-section">
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,1fr)] lg:gap-16">
            {/* ------------------------------------------ sticky metadata -- */}
            <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <dl className="space-y-5 border-t border-steel-200 pt-6">
                <MetaRow label="ประเภทระบบ" value={item.titleEn} />
                <MetaRow label="หมวด" value={item.category} />
                <MetaRow label="สถานะ" value="ส่งมอบแล้ว" />
                <div>
                  <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-steel-400">
                    เทคโนโลยี
                  </dt>
                  <dd className="mt-3 flex flex-wrap gap-1.5">
                    {item.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-pill border border-steel-200 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-steel-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </aside>

            <div className="min-w-0 space-y-16">
              {/* Problem and solution are only published for items whose
                  description the owner has confirmed. */}
              {item.verified ? (
                <>
                  <EditorialBlock code="02" heading="ปัญหาของระบบเดิม" body={item.problem} />
                  <EditorialBlock code="03" heading="แนวทางแก้ไข" body={item.solution} />
                </>
              ) : (
                <EditorialBlock
                  code="02"
                  heading="ภาพรวมระบบ"
                  body={`${item.summary} รายละเอียดโจทย์และแนวทางการพัฒนาของระบบนี้อยู่ระหว่างการเรียบเรียงร่วมกับเจ้าของระบบ ก่อนเผยแพร่ต่อสาธารณะ`}
                />
              )}

              {/* 04 Workflow */}
              <div>
                <SectionNumber code="04" heading="Workflow" />
                {/* min-w-0 above lets this actually scroll instead of widening the page. */}
                <div className="mt-8 max-w-full overflow-x-auto">
                  <WorkflowDiagram features={item.features} />
                </div>
              </div>

              {/* 05 Features */}
              <div>
                <SectionNumber code="05" heading="ฟีเจอร์หลัก" />
                <ul className="mt-8 grid gap-px overflow-hidden border border-steel-200 bg-steel-200 sm:grid-cols-2">
                  {item.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={reduced ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: (featureIndex % 2) * 0.06 }}
                      className="flex items-start gap-4 bg-white p-6"
                    >
                      <span className="font-mono text-[0.625rem] tabular-nums text-brand-500">
                        {String(featureIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm leading-relaxed text-steel-600">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* 06 Technology */}
              <div>
                <SectionNumber code="06" heading="เทคโนโลยี" />
                <ul className="mt-8 flex flex-wrap gap-2">
                  {item.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-pill border border-steel-200 px-4 py-2 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-steel-600"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 07 Screenshots */}
              <div>
                <SectionNumber code="07" heading="ภาพหน้าจอ" />
                {reviewed.length > 0 ? (
                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    {reviewed.map((shot) => (
                      <figure
                        key={shot.src}
                        className="overflow-hidden rounded-panel border border-steel-200 bg-white"
                      >
                        <img
                          src={shot.src}
                          alt={shot.caption}
                          loading="lazy"
                          decoding="async"
                          className="w-full"
                        />
                        <figcaption className="border-t border-steel-100 px-5 py-4 text-xs leading-relaxed text-steel-500">
                          {shot.caption}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="aspect-[16/9] overflow-hidden rounded-panel border border-steel-200">
                      <ProjectVisual item={item} density="compact" />
                    </div>
                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-steel-500">
                      ภาพหน้าจอจริงของระบบนี้ยังไม่เผยแพร่ เพราะมีข้อมูลของลูกค้าและพนักงานอยู่ในหน้าจอ
                      เราจะเผยแพร่เมื่อปิดข้อมูลส่วนบุคคลเรียบร้อยและได้รับอนุญาตแล้ว
                    </p>
                  </div>
                )}
              </div>

              {/* 08 Summary — description only. No outcome figures exist. */}
              <div>
                <SectionNumber code="08" heading="สรุป" />
                <p className="mt-8 max-w-2xl text-lead text-steel-600">{item.summary}</p>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-steel-500">
                  เราไม่แสดงตัวเลขผลลัพธ์ของระบบนี้ เพราะยังไม่มีการวัดผลร่วมกับลูกค้าอย่างเป็นทางการ
                  ถ้าคุณอยากรู้ว่าระบบลักษณะนี้เหมาะกับธุรกิจของคุณหรือไม่ คุยกับเราได้โดยตรง
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {next && next.id !== item.id ? <NextProject to={`/work/${next.id}`} title={next.titleTh} /> : null}
      <BigCTA code="09 / START" />
    </>
  );
}

/* -------------------------------------------------------- approach example -- */

function ApproachExample({ study }: { study: CaseStudy }) {
  const reduced = useReducedMotion();
  const index = caseStudies.findIndex((entry) => entry.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <>
      <section className="sect sect--hero relative overflow-hidden pb-16 pt-32 sm:pt-40">
        <div
          className="sect-layer opacity-50"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,59,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(6,59,42,0.045) 1px, transparent 1px)',
            backgroundSize: '84px 84px'
          }}
        />
        <Container className="relative">
          <BackLink />

          <div className="mt-10 flex flex-wrap items-center gap-3 text-xs text-steel-400">
            <span className="rounded-pill border border-steel-200 bg-white px-3 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-600">
              {study.projectType}
            </span>
            <span>{study.industry}</span>
            <span className="h-3 w-px bg-steel-300" />
            <span className="font-mono">{study.year}</span>
          </div>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="thai-display mt-7 max-w-4xl text-mega font-bold text-ink"
          >
            {study.title}
          </motion.h1>

          <p className="mt-8 max-w-2xl text-lead text-steel-600">{study.summary}</p>

          {/* The badge is the point: this is not a named client project. */}
          {caseStudiesVerified ? (
            <dl className="mt-12 grid max-w-3xl gap-px overflow-hidden border border-steel-200 bg-steel-200 sm:grid-cols-3">
              {study.results.map((result) => (
                <div key={result.label} className="bg-white p-6">
                  <dt className="text-xs text-steel-500">{result.label}</dt>
                  <dd className="mt-2 text-2xl font-semibold tabular-nums text-ink">
                    {result.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="mt-11 inline-flex max-w-xl items-start gap-3 rounded-panel border border-steel-300 bg-white px-5 py-4">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-steel-400" />
              <p className="text-xs leading-relaxed text-steel-500">
                <span className="font-semibold text-steel-600">{unverifiedResultLabel}</span> —
                หน้านี้อธิบายรูปแบบของงานที่เราออกแบบ ไม่ใช่โปรเจกต์ที่ระบุชื่อลูกค้าได้
                และไม่มีการแสดงตัวเลขผลลัพธ์
              </p>
            </div>
          )}
        </Container>
      </section>

      <section className="sect sect--bright relative py-section">
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,1fr)] lg:gap-16">
            <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <dl className="space-y-5 border-t border-steel-200 pt-6">
                <MetaRow label="ประเภทงาน" value={study.projectType} />
                <MetaRow label="อุตสาหกรรม" value={study.industry} />
                <MetaRow label="ปี" value={String(study.year)} />
                <MetaRow label="ลูกค้า" value={study.client} />
              </dl>
            </aside>

            <div className="min-w-0 space-y-16">
              <EditorialBlock code="02" heading="ปัญหาของระบบเดิม" body={study.problem} />
              <EditorialBlock code="03" heading="แนวทางแก้ไข" body={study.solution} />

              <div>
                <SectionNumber code="04" heading="Workflow" />
                <ol className="mt-8 grid gap-px overflow-hidden border border-steel-200 bg-steel-200 sm:grid-cols-2">
                  {study.approach.map((step, stepIndex) => (
                    <li key={step.step} className="bg-white p-6">
                      <span className="font-mono text-[0.625rem] tabular-nums text-brand-500">
                        {String(stepIndex + 1).padStart(2, '0')}
                      </span>
                      <h4 className="thai-display mt-4 text-base font-bold text-ink">{step.step}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-steel-500">{step.body}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <SectionNumber code="05" heading="ฟีเจอร์หลัก" />
                <ul className="mt-8 grid gap-px overflow-hidden border border-steel-200 bg-steel-200 sm:grid-cols-2">
                  {study.features.map((feature, featureIndex) => (
                    <li key={feature} className="flex items-start gap-4 bg-white p-6">
                      <span className="font-mono text-[0.625rem] tabular-nums text-brand-500">
                        {String(featureIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm leading-relaxed text-steel-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <SectionNumber code="06" heading="เทคโนโลยี" />
                <ul className="mt-8 flex flex-wrap gap-2">
                  {study.technology.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-pill border border-steel-200 px-4 py-2 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-steel-600"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <SectionNumber code="07" heading="ภาพจำลองระบบ" />
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-steel-500">
                  ภาพด้านล่างเป็นแบบจำลองเพื่อสื่อสารแนวทางเท่านั้น ไม่ใช่ข้อมูล Production ของลูกค้า
                </p>
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  {study.screens.map((screen, screenIndex) => {
                    const Preview = SCREEN_PREVIEW[screen.kind];
                    return (
                      <motion.figure
                        key={screen.title}
                        initial={reduced ? false : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: screenIndex * 0.08 }}
                        className="overflow-hidden rounded-panel border border-steel-200 bg-white"
                      >
                        <div className="flex items-center gap-1.5 border-b border-steel-100 bg-steel-50/70 px-4 py-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-steel-300" />
                          <span className="h-1.5 w-1.5 rounded-full bg-steel-300" />
                          <span className="ml-2 truncate font-mono text-[0.5rem] uppercase tracking-[0.14em] text-steel-400">
                            {screen.title}
                          </span>
                        </div>
                        <div className="h-36 p-5">
                          <Preview className="h-full" />
                        </div>
                        <figcaption className="border-t border-steel-100 px-5 py-4 text-xs leading-relaxed text-steel-500">
                          {screen.caption}
                        </figcaption>
                      </motion.figure>
                    );
                  })}
                </div>
              </div>

              <div>
                <SectionNumber code="08" heading="สรุป" />
                <p className="mt-8 max-w-2xl text-lead text-steel-600">{study.summary}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {next && next.slug !== study.slug ? (
        <NextProject to={`/work/${next.slug}`} title={next.title} />
      ) : null}
      <BigCTA code="09 / START" />
    </>
  );
}

/* ------------------------------------------------------------------ pieces -- */

function BackLink({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      to="/work"
      className={cn(
        'group inline-flex items-center gap-2 text-sm transition-colors',
        dark ? 'text-brand-100/60 hover:text-white' : 'text-steel-500 hover:text-ink'
      )}
    >
      <ArrowIcon className="rotate-180 transition-transform duration-base group-hover:-translate-x-1" />
      กลับไปหน้าผลงาน
    </Link>
  );
}

function SectionNumber({ code, heading }: { code: string; heading: string }) {
  return (
    <div className="flex items-baseline gap-5 border-t border-steel-200 pt-7">
      <span className="font-mono text-numeral font-medium leading-none text-steel-200">{code}</span>
      <h2 className="thai-display text-statement font-bold text-ink">{heading}</h2>
    </div>
  );
}

function EditorialBlock({
  code,
  heading,
  body
}: {
  code: string;
  heading: string;
  body: string;
}) {
  return (
    <div>
      <SectionNumber code={code} heading={heading} />
      <p className="mt-8 max-w-2xl text-lead text-steel-600">{body}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-steel-400">
        {label}
      </dt>
      <dd className="thai-display mt-2 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

/** A minimal workflow diagram derived from the item's own feature list. */
function WorkflowDiagram({ features }: { features: string[] }) {
  const steps = features.slice(0, 4);
  return (
    <ol className="flex min-w-[36rem] items-stretch gap-3">
      {steps.map((step, index) => (
        <li key={step} className="flex flex-1 items-center gap-3">
          <div
            className={cn(
              'flex min-h-[7rem] flex-1 flex-col justify-between rounded-card border p-4',
              index === steps.length - 1
                ? 'border-brand-300 bg-brand-50'
                : 'border-steel-200 bg-white'
            )}
          >
            <span
              className={cn(
                'font-mono text-[0.5625rem] tabular-nums',
                index === steps.length - 1 ? 'text-brand-600' : 'text-steel-400'
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="mt-3 text-xs leading-relaxed text-steel-600">{step}</span>
          </div>
          {index < steps.length - 1 ? (
            <span aria-hidden="true" className="shrink-0 text-steel-300">
              <svg viewBox="0 0 16 8" className="h-2 w-4" fill="none">
                <path
                  d="M0 4h12M10 1l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function NextProject({ to, title }: { to: string; title: string }) {
  return (
    <section className="sect sect--field relative overflow-hidden py-16">
      <Container className="relative">
        <Link
          to={to}
          data-cursor="project"
          className="group flex flex-wrap items-end justify-between gap-6 border-t border-steel-300/70 pt-8"
        >
          <div>
            <p className="section-code">next</p>
            <p className="thai-display mt-3 text-statement font-bold text-ink transition-colors duration-base group-hover:text-brand-600">
              {title}
            </p>
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-steel-300 text-ink transition-all duration-base group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-600">
            <ArrowIcon className="h-5 w-5" />
          </span>
        </Link>
      </Container>
    </section>
  );
}
