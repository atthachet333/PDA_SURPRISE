import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * SYSTEM MOCKS — the product evidence layer.
 *
 * A set of realistic interface mockups for the systems PDA BLISS builds, drawn
 * with real DOM so they stay crisp at any DPI and cost almost nothing to render.
 *
 * WHY THESE EXIST
 *   No portfolio screenshot has cleared the privacy review yet (payroll and
 *   document systems cannot be shown without masking employee and client data —
 *   see docs/SCREENSHOT_PRIVACY.md). A site for a software company still has to
 *   show software, so these stand in until reviewed captures arrive.
 *
 * HONESTY RULES — these are NOT client screenshots and must never read as one.
 *   - Every figure is obviously generic sample data (EMP-001, DOC-2401).
 *   - No client name, no real monetary total, no measured outcome.
 *   - Anywhere a mock is shown at size, the caller labels it as a mockup.
 *   - `data/visuals.ts` maps each slot to a mock today and to a real screenshot
 *     the moment one exists, with no component changes needed.
 */

import { isPhoneMock, type MockKind } from '@/lib/systemMocks';

export type { MockKind };

/**
 * Whether a mock's controls are real.
 *
 * Decorative mocks — the ones drifting behind the Numbers figures, for
 * instance — must NOT contain buttons: they live inside `aria-hidden` layers,
 * so focusable descendants would put 16 invisible controls into the keyboard
 * tab order that a screen reader cannot announce. A context avoids threading a
 * flag through every screen component.
 */
const InteractiveContext = createContext(true);

const useMockInteractive = () => useContext(InteractiveContext);

/* ------------------------------------------------------------------ frames -- */

/** Desktop app chrome. `flush` drops the outer radius for full-bleed use. */
export function BrowserFrame({
  children,
  label,
  className,
  flush = false
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
  flush?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden border border-steel-200 bg-white',
        flush ? 'rounded-none' : 'rounded-card',
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-steel-100 bg-steel-50/80 px-3 py-2">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-steel-300" />
          <span className="h-2 w-2 rounded-full bg-steel-300" />
          <span className="h-2 w-2 rounded-full bg-steel-300" />
        </span>
        {label ? (
          <span className="ml-1 truncate rounded-[4px] bg-white px-2 py-0.5 font-mono text-[0.5625rem] text-steel-400 ring-1 ring-steel-200">
            {label}
          </span>
        ) : null}
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

/** Phone chrome. */
export function PhoneFrame({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-[1.25rem] border-[3px] border-ink bg-white shadow-lift',
        className
      )}
    >
      <div className="relative flex shrink-0 items-center justify-center bg-ink pb-1.5 pt-2">
        <span className="h-1 w-8 rounded-pill bg-white/25" />
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------- shared atoms -- */

/**
 * Sidebar. When `onSelect` is supplied the rows become real buttons, so the
 * mock reacts to a visitor instead of only looking like software.
 */
function Sidebar({
  active,
  onSelect
}: {
  active: number;
  onSelect?: (index: number) => void;
}) {
  // The hook must run unconditionally — `&&` would short-circuit it.
  const contextInteractive = useMockInteractive();
  const interactive = Boolean(onSelect) && contextInteractive;
  return (
    <div className="hidden w-[4.5rem] shrink-0 flex-col gap-1 border-r border-steel-100 bg-steel-50/60 p-2 sm:flex lg:w-24">
      <span className="mb-1 flex items-center gap-1.5 px-1">
        <span className="h-3.5 w-3.5 rounded-[4px] bg-brand-500" />
        <span className="hidden h-1.5 w-8 rounded-pill bg-steel-300 lg:block" />
      </span>
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <Row
          key={row}
          interactive={interactive}
          onSelect={onSelect ? () => onSelect(row) : undefined}
          className={cn(
            'flex items-center gap-1.5 rounded-[5px] px-1 py-1.5 transition-colors duration-fast',
            row === active ? 'bg-brand-50' : interactive ? 'hover:bg-steel-100' : ''
          )}
        >
          <span
            className={cn(
              'h-2.5 w-2.5 shrink-0 rounded-[3px]',
              row === active ? 'bg-brand-500' : 'bg-steel-300'
            )}
          />
          <span
            className={cn(
              'hidden h-1 rounded-pill lg:block',
              row === active ? 'w-9 bg-brand-400' : 'w-7 bg-steel-200'
            )}
          />
        </Row>
      ))}
    </div>
  );
}

