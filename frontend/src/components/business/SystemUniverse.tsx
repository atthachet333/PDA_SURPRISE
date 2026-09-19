import { motion } from 'framer-motion';
import { useCallback, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * SYSTEM UNIVERSE — the signature PDA BLISS section.
 *
 * One claim, made visually: we do not sell separate apps, we build one
 * connected system. PDA BLISS sits at the centre; every module orbits it and is
 * wired to the modules it genuinely shares data with.
 *
 * Interaction
 *   hover / focus a node -> its links light up, the others dim, and a detail
 *                           panel shows what the module does, a tiny product
 *                           visual, and the stack behind it
 *   click                -> jumps to that service on /services
 *
 * Built as one inline SVG plus absolutely positioned DOM labels. SVG because
 * the geometry is a fixed graph of ten nodes — a canvas or WebGL layer would
 * cost more and give up crisp text, focus rings and keyboard access, all of
 * which this section needs.
 */

type Visual = 'table' | 'chart' | 'chat' | 'doc' | 'flow' | 'browser' | 'mobile' | 'nodes';

interface SystemNode {
  id: string;
  label: string;
  labelEn: string;
  /** Angle on the orbit, degrees clockwise from 12 o'clock. */
  angle: number;
  /** Orbit radius as a fraction of the viewBox half-size. */
  orbit: number;
  summary: string;
  stack: string[];
  visual: Visual;
  /** Service id on /services, when there is a matching primary service. */
  serviceId?: string;
  /** Other node ids this one genuinely exchanges data with. */
  links: string[];
}

const NODES: SystemNode[] = [
  {
    id: 'erp',
    label: 'ERP',
    labelEn: 'ERP',
    angle: 0,
    orbit: 0.82,
    summary: 'แกนกลางของข้อมูลธุรกิจ บัญชี คลังสินค้า จัดซื้อ และต้นทุน อยู่บนชุดข้อมูลเดียวกัน',
    stack: ['PostgreSQL', 'Node.js', 'React'],
    visual: 'table',
    serviceId: 'business-systems',
    links: ['payroll', 'inventory', 'documents', 'api', 'data']
  },
  {
    id: 'payroll',
    label: 'Payroll',
    labelEn: 'Payroll',
    angle: 36,
    orbit: 0.86,
    summary: 'เงินเดือน เวลาทำงาน กะ และค่าล่วงเวลา ส่งตัวเลขเข้าบัญชีโดยไม่ต้องคีย์ซ้ำ',
    stack: ['TypeScript', 'PostgreSQL'],
    visual: 'chart',
    serviceId: 'payroll',
    links: ['erp', 'hr', 'data']
  },
  {
    id: 'hr',
    label: 'HR ผ่าน LINE',
    labelEn: 'HR LINE Bot',
    angle: 72,
    orbit: 0.8,
    summary: 'พนักงานลงเวลาและยื่นลาผ่าน LINE ที่ใช้อยู่แล้ว หัวหน้าอนุมัติได้จากมือถือ',
    stack: ['LINE API', 'Node.js'],
    visual: 'chat',
    serviceId: 'hr-line-bot',
    links: ['payroll', 'automation', 'mobile']
  },
  {
    id: 'documents',
    label: 'ระบบเอกสาร',
    labelEn: 'Documents',
    angle: 108,
    orbit: 0.88,
    summary: 'ที่เก็บเอกสารกลางที่ค้นเจอ กำหนดสิทธิ์ได้ และรู้ว่าใครเปิดหรือแก้ไฟล์ไหนเมื่อไหร่',
    stack: ['Object Storage', 'PostgreSQL'],
    visual: 'doc',
    serviceId: 'document-management',
    links: ['erp', 'automation', 'web']
  },
  {
    id: 'automation',
    label: 'Automation',
    labelEn: 'Automation',
    angle: 144,
    orbit: 0.82,
    summary: 'งานตามรอบ การอนุมัติ และการกระทบยอด ทำงานเองตามเงื่อนไขที่ตั้งไว้',
    stack: ['Node.js', 'Redis'],
    visual: 'flow',
    serviceId: 'automation',
    links: ['documents', 'hr', 'api']
  },
  {
    id: 'web',
    label: 'เว็บไซต์',
    labelEn: 'Website',
    angle: 180,
    orbit: 0.86,
    summary: 'หน้าร้านออนไลน์ขององค์กร โหลดเร็ว ค้นหาเจอ และแก้เนื้อหาเองได้',
    stack: ['Next.js', 'Cloudflare'],
    visual: 'browser',
    serviceId: 'websites',
    links: ['webapp', 'documents']
  },
  {
    id: 'webapp',
    label: 'เว็บแอป',
    labelEn: 'Web Application',
    angle: 216,
    orbit: 0.8,
    summary: 'หน้าจอทำงานจริงของทีม รองรับผู้ใช้พร้อมกันได้โดยไม่สะดุด',
    stack: ['React', 'Fastify'],
    visual: 'nodes',
    serviceId: 'web-applications',
    links: ['web', 'api', 'data']
  },
  {
    id: 'mobile',
    label: 'Mobile App',
    labelEn: 'Mobile Application',
    angle: 252,
    orbit: 0.88,
    summary: 'แอปสำหรับทีมหน้างานและลูกค้า ทำงานต่อได้แม้สัญญาณไม่ถึง',
    stack: ['React Native', 'SQLite'],
    visual: 'mobile',
    serviceId: 'mobile-applications',
    links: ['hr', 'api']
  },
  {
    id: 'api',
    label: 'API',
    labelEn: 'API & Integration',
    angle: 288,
    orbit: 0.82,
    summary: 'ชั้นเชื่อมต่อที่ทำให้ระบบเดิมกับระบบใหม่คุยกันได้ พร้อมการลองใหม่และกันข้อมูลซ้ำ',
    stack: ['Fastify', 'Webhook'],
    visual: 'flow',
    serviceId: 'integration',
    links: ['erp', 'webapp', 'mobile', 'automation']
  },
  {
    id: 'data',
    label: 'Dashboard',
    labelEn: 'Data & Analytics',
    angle: 324,
    orbit: 0.86,
    summary: 'ตัวเลขชุดเดียวที่ทุกฝ่ายเห็นตรงกัน เจาะดูที่มาของตัวเลขได้ถึงรายการต้นทาง',
    stack: ['PostgreSQL', 'React'],
    visual: 'chart',
    serviceId: 'analytics',
    links: ['erp', 'payroll', 'webapp']
  },
  {
    id: 'inventory',
    label: 'คลังสินค้า',
    labelEn: 'Inventory',
    angle: 18,
    orbit: 0.52,
    summary: 'ยอดคงเหลือที่ตรงกับของจริงในคลัง อ้างอิงกลับไปที่เอกสารต้นทางได้ทุกรายการ',
    stack: ['PostgreSQL'],
    visual: 'table',
    links: ['erp']
  }
];

/** viewBox is a square; the centre is at 50,50. */
const VIEW = 100;
const CENTRE = VIEW / 2;
const HALF = VIEW / 2;

function nodePosition(node: SystemNode): { x: number; y: number } {
  const radians = ((node.angle - 90) * Math.PI) / 180;
  const radius = node.orbit * HALF * 0.86;
  return {
    x: CENTRE + Math.cos(radians) * radius,
    y: CENTRE + Math.sin(radians) * radius
  };
}

const POSITIONS = new Map(NODES.map((node) => [node.id, nodePosition(node)]));

/** Unique, de-duplicated edges. */
const EDGES = (() => {
  const seen = new Set<string>();
  const edges: { a: string; b: string }[] = [];
  NODES.forEach((node) => {
    node.links.forEach((other) => {
      const key = [node.id, other].sort().join('|');
      if (seen.has(key) || !POSITIONS.has(other)) return;
      seen.add(key);
      edges.push({ a: node.id, b: other });
    });
  });
  return edges;
})();

export function SystemUniverse({ code = '03 / SYSTEM' }: { code?: string } = {}) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.2 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const gradientId = useId();

  const active = useMemo(
    () => NODES.find((node) => node.id === activeId) ?? null,
    [activeId]
  );

  const isDimmed = useCallback(
    (nodeId: string) => {
      if (!activeId) return false;
      if (nodeId === activeId) return false;
      const activeNode = NODES.find((node) => node.id === activeId);
      return !activeNode?.links.includes(nodeId);
    },
    [activeId]
  );

  const edgeIsActive = useCallback(
    (edge: { a: string; b: string }) => !activeId || edge.a === activeId || edge.b === activeId,
    [activeId]
  );

  return (
    <section className="sect sect--mesh relative overflow-hidden py-section text-white">
      <div className="sect-layer mesh-lines" aria-hidden="true" />

      <Container className="relative">
        {/*
          Copy left (~40%), graph right (~60%). The graph is the argument this
          section makes, so it gets the larger share and the headline is sized to
          sit beside it rather than above it — an earlier version stacked a
          `text-mega` headline on top and pushed the graph out of view.
        */}
        <div
          ref={ref}
          className="grid gap-10 lg:grid-cols-[minmax(0,0.66fr)_minmax(0,1fr)] lg:items-center lg:gap-14"
        >
          {/* ------------------------------------------- copy + detail panel -- */}
          <div className="order-1">
            <p className="section-code text-brand-300">{code}</p>
            <h2 className="thai-display mt-3 text-statement font-bold text-white">
              ระบบที่เชื่อมต่อกัน
              <br />
              <span className="text-brand-400">ทำงานได้มากกว่า</span>
            </h2>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-brand-100/70">
              เลือกโมดูลบนแผนภาพเพื่อดูว่ามันทำอะไร เชื่อมกับส่วนไหน
              และใช้เทคโนโลยีอะไรอยู่เบื้องหลัง
            </p>

            <div className="mt-7" onPointerLeave={() => setActiveId(null)}>
              <DetailPanel active={active} reduced={reduced} nodeCount={NODES.length} edgeCount={EDGES.length} />
            </div>
          </div>

          {/* ---------------------------------------------------- the graph -- */}
          <div className="relative order-2 mx-auto aspect-square w-full max-w-[40rem] lg:max-w-none">
            <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="h-full w-full overflow-visible">
              <defs>
                <radialGradient id={`${gradientId}-core`}>
                  <stop offset="0%" stopColor="#35C96F" stopOpacity="0.55" />
                  <stop offset="70%" stopColor="#1DAA61" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#1DAA61" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Orbit rings, purely structural */}
              {[0.52, 0.82, 0.88].map((orbit) => (
                <circle
                  key={orbit}
                  cx={CENTRE}
                  cy={CENTRE}
                  r={orbit * HALF * 0.86}
                  fill="none"
                  stroke="rgba(53,201,111,0.14)"
                  strokeWidth="0.2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {/* Core glow */}
              <circle cx={CENTRE} cy={CENTRE} r={26} fill={`url(#${gradientId}-core)`} />

              {/* Edges */}
              {EDGES.map((edge) => {
                const from = POSITIONS.get(edge.a);
                const to = POSITIONS.get(edge.b);
                if (!from || !to) return null;
                const on = edgeIsActive(edge);
                return (
                  <line
                    key={`${edge.a}-${edge.b}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={on ? 'rgba(53,201,111,0.75)' : 'rgba(53,201,111,0.14)'}
                    strokeWidth={on && activeId ? 0.55 : 0.25}
                    vectorEffect="non-scaling-stroke"
                    className="transition-all duration-base ease-smooth"
                  />
                );
              })}

              {/* Spokes to the core */}
              {NODES.map((node) => {
                const position = POSITIONS.get(node.id);
                if (!position) return null;
                const on = !activeId || node.id === activeId;
                return (
                  <line
                    key={`spoke-${node.id}`}
                    x1={CENTRE}
                    y1={CENTRE}
                    x2={position.x}
                    y2={position.y}
                    stroke={on ? 'rgba(220,255,235,0.3)' : 'rgba(220,255,235,0.07)'}
                    strokeWidth="0.15"
                    strokeDasharray="1.5 2"
                    vectorEffect="non-scaling-stroke"
                    className="transition-all duration-base"
                  />
                );
              })}

              {/* Node dots */}
              {NODES.map((node) => {
                const position = POSITIONS.get(node.id);
                if (!position) return null;
                const dimmed = isDimmed(node.id);
                const isActive = node.id === activeId;
                return (
                  <g key={`dot-${node.id}`} className="transition-opacity duration-base" opacity={dimmed ? 0.3 : 1}>
                    {isActive ? (
                      <circle cx={position.x} cy={position.y} r="3.4" fill="rgba(53,201,111,0.25)" />
                    ) : null}
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={isActive ? 1.5 : 1}
                      fill={isActive ? '#35C96F' : '#1DAA61'}
                      className="transition-all duration-base"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Centre mark */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                animate={inView || reduced ? { opacity: 1, scale: 1 } : undefined}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-mono text-[0.5rem] uppercase tracking-[0.28em] text-brand-300/80">
                  core
                </p>
                <p className="mt-1 text-base font-bold leading-tight tracking-[-0.01em] text-white sm:text-xl">
                  PDA
                  <br />
                  BLISS
                </p>
              </motion.div>
            </div>

            {/* Interactive labels, as real focusable DOM */}
            {NODES.map((node, index) => {
              const position = POSITIONS.get(node.id);
              if (!position) return null;
              const dimmed = isDimmed(node.id);
              const isActive = node.id === activeId;
              const label = (
                <>
                  <span
                    className={cn(
                      'h-1 w-1 shrink-0 rounded-full transition-colors duration-base',
                      isActive ? 'bg-white' : 'bg-brand-400'
                    )}
                  />
                  <span className="whitespace-nowrap">{node.label}</span>
                </>
              );

              const className = cn(
                'absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-pill border px-2 py-1 text-[0.5625rem] font-medium transition-all duration-base ease-smooth sm:text-[0.625rem]',
                isActive
                  ? 'border-brand-400 bg-brand-500 text-white shadow-brand-glow'
                  : 'border-brand-400/25 bg-brand-900/70 text-brand-100 hover:border-brand-400/70 hover:bg-brand-800',
                dimmed && 'opacity-35'
              );

              const style = { left: `${position.x}%`, top: `${position.y}%` };

              return (
                <motion.div
                  key={`label-${node.id}`}
                  className="absolute inset-0"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={inView || reduced ? { opacity: 1 } : undefined}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                >
                  {node.serviceId ? (
                    <Link
                      to={`/services#${node.serviceId}`}
                      className={className}
                      style={style}
                      onPointerEnter={() => setActiveId(node.id)}
                      onFocus={() => setActiveId(node.id)}
                      onBlur={() => setActiveId(null)}
                      aria-describedby={`universe-detail-${node.id}`}
                    >
                      {label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={className}
                      style={style}
                      onPointerEnter={() => setActiveId(node.id)}
                      onFocus={() => setActiveId(node.id)}
                      onBlur={() => setActiveId(null)}
                      onClick={() => setActiveId((current) => (current === node.id ? null : node.id))}
                      aria-pressed={isActive}
                    >
                      {label}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------- detail panel -- */

/**
 * The module read-out. Lives beside the graph rather than under it, and keeps a
 * fixed minimum height so selecting a module never reflows the section.
 */
function DetailPanel({
  active,
  reduced,
  nodeCount,
  edgeCount
}: {
  active: SystemNode | null;
  reduced: boolean;
  nodeCount: number;
  edgeCount: number;
}) {
  return (
    <div className="plane-dark relative min-h-[16.5rem] rounded-panel p-5 sm:p-6">
      {active ? (
        <motion.div
          key={active.id}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          id={`universe-detail-${active.id}`}
        >
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand-300">
            {active.labelEn}
          </p>
          <h3 className="thai-display mt-2 text-lg font-bold text-white sm:text-xl">
            {active.label}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-brand-100/75">{active.summary}</p>

          <div className="mt-4">
            <NodeVisual visual={active.visual} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <ul className="flex flex-wrap gap-1.5">
              {active.stack.map((item) => (
                <li
                  key={item}
                  className="rounded-pill border border-brand-400/25 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-brand-200"
                >
                  {item}
                </li>
              ))}
            </ul>
            {active.serviceId ? (
              <Link
                to={`/services#${active.serviceId}`}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 transition-colors hover:text-white"
              >
                ดูบริการ
                <span aria-hidden="true" className="transition-transform duration-base group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            ) : null}
          </div>
        </motion.div>
      ) : (
        <div className="flex h-full min-h-[14.5rem] flex-col justify-center">
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand-300/70">
            idle
          </p>
          <p className="thai-display mt-2.5 text-base font-semibold leading-snug text-white/90 sm:text-lg">
            ทุกโมดูลใช้ข้อมูลชุดเดียวกัน
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-brand-100/60">
            ไม่ต้องคีย์ซ้ำ ไม่ต้องกระทบยอดด้วยมือ และไม่ต้องเดาว่าตัวเลขไหนคือตัวเลขจริง
          </p>
          <ul className="mt-5 space-y-1.5">
            {[
              `${nodeCount} โมดูลในระบบเดียว`,
              `${edgeCount} จุดเชื่อมต่อระหว่างโมดูล`,
              'ข้อมูลชุดเดียว ตรวจย้อนกลับได้'
            ].map((line) => (
              <li key={line} className="flex items-center gap-2 text-xs text-brand-100/70">
                <span className="h-px w-4 bg-brand-400/60" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- tiny visuals -- */

/** Small abstract product vignettes. No fabricated data, no fake screenshots. */
function NodeVisual({ visual }: { visual: Visual }) {
  const shell = 'rounded-[10px] border border-brand-400/20 bg-brand-900/60 p-3';

  if (visual === 'chart') {
    return (
      <div className={cn(shell, 'flex h-20 items-end gap-1.5')}>
        {[40, 62, 48, 78, 58, 88].map((height, index) => (
          <span
            key={index}
            className={cn('flex-1 rounded-t-[2px]', index === 5 ? 'bg-brand-400' : 'bg-brand-400/30')}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    );
  }

  if (visual === 'table') {
    return (
      <div className={cn(shell, 'h-20 space-y-1.5')}>
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span className="h-1 w-10 rounded-pill bg-brand-400/50" />
            <span className="h-1 flex-1 rounded-pill bg-brand-400/15" />
            <span
              className={cn(
                'h-2 w-8 rounded-pill',
                row === 0 ? 'bg-brand-400/70' : 'bg-brand-400/20'
              )}
            />
          </div>
        ))}
      </div>
    );
  }

  if (visual === 'chat') {
    return (
      <div className={cn(shell, 'h-20 space-y-1.5')}>
        <span className="block w-3/5 rounded-[6px] rounded-tl-[2px] bg-brand-400/20 px-2 py-1.5">
          <span className="block h-1 w-full rounded-pill bg-brand-200/40" />
        </span>
        <span className="ml-auto block w-1/2 rounded-[6px] rounded-br-[2px] bg-brand-500 px-2 py-1.5">
          <span className="block h-1 w-full rounded-pill bg-white/70" />
        </span>
      </div>
    );
  }

  if (visual === 'doc') {
    return (
      <div className={cn(shell, 'grid h-20 grid-cols-4 gap-2')}>
        {[0, 1, 2, 3].map((item) => (
          <span
            key={item}
            className={cn(
              'flex flex-col justify-end rounded-[4px] border p-1',
              item === 0 ? 'border-brand-400/60 bg-brand-400/15' : 'border-brand-400/20'
            )}
          >
            <span className="block h-1 w-full rounded-pill bg-brand-400/40" />
          </span>
        ))}
      </div>
    );
  }

  if (visual === 'browser') {
    return (
      <div className={cn(shell, 'h-20')}>
        <div className="flex gap-1">
          <span className="h-1 w-1 rounded-full bg-brand-400/50" />
          <span className="h-1 w-1 rounded-full bg-brand-400/50" />
        </div>
        <span className="mt-2 block h-1.5 w-2/3 rounded-pill bg-brand-400/60" />
        <span className="mt-1.5 block h-1 w-full rounded-pill bg-brand-400/20" />
        <span className="mt-1 block h-1 w-4/5 rounded-pill bg-brand-400/20" />
      </div>
    );
  }

  if (visual === 'mobile') {
    return (
      <div className={cn(shell, 'flex h-20 items-center justify-center')}>
        <span className="flex h-16 w-9 flex-col gap-1 rounded-[5px] border border-brand-400/40 p-1.5">
          <span className="block h-1 w-full rounded-pill bg-brand-400/60" />
          <span className="block h-1 w-2/3 rounded-pill bg-brand-400/25" />
          <span className="mt-auto block h-3 w-full rounded-[3px] bg-brand-400/50" />
        </span>
      </div>
    );
  }

  // flow / nodes
  return (
    <div className={cn(shell, 'flex h-20 items-center justify-between gap-1.5')}>
      {[0, 1, 2, 3].map((step) => (
        <span key={step} className="flex flex-1 items-center gap-1.5">
          <span
            className={cn(
              'h-6 flex-1 rounded-[4px] border',
              step === 3 ? 'border-brand-400/70 bg-brand-400/20' : 'border-brand-400/25'
            )}
          />
          {step < 3 ? <span className="h-px w-2 shrink-0 bg-brand-400/50" /> : null}
        </span>
      ))}
    </div>
  );
}
