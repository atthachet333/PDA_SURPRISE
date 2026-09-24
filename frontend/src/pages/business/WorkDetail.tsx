import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BigCTA } from '@/components/business/BigCTA';
import { CaseStudyFlow } from '@/components/business/CaseStudyFlow';
import { CaseStudyVisual } from '@/components/business/CaseStudyVisual';
import { ProjectAccessNote, ProjectLiveButton, ProjectTags, ProjectVisual } from '@/components/business/ProjectParts';
import { SectionBackdrop } from '@/components/business/SectionBackdrop';
import { ArrowIcon, ButtonLink } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import {
  caseStudies,
  caseStudyCategories,
  caseStudyStatusLabels,
  getCaseStudy,
  type CaseStudy
} from '@/data/caseStudies';
import { getSystemById } from '@/data/systemUniverse';
import { contactHref, contactServiceFromRoute } from '@/data/contactRouting';
import type { LocalizedPageMeta, PageMeta } from '@/lib/seo';
import { pageMeta } from '@/lib/seo';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function WorkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const study = slug ? getCaseStudy(slug) : undefined;
  const meta = useMemo<PageMeta | LocalizedPageMeta>(() => study ? {
    title: `${study.title} — PDA BLISS`,
    description: `${study.subtitle} — ${study.delivered}`,
    path: `/work/${study.slug}`
  } : pageMeta.work, [study]);
  usePageMeta(meta);

  if (!study) return <Navigate to="/work" replace />;
  return <CaseStudyDetail study={study} />;
}

