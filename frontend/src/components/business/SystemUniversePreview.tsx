import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import { businessSystems } from '@/data/systemUniverse';
import { SectionBackdrop } from './SectionBackdrop';

/** Lightweight homepage summary; the interactive topology remains in /solutions. */
export function SystemUniversePreview({ code = '03 / CONNECTED' }: { code?: string }) {
  return (
    <section className="sect sect--mesh relative overflow-hidden py-section text-white">
      <span aria-hidden="true" className="sect-edge-top sect-edge-top--dark" />
      <SectionBackdrop variant="mesh-dark" pointer />
      <Container wide className="relative">
        <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] lg:gap-16">
          <div>
            <p className="section-code text-brand-300">{code}</p>
            <h2 className="thai-display mt-4 text-statement font-bold text-white">ระบบไม่ได้<br /><span className="text-brand-400">ทำงานแยกกัน</span></h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-brand-100/75">เราออกแบบซอฟต์แวร์ให้ข้อมูลและขั้นตอนของธุรกิจเชื่อมต่อกันได้ ตั้งแต่งานบุคคล เอกสาร สต็อก ไปจนถึงระบบหลังบ้าน</p>
            <ButtonLink to="/solutions" variant="secondary" className="mt-7 border-brand-300/30 bg-white/5 text-white hover:bg-white/10">สำรวจระบบทั้งหมด <ArrowIcon /></ButtonLink>
          </div>
          <div className="relative rounded-panel border border-brand-400/20 bg-brand-900/55 p-4 shadow-lift sm:p-6">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[74%] -translate-x-1/2 bg-brand-400/20" aria-hidden="true" />
            <div className="pointer-events-none absolute left-1/2 top-[16%] h-[68%] w-px -translate-x-1/2 bg-brand-400/20" aria-hidden="true" />
            <div className="relative grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {businessSystems.map((system) => (
                <div key={system.id} className="flex min-h-24 flex-col justify-between rounded-card border border-brand-400/20 bg-brand-900/90 p-3 sm:min-h-28">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-400/30 bg-brand-800 font-mono text-[.55rem] font-semibold text-brand-300">{system.nameEn.slice(0, 2)}</span>
                  <div><p className="text-xs font-semibold text-white">{system.nameEn}</p><p className="mt-1 text-[.6875rem] leading-snug text-brand-100/60">{system.nameTh}</p></div>
                </div>
              ))}
            </div>
            <div className="relative mx-auto -mt-2 flex w-fit items-center gap-2 rounded-pill border border-brand-300/50 bg-brand-600 px-4 py-2 text-xs font-bold shadow-brand-glow"><span className="h-1.5 w-1.5 rounded-full bg-white" /> PDA CORE</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
