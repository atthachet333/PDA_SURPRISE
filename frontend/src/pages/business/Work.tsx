import { PageHeader } from '@/components/business/PageHeader';
import { WorkShowcase } from '@/components/business/WorkShowcase';
import { BigCTA } from '@/components/business/BigCTA';
import { caseStudies } from '@/data/caseStudies';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';

export default function Work() {
  usePageMeta(pageMeta.work);

  return (
    <>
      <PageHeader
        eyebrow="01 / WORK"
        tone="dark"
        title={<>ระบบที่เรา<br />อธิบายได้ทุกขั้น</>}
        lead={`Case Study ${caseStudies.length} ระบบที่เล่าจากปัญหา Workflow และวิธีออกแบบจริง โดยไม่เปิดเผยชื่อลูกค้าหรือตัวเลขผลลัพธ์ที่ยังไม่ได้วัด`}
      />

      <WorkShowcase showFilters />
      <BigCTA code="03 / START" />
    </>
  );
}
