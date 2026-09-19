import { PageHeader } from '@/components/business/PageHeader';
import { InsightStrip } from '@/components/business/InsightStrip';
import { BigCTA } from '@/components/business/BigCTA';
import { insightsIntro } from '@/data/insights';

export default function Insights() {
  return (
    <>
      <PageHeader
        eyebrow="01 / INSIGHTS"
        title={<>มองระบบธุรกิจ<br /><span className="text-brand-700">ให้ชัดก่อนตัดสินใจ</span></>}
        lead={insightsIntro.lead}
      />

      <InsightStrip variant="grid" code="02 / ARTICLES" />
      <BigCTA code="03 / TALK" />
    </>
  );
}
