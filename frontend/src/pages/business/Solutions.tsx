import { PageHeader } from '@/components/business/PageHeader';
import { SolutionShowcase } from '@/components/business/SolutionShowcase';
import { SolutionGrid } from '@/components/business/SolutionGrid';
import { BigCTA } from '@/components/business/BigCTA';
import { solutionsIntro } from '@/data/solutions';

export default function Solutions() {
  return (
    <>
      <PageHeader
        eyebrow="01 / SOLUTIONS"
        title={<>โซลูชันของเรา</>}
        lead={solutionsIntro.lead}
      />

      <SolutionShowcase code="02 / SHOWCASE" />
      <SolutionGrid code="03 / INDEX" />
      <BigCTA code="04 / START" />
    </>
  );
}
