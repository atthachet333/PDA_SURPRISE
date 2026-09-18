import { PageHeader } from '@/components/business/PageHeader';
import { WorkCard } from '@/components/business/WorkCard';
import { CTASection } from '@/components/business/CTASection';
import { Container, Section } from '@/components/shared/Layout';
import { caseStudies, workIntro } from '@/data/work';

export default function Work() {
  return (
    <>
      <PageHeader
        eyebrow={workIntro.eyebrow}
        title={<>{workIntro.title[0]}<br />{workIntro.title[1]}</>}
        lead={workIntro.lead}
      />

      <Section className="pt-16 sm:pt-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            {caseStudies.map((study, index) => (
              <WorkCard
                key={study.slug}
                study={study}
                index={index}
                featured={index === 0 || index === 3}
              />
            ))}
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
