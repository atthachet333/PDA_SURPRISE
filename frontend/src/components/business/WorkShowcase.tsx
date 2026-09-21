import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowIcon } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import {
  caseStudies,
  caseStudyCategories,
  caseStudyStatusLabels,
  type CaseStudy,
  type CaseStudyCategory
} from '@/data/caseStudies';
import { cn } from '@/lib/cn';
import { CaseStudyVisual } from './CaseStudyVisual';
import { SectionBackdrop } from './SectionBackdrop';

interface WorkShowcaseProps {
  items?: readonly CaseStudy[];
  code?: string;
  title?: React.ReactNode;
  lead?: string;
  showAllLink?: boolean;
  showFilters?: boolean;
}

export function WorkShowcase({
  items = caseStudies,
  code = '02 / CASE STUDIES',
  title = <><span>ระบบที่เริ่มจาก</span><br /><span className="text-brand-400">ปัญหาการทำงานจริง</span></>,
  lead = 'แต่ละ Case Study อธิบายโจทย์ วิธีคิด และลำดับการทำงานของระบบ โดยไม่ใช้ตัวเลขผลลัพธ์ที่ยังไม่ได้วัด',
  showAllLink = false,
  showFilters = false
}: WorkShowcaseProps) {
  const [category, setCategory] = useState<CaseStudyCategory | 'all'>('all');
  const visibleItems = useMemo(() => category === 'all' ? items : items.filter((item) => item.category === category), [category, items]);

  return (
    <section id="work" className="sect sect--deep relative overflow-hidden py-section text-white">
      <span aria-hidden="true" className="sect-edge-top sect-edge-top--dark" />
      <SectionBackdrop variant="mesh-dark" pointer intensity={0.85} />
      <Container wide className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl"><p className="section-code text-brand-400">{code}</p><h2 className="thai-display mt-3 text-statement font-bold text-white">{title}</h2></div>
          <p className="max-w-md text-sm leading-relaxed text-brand-100/65">{lead}</p>
        </div>

        {showFilters ? (
          <div className="no-scrollbar mt-8 flex max-w-full gap-1 overflow-x-auto rounded-pill border border-brand-400/20 bg-brand-900/70 p-1" role="group" aria-label="กรอง Case Study">
            {caseStudyCategories.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)} className={cn('min-h-11 shrink-0 rounded-pill px-4 text-xs font-medium transition-colors', category === item.id ? 'bg-brand-500 text-white' : 'text-brand-100/60 hover:bg-white/5 hover:text-white')}>{item.label}</button>)}
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => <CaseCard key={item.id} item={item} />)}
        </div>

        {showAllLink ? <Link to="/work" className="group mt-10 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-300 transition-colors hover:text-white">ดู Case Study ทั้งหมด <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" /></Link> : null}
      </Container>
    </section>
  );
}

function CaseCard({ item }: { item: CaseStudy }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-panel border border-brand-400/20 bg-brand-900/85 shadow-soft transition-colors hover:border-brand-300/50">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-brand-400/15 bg-white">
        <CaseStudyVisual kind={item.visual} />
        <span className="absolute bottom-3 right-3 rounded-pill bg-ink/75 px-2 py-1 font-mono text-[.5rem] tracking-[.1em] text-white/80 backdrop-blur-sm">SYSTEM ILLUSTRATION</span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[.58rem] tracking-[.14em] text-brand-300">{caseStudyStatusLabels[item.status]}</span><span className="h-1 w-1 rounded-full bg-brand-500" /><span className="text-[.65rem] text-brand-100/45">{caseStudyCategories.find((entry) => entry.id === item.category)?.label}</span></div>
        <h3 className="thai-display mt-4 text-xl font-bold text-white">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-brand-100/65">{item.problem}</p>
        <div className="mt-5 border-t border-brand-400/15 pt-4"><p className="font-mono text-[.55rem] tracking-[.12em] text-brand-300">OPERATIONAL IMPROVEMENT</p><p className="mt-2 text-xs leading-relaxed text-brand-100/60">{item.outcomes[0]}</p></div>
        <Link to={`/work/${item.slug}`} data-cursor="project" className="mt-6 inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-brand-300/30 px-4 text-sm font-semibold text-white transition-colors hover:border-brand-300 hover:bg-white/5">ดูวิธีที่ระบบทำงาน <ArrowIcon /></Link>
      </div>
    </article>
  );
}
