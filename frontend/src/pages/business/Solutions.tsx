import { PageHeader } from '@/components/business/PageHeader';
import { SolutionGrid } from '@/components/business/SolutionGrid';
import { CTASection } from '@/components/business/CTASection';
import { Container, Section } from '@/components/shared/Layout';

export default function Solutions() {
  return (
    <>
      <PageHeader
        eyebrow="SOLUTIONS"
        title="โซลูชันที่ปรับตามกระบวนการของธุรกิจคุณ"
        lead="เริ่มจากโครงสร้างที่ผ่านการคิดมาแล้ว แล้วออกแบบ Workflow สิทธิ์ และรายงานให้ตรงกับการทำงานจริง"
      />

      <Section className="pt-16 sm:pt-20">
        <Container>
          <SolutionGrid />
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
