import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import {
  API_LINES,
  EDITOR_FILE,
  EDITOR_LINES,
  NODE_LABELS,
  PIPELINE_STAGES,
  TERMINAL_LINES,
  TREE_LINES,
  type CodeLine
} from './fragments';
import type { AtmosphereVariant } from './variants';

export type { AtmosphereVariant } from './variants';

/**
 * VISUAL ATMOSPHERE (EP43) — the composed depth behind a section.
 *
 *   background   grid ground (the section's own `.sect--*::before`), light
 *                sources, grain, edge vignette
 *   midground    system topology (SVG) and ghost interface panels
 *   foreground   the section's real content, untouched
 *
 * Every variant is data: which glows, which topology, which panels, where.
 * The drawing is theme-agnostic — all colour comes from the `--atm-*` tokens —
 * so one composition serves Light, Dark and the dark-green islands, each
 * composed separately in theme-tokens.css.
 *
 * Decorative only: aria-hidden, pointer-events none, clipped to the section,
 * CSS motion that stops under prefers-reduced-motion. Detail is placed around
 * the copy column, never behind body text; on small screens panels drop out
 * (`atm-hide-sm`) but the map, one glow and the grid stay.
 */

interface VisualAtmosphereProps {
  variant: AtmosphereVariant;
  className?: string;
}

export function VisualAtmosphere({ variant, className }: VisualAtmosphereProps) {
  const Composition = COMPOSITIONS[variant];
  return (
    <div className={cn('atm', className)} aria-hidden="true" data-atmosphere={variant}>
      <Composition />
      <span className="atm-vignette" />
      <span className="atm-noise" />
    </div>
  );
}

/* ------------------------------------------------------------------ layers -- */

function Glow({ tone, style, breathe = false, className }: { tone: 'green' | 'blue'; style: CSSProperties; breathe?: boolean; className?: string }) {
  return <span className={cn('atm-glow', `atm-glow--${tone}`, breathe && 'atm-breathe', className)} style={style} />;
}

function Code({ lines }: { lines: readonly CodeLine[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <div key={index}>
          {line.map(([tone, text], part) => (
            <span key={part} className={tone ? `atm-ghost__${tone}` : undefined}>
              {text}
            </span>
          ))}
        </div>
      ))}
    </>
  );
}

type GhostKind = 'editor' | 'terminal' | 'api' | 'tree' | 'analytics';

const GHOST_TITLE: Record<GhostKind, string> = {
  editor: EDITOR_FILE,
  terminal: 'terminal',
  api: 'api',
  tree: 'components',
  analytics: 'throughput'
};

