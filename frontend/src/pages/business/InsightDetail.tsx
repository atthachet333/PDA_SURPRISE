import { Navigate, useParams } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { BigCTA } from '@/components/business/BigCTA';
import { getInsight, isInsightPublished } from '@/data/insights';

export default function InsightDetail() {
  const { slug } = useParams<{ slug: string }>();
  const insight = slug ? getInsight(slug) : undefined;
  if (!insight || !isInsightPublished(insight) || !insight.body) return <Navigate to="/insights" replace />;

  return (
    <>
      <article className="sect sect--paper pb-section pt-32 sm:pt-40">
        <Container>
          <p className="section-code">{insight.category}</p>
          <h1 className="thai-display mt-6 max-w-4xl text-mega font-bold text-ink">{insight.titleTh}</h1>
          <p className="mt-7 max-w-2xl text-lead text-steel-600">{insight.excerpt}</p>
          {(insight.date || insight.author || insight.readingTime) ? (
            <p className="mt-6 font-mono text-[.625rem] uppercase tracking-[.14em] text-steel-400">
              {[insight.date, insight.author, insight.readingTime ? `${insight.readingTime} นาที` : undefined].filter(Boolean).join(' · ')}
            </p>
          ) : null}
          <div className="mx-auto mt-16 max-w-3xl space-y-7 text-base leading-8 text-steel-700">
            {insight.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </Container>
      </article>
      <BigCTA code="02 / TALK" />
    </>
  );
}
