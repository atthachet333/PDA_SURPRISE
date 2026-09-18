import { PageHeader } from '@/components/business/PageHeader';
import { ServiceList } from '@/components/business/ServiceList';
import { CTASection } from '@/components/business/CTASection';
import { Container, Section, SectionHeading } from '@/components/shared/Layout';
import { process } from '@/data/company';

export default function Services() {
  return (
    <>
      <PageHeader
        eyebrow="SERVICES"
        title="ความเชี่ยวชาญครบในทีมเดียว"
        lead="เลือกหัวข้อเพื่อดูรายละเอียด สิ่งส่งมอบ และเทคโนโลยีที่ใช้ในแต่ละบริการ"
      />

      <Section className="pt-16 sm:pt-20">
        <Container>
          <ServiceList />
        </Container>
      </Section>

      <Section tone="muted" className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="กระบวนการทำงาน"
            title="ตั้งแต่คุยครั้งแรกจนถึงใช้งานจริง"
            align="center"
          />
          <ol className="mx-auto mt-14 max-w-3xl space-y-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200">
            {process.map((step) => (
              <li key={step.step} className="flex gap-6 bg-white p-7 sm:gap-10">
                <span className="font-mono text-xs text-brand-500">{step.step}</span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel-500">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