function GhostWindow({ kind, style, className, soft = false }: { kind: GhostKind; style: CSSProperties; className?: string; soft?: boolean }) {
  return (
    <div className={cn('atm-ghost', soft && 'atm-ghost--soft', className)} style={style}>
      <div className="atm-ghost__bar">
        <span className="atm-ghost__dot" />
        <span className="atm-ghost__dot" />
        <span className="atm-ghost__dot" />
        <span className="ml-2">{GHOST_TITLE[kind]}</span>
      </div>
      <div className="atm-ghost__body">
        {kind === 'editor' ? <Code lines={EDITOR_LINES} /> : null}
        {kind === 'terminal' ? <Code lines={TERMINAL_LINES} /> : null}
        {kind === 'api' ? <Code lines={API_LINES} /> : null}
        {kind === 'tree' ? <Code lines={TREE_LINES} /> : null}
        {kind === 'analytics' ? (
          <>
            <span className="atm-ghost__line" style={{ width: '46%' }} />
            <div className="atm-ghost__bars">
              {[38, 56, 44, 70, 52, 80, 64, 92].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div>
              <span className="atm-ghost__chip">daily</span>
              <span className="atm-ghost__chip">weekly</span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface MapNode {
  x: number;
  y: number;
  ring?: boolean;
  quiet?: boolean;
  label?: string;
  pulse?: boolean;
}

interface MapSpec {
  view?: string;
  align?: string;
  edges: string[];
  blueEdges?: string[];
  signals?: string[];
  nodes: MapNode[];
  boxes?: Array<{ x: number; y: number; w: number; h: number; label: string; accent?: boolean }>;
  labels?: Array<{ x: number; y: number; text: string; accent?: boolean }>;
  extra?: React.ReactNode;
}

function Topology({ spec, className }: { spec: MapSpec; className?: string }) {
  return (
    <>
      <StaticMap spec={spec} className={className} />
      {spec.signals?.length ? (
        <svg
          className={cn('atm-topology atm-topology--signals', className)}
          viewBox={spec.view ?? '0 0 1440 900'}
          preserveAspectRatio={spec.align ?? 'xMidYMid slice'}
          focusable="false"
        >
          {spec.signals.map((d, index) => (
            <path key={d} className="atm-signal" d={d} style={{ animationDelay: `${index * -4.2}s` }} />
          ))}
        </svg>
      ) : null}
    </>
  );
}

function StaticMap({ spec, className }: { spec: MapSpec; className?: string }) {
  return (
    <svg
      className={cn('atm-topology', className)}
      viewBox={spec.view ?? '0 0 1440 900'}
      preserveAspectRatio={spec.align ?? 'xMidYMid slice'}
      focusable="false"
    >
      {spec.extra}
      {spec.edges.map((d) => (
        <path key={d} className="atm-edge" d={d} />
      ))}
      {spec.blueEdges?.map((d) => (
        <path key={d} className="atm-edge atm-edge--blue atm-edge--dashed" d={d} />
      ))}
      {spec.boxes?.map((box) => (
        <g key={box.label}>
          <rect className="atm-box" x={box.x} y={box.y} width={box.w} height={box.h} rx={8} />
          <text
            className={cn('atm-label', box.accent && 'atm-label--accent')}
            x={box.x + box.w / 2}
            y={box.y + box.h / 2 + 3.5}
            textAnchor="middle"
          >
            {box.label}
          </text>
        </g>
      ))}
      {spec.nodes.map((node) => (
        <g key={`${node.x}-${node.y}`}>
          {node.ring ? <circle className={cn('atm-node-ring', node.pulse && 'atm-pulse')} cx={node.x} cy={node.y} r={11} /> : null}
          <circle className={node.quiet ? 'atm-node--quiet' : 'atm-node'} cx={node.x} cy={node.y} r={node.quiet ? 2.2 : 3.2} />
          {node.label ? (
            <text className="atm-label" x={node.x + 12} y={node.y - 10}>
              {node.label}
            </text>
          ) : null}
        </g>
      ))}
      {spec.labels?.map((label) => (
        <text key={`${label.x}-${label.y}`} className={cn('atm-label', label.accent && 'atm-label--accent')} x={label.x} y={label.y}>
          {label.text}
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------ compositions -- */

const HERO_MAP: MapSpec = {
  align: 'xMaxYMid slice',
  edges: [
    'M700 190 H860 V150',
    'M860 150 H1060 V200',
    'M1060 200 H1250 V150',
    'M1250 150 H1400 V230',
    'M1400 230 V330 H1330',
    'M1410 420 V620',
    'M1400 620 V790 H1300',
    'M1300 790 H1120 V850',
    'M1120 850 H940 V770',
    'M940 770 H760 V820',
    'M760 820 H620 V870',
    'M620 870 H420 V850'
  ],
  blueEdges: ['M1060 200 V250 H1150', 'M940 770 V690 H1040', 'M1400 230 H1440', 'M1250 150 V112'],
  signals: [
    'M700 190 H860 V150 H1060 V200 H1250 V150 H1400 V330 H1330',
    'M1400 620 V790 H1300 H1120 V850 H940 V770 H760 V820 H620 V870 H420'
  ],
  nodes: [
    { x: 700, y: 190, label: NODE_LABELS[5] },
    { x: 860, y: 150, ring: true, pulse: true, label: NODE_LABELS[0] },
    { x: 1060, y: 200 },
    { x: 1250, y: 150, label: NODE_LABELS[3] },
    { x: 1400, y: 230, ring: true },
    { x: 1330, y: 330, label: NODE_LABELS[1] },
    { x: 1410, y: 420, quiet: true },
    { x: 1400, y: 620, ring: true, pulse: true },
    { x: 1300, y: 790, label: NODE_LABELS[2] },
    { x: 1120, y: 850 },
    { x: 940, y: 770, ring: true, label: NODE_LABELS[4] },
    { x: 760, y: 820 },
    { x: 620, y: 870, quiet: true },
    { x: 420, y: 850, quiet: true },
    { x: 1040, y: 690, quiet: true }
  ]
};

function HeroComposition() {
  return (
    <>
      <Glow tone="green" breathe style={{ right: '-12%', top: '-28%', width: 'min(62rem, 90vw)', height: 'min(62rem, 90vw)' }} />
      <Glow tone="blue" style={{ left: '-18%', bottom: '-38%', width: 'min(52rem, 85vw)', height: 'min(52rem, 85vw)' }} />
      <Topology spec={HERO_MAP} className="atm-mask-right" />
      {/* Back plane: three stylised panels around the product rig, cropped by the edges. */}
      <GhostWindow kind="editor" className="atm-drift-a atm-hide-sm atm-hide-md" soft style={{ left: '41%', bottom: '-3.25rem', width: '17.5rem', opacity: 0.72 }} />
      <GhostWindow kind="terminal" className="atm-drift-b" style={{ right: '-3.5rem', bottom: '5%', width: '16.5rem', opacity: 0.8 }} />
      <GhostWindow kind="analytics" className="atm-drift-a atm-hide-sm" soft style={{ right: '-4.5rem', top: '15%', width: '15rem', opacity: 0.6 }} />
    </>
  );
}

const SYSTEMS_MAP: MapSpec = {
  edges: [
    'M0 140 H180 V260 H320',
    'M0 700 H120 V600 H260',
    'M1440 180 H1280 V320 H1150',
    'M1440 740 H1320 V620 H1200',
    'M320 260 V420',
    'M1150 320 V470'
  ],
  blueEdges: ['M180 140 V60', 'M1320 740 V840', 'M260 600 H360'],
  signals: ['M0 140 H180 V260 H320 V420', 'M1440 740 H1320 V620 H1200'],
  nodes: [
    { x: 180, y: 140, ring: true },
    { x: 320, y: 260, label: NODE_LABELS[0] },
    { x: 320, y: 420, quiet: true },
    { x: 120, y: 700 },
    { x: 260, y: 600, ring: true, pulse: true },
    { x: 1280, y: 180, label: NODE_LABELS[2] },
    { x: 1150, y: 320, ring: true },
    { x: 1150, y: 470, quiet: true },
    { x: 1320, y: 740, ring: true, pulse: true },
    { x: 1200, y: 620, label: NODE_LABELS[5] }
  ]
};

function SystemsComposition() {
  return (
    <>
      <Glow tone="green" style={{ left: '30%', top: '18%', width: 'min(56rem, 90vw)', height: 'min(40rem, 70vw)' }} />
      <Glow tone="blue" className="atm-hide-sm" style={{ right: '-10%', bottom: '-20%', width: '34rem', height: '34rem' }} />
      <Topology spec={SYSTEMS_MAP} className="atm-mask-edges" />
    </>
  );
}

const WORKFLOW_MAP: MapSpec = {
  align: 'xMaxYMin slice',
  edges: [
    'M860 140 H960',
    'M1080 140 H1120',
    'M1240 140 H1280',
    'M1340 158 V200',
    'M1280 218 H1180 V330',
    'M0 560 H300 V500 H620',
    'M620 500 H980 V560 H1440'
  ],
  blueEdges: ['M1400 140 H1440', 'M1020 158 V240 H900', 'M1180 330 V420'],
  signals: ['M860 140 H960 H1080 H1120 H1240 H1280 H1340 V200', 'M0 560 H300 V500 H620 H980 V560 H1440'],
  boxes: [
    { x: 960, y: 122, w: 120, h: 36, label: PIPELINE_STAGES[0] },
    { x: 1120, y: 122, w: 120, h: 36, label: PIPELINE_STAGES[1] },
    { x: 1280, y: 122, w: 120, h: 36, label: PIPELINE_STAGES[2], accent: true },
    { x: 1280, y: 200, w: 120, h: 36, label: PIPELINE_STAGES[3] }
  ],
  nodes: [
    { x: 860, y: 140, ring: true, pulse: true },
    { x: 1180, y: 330, quiet: true },
    { x: 900, y: 240, quiet: true },
    { x: 300, y: 560 },
    { x: 620, y: 500, ring: true },
    { x: 980, y: 560, label: NODE_LABELS[1] },
    { x: 1180, y: 420, quiet: true }
  ],
  labels: [{ x: 960, y: 108, text: '01 → 04' }]
};

function WorkflowComposition() {
  return (
    <>
      <Glow tone="green" breathe style={{ right: '-8%', top: '-30%', width: 'min(50rem, 90vw)', height: 'min(50rem, 90vw)' }} />
      <Glow tone="blue" style={{ left: '-14%', bottom: '-40%', width: 'min(44rem, 80vw)', height: 'min(44rem, 80vw)' }} />
      <Topology spec={WORKFLOW_MAP} className="atm-mask-top" />
      <GhostWindow kind="api" className="atm-drift-a atm-hide-sm atm-hide-md" soft style={{ left: '40%', bottom: '-2.25rem', width: '15rem', opacity: 0.7 }} />
    </>
  );
}

function PortfolioComposition() {
  return (
    <>
      <Glow tone="green" style={{ right: '-6%', top: '-26%', width: 'min(52rem, 90vw)', height: 'min(52rem, 90vw)' }} />
      <Glow tone="blue" style={{ right: '18%', bottom: '-46%', width: '40rem', height: '40rem' }} />
      {/* Layered frames: the shape of shipped screens, never their content. */}
      <span className="atm-frame atm-drift-a" style={{ right: '-7%', top: '16%', width: '44%', height: '64%' }} />
      <span className="atm-frame atm-drift-b atm-hide-sm" style={{ right: '9%', top: '28%', width: '30%', height: '50%', opacity: 0.8 }} />
      <span className="atm-frame atm-frame--device atm-hide-sm" style={{ right: '36%', top: '42%', width: '8.5rem', height: '15.5rem', opacity: 0.8 }} />
    </>
  );
}

function EvidenceComposition() {
  return (
    <>
      <Glow tone="blue" style={{ right: '-12%', top: '-20%', width: 'min(48rem, 90vw)', height: 'min(48rem, 90vw)' }} />
      <span className="atm-frame atm-drift-a" style={{ left: '-6%', bottom: '-10%', width: '30%', height: '46%', opacity: 0.7 }} />
      <span className="atm-frame atm-drift-b atm-hide-sm" style={{ right: '-5%', top: '-8%', width: '26%', height: '40%', opacity: 0.6 }} />
    </>
  );
}

/* A deterministic constellation: same stars on every render and every build. */
function constellation(count: number, seed: number) {
  let state = seed;
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const points = Array.from({ length: count }, () => ({ x: Math.round(40 + next() * 1360), y: Math.round(30 + next() * 840) }));
  const edges: string[] = [];
  points.forEach((point, index) => {
    const nearest = points
      .map((other, otherIndex) => ({ otherIndex, d: Math.hypot(other.x - point.x, other.y - point.y) }))
      .filter((entry) => entry.otherIndex > index)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { otherIndex, d } of nearest) {
      if (d < 260) edges.push(`M${point.x} ${point.y} L${points[otherIndex]!.x} ${points[otherIndex]!.y}`);
    }
  });
  return { points, edges };
}

const STARS = constellation(46, 43);

const TOPOLOGY_MAP: MapSpec = {
  edges: STARS.edges,
  nodes: STARS.points.map((point, index) => ({ ...point, quiet: index % 3 !== 0, ring: index % 9 === 0, pulse: index % 18 === 0 })),
  signals: ['M40 820 C 400 700, 700 760, 980 520 S 1300 200, 1440 160']
};

function TopologyComposition() {
  return (
    <>
      <Glow tone="green" breathe style={{ right: '-10%', top: '-20%', width: 'min(60rem, 95vw)', height: 'min(60rem, 95vw)' }} />
      <Glow tone="blue" style={{ left: '-12%', bottom: '-35%', width: 'min(48rem, 85vw)', height: 'min(48rem, 85vw)' }} />
      <Topology spec={TOPOLOGY_MAP} className="atm-mask-right" />
    </>
  );
}

const BLUEPRINT_MAP: MapSpec = {
  align: 'xMaxYMid slice',
  edges: ['M900 40 V860', 'M760 380 H1440', 'M940 150 H1400 V620 H940 Z', 'M1010 610 L1370 160'],
  blueEdges: ['M1180 90 V700', 'M820 620 H1440'],
  nodes: [
    { x: 1180, y: 380, ring: true },
    { x: 940, y: 150, quiet: true },
    { x: 1400, y: 150, quiet: true },
    { x: 1400, y: 620, quiet: true },
    { x: 940, y: 620, quiet: true }
  ],
  labels: [
    { x: 950, y: 140, text: 'A-01' },
    { x: 1310, y: 640, text: 'GRID 24' },
    { x: 1192, y: 368, text: 'CORE', accent: true }
  ],
  extra: (
    <>
      <circle className="atm-edge atm-edge--dashed" cx={1180} cy={380} r={250} />
      <circle className="atm-edge" cx={1180} cy={380} r={150} />
      {/* A dimension line with end ticks. */}
      <path className="atm-edge atm-edge--blue" d="M940 700 H1400 M940 690 V710 M1400 690 V710" />
    </>
  )
};

function BlueprintComposition() {
  return (
    <>
      <Glow tone="blue" style={{ right: '-6%', top: '-22%', width: 'min(52rem, 90vw)', height: 'min(52rem, 90vw)' }} />
      <Glow tone="green" style={{ left: '-18%', bottom: '-50%', width: '42rem', height: '42rem' }} />
      <Topology spec={BLUEPRINT_MAP} className="atm-mask-right" />
    </>
  );
}

const CONTACT_MAP: MapSpec = {
  align: 'xMaxYMid slice',
  edges: [
    'M700 760 C 900 740, 1000 500, 1160 380',
    'M1440 120 C 1330 180, 1260 280, 1160 380',
    'M1440 640 C 1330 600, 1250 470, 1160 380',
    'M820 180 C 960 220, 1060 300, 1160 380'
  ],
  signals: ['M700 760 C 900 740, 1000 500, 1160 380', 'M1440 120 C 1330 180, 1260 280, 1160 380', 'M1440 640 C 1330 600, 1250 470, 1160 380'],
  nodes: [
    { x: 1160, y: 380, ring: true, pulse: true },
    { x: 700, y: 760, label: 'form' },
    { x: 820, y: 180, label: 'mail', quiet: true },
    { x: 1400, y: 140, label: 'line' },
    { x: 1400, y: 624, label: 'call', quiet: true }
  ],
  extra: (
    <>
      <circle className="atm-node-ring" cx={1160} cy={380} r={46} />
      <circle className="atm-node-ring atm-edge--dashed" cx={1160} cy={380} r={96} />
      <circle className="atm-edge atm-edge--blue atm-edge--dashed" cx={1160} cy={380} r={170} />
    </>
  )
};

function ContactComposition() {
  return (
    <>
      <Glow tone="green" breathe style={{ right: '-4%', top: '-18%', width: 'min(46rem, 90vw)', height: 'min(46rem, 90vw)' }} />
      <Glow tone="blue" style={{ left: '-16%', bottom: '-46%', width: '40rem', height: '40rem' }} />
      <Topology spec={CONTACT_MAP} className="atm-mask-right" />
      <GhostWindow kind="api" className="atm-drift-b atm-hide-sm atm-hide-md" soft style={{ right: '4%', bottom: '-1.75rem', width: '14.5rem', opacity: 0.7 }} />
    </>
  );
}

const CLOSING_MAP: MapSpec = {
  align: 'xMidYMax slice',
  edges: ['M0 900 C 360 760, 560 700, 720 700', 'M1440 900 C 1080 760, 880 700, 720 700', 'M720 900 V700'],
  signals: ['M0 900 C 360 760, 560 700, 720 700', 'M1440 900 C 1080 760, 880 700, 720 700'],
  nodes: [{ x: 720, y: 700, ring: true, pulse: true }],
  extra: (
    <>
      <circle className="atm-node-ring" cx={720} cy={900} r={220} />
      <circle className="atm-node-ring atm-edge--dashed" cx={720} cy={900} r={360} />
      <circle className="atm-edge" cx={720} cy={900} r={520} />
    </>
  )
};

function ClosingComposition() {
  return (
    <>
      <Glow tone="green" breathe style={{ left: '50%', bottom: '-55%', width: 'min(70rem, 120vw)', height: 'min(50rem, 90vw)', transform: 'translateX(-50%)' }} />
      <Glow tone="blue" className="atm-hide-sm" style={{ right: '-10%', top: '-30%', width: '36rem', height: '36rem' }} />
      <Topology spec={CLOSING_MAP} />
    </>
  );
}

const OUTER_STARS = constellation(64, 7);

/* Around the System Universe: a wider, fainter field of the same stars, kept
   to the edges so the Universe itself stays the one bright structure. */
const UNIVERSE_MAP: MapSpec = {
  edges: OUTER_STARS.edges,
  nodes: OUTER_STARS.points.map((point, index) => ({ ...point, quiet: index % 4 !== 0, ring: index % 16 === 0 }))
};

function UniverseComposition() {
  return (
    <>
      <Glow tone="green" breathe style={{ left: '50%', top: '50%', width: 'min(70rem, 120vw)', height: 'min(56rem, 110vw)', transform: 'translate(-50%, -50%)' }} />
      <Glow tone="blue" style={{ left: '-14%', top: '-24%', width: '40rem', height: '40rem' }} />
      <Glow tone="blue" className="atm-hide-sm" style={{ right: '-14%', bottom: '-24%', width: '40rem', height: '40rem' }} />
      <Topology spec={UNIVERSE_MAP} className="atm-mask-universe" />
    </>
  );
}

function EditorialComposition() {
  return (
    <>
      <Glow tone="green" style={{ right: '-8%', top: '-30%', width: 'min(44rem, 85vw)', height: 'min(44rem, 85vw)' }} />
      <Glow tone="blue" className="atm-hide-sm" style={{ left: '-12%', bottom: '-50%', width: '36rem', height: '36rem' }} />
    </>
  );
}

const COMPOSITIONS: Record<AtmosphereVariant, () => React.JSX.Element> = {
  hero: HeroComposition,
  systems: SystemsComposition,
  workflow: WorkflowComposition,
  portfolio: PortfolioComposition,
  evidence: EvidenceComposition,
  topology: TopologyComposition,
  blueprint: BlueprintComposition,
  contact: ContactComposition,
  closing: ClosingComposition,
  universe: UniverseComposition,
  editorial: EditorialComposition
};
