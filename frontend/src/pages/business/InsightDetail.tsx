import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { BigCTA } from '@/components/business/BigCTA';
import { getInsight, isInsightPublished } from '@/data/insights';
import { useLocale } from '@/app/LocaleContext';
import { insightsPage, localizeInsight } from '@/i18n/insights';
import { fillText } from '@/i18n/fill';
import { nav } from '@/i18n/ui';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta, type PageMeta } from '@/lib/seo';

export default function InsightDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, path, content } = useLocale();
  const source = slug ? getInsight(slug) : undefined;
  /*
   * Title and excerpt follow the locale. The BODY is shown in the language it
   * was written in — article bodies are not translated (see i18n/insights.ts).
   */
  const insight = source ? localizeInsight(source, content) : undefined;
  const published = Boolean(insight && isInsightPublished(insight) && insight.body);
  /*
   * EP44: a published article gets its own metadata. A draft never renders —
   * it redirects to /insights — so it never gets a canonical or a sitemap entry.
   */
  const meta = useMemo<PageMeta | typeof pageMeta.insights>(
    () =>
      insight && published
        ? {
            title: `${insight.titleTh} — PDA BLISS`,
            description: insight.excerpt,
            path: `/insights/${insight.slug}`,
            localizedRoute: true,
            breadcrumbs: [
              { name: nav.insights, path: '/insights' },
              { name: insight.titleTh, path: `/insights/${insight.slug}` }
            ]
          }
        : pageMeta.insights,
    [insight, published]
  );
  usePageMeta(meta);
  if (!insight || !isInsightPublished(insight) || !insight.body) return <Navigate to={path('/insights')} replace />;

  return (
    <>
      <article className="sect sect--paper pb-section pt-32 sm:pt-40">
        <Container>
          <p className="section-code">{insight.category}</p>
          <h1 className="thai-display mt-6 max-w-4xl text-mega font-bold text-ink">{insight.titleTh}</h1>
          <p className="mt-7 max-w-2xl text-lead text-steel-600">{insight.excerpt}</p>
          {(insight.date || insight.author || insight.readingTime) ? (
            <p className="mt-6 font-mono text-[.625rem] uppercase tracking-[.14em] text-steel-400">
              {[insight.date, insight.author, insight.readingTime ? fillText(t(insightsPage.minutes), { n: insight.readingTime }) : undefined].filter(Boolean).join(' · ')}
            </p>
          ) : null}
          {/* Bodies are authored in Thai (`Insight.body`), so they are marked as such on every locale. */}
          <div lang="th" className="mx-auto mt-16 max-w-3xl space-y-7 text-base leading-8 text-steel-700">
            {insight.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </Container>
      </article>
      <BigCTA code="02 / TALK" />
    </>
  );
}
