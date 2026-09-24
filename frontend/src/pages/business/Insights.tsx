import { PageHeader } from '@/components/business/PageHeader';
import { InsightStrip } from '@/components/business/InsightStrip';
import { BigCTA } from '@/components/business/BigCTA';
import { useLocale } from '@/app/LocaleContext';
import { insightsPage } from '@/i18n/insights';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';

export default function Insights() {
  usePageMeta(pageMeta.insights);
  const { t } = useLocale();
  const [lead, accent] = t(insightsPage.title);

  return (
    <>
      <PageHeader
        eyebrow="01 / INSIGHTS"
        title={<>{lead}<br /><span className="text-brand-700">{accent}</span></>}
        lead={t(insightsPage.lead)}
      />

      <InsightStrip variant="grid" code="02 / ARTICLES" />
      <BigCTA code="03 / TALK" />
    </>
  );
}
