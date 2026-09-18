import { motion } from 'framer-motion';
import { PageHeader } from '@/components/business/PageHeader';
import { CTASection } from '@/components/business/CTASection';
import { Container, Section } from '@/components/shared/Layout';
import { insights, insightsIntro } from '@/data/insights';

export default function Insights() {
  return (
    <>
      <PageHeader eyebrow={insightsIntro.eyebrow} title={<>{insightsIntro.title[0]}<br /><span className="text-gradient-brand">{insightsIntro.title[1]}</span></>} lead={insightsIntro.lead} />
      <Section className="pt-16 sm:pt-20">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {insights.map((article, index) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * .06 }}
                className="surface-card flex min-h-72 flex-col p-7 sm:p-9"
              >
                <div className="flex items-center justify-between gap-4 text-2xs font-semibold uppercase tracking-[.16em]">
                  <span className="text-brand-600">{article.category}</span>
                  <span className="text-steel-400">{article.published ? `${article.minutes} นาที` : 'เร็ว ๆ นี้'}</span>
                </div>
                <h2 className="mt-10 text-title font-semibold text-ink">{article.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-steel-500">{article.excerpt}</p>
                <div className="mt-auto pt-8 text-xs text-steel-400">
                  {article.published ? `${article.author ?? ''} · ${article.date ?? ''}` : 'กำลังเรียบเรียงเนื้อหา'}
                </div>
              </motion.article>
            ))}
          </div>
        </Container>
      </Section>
      <CTASection />
    </>
  );
}
