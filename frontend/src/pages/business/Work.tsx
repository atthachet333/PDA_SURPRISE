import { PageHeader } from '@/components/business/PageHeader';
import { WorkShowcase } from '@/components/business/WorkShowcase';
import { ApproachExamples } from '@/components/business/ApproachExamples';
import { BigCTA } from '@/components/business/BigCTA';
import { portfolio } from '@/data/portfolio';

/**
 * /work — the REAL systems first (from data/portfolio.ts, no outcome figures),
 * then the illustrative development approaches from data/work.ts, clearly
 * separated and labelled so the two can never be read as the same thing.
 */
export default function Work() {
  return (
    <>
      <PageHeader
        eyebrow="01 / WORK"
        tone="dark"
        title={<>ผลงานของเรา</>}
        lead={`ระบบที่พัฒนาและส่งมอบแล้ว ${portfolio.length} ระบบ ภาพหน้าจอบางส่วนยังไม่เผยแพร่เพราะมีข้อมูลของลูกค้าและพนักงานอยู่`}
      />

      <WorkShowcase code="02 / SYSTEMS" />
      <ApproachExamples />
      <BigCTA code="04 / START" />
    </>
  );
}
