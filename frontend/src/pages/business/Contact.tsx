import { PageHeader } from '@/components/business/PageHeader';
import { ContactForm } from '@/components/business/ContactForm';
import { Container, Reveal, Section } from '@/components/shared/Layout';
import { company } from '@/data/company';

export default function Contact() {
  return <>
    <PageHeader eyebrow="CONTACT" title={<>เล่าโจทย์ที่คุณกำลังแก้<br /><span className="text-gradient-brand">ให้เราฟัง</span></>} lead="ยิ่งเราเข้าใจกระบวนการปัจจุบันมากเท่าไร การคุยครั้งแรกก็ยิ่งมีประโยชน์มากขึ้น" />
    <Section className="py-16 sm:py-20"><Container>
      <div className="grid gap-10 lg:grid-cols-[1.35fr_.8fr] lg:gap-16">
        <ContactForm />
        <aside className="space-y-4 self-start">
          <Info title="อีเมล"><a href={`mailto:${company.email}`}>{company.email}</a></Info>
          <Info title="โทรศัพท์"><a href={`tel:${company.phone}`}>{company.phoneDisplay}</a></Info>
          <Info title="LINE OA"><a href={company.lineUrl} target="_blank" rel="noreferrer">{company.lineOA}</a></Info>
          <Info title="ที่ตั้งสำนักงาน">{company.address.lines.map((line) => <span key={line} className="block">{line}</span>)}</Info>
          <Info title="เวลาทำการ"><p>{company.businessHours.days}<br />{company.businessHours.time}</p><p className="mt-2 text-xs text-steel-400">{company.businessHours.note}</p></Info>
          <div className="rounded-panel bg-ink p-7 text-white"><p className="text-sm font-semibold">หลังจากส่งข้อมูล</p><ol className="mt-4 space-y-3 text-xs leading-6 text-steel-300"><li>01 · ทีมงานอ่านโจทย์และตอบกลับ</li><li>02 · นัดคุยเพื่อเข้าใจ Workflow</li><li>03 · สรุปแนวทาง ขอบเขต และขั้นตอนถัดไป</li></ol></div>
        </aside>
      </div>
    </Container></Section>
  </>;
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <Reveal><div className="surface-card p-6"><p className="text-2xs font-semibold uppercase tracking-[.16em] text-brand-600">{title}</p><div className="mt-3 break-words text-sm text-ink [&_a]:transition-colors hover:[&_a]:text-brand-600">{children}</div></div></Reveal>;
}
