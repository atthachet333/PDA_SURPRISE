import type { CaseStudyVisual as VisualKind } from '@/data/caseStudies';
import { cn } from '@/lib/cn';

/** Metric-free interface illustrations derived from verified workflow structure. */
export function CaseStudyVisual({ kind, className }: { kind: VisualKind; className?: string }) {
  return (
    <div className={cn('h-full bg-white p-3 text-ink sm:p-4', className)} aria-label="ภาพจำลองโครงสร้างหน้าจอ ไม่มีข้อมูลจริง">
      <div className="flex h-full flex-col overflow-hidden rounded-card border border-steel-200 bg-steel-50/50">
        <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-steel-200 bg-white px-3"><span className="h-1.5 w-1.5 rounded-full bg-steel-300" /><span className="h-1.5 w-1.5 rounded-full bg-steel-300" /><span className="ml-2 font-mono text-[.5rem] tracking-[.12em] text-steel-400">PDA BLISS · SYSTEM VIEW</span></div>
        <div className="min-h-0 flex-1 p-3 sm:p-4">{kind === 'erp' ? <ErpVisual /> : kind === 'payroll' ? <PayrollVisual /> : kind === 'hrLine' ? <HrVisual /> : kind === 'documents' ? <DocumentVisual /> : <WebsiteVisual />}</div>
      </div>
    </div>
  );
}

function ErpVisual() {
  const stages = ['รับสินค้า', 'สต็อก', 'ต้นทุน', 'รายงาน'];
  return <div className="grid h-full gap-3 sm:grid-cols-[.34fr_1fr]"><div className="hidden rounded-card bg-brand-900 p-3 text-white sm:block"><p className="font-mono text-[.5rem] text-brand-300">ERP MODULES</p><ul className="mt-4 space-y-2">{['คลังสินค้า', 'วัตถุดิบ', 'จัดซื้อ', 'ต้นทุน'].map((item, index) => <li key={item} className={cn('rounded-md px-2 py-1.5 text-[.6rem]', index === 0 ? 'bg-brand-500' : 'text-brand-100/60')}>{item}</li>)}</ul></div><div className="flex min-w-0 flex-col"><p className="text-xs font-semibold">ธุรกรรมสต็อกและต้นทุน</p><div className="mt-3 grid flex-1 grid-cols-2 gap-2">{stages.map((stage, index) => <div key={stage} className={cn('flex flex-col justify-between rounded-card border p-3', index === 0 ? 'border-brand-300 bg-brand-50' : 'border-steel-200 bg-white')}><span className="font-mono text-[.5rem] text-brand-600">0{index + 1}</span><span className="text-[.65rem] font-medium text-steel-700">{stage}</span><span className="h-1 w-2/3 rounded-full bg-steel-200" /></div>)}</div></div></div>;
}

function PayrollVisual() {
  return <div className="flex h-full flex-col"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold">รอบเงินเดือน</p><p className="mt-1 font-mono text-[.48rem] text-steel-400">REVIEW WORKSPACE</p></div><span className="rounded-pill bg-brand-50 px-2 py-1 text-[.5rem] text-brand-700">พร้อมตรวจ</span></div><div className="mt-3 grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">{['นำเข้าเวลา', 'ตรวจข้อยกเว้น', 'คำนวณ', 'อนุมัติ', 'ดำเนินการจ่าย', 'ล็อกรอบ'].map((item, index) => <div key={item} className="rounded-card border border-steel-200 bg-white p-2.5"><span className="font-mono text-[.48rem] text-brand-600">0{index + 1}</span><p className="mt-2 text-[.6rem] font-medium text-steel-700">{item}</p><span className="mt-3 block h-1 rounded-full bg-steel-100"><span className={cn('block h-full rounded-full', index < 2 ? 'w-full bg-brand-400' : 'w-1/3 bg-steel-200')} /></span></div>)}</div></div>;
}

function HrVisual() {
  return <div className="mx-auto flex h-full max-w-sm flex-col overflow-hidden rounded-card border border-steel-200 bg-[#eef2ef]"><div className="flex items-center gap-2 bg-brand-800 px-3 py-2 text-white"><span className="h-5 w-5 rounded-full bg-brand-400" /><span><span className="block text-[.6rem] font-semibold">HR Assistant</span><span className="block font-mono text-[.45rem] text-brand-300">LINE WORKFLOW</span></span></div><div className="flex-1 space-y-2 p-3"><div className="w-3/4 rounded-card bg-white p-2 text-[.58rem] text-steel-600">เลือกประเภทคำขอ</div><div className="ml-auto w-2/3 rounded-card bg-brand-300 p-2 text-[.58rem] text-brand-900">ส่งคำขอลา</div><div className="w-5/6 rounded-card bg-white p-2 text-[.58rem] text-steel-600">คำขอถูกส่งให้ผู้จัดการพิจารณาแล้ว</div></div><div className="grid grid-cols-3 gap-1 border-t border-steel-200 bg-white p-2">{['คำขอ', 'อนุมัติ', 'แจ้งผล'].map((item) => <span key={item} className="rounded-md border border-brand-100 py-1 text-center text-[.5rem] text-brand-700">{item}</span>)}</div></div>;
}

function DocumentVisual() {
  return <div className="grid h-full gap-3 sm:grid-cols-[.32fr_1fr]"><div className="hidden rounded-card border border-steel-200 bg-white p-3 sm:block"><p className="font-mono text-[.5rem] text-steel-400">FOLDERS</p><ul className="mt-3 space-y-2">{['รอตรวจ', 'ต้องแก้ไข', 'อนุมัติแล้ว', 'คลังเอกสาร'].map((item, index) => <li key={item} className={cn('rounded-md px-2 py-1.5 text-[.55rem]', index === 0 ? 'bg-brand-50 text-brand-700' : 'text-steel-500')}>{item}</li>)}</ul></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{['UPLOAD', 'REVIEW', 'REVISE', 'RESUBMIT', 'APPROVE', 'AUDIT'].map((state, index) => <div key={state} className="flex flex-col justify-between rounded-card border border-steel-200 bg-white p-2.5"><span className={cn('h-5 w-4 rounded-sm', index === 4 ? 'bg-brand-400' : 'bg-steel-200')} /><span className="font-mono text-[.48rem] text-steel-500">{state}</span></div>)}</div></div>;
}

function WebsiteVisual() {
  return <div className="flex h-full flex-col overflow-hidden rounded-card border border-steel-200 bg-white"><div className="flex h-9 items-center justify-between border-b border-steel-100 px-3"><span className="text-[.58rem] font-bold text-brand-800">PDA BLISS</span><span className="h-1 w-24 rounded-full bg-steel-200" /></div><div className="grid flex-1 items-center gap-4 bg-[linear-gradient(135deg,#f7f9f7,#eef8f2)] p-4 sm:grid-cols-2"><div><span className="block h-2 w-16 rounded-full bg-brand-300" /><span className="mt-3 block h-3 w-full rounded-full bg-ink/80" /><span className="mt-2 block h-3 w-4/5 rounded-full bg-brand-700" /><span className="mt-4 block h-1.5 w-3/4 rounded-full bg-steel-300" /><span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-steel-200" /></div><div className="grid grid-cols-2 gap-2">{['SERVICES', 'SYSTEMS', 'WORK', 'CONTACT'].map((item) => <span key={item} className="flex min-h-14 items-end rounded-card border border-brand-100 bg-white p-2 font-mono text-[.45rem] text-brand-700">{item}</span>)}</div></div></div>;
}
