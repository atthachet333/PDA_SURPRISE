import { Container } from '@/components/shared/Layout';

const values = [
  { icon: '↺', label: 'ลดงานซ้ำ', detail: 'ให้ระบบทำงานตามรอบแทนคน' },
  { icon: '⌘', label: 'รวมข้อมูล', detail: 'ทุกทีมอ้างอิงข้อมูลชุดเดียวกัน' },
  { icon: '◎', label: 'ตรวจสอบย้อนหลัง', detail: 'เห็นที่มาของทุกการเปลี่ยนแปลง' },
  { icon: '↗', label: 'ติดตามสถานะ', detail: 'รู้ว่างานค้างอยู่ที่ขั้นตอนไหน' },
  { icon: '+', label: 'รองรับการขยายระบบ', detail: 'ต่อยอดตามธุรกิจได้โดยไม่ต้องรื้อใหม่' }
];

export function BusinessValueStrip({ code = '04 / BUSINESS VALUE' }: { code?: string }) {
  return (
    <section className="sect relative overflow-hidden border-y border-brand-200/70 bg-brand-50 py-10 sm:py-12">
      <Container wide>
        <p className="section-code">{code}</p>
        <ul className="mt-7 grid gap-px overflow-hidden rounded-card border border-brand-200/70 bg-brand-200/70 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((value) => (
            <li key={value.label} className="bg-brand-50 p-5 sm:p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-300 bg-white font-mono text-sm text-brand-700">{value.icon}</span>
              <p className="thai-display mt-4 text-sm font-bold text-ink">{value.label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-steel-600">{value.detail}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