/**
 * A control that is a real `button` when the mock is interactive and a plain
 * `span` when it is decorative — so a background mock never contributes
 * focusable elements to the page.
 */
function Control({
  onSelect,
  className,
  children
}: {
  onSelect?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const interactive = useMockInteractive();
  if (!interactive) {
    /*
      Strip hover utilities as well as the button element. A decorative mock
      that still lit up on hover would be a fake affordance, and these sit
      inside aria-hidden layers where nothing is clickable.
    */
    const inert = (className ?? '')
      .split(' ')
      .filter((token) => !token.startsWith('hover:') && !token.startsWith('group-hover:'))
      .join(' ');
    return <span className={inert}>{children}</span>;
  }
  return (
    <button type="button" onClick={onSelect} onPointerEnter={onSelect} className={className}>
      {children}
    </button>
  );
}

/**
 * A row that is a real `button` when it does something and a plain `span` when
 * it does not — so a mock never shows a hover state it cannot honour.
 */
function Row({
  interactive,
  onSelect,
  className,
  children
}: {
  interactive: boolean;
  onSelect?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  if (!interactive) {
    const inert = (className ?? '')
      .split(' ')
      .filter((token) => !token.startsWith('hover:') && !token.startsWith('group-hover:'))
      .join(' ');
    return <span className={inert}>{children}</span>;
  }
  return (
    <button type="button" onClick={onSelect} onPointerEnter={onSelect} className={cn('w-full text-left', className)}>
      {children}
    </button>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="min-w-0 rounded-[6px] border border-steel-100 bg-white px-2.5 py-2">
      <p className="truncate font-mono text-[0.5rem] uppercase tracking-[0.12em] text-steel-400">
        {label}
      </p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-sm font-semibold tabular-nums text-ink">{value}</span>
        {delta ? (
          <span className="font-mono text-[0.5rem] text-brand-600">{delta}</span>
        ) : null}
      </p>
    </div>
  );
}

function Bars({ data, highlight }: { data: number[]; highlight?: number }) {
  return (
    <div className="flex h-full items-end gap-[3px]">
      {data.map((height, index) => (
        <span
          key={index}
          className={cn(
            'flex-1 rounded-t-[2px]',
            index === (highlight ?? data.length - 1) ? 'bg-brand-500' : 'bg-steel-200'
          )}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function Pill({ tone, children }: { tone: 'ok' | 'warn' | 'idle'; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-pill px-1.5 py-px font-mono text-[0.4375rem] uppercase tracking-[0.08em]',
        tone === 'ok' && 'bg-brand-50 text-brand-700',
        tone === 'warn' && 'bg-amber-50 text-amber-700',
        tone === 'idle' && 'bg-steel-100 text-steel-500'
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- the screens -- */

/**
 * ERP: production and stock overview.
 *
 * Picking a module in the sidebar swaps the chart series and the headline
 * figure. Lightweight on purpose — enough for the panel to feel like software a
 * person can touch, nothing like real application behaviour.
 */
const ERP_MODULES = [
  { label: 'ภาพรวมการผลิต', orders: '1,284', bars: [44, 62, 38, 74, 52, 86, 58, 92, 68, 78, 60, 88] },
  { label: 'คลังสินค้า', orders: '3,910', bars: [62, 48, 70, 55, 82, 60, 74, 66, 88, 58, 72, 80] },
  { label: 'จัดซื้อ', orders: '642', bars: [30, 44, 36, 58, 42, 66, 50, 72, 46, 60, 54, 68] },
  { label: 'ต้นทุน', orders: '218', bars: [70, 58, 76, 64, 84, 72, 90, 66, 78, 86, 68, 94] },
  { label: 'รายงาน', orders: '96', bars: [24, 40, 32, 52, 38, 60, 44, 68, 40, 56, 48, 64] },
  { label: 'ตั้งค่า', orders: '12', bars: [18, 26, 22, 34, 28, 40, 30, 46, 26, 38, 32, 44] }
];

export function ErpScreen() {
  const [module, setModule] = useState(1);
  const view = ERP_MODULES[module] ?? ERP_MODULES[0]!;

  return (
    <div className="flex h-full">
      <Sidebar active={module} onSelect={setModule} />
      <div className="flex min-w-0 flex-1 flex-col p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[0.6875rem] font-semibold text-ink">{view.label}</p>
          <span className="hidden shrink-0 rounded-[4px] bg-brand-500 px-2 py-1 font-mono text-[0.5rem] text-white sm:block">
            + ใบสั่งผลิต
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <Kpi label="ใบสั่งผลิต" value={view.orders} delta="+12%" />
          <Kpi label="รอผลิต" value="7" />
          <Kpi label="คลัง" value="99.4%" />
          <Kpi label="ของเสีย" value="0.6%" />
        </div>

        <div className="mt-2.5 min-h-0 flex-1 rounded-[6px] border border-steel-100 p-2.5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-steel-400">
              กำลังการผลิต / สัปดาห์
            </span>
            <span className="font-mono text-[0.5rem] text-steel-300">SAMPLE</span>
          </div>
          <div className="mt-2 h-[calc(100%-1.25rem)] min-h-[2rem]">
            <Bars data={view.bars} />
          </div>
        </div>

        <div className="mt-2.5 space-y-1">
          {[
            { id: 'MO-4821', tone: 'ok' as const, state: 'running' },
            { id: 'MO-4822', tone: 'warn' as const, state: 'hold' },
            { id: 'MO-4823', tone: 'idle' as const, state: 'queued' }
          ].map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <span className="font-mono text-[0.5rem] text-steel-500">{row.id}</span>
              <span className="h-px flex-1 bg-steel-100" />
              <span className="hidden h-1 w-10 rounded-pill bg-steel-200 sm:block" />
              <Pill tone={row.tone}>{row.state}</Pill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Payroll: a pay run being reviewed. Amounts are obviously sample values. */
export function PayrollScreen() {
  const [view, setView] = useState<'rows' | 'summary'>('rows');
  const rows = [
    { id: 'EMP-001', amount: '32,500', tone: 'ok' as const },
    { id: 'EMP-002', amount: '28,900', tone: 'ok' as const },
    { id: 'EMP-003', amount: '41,200', tone: 'warn' as const },
    { id: 'EMP-004', amount: '26,750', tone: 'ok' as const }
  ];

  return (
    <div className="flex h-full">
      <Sidebar active={2} />
      <div className="flex min-w-0 flex-1 flex-col p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[0.6875rem] font-semibold text-ink">รอบเงินเดือน</p>
            <p className="font-mono text-[0.5rem] text-steel-400">PERIOD 2026-09 · SAMPLE</p>
          </div>
          {/* A real toggle between the run list and the summary. */}
          <span className="flex shrink-0 gap-1">
            {(['rows', 'summary'] as const).map((mode) => (
              <Control
                key={mode}
                onSelect={() => setView(mode)}
                className={cn(
                  'rounded-[4px] border px-2 py-1 font-mono text-[0.5rem] transition-colors duration-fast',
                  view === mode
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-steel-200 text-steel-400 hover:border-steel-300'
                )}
              >
                {mode === 'rows' ? 'รายคน' : 'สรุป'}
              </Control>
            ))}
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <Kpi label="พนักงาน" value="128" />
          <Kpi label="ผ่านการตรวจ" value="124" />
          <Kpi label="ต้องแก้ไข" value="4" />
        </div>

        <div className="mt-2.5 min-h-0 flex-1 overflow-hidden rounded-[6px] border border-steel-100">
          {view === 'summary' ? (
            <div className="flex h-full flex-col justify-center gap-2 p-3">
              {[
                { label: 'เงินเดือนพื้นฐาน', pct: 78 },
                { label: 'ค่าล่วงเวลา', pct: 34 },
                { label: 'ประกันสังคม', pct: 18 },
                { label: 'ภาษีหัก ณ ที่จ่าย', pct: 26 }
              ].map((bar, index) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
                      {bar.label}
                    </span>
                  </div>
                  <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-pill bg-steel-100">
                    <span
                      className={cn('block h-full rounded-pill', index === 0 ? 'bg-brand-500' : 'bg-brand-300')}
                      style={{ width: `${bar.pct}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          ) : (
          <>
          <div className="flex items-center gap-2 border-b border-steel-100 bg-steel-50/70 px-2.5 py-1.5">
            <span className="w-14 font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
              รหัส
            </span>
            <span className="flex-1 font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
              เวลาทำงาน
            </span>
            <span className="font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
              สุทธิ
            </span>
          </div>
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-2 border-b border-steel-50 px-2.5 py-[0.3125rem] last:border-b-0"
            >
              <span className="w-14 shrink-0 font-mono text-[0.5rem] text-steel-500">{row.id}</span>
              <span className="flex flex-1 items-center gap-1">
                <span className="h-1 w-full rounded-pill bg-steel-200" />
              </span>
              <span className="shrink-0 font-mono text-[0.5rem] tabular-nums text-ink">
                {row.amount}
              </span>
              <Pill tone={row.tone}>{row.tone === 'ok' ? 'ok' : 'check'}</Pill>
            </div>
          ))}
          </>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between rounded-[6px] bg-brand-50 px-2.5 py-1.5">
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.1em] text-brand-700">
            ยอดรวมรอบนี้
          </span>
          <span className="font-mono text-[0.625rem] font-semibold tabular-nums text-brand-800">
            3,842,150
          </span>
        </div>
      </div>
    </div>
  );
}

/** Document management: folders, files, versioning. */
export function DocumentsScreen() {
  const [selected, setSelected] = useState(1);
  const [folder, setFolder] = useState(0);
  return (
    <div className="flex h-full">
      <div className="hidden w-24 shrink-0 flex-col gap-1 border-r border-steel-100 bg-steel-50/60 p-2 sm:flex">
        <span className="mb-1 h-1.5 w-12 rounded-pill bg-steel-300" />
        {['สัญญา', 'ใบกำกับ', 'HR', 'บัญชี', 'อื่น ๆ'].map((name, index) => (
          <Control
            key={name}
            onSelect={() => setFolder(index)}
            className={cn(
              'flex w-full items-center gap-1.5 rounded-[5px] px-1 py-1 text-left transition-colors duration-fast',
              index === folder ? 'bg-brand-50' : 'hover:bg-steel-100'
            )}
          >
            <span
              className={cn(
                'h-2.5 w-3 shrink-0 rounded-[2px]',
                index === folder ? 'bg-brand-400' : 'bg-steel-300'
              )}
            />
            <span className="truncate text-[0.5rem] text-steel-500">{name}</span>
          </Control>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3">
        <div className="flex items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[5px] border border-steel-200 px-2 py-1">
            <span className="h-2 w-2 shrink-0 rounded-full border border-steel-300" />
            <span className="h-1 w-16 rounded-pill bg-steel-200" />
          </span>
          <span className="shrink-0 rounded-[4px] bg-brand-500 px-2 py-1 font-mono text-[0.5rem] text-white">
            อัปโหลด
          </span>
        </div>

        <div className="mt-2.5 grid min-h-0 flex-1 grid-cols-3 gap-1.5 sm:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((file) => (
            <Control
              key={file}
              onSelect={() => setSelected(file)}
              className={cn(
                'flex min-h-0 flex-col justify-between rounded-[5px] border p-1.5 text-left transition-colors duration-fast',
                file === selected
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-steel-100 hover:border-steel-200'
              )}
            >
              <span
                className={cn(
                  'h-3 w-2.5 rounded-[2px]',
                  file === selected ? 'bg-brand-400' : 'bg-steel-200'
                )}
              />
              <span className="space-y-0.5">
                <span className="block h-1 w-full rounded-pill bg-steel-200" />
                <span className="block font-mono text-[0.4375rem] text-steel-400">
                  DOC-240{file + 1}
                </span>
              </span>
            </Control>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-steel-100 pt-2">
          <span className="font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
            DOC-240{selected + 1} · v.4 · สิทธิ์: ฝ่ายบัญชี
          </span>
          <span className="font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-brand-600">
            synced
          </span>
        </div>
      </div>
    </div>
  );
}

/** HR LINE bot: clock-in and leave, in a LINE-style thread. */
export function HrLineScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 bg-brand-800 px-2.5 py-2">
        <span className="h-4 w-4 rounded-full bg-brand-400" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.5rem] font-semibold text-white">HR Assistant</span>
          <span className="block font-mono text-[0.4375rem] text-brand-300">LINE OFFICIAL</span>
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden bg-steel-200 p-2">
        <div className="w-[82%] rounded-[8px] rounded-tl-[2px] bg-white px-2 py-1.5">
          <span className="block text-[0.5rem] leading-snug text-steel-600">
            เลือกรายการที่ต้องการ
          </span>
        </div>
        <div className="ml-auto w-[62%] rounded-[8px] rounded-br-[2px] bg-brand-400 px-2 py-1.5">
          <span className="block text-[0.5rem] leading-snug text-brand-900">ลงเวลาเข้างาน</span>
        </div>
        <div className="w-[88%] rounded-[8px] rounded-tl-[2px] bg-white px-2 py-1.5">
          <span className="block text-[0.5rem] leading-snug text-steel-600">
            บันทึกเวลาเรียบร้อย
          </span>
          <span className="mt-1 block font-mono text-[0.4375rem] text-brand-600">
            08:57 · สำนักงานใหญ่
          </span>
        </div>
      </div>

      <div className="shrink-0 space-y-1 border-t border-steel-200 bg-white p-1.5">
        <div className="flex gap-1">
          <span className="flex-1 rounded-[5px] border border-brand-200 bg-brand-50 py-1 text-center text-[0.4375rem] text-brand-700">
            ลงเวลา
          </span>
          <span className="flex-1 rounded-[5px] border border-steel-200 py-1 text-center text-[0.4375rem] text-steel-500">
            ยื่นลา
          </span>
        </div>
        <span className="block rounded-[5px] border border-steel-200 py-1 text-center text-[0.4375rem] text-steel-500">
          สลิปเงินเดือน
        </span>
      </div>
    </div>
  );
}

/** Corporate website. */
export function WebsiteScreen() {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-steel-100 px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px] bg-brand-500" />
          <span className="h-1.5 w-12 rounded-pill bg-steel-300" />
        </span>
        <span className="hidden gap-2 sm:flex">
          {[0, 1, 2, 3].map((nav) => (
            <span key={nav} className="h-1 w-6 rounded-pill bg-steel-200" />
          ))}
        </span>
        <span className="h-3.5 w-14 rounded-pill bg-brand-500" />
      </div>

      <div className="min-h-0 flex-1 p-3">
        <span className="block h-2.5 w-1/2 rounded-pill bg-ink/80" />
        <span className="mt-1.5 block h-2.5 w-2/5 rounded-pill bg-brand-500" />
        <span className="mt-2.5 block h-1 w-4/5 rounded-pill bg-steel-200" />
        <span className="mt-1 block h-1 w-3/5 rounded-pill bg-steel-200" />
        <span className="mt-2.5 flex gap-1.5">
          <span className="h-4 w-16 rounded-pill bg-brand-500" />
          <span className="h-4 w-14 rounded-pill border border-steel-200" />
        </span>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((card) => (
            <span
              key={card}
              className="flex h-12 flex-col justify-between rounded-[5px] border border-steel-100 p-1.5"
            >
              <span className="h-2.5 w-2.5 rounded-[3px] bg-brand-100" />
              <span className="space-y-0.5">
                <span className="block h-1 w-full rounded-pill bg-steel-200" />
                <span className="block h-1 w-2/3 rounded-pill bg-steel-100" />
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** NAS / storage. */
export function NasScreen() {
  return (
    <div className="flex h-full">
      <Sidebar active={4} />
      <div className="flex min-w-0 flex-1 flex-col p-3">
        <p className="truncate text-[0.6875rem] font-semibold text-ink">พื้นที่จัดเก็บเอกสาร</p>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <Kpi label="ใช้ไป" value="1.2 TB" />
          <Kpi label="คงเหลือ" value="2.8 TB" />
          <Kpi label="สำรองล่าสุด" value="02:00" />
        </div>

        <div className="mt-2.5 space-y-2 rounded-[6px] border border-steel-100 p-2.5">
          {[
            { label: 'VOLUME 01', pct: 62 },
            { label: 'VOLUME 02', pct: 38 },
            { label: 'ARCHIVE', pct: 84 }
          ].map((vol) => (
            <div key={vol.label}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
                  {vol.label}
                </span>
                <span className="font-mono text-[0.4375rem] tabular-nums text-steel-500">
                  {vol.pct}%
                </span>
              </div>
              <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-pill bg-steel-100">
                <span
                  className={cn(
                    'block h-full rounded-pill',
                    vol.pct > 80 ? 'bg-amber-400' : 'bg-brand-500'
                  )}
                  style={{ width: `${vol.pct}%` }}
                />
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 min-h-0 flex-1 space-y-1">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="h-2.5 w-2 rounded-[2px] bg-steel-200" />
              <span className="h-1 flex-1 rounded-pill bg-steel-100" />
              <span className="font-mono text-[0.4375rem] text-steel-400">
                {(row + 1) * 14} MB
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Approval workflow. */
export function WorkflowScreen() {
  const lanes = ['คำขอ', 'หัวหน้า', 'บัญชี', 'อนุมัติ'];
  return (
    <div className="flex h-full flex-col p-3">
      <p className="truncate text-[0.6875rem] font-semibold text-ink">เส้นทางอนุมัติเอกสาร</p>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-4 gap-1.5">
        {lanes.map((lane, index) => (
          <div key={lane} className="flex min-h-0 flex-col">
            <span className="mb-1.5 flex items-center gap-1">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  index === lanes.length - 1 ? 'bg-brand-500' : 'bg-steel-300'
                )}
              />
              <span className="truncate font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
                {lane}
              </span>
            </span>
            <div className="min-h-0 flex-1 space-y-1 rounded-[5px] bg-steel-50/70 p-1">
              {Array.from({ length: index === 0 ? 3 : index === 3 ? 1 : 2 }).map((_, card) => (
                <span
                  key={card}
                  className={cn(
                    'block space-y-0.5 rounded-[4px] border bg-white p-1',
                    index === 3 ? 'border-brand-200' : 'border-steel-100'
                  )}
                >
                  <span className="block h-1 w-full rounded-pill bg-steel-200" />
                  <span className="block h-1 w-1/2 rounded-pill bg-steel-100" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-steel-100 pt-2">
        <span className="font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
          เฉลี่ย 1.1 วัน · SAMPLE
        </span>
        <Pill tone="ok">auditable</Pill>
      </div>
    </div>
  );
}

/** Tracking / dispatch. */
export function TrackingScreen() {
  return (
    <div className="flex h-full flex-col p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[0.6875rem] font-semibold text-ink">ติดตามงานหน้างาน</p>
        <Pill tone="ok">live</Pill>
      </div>
      <div className="mt-2.5 grid min-h-0 flex-1 grid-cols-5 gap-1.5">
        <div className="col-span-3 min-h-0 overflow-hidden rounded-[6px] border border-steel-100 bg-steel-50/60">
          <div className="relative h-full">
            <span
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(6,59,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,59,42,0.05) 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            />
            <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full">
              <path
                d="M8 48 C 26 40, 34 24, 52 20 S 78 14, 92 8"
                fill="none"
                stroke="#1DAA61"
                strokeWidth="1"
                strokeDasharray="3 2"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx="8" cy="48" r="2" fill="#9AA89F" />
              <circle cx="52" cy="20" r="2.5" fill="#1DAA61" />
              <circle cx="92" cy="8" r="2" fill="#9AA89F" />
            </svg>
          </div>
        </div>
        <div className="col-span-2 min-h-0 space-y-1">
          {[
            { id: 'JOB-118', tone: 'ok' as const },
            { id: 'JOB-119', tone: 'ok' as const },
            { id: 'JOB-120', tone: 'warn' as const },
            { id: 'JOB-121', tone: 'idle' as const }
          ].map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-1.5 rounded-[4px] border border-steel-100 px-1.5 py-1"
            >
              <span className="font-mono text-[0.4375rem] text-steel-500">{job.id}</span>
              <span className="h-1 flex-1 rounded-pill bg-steel-100" />
              <Pill tone={job.tone}>{job.tone === 'ok' ? 'on' : job.tone === 'warn' ? 'late' : 'new'}</Pill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Analytics dashboard. */
const ANALYTICS_PERIODS = [
  { label: '7D', bars: [38, 52, 46, 68, 58, 78, 66, 88, 74, 92], total: '4,128' },
  { label: '30D', bars: [62, 48, 74, 58, 86, 64, 92, 70, 80, 96], total: '17,540' },
  { label: '90D', bars: [44, 70, 52, 82, 60, 90, 68, 76, 88, 98], total: '52,306' }
];

export function AnalyticsScreen() {
  const [period, setPeriod] = useState(0);
  const view = ANALYTICS_PERIODS[period] ?? ANALYTICS_PERIODS[0]!;
  return (
    <div className="flex h-full">
      <Sidebar active={5} />
      <div className="flex min-w-0 flex-1 flex-col p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[0.6875rem] font-semibold text-ink">Dashboard ผู้บริหาร</p>
          <span className="flex shrink-0 gap-1">
            {ANALYTICS_PERIODS.map((item, index) => (
              <Control
                key={item.label}
                onSelect={() => setPeriod(index)}
                className={cn(
                  'rounded-[4px] border px-1.5 py-0.5 font-mono text-[0.4375rem] transition-colors duration-fast',
                  index === period
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-steel-200 text-steel-400 hover:border-steel-300'
                )}
              >
                {item.label}
              </Control>
            ))}
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-4 gap-1.5">
          <Kpi label="รายการ" value={view.total} delta="+8%" />
          <Kpi label="รอดำเนินการ" value="36" />
          <Kpi label="เฉลี่ย/วัน" value="182" />
          <Kpi label="ผิดปกติ" value="2" />
        </div>
        <div className="mt-2.5 grid min-h-0 flex-1 grid-cols-3 gap-1.5">
          <div className="col-span-2 rounded-[6px] border border-steel-100 p-2">
            <span className="font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
              แนวโน้ม · SAMPLE
            </span>
            <div className="mt-1.5 h-[calc(100%-1rem)] min-h-[2rem]">
              <Bars data={view.bars} />
            </div>
          </div>
          <div className="space-y-1.5 rounded-[6px] border border-steel-100 p-2">
            {[64, 42, 28].map((pct, index) => (
              <div key={pct}>
                <span className="block h-1 w-full overflow-hidden rounded-pill bg-steel-100">
                  <span
                    className={cn('block h-full rounded-pill', index === 0 ? 'bg-brand-500' : 'bg-brand-200')}
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </div>
            ))}
            <span className="mt-1 block h-8 rounded-[4px] bg-steel-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- registry -- */

const SCREENS: Record<MockKind, () => JSX.Element> = {
  erp: ErpScreen,
  payroll: PayrollScreen,
  documents: DocumentsScreen,
  hrLine: HrLineScreen,
  website: WebsiteScreen,
  nas: NasScreen,
  workflow: WorkflowScreen,
  tracking: TrackingScreen,
  analytics: AnalyticsScreen
};

/**
 * Renders a system mock, framed. `frame="none"` gives the bare screen for
 * callers that supply their own chrome.
 */
export function SystemMock({
  kind,
  label,
  className,
  frame = 'auto',
  flush = false,
  interactive = true
}: {
  kind: MockKind;
  label?: string;
  className?: string;
  frame?: 'auto' | 'browser' | 'phone' | 'none';
  flush?: boolean;
  /**
   * False for decorative instances (backgrounds, watermarks). Renders every
   * control as a span so the mock adds nothing to the tab order.
   */
  interactive?: boolean;
}) {
  const Screen = SCREENS[kind];
  const resolved = frame === 'auto' ? (isPhoneMock(kind) ? 'phone' : 'browser') : frame;

  const body =
    resolved === 'none' ? (
      <div className={cn('h-full bg-white', className)}>
        <Screen />
      </div>
    ) : resolved === 'phone' ? (
      <PhoneFrame className={className}>
        <Screen />
      </PhoneFrame>
    ) : (
      <BrowserFrame label={label} className={className} flush={flush}>
        <Screen />
      </BrowserFrame>
    );

  /*
   * The miniature interfaces depict the Thai-language software delivered to
   * Thai businesses, so their text is Thai on every locale — part of the
   * artwork, like text inside a screenshot. `lang="th"` tells assistive tech
   * (and the CJK font rules) what it is on /en and /zh pages; `contents`
   * keeps the wrapper out of layout.
   */
  return (
    <InteractiveContext.Provider value={interactive}>
      <div lang="th" data-system-mock="" className="contents">
        {body}
      </div>
    </InteractiveContext.Provider>
  );
}
