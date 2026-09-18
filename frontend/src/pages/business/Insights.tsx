import { PageHeader } from '@/components/business/PageHeader';
import { InsightStrip } from '@/components/business/InsightStrip';
import { BigCTA } from '@/components/business/BigCTA';
import { insightsIntro } from '@/data/insights';

export default function Insights() {
  return (
    <>
      <PageHeader
        eyebrow="01 / INSIGHTS"
        title={<>บทความและมุมมอง</>}
        lead={insightsIntro.lead}
      />

      <InsightStrip variant="grid" code="02 / ARTICLES" />
      <BigCTA code="03 / START" />
    </>
  );
}