function CaseStudyDetail({ study }: { study: CaseStudy }) {
  const currentIndex = caseStudies.findIndex((entry) => entry.id === study.id);
  const next = caseStudies[(currentIndex + 1) % caseStudies.length];
  const category = caseStudyCategories.find((entry) => entry.id === study.category)?.label;
  const relatedSystems = study.relatedSystems.map(getSystemById).filter((system) => system !== undefined);
  const reviewedScreens = study.screens.filter((screen) => screen.reviewed);
  const contactService = contactServiceFromRoute(study.serviceRoute);

  return (
    <>
      <section className="sect sect--deep relative overflow-hidden pb-16 pt-32 text-white sm:pb-20 sm:pt-40">
        <SectionBackdrop variant="mesh-dark" pointer />
        <Container wide className="relative">
          <Link to="/work" className="group inline-flex min-h-11 items-center gap-2 text-sm text-brand-100/60 transition-colors hover:text-white"><ArrowIcon className="rotate-180 transition-transform group-hover:-translate-x-1" />กลับไปหน้าผลงาน</Link>
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,.9fr)_minmax(22rem,.7fr)] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-pill border border-brand-400/30 px-3 py-1 font-mono text-[.58rem] tracking-[.14em] text-brand-300">{caseStudyStatusLabels[study.status]}</span><span className="text-xs text-brand-100/50">{category}</span></div>
              <h1 className="thai-display mt-6 max-w-4xl text-mega font-bold">{study.title}</h1>
              <p className="mt-6 max-w-2xl text-lead text-brand-100/75">{study.subtitle}</p>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-brand-100/55">ระบบนี้แก้โจทย์อะไร: {study.problem}</p>
              <ProjectTags tags={study.tags} className="mt-6" />
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <ProjectLiveButton study={study} />
                <ProjectAccessNote study={study} className="text-brand-100/60" />
              </div>
            </div>
            <ProjectVisual study={study} priority className="shadow-lift-lg" />
          </div>
        </Container>
      </section>

      <section className="sect sect--bright relative py-section">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-[minmax(15rem,.38fr)_minmax(0,1fr)] lg:gap-20">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="section-code">01 / PROBLEM</p>
              <h2 className="thai-display mt-4 text-statement font-bold text-ink">เริ่มจากปัญหา<br /><span className="text-brand-700">ไม่ใช่หน้าจอ</span></h2>
            </aside>
            <div>
              <p className="text-lead font-medium text-ink">{study.problem}</p>
              <p className="mt-6 text-base leading-relaxed text-steel-600">{study.context}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="sect sect--paper relative py-section">
        <Container wide>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div><p className="section-code">02 / SOLUTION</p><h2 className="thai-display mt-4 text-statement font-bold text-ink">ออกแบบ Workflow<br /><span className="text-brand-700">ให้ข้อมูลไปต่อได้</span></h2><p className="mt-6 text-base leading-relaxed text-steel-600">{study.solution}</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Comparison title="BEFORE" items={study.before} tone="neutral" />
              <Comparison title="AFTER" items={study.after} tone="brand" />
            </div>
          </div>
        </Container>
      </section>

      <section className="sect sect--field relative overflow-hidden py-section">
        <Container wide>
          <p className="section-code">03 / HOW IT WORKS</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><h2 className="thai-display text-statement font-bold text-ink">เลือกแต่ละขั้น<br /><span className="text-brand-700">เพื่อดูสิ่งที่เกิดขึ้น</span></h2><p className="max-w-md text-sm leading-relaxed text-steel-600">ทุกขั้นระบุผู้ดำเนินการ สิ่งที่ระบบทำ และ Output ที่ส่งต่อไปยังขั้นถัดไป</p></div>
          <div className="mt-10"><CaseStudyFlow steps={study.flow} /></div>
        </Container>
      </section>

      <section className="sect sect--bright relative py-section">
        <Container wide>
          <p className="section-code">04 / KEY FEATURES</p>
          <h2 className="thai-display mt-4 text-statement font-bold text-ink">ฟีเจอร์ที่จัดตาม<br /><span className="text-brand-700">หน้าที่ของระบบ</span></h2>
          <div className="mt-9 grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-2 lg:grid-cols-4">
            {study.features.map((group) => <section key={group.title} className="bg-white p-5 sm:p-6"><h3 className="font-mono text-[.62rem] tracking-[.16em] text-brand-600">{group.title}</h3><ul className="mt-5 space-y-3">{group.items.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-steel-600"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" />{item}</li>)}</ul></section>)}
          </div>
        </Container>
      </section>

      <section className="sect sect--deep relative overflow-hidden py-section text-white">
        <SectionBackdrop variant="mesh-dark" />
        <Container wide className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)] lg:gap-16">
            <div>
              <p className="section-code text-brand-300">05 / SYSTEM VIEW</p>
              {study.screenshot?.reviewed ? <div className="mt-7 max-w-4xl"><ProjectVisual study={study} /></div> : reviewedScreens.length ? <div className="mt-7 grid gap-4 sm:grid-cols-2">{reviewedScreens.map((screen) => <figure key={screen.src} className="overflow-hidden rounded-panel border border-brand-400/20 bg-brand-900"><img src={screen.src} alt={screen.alt} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover object-top" /><figcaption className="p-4 text-xs leading-relaxed text-brand-100/60">{screen.caption}</figcaption></figure>)}</div> : <div className="mt-7 aspect-[16/9] max-w-4xl overflow-hidden rounded-panel border border-brand-400/20 bg-white shadow-lift-lg"><CaseStudyVisual kind={study.visual} /></div>}
            </div>
            <div><p className="font-mono text-[.62rem] tracking-[.16em] text-brand-300">MEDIA POLICY</p>{study.screenshot?.reviewed ? <><h2 className="thai-display mt-4 text-2xl font-bold">ภาพหน้าจอจริง<br />ของโครงการนี้</h2><p className="mt-4 text-sm leading-relaxed text-brand-100/65">เป็นหน้าสาธารณะ จึงแสดงภาพจริงได้โดยไม่มีข้อมูลส่วนบุคคล</p></> : <><h2 className="thai-display mt-4 text-2xl font-bold">หน้าจอจริงจะเผยแพร่<br />เมื่อผ่าน Privacy review</h2><p className="mt-4 text-sm leading-relaxed text-brand-100/65">ขณะนี้ใช้ภาพจำลองจากโครงสร้าง UI ที่ตรวจสอบได้ เพราะหน้าจอจริงอาจมีข้อมูลพนักงาน ลูกค้า การเงิน หรือชื่อไฟล์ภายใน</p></>}</div>
          </div>
        </Container>
      </section>

      <section className="sect sect--paper relative py-section">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div><p className="section-code">06 / OUTCOME</p><h2 className="thai-display mt-4 text-statement font-bold text-ink">ผลลัพธ์เชิง<br /><span className="text-brand-700">การทำงาน</span></h2><p className="mt-5 text-sm leading-relaxed text-steel-500">ไม่มีการแสดงเปอร์เซ็นต์ ROI หรือจำนวนผู้ใช้ เพราะยังไม่มีข้อมูลการวัดผลที่ยืนยันสำหรับเผยแพร่</p><ul className="mt-7 space-y-3">{study.outcomes.map((outcome) => <li key={outcome} className="flex items-start gap-3 rounded-card border border-brand-100 bg-white p-4 text-sm leading-relaxed text-steel-700"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />{outcome}</li>)}</ul></div>
            <div><p className="section-code">07 / RELATED SYSTEMS</p><h2 className="thai-display mt-4 text-2xl font-bold text-ink">ระบบที่เกี่ยวข้อง</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{relatedSystems.map((system) => <Link key={system.id} to="/solutions" className="group rounded-card border border-steel-200 bg-white p-4 transition-colors hover:border-brand-300"><p className="font-mono text-[.58rem] tracking-[.13em] text-brand-600">{system.nameEn}</p><p className="thai-display mt-2 text-sm font-semibold text-ink">{system.nameTh}</p><span className="mt-3 inline-flex items-center gap-1 text-xs text-steel-500 group-hover:text-brand-700">ดูใน System Universe <ArrowIcon /></span></Link>)}</div><details className="mt-5 rounded-card border border-steel-200 bg-white p-5"><summary className="cursor-pointer text-sm font-semibold text-ink">Technical Notes</summary><ul className="mt-4 space-y-2 border-t border-steel-100 pt-4">{study.technicalNotes.map((note) => <li key={note} className="text-sm leading-relaxed text-steel-600">— {note}</li>)}</ul></details><div className="mt-5 flex flex-wrap gap-3"><ButtonLink to={study.serviceRoute} variant="secondary">ดูบริการที่เกี่ยวข้อง <ArrowIcon /></ButtonLink>{contactService ? <ButtonLink to={contactHref(contactService, `case:${study.slug}`)}>ปรึกษาระบบลักษณะนี้ <ArrowIcon /></ButtonLink> : null}</div></div>
          </div>
        </Container>
      </section>

      {next && next.id !== study.id ? <section className="sect sect--field py-14"><Container><Link to={`/work/${next.slug}`} className="group flex flex-wrap items-end justify-between gap-5 border-t border-steel-300 pt-7"><div><p className="section-code">NEXT CASE</p><p className="thai-display mt-3 text-2xl font-bold text-ink group-hover:text-brand-700">{next.title}</p></div><span className="flex h-12 w-12 items-center justify-center rounded-full border border-steel-300 group-hover:border-brand-400"><ArrowIcon /></span></Link></Container></section> : null}
      <BigCTA code="08 / NEXT STEP" />
    </>
  );
}

function Comparison({ title, items, tone }: { title: string; items: readonly string[]; tone: 'neutral' | 'brand' }) {
  return <div className={tone === 'brand' ? 'rounded-panel border border-brand-200 bg-brand-50 p-5 sm:p-6' : 'rounded-panel border border-steel-200 bg-white p-5 sm:p-6'}><p className={tone === 'brand' ? 'font-mono text-[.62rem] tracking-[.16em] text-brand-700' : 'font-mono text-[.62rem] tracking-[.16em] text-steel-400'}>{title}</p><ul className="mt-5 space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-steel-600"><span className={tone === 'brand' ? 'mt-2 h-1 w-3 shrink-0 bg-brand-500' : 'mt-2 h-px w-3 shrink-0 bg-steel-300'} />{item}</li>)}</ul></div>;
}
