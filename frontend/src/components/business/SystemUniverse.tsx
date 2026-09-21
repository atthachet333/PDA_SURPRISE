import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowIcon } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import {
  businessSystems,
  getConnectedSystemIds,
  getSystemById,
  systemCategories,
  systemEdges,
  systemStatusLabels,
  type BusinessSystem,
  type SystemIcon
} from '@/data/systemUniverse';
import { cn } from '@/lib/cn';
import { getCaseStudyForSystem } from '@/data/caseStudies';
import { SectionBackdrop } from './SectionBackdrop';

const ICON_PATHS: Record<SystemIcon, React.ReactNode> = {
  erp: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 9v11M13 9v11M17 13h2M17 17h2" /></>,
  payroll: <><path d="M5 4h14v16H5zM8 8h8M8 12h3M8 16h3M15 12h1M15 16h1" /></>,
  hr: <><path d="M7 18.5 3.5 21l1-4.2A8 8 0 1 1 7 18.5Z" /><path d="M8 10h8M8 14h5" /></>,
  documents: <><path d="M7 3h7l4 4v14H7zM14 3v5h5M10 12h5M10 16h5" /></>,
  storage: <><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
  webapp: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M7 6.5h.01M10 6.5h.01M8 13h3v3H8zM14 13h3M14 16h3" /></>,
  mobile: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M10 5h4M11 18.5h2" /></>,
  website: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>
};

function UniverseIcon({ name, className }: { name: SystemIcon; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn('h-5 w-5', className)}>{ICON_PATHS[name]}</svg>;
}

export function SystemUniverse() {
  const [selectedId, setSelectedId] = useState('erp');
  const labelId = useId();
  const selected = getSystemById(selectedId) ?? businessSystems[0]!;
  const connectedIds = useMemo(() => new Set(getConnectedSystemIds(selected.id)), [selected.id]);
  const relatedEdges = systemEdges.filter((edge) => edge.from === selected.id || edge.to === selected.id);
  const stateFor = (id: string) => id === selected.id ? 'selected' : connectedIds.has(id) ? 'connected' : 'dimmed';

  return (
    <section aria-labelledby={labelId} className="sect sect--mesh relative overflow-hidden py-section text-white">
      <SectionBackdrop variant="mesh-dark" pointer />
      <Container wide className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="section-code text-brand-300">02 / SYSTEM MAP</p><h2 id={labelId} className="thai-display mt-3 text-statement font-bold">หนึ่งระบบที่เลือก<br /><span className="text-brand-400">ทำให้ทั้งภาพชัดขึ้น</span></h2></div>
          <p className="max-w-lg text-sm leading-relaxed text-brand-100/70">เลือกแต่ละระบบเพื่อดูหน้าที่ ความสามารถ และเส้นทางที่สามารถทำงานร่วมกับระบบอื่น โดยเส้นเชื่อมหมายถึงความเป็นไปได้ในการออกแบบ Workflow ไม่ใช่สถานะการเชื่อมต่อจริงของทุกโครงการ</p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(20rem,.58fr)]">
          <div className="hidden min-h-[42rem] rounded-panel border border-brand-400/20 bg-brand-900/65 p-6 lg:block" aria-label="แผนผังระบบ PDA BLISS">
            <div className="relative h-full min-h-[38rem]">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                {systemEdges.map((edge) => {
                  const from = getSystemById(edge.from); const to = getSystemById(edge.to);
                  if (!from || !to) return null;
                  const active = edge.from === selected.id || edge.to === selected.id;
                  return <line key={`${edge.from}-${edge.to}`} x1={from.position.x} y1={from.position.y} x2={to.position.x} y2={to.position.y} vectorEffect="non-scaling-stroke" stroke={active ? '#35C96F' : 'rgba(127,217,166,.2)'} strokeWidth={active ? 2 : 1} strokeDasharray={active ? '0' : '4 6'} className="transition-all duration-base" />;
                })}
                {businessSystems.map((system) => <line key={`core-${system.id}`} x1="50" y1="50" x2={system.position.x} y2={system.position.y} vectorEffect="non-scaling-stroke" stroke={system.id === selected.id ? 'rgba(127,217,166,.55)' : 'rgba(127,217,166,.1)'} strokeWidth="1" strokeDasharray="3 7" />)}
              </svg>
              <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-brand-300/60 bg-brand-700 text-center shadow-brand-glow" aria-label="PDA Core ศูนย์กลางระบบ"><span className="font-mono text-[.55rem] tracking-[.24em] text-brand-200">ECOSYSTEM</span><strong className="mt-1 text-lg">PDA CORE</strong><span className="mt-1 text-[.6rem] text-brand-100/70">SHARED FLOW</span></div>
              {businessSystems.map((system) => {
                const state = stateFor(system.id);
                return <button key={system.id} type="button" aria-pressed={system.id === selected.id} aria-label={`${system.nameEn} — ${system.nameTh}`} onPointerEnter={() => setSelectedId(system.id)} onFocus={() => setSelectedId(system.id)} onClick={() => setSelectedId(system.id)} style={{ left: `${system.position.x}%`, top: `${system.position.y}%` }} className={cn('absolute flex min-h-14 min-w-32 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-card border px-3 py-2 text-left transition-all duration-base', state === 'selected' && 'z-10 scale-105 border-brand-300 bg-brand-500 text-white shadow-brand-glow', state === 'connected' && 'border-brand-400/60 bg-brand-800 text-white', state === 'dimmed' && 'border-white/10 bg-brand-900/90 text-brand-100/45 opacity-60')}><span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border', state === 'selected' ? 'border-white/30 bg-white/10' : 'border-brand-400/20 bg-brand-800')}><UniverseIcon name={system.icon} /></span><span><span className="block font-mono text-[.6rem] font-semibold tracking-[.04em]">{system.nameEn}</span><span className="mt-0.5 block text-[.65rem] text-current/70">{system.nameTh}</span></span></button>;
              })}
            </div>
          </div>

          <div className="lg:hidden">
            <p className="mb-3 text-xs text-brand-100/60">แตะระบบเพื่อดูรายละเอียด</p>
            <div className="grid grid-cols-2 gap-2">
              {businessSystems.map((system) => {
                const state = stateFor(system.id);
                return <button key={system.id} type="button" aria-pressed={system.id === selected.id} onClick={() => setSelectedId(system.id)} className={cn('min-h-24 rounded-card border p-3 text-left transition-colors', state === 'selected' ? 'border-brand-300 bg-brand-500 text-white' : state === 'connected' ? 'border-brand-400/50 bg-brand-800 text-white' : 'border-white/10 bg-brand-900/70 text-brand-100/55')}><UniverseIcon name={system.icon} /><span className="mt-3 block text-xs font-bold">{system.nameEn}</span><span className="mt-1 block text-[.6875rem]">{system.nameTh}</span></button>;
              })}
            </div>
          </div>

          <SystemDetail system={selected} edges={relatedEdges.map((edge) => ({ label: edge.label, system: getSystemById(edge.from === selected.id ? edge.to : edge.from) })).filter((item): item is { label: string; system: BusinessSystem } => Boolean(item.system))} />
        </div>
      </Container>
    </section>
  );
}

