import { motion } from 'framer-motion';
import { BigCTA } from '@/components/business/BigCTA';
import { CategoryLegend, SystemUniverse } from '@/components/business/SystemUniverse';
import { SectionBackdrop } from '@/components/business/SectionBackdrop';
import { Container } from '@/components/shared/Layout';
import { RevealLines } from '@/components/shared/RevealLines';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pageMeta } from '@/lib/seo';

const WORKFLOWS = [
  {
    code: 'PEOPLE FLOW',
    title: 'คำขอลาของพนักงาน',
    steps: ['พนักงานส่งคำขอ', 'HR LINE BOT', 'หัวหน้าอนุมัติ', 'Payroll รับข้อมูลวันลา'],
    note: 'ตัวอย่าง Workflow ที่สามารถออกแบบให้ข้อมูลไหลต่อกัน ลดการส่งต่อด้วยไฟล์หรือข้อความซ้ำ'
  },
  {
    code: 'OPERATIONS FLOW',
    title: 'รับสินค้าเข้าคลัง',
    steps: ['บันทึกรับสินค้า', 'ERP', 'อัปเดตสต็อก', 'ต้นทุนและรายงาน'],
    note: 'รายการต้นทางเดียวสามารถนำไปใช้กับยอดคงเหลือ ต้นทุน และรายงานตามขอบเขตระบบที่ตกลงกัน'
  }
] as const;

export default function Solutions() {
  usePageMeta(pageMeta.solutions);
  const reduced = useReducedMotion();

  return (
    <>
      <section className="sect sect--hero relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-36">
        <SectionBackdrop variant="aurora" pointer />
        <Container wide className="relative">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.7fr)] lg:gap-16">
            <div>
              <p className="section-code">01 / PDA SYSTEM UNIVERSE</p>
              <RevealLines as="h1" lines={['ระบบไม่ได้', 'ทำงานแยกกัน']} className="thai-display mt-6 text-mega font-bold text-ink" lineClassName={(index) => index === 1 ? 'text-brand-700' : undefined} />
              <motion.p initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .25 }} className="mt-7 max-w-2xl text-lead text-steel-600">PDA BLISS ออกแบบซอฟต์แวร์ให้ข้อมูลและขั้นตอนของธุรกิจสามารถเชื่อมต่อกันได้ ตั้งแต่งานบุคคล เอกสาร สต็อก ไปจนถึงระบบหลังบ้าน</motion.p>
            </div>
            <div className="rounded-panel border border-brand-200 bg-white/80 p-5 shadow-soft backdrop-blur-sm sm:p-6">
              <p className="font-mono text-[.62rem] tracking-[.18em] text-brand-600">ECOSYSTEM CAPABLE</p>
              <p className="thai-display mt-3 text-lg font-semibold text-ink">เริ่มจากระบบที่ธุรกิจต้องการ แล้วออกแบบเส้นทางข้อมูลให้เติบโตต่อได้</p>
              <p className="mt-3 text-sm leading-relaxed text-steel-500">แต่ละโครงการเชื่อมต่อไม่เหมือนกัน แผนภาพนี้จึงสื่อถึงความสามารถในการทำงานร่วมกัน ไม่ได้อ้างว่าทุกระบบเชื่อมต่ออยู่แล้ว</p>
            </div>
          </div>
          <div className="mt-10"><CategoryLegend /></div>
        </Container>
      </section>

      <SystemUniverse />

      <section className="sect sect--paper relative overflow-hidden py-section">
        <span aria-hidden="true" className="sect-edge-top" />
        <Container wide>
          <div className="grid gap-8 lg:grid-cols-[minmax(16rem,.56fr)_minmax(0,1.44fr)] lg:gap-16">
            <div>
              <p className="section-code">03 / BUSINESS FLOW</p>
              <h2 className="thai-display mt-4 text-statement font-bold text-ink">เส้นเชื่อมต้อง<br /><span className="text-brand-700">มีความหมาย</span></h2>
              <p className="mt-4 text-sm leading-relaxed text-steel-600">เราเริ่มจากสิ่งที่คนในธุรกิจทำจริง แล้วกำหนดว่าข้อมูลควรไปต่อที่ไหน โดยไม่เพิ่มเส้นเชื่อมเพียงเพื่อให้แผนภาพดูซับซ้อน</p>
            </div>
            <div className="space-y-5">
              {WORKFLOWS.map((flow) => (
                <article key={flow.code} className="rounded-panel border border-steel-200 bg-white p-5 shadow-soft sm:p-7">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between"><p className="font-mono text-[.62rem] tracking-[.16em] text-brand-600">{flow.code}</p><h3 className="thai-display text-lg font-bold text-ink">{flow.title}</h3></div>
                  <ol className="mt-6 grid gap-2 sm:grid-cols-4">
                    {flow.steps.map((step, index) => <li key={step} className="relative flex min-h-20 items-center rounded-card border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800"><span className="mr-3 font-mono text-[.6rem] text-brand-500">0{index + 1}</span>{step}{index < flow.steps.length - 1 ? <span aria-hidden="true" className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-brand-500 sm:block">→</span> : null}</li>)}
                  </ol>
                  <p className="mt-4 text-xs leading-relaxed text-steel-500">{flow.note}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <BigCTA code="04 / START" />
    </>
  );
}
