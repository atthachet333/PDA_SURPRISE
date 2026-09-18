import { motion } from 'framer-motion';
import { PageHeader } from '@/components/business/PageHeader';
import { CTASection } from '@/components/business/CTASection';
import { Container, Reveal, Section, SectionHeading } from '@/components/shared/Layout';
import { aboutIntro, aftercare, philosophy, standards, statement, whoWeAre } from '@/data/about';
import { company, process } from '@/data/company';

export default function About() {
  return (
    <>
      <PageHeader eyebrow={aboutIntro.eyebrow} title={<>{aboutIntro.title[0]}<br /><span className="text-gradient-brand">{aboutIntro.title[1]}</span></>} lead={aboutIntro.body[0]} />
      <Section className="py-20 sm:py-24"><Container>
        <div className="grid gap-14 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
          <div><p className="eyebrow">{whoWeAre.heading}</p><p className="mt-5 text-lead text-steel-600">{whoWeAre.body}</p>{aboutIntro.body.slice(1).map((p) => <Reveal key={p}><p className="mt-6 max-w-prose leading-7 text-steel-500">{p}</p></Reveal>)}</div>
          <blockquote className="surface-card p-8 sm:p-10"><p className="text-title font-semibold text-ink">“{statement.quote[0]}<br /><span className="text-brand-600">{statement.quote[1]}</span>”</p><p className="mt-6 text-sm leading-7 text-steel-500">{statement.support}</p><p className="mt-8 text-xs font-medium text-steel-400">{company.legalNameTh} · {company.addressNote}</p></blockquote>
        </div>
      </Container></Section>
      <Section tone="muted" className="py-20 sm:py-24"><Container>
        <SectionHeading eyebrow="แนวคิดของเรา" title="หลักที่ใช้ตัดสินใจในทุกโปรเจกต์" />
        <div className="mt-12 grid gap-4 md:grid-cols-2">{philosophy.map((item, index) => <motion.article key={item.heading} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*.06}} className="surface-card p-7"><span className="font-mono text-xs text-brand-500">0{index+1}</span><h3 className="mt-5 text-lg font-semibold text-ink">{item.heading}</h3><p className="mt-3 text-sm leading-7 text-steel-500">{item.body}</p></motion.article>)}</div>
      </Container></Section>
      <Section className="py-20 sm:py-24"><Container>
        <SectionHeading eyebrow="WORKING PROCESS" title="จากโจทย์หน้างานสู่ระบบที่ทีมใช้ได้จริง" lead="ทุกขั้นตอนมีสิ่งส่งมอบให้ตรวจสอบ ไม่ปล่อยให้โปรเจกต์หายเข้าไปในกล่องดำ" />
        <ol className="relative mt-14 space-y-3 before:absolute before:bottom-8 before:left-6 before:top-8 before:w-px before:bg-brand-200 sm:before:left-8">{process.map((item,index) => <motion.li key={item.step} initial={{opacity:0,x:-16}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:index*.06}} className="relative grid gap-4 rounded-panel border border-steel-200 bg-white p-6 pl-16 shadow-soft sm:grid-cols-[11rem_1fr] sm:p-8 sm:pl-20"><span className="absolute left-[1.15rem] top-7 flex h-10 w-10 items-center justify-center rounded-full bg-ink font-mono text-xs text-brand-300 sm:left-[.75rem] sm:top-7">{item.step}</span><h3 className="font-semibold text-ink">{item.title}</h3><p className="text-sm leading-7 text-steel-500">{item.body}</p></motion.li>)}</ol>
      </Container></Section>
      <Section tone="dark" className="py-20 sm:py-24"><Container>
        <SectionHeading eyebrow={standards.heading} title="สร้างให้ดูแลต่อได้ตั้งแต่วันแรก" tone="dark" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-panel border border-white/10 bg-white/10 md:grid-cols-2">{standards.items.map((item)=><article key={item.heading} className="bg-ink p-7"><h3 className="font-semibold text-white">{item.heading}</h3><p className="mt-3 text-sm leading-7 text-steel-300">{item.body}</p></article>)}</div>
        <div className="mt-12"><h3 className="text-title font-semibold text-white">{aftercare.heading}</h3><p className="mt-4 max-w-3xl text-sm leading-7 text-steel-300">{aftercare.body}</p><dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{aftercare.items.map((item)=><div key={item.label} className="rounded-card border border-white/10 p-4"><dt className="text-2xs uppercase tracking-wider text-brand-300">{item.label}</dt><dd className="mt-2 text-xs leading-6 text-steel-300">{item.value}</dd></div>)}</dl></div>
      </Container></Section>
      <CTASection />
    </>
  );
}