function SystemDetail({ system, edges }: { system: BusinessSystem; edges: { label: string; system: BusinessSystem }[] }) {
  const caseStudy = getCaseStudyForSystem(system.id);
  return (
    <aside key={system.id} aria-live="polite" className="rounded-panel border border-brand-400/25 bg-brand-900 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-400/30 bg-brand-800 text-brand-300"><UniverseIcon name={system.icon} className="h-6 w-6" /></span><span className="rounded-pill border border-brand-400/25 px-2.5 py-1 font-mono text-[.55rem] tracking-[.12em] text-brand-300">{systemStatusLabels[system.status]}</span></div>
      <p className="mt-6 font-mono text-[.65rem] tracking-[.16em] text-brand-300">{system.nameEn}</p><h3 className="thai-display mt-2 text-2xl font-bold">{system.nameTh}</h3><p className="mt-3 text-sm leading-relaxed text-brand-100/75">{system.shortDescription}</p>
      <div className="mt-6 border-t border-brand-400/15 pt-5"><p className="font-mono text-[.58rem] tracking-[.16em] text-brand-300">CAPABILITIES</p><ul className="mt-3 grid grid-cols-2 gap-2">{system.capabilities.map((capability) => <li key={capability} className="flex items-start gap-2 text-xs leading-relaxed text-brand-100/80"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />{capability}</li>)}</ul></div>
      <div className="mt-6 border-t border-brand-400/15 pt-5"><p className="font-mono text-[.58rem] tracking-[.16em] text-brand-300">CAN CONNECT</p>{edges.length ? <ul className="mt-3 space-y-3">{edges.map(({ system: peer, label }) => <li key={peer.id} className="rounded-card border border-brand-400/15 bg-brand-800/55 p-3"><span className="text-xs font-bold text-white">{peer.nameEn}</span><span className="mt-1 block text-[.7rem] leading-relaxed text-brand-100/60">{label}</span></li>)}</ul> : <p className="mt-3 text-xs leading-relaxed text-brand-100/60">ทำงานเป็นช่องทางเฉพาะ และสามารถออกแบบการเชื่อมต่อเพิ่มเติมตาม Workflow จริงของโครงการ</p>}</div>
      <div className="mt-6 flex flex-wrap gap-2">
        {caseStudy ? <Link to={`/work/${caseStudy.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50">ดูตัวอย่างระบบ <ArrowIcon /></Link> : null}
        <Link to={system.route} className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-brand-300/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5">ดูบริการ</Link>
      </div>
    </aside>
  );
}

export function CategoryLegend() {
  return <div className="grid gap-3 sm:grid-cols-3">{Object.entries(systemCategories).map(([id, category]) => <div key={id} className="rounded-card border border-steel-200 bg-white p-4"><p className="font-mono text-[.6rem] tracking-[.14em] text-brand-600">{category.nameEn}</p><p className="thai-display mt-2 text-sm font-semibold text-ink">{category.nameTh}</p></div>)}</div>;
}
