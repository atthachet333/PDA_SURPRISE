import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { ProjectAccessNote, ProjectActions, ProjectTags, ProjectVisual } from '@/components/business/ProjectParts';
import {
  caseStudies,
  projectsForFilter,
  workFilters,
  type CaseStudy,
  type WorkFilter
} from '@/data/caseStudies';
import { company, metrics, metricsVerified } from '@/data/company';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';
import { cn } from '@/lib/cn';

/**
 * WORK — "PDA BLISS ทำอะไรจริงมาแล้วบ้าง?"
 *
 * Real projects only, from `caseStudies.ts`. Screenshots lead where a reviewed
 * capture exists; otherwise a labelled schematic. A live link appears only for
 * a public project whose URL passes the safety gate — none is guessed.
 */

/** Technologies the listed projects actually use (verified from their code). */
const TECH = ['React', 'TypeScript', 'Vite', 'Next.js', 'Tailwind CSS', 'Fastify', 'Express', 'Prisma', 'MySQL', 'Google APIs', 'LINE Official Account'];

const PROCESS = [
  { title: 'Requirement', th: 'เก็บโจทย์จากงานจริง' },
  { title: 'Design', th: 'ออกแบบ Workflow และหน้าจอ' },
  { title: 'Development', th: 'พัฒนาเป็นระบบที่ใช้ได้' },
  { title: 'Test', th: 'ทดสอบกับข้อมูลและผู้ใช้' },
  { title: 'Deploy', th: 'นำขึ้นระบบจริง' },
  { title: 'Support', th: 'ดูแลและปรับต่อ' }
];

export default function Work() {
  usePageMeta(pageMeta.work);
  const featured = caseStudies.filter((study) => study.featured);

  return (
    <>
      <WorkHero />
      <section aria-labelledby="featured-work" className="sect sect--paper relative py-section">
        <Container wide>
          <p className="section-code">01 / FEATURED WORK</p>
          <h2 id="featured-work" className="thai-display mt-3 text-statement font-bold text-ink">ผลงานที่แสดง<span className="text-brand-700">ความสามารถคนละด้าน</span></h2>
          <div className="mt-12 space-y-16 lg:mt-16 lg:space-y-24">
            {featured.map((study, index) => <FeaturedRow key={study.id} study={study} index={index} />)}
          </div>
        </Container>
      </section>
      <AllProjects />
      <HowWeBuild />
      <WorkCta />
    </>
  );
}

function WorkHero() {
  return (
    <section className="sect sect--bright relative overflow-hidden pb-14 pt-32 sm:pb-16 sm:pt-40">
      <span aria-hidden="true" className="work-grid pointer-events-none absolute inset-0" />
      <Container wide className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end">
          <div>
            <p className="section-code">WORK · ผลงาน</p>
            <h1 className="thai-display mt-4 max-w-4xl text-[clamp(2.3rem,5vw,4.4rem)] font-bold leading-[1.12] text-ink">
              เราไม่ได้แค่ทำเว็บไซต์<br /><span className="text-brand-700">เราสร้างระบบที่ใช้ทำงานจริง</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-steel-600">
              ผลงานของเราครอบคลุมระบบหลังบ้าน เว็บไซต์ และเครื่องมือสำหรับงานจริงของธุรกิจ แต่ละโครงการเล่าจากปัญหา สิ่งที่เราสร้าง และวิธีที่ระบบทำงาน
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200">
            {metricsVerified
              ? metrics.map((metric) => (
                  <div key={metric.label} className="bg-white p-5">
                    <dt className="text-xs text-steel-500">{metric.label}</dt>
                    <dd className="mt-1 font-mono text-4xl font-semibold text-ink">{metric.value}</dd>
                    <dd className="mt-1 text-[0.7rem] leading-snug text-steel-400">{metric.detail}</dd>
                  </div>
                ))
              : null}
            <div className="col-span-2 bg-brand-50 p-4 text-xs leading-relaxed text-brand-800">
              หน้านี้อธิบาย {caseStudies.length} โครงการที่เปิดเผยรายละเอียดได้ ระบบของลูกค้าแสดงโดยไม่เปิดเผยข้อมูลภายใน
            </div>
          </dl>
        </div>
      </Container>
    </section>
  );
}

function FeaturedRow({ study, index }: { study: CaseStudy; index: number }) {
  const flip = index % 2 === 1;
  return (
    <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
      <div className={cn('lg:col-span-7', flip && 'lg:order-2')}>
        <Link to={`/work/${study.slug}`} tabIndex={-1} aria-hidden="true" className="block">
          <ProjectVisual study={study} priority={index === 0} className="work-feature shadow-lift-lg" />
        </Link>
      </div>
      <div className={cn('lg:col-span-5', flip && 'lg:order-1')}>
        <p className="font-mono text-[0.62rem] tracking-[0.16em] text-brand-600">{String(index + 1).padStart(2, '0')} · {study.projectType}</p>
        <h3 className="thai-display mt-3 text-[clamp(1.6rem,2.6vw,2.3rem)] font-bold leading-tight text-ink">{study.title}</h3>
        <dl className="mt-6 space-y-4">
          <div>
            <dt className="font-mono text-[0.58rem] tracking-[0.16em] text-steel-400">PROBLEM</dt>
            <dd className="mt-1 text-base leading-relaxed text-steel-700">{study.problem}</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.58rem] tracking-[0.16em] text-steel-400">WHAT WE BUILT</dt>
            <dd className="mt-1 text-base leading-relaxed text-ink">{study.delivered}</dd>
          </div>
        </dl>
        <ProjectTags tags={study.tags} className="mt-6" />
        <ProjectActions study={study} className="mt-7" />
        <ProjectAccessNote study={study} className="mt-4" />
      </div>
    </article>
  );
}

function AllProjects() {
  const [filter, setFilter] = useState<WorkFilter | 'all'>('all');
  const visible = useMemo(() => projectsForFilter(filter), [filter]);
  const available = workFilters.filter((entry) => entry.id === 'all' || projectsForFilter(entry.id).length > 0);

  return (
    <section aria-labelledby="all-projects" className="sect sect--field relative py-section">
      <Container wide>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-code">02 / ALL PROJECTS</p>
            <h2 id="all-projects" className="thai-display mt-3 text-statement font-bold text-ink">ผลงานทั้งหมด</h2>
          </div>
          <p aria-live="polite" className="text-sm text-steel-500">
            แสดง <span className="font-semibold text-ink">{visible.length}</span> จาก {caseStudies.length} โครงการ
          </p>
        </div>

        <div role="group" aria-label="กรองผลงานตามประเภท" className="no-scrollbar -mx-5 mt-7 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {available.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={filter === entry.id}
              onClick={() => setFilter(entry.id)}
              className={cn(
                'min-h-11 shrink-0 rounded-pill border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                filter === entry.id ? 'border-ink bg-ink text-white' : 'border-steel-300 bg-white text-steel-600 hover:border-brand-400 hover:text-brand-700'
              )}
            >
              {entry.label}
              <span className={cn('ml-2 font-mono text-[0.65rem]', filter === entry.id ? 'text-white/70' : 'text-steel-400')}>
                {projectsForFilter(entry.id).length}
              </span>
            </button>
          ))}
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:gap-8">
          {visible.map((study) => (
            <li key={study.id}>
              <ProjectCard study={study} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function ProjectCard({ study }: { study: CaseStudy }) {
  return (
    <article className="work-card group flex h-full flex-col overflow-hidden rounded-panel border border-steel-200 bg-white transition-colors hover:border-brand-300">
      <ProjectVisual study={study} className="rounded-none border-0 border-b" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="font-mono text-[0.6rem] tracking-[0.14em] text-brand-600">{study.projectType}</p>
        <h3 className="thai-display mt-2 text-xl font-bold text-ink">{study.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-steel-600">{study.delivered}</p>
        <ProjectTags tags={study.tags} className="mt-4" />
        <div className="mt-auto pt-6">
          <ProjectActions study={study} />
          <ProjectAccessNote study={study} className="mt-3" />
        </div>
      </div>
    </article>
  );
}

function HowWeBuild() {
  return (
    <section aria-labelledby="how-we-build" className="sect sect--bright relative py-section">
      <Container wide>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="section-code">03 / HOW WE BUILD</p>
            <h2 id="how-we-build" className="thai-display mt-3 text-statement font-bold text-ink">จากโจทย์ ถึงระบบที่ใช้งาน</h2>
            <ol className="mt-8 grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-2">
              {PROCESS.map((step, index) => (
                <li key={step.title} className="bg-white p-4">
                  <span className="font-mono text-[0.6rem] text-brand-600">{String(index + 1).padStart(2, '0')}</span>
                  <p className="mt-1 text-sm font-semibold text-ink">{step.title}</p>
                  <p className="text-xs text-steel-500">{step.th}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="section-code">TECHNOLOGY</p>
            <h3 className="thai-display mt-3 text-2xl font-bold text-ink">เครื่องมือที่ใช้จริงในโครงการเหล่านี้</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-steel-500">เลือกเครื่องมือตามโจทย์ ไม่ใช่ตามกระแส งานของระบบสำคัญกว่าชื่อเทคโนโลยี</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {TECH.map((tech) => <li key={tech} className="rounded-card border border-steel-200 bg-white px-3 py-2 font-mono text-xs text-steel-700">{tech}</li>)}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function WorkCta() {
  const actions = [
    { label: `LINE ${company.lineOA}`, href: company.lineUrl, external: true, primary: true },
    { label: 'ส่งรายละเอียดโครงการ', to: '/contact', primary: false },
    { label: `โทร ${company.phoneDisplay}`, href: `tel:${company.phone}`, primary: false },
    { label: company.email, href: `mailto:${company.email}`, primary: false }
  ];
  return (
    <section aria-labelledby="work-cta" className="sect sect--deep relative overflow-hidden py-section text-white">
      <Container wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="section-code text-brand-300">04 / START</p>
            <h2 id="work-cta" className="thai-display mt-3 text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-tight">มีระบบที่อยากทำอยู่หรือยัง?<br /><span className="text-brand-300">เล่าโจทย์ให้เราฟัง</span></h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-brand-100/70">{company.businessHours.days} {company.businessHours.time} · {company.businessHours.note}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:max-w-md lg:justify-end">
            {actions.map((action) =>
              action.to ? (
                <Link key={action.label} to={action.to} className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:border-brand-300 hover:bg-white/5">
                  {action.label} <ArrowIcon />
                </Link>
              ) : (
                <a
                  key={action.label}
                  href={action.href}
                  {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-pill px-5 text-sm font-semibold transition-colors',
                    action.primary ? 'bg-brand-500 text-white hover:bg-brand-400' : 'border border-white/25 text-white hover:border-brand-300 hover:bg-white/5'
                  )}
                >
                  {action.label}
                  {action.external ? <span className="sr-only">(เปิดแท็บใหม่)</span> : null}
                </a>
              )
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
