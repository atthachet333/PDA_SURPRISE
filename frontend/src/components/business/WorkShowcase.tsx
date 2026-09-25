import { LocaleLink as Link } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { useCaseStudies } from '@/i18n/useContent';
import { workPage } from '@/i18n/work';
import { cta as ctaText } from '@/i18n/ui';
import { ArrowIcon } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import { homeWorkPreview, type CaseStudy } from '@/data/caseStudies';
import { ProjectAccessNote, ProjectActions, ProjectVisual } from './ProjectParts';
import { VisualAtmosphere } from '@/components/business/atmosphere/VisualAtmosphere';

interface WorkShowcaseProps {
  items?: readonly CaseStudy[];
  code?: string;
  title?: React.ReactNode;
  lead?: string;
  showAllLink?: boolean;
}

/**
 * Homepage preview of real work: a representative spread (not the whole /work
 * page), screenshot-first, with the same gated actions as the portfolio.
 */
export function WorkShowcase({
  items = homeWorkPreview,
  code = '06 / WORK',
  title,
  lead,
  showAllLink = false
}: WorkShowcaseProps) {
  const { t } = useLocale();
  const localized = useCaseStudies(items);
  const [titleLead, titleAccent] = t(workPage.showcaseTitle);
  const heading = title ?? <><span>{titleLead}</span><br /><span className="text-brand-400">{titleAccent}</span></>;
  return (
    <section id="work" className="sect sect--deep relative overflow-hidden py-section text-white">
      <span aria-hidden="true" className="sect-edge-top sect-edge-top--dark" />
      <VisualAtmosphere variant="evidence" />
      <Container wide className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl"><p className="section-code text-brand-400">{code}</p><h2 className="thai-display mt-3 text-statement font-bold text-white">{heading}</h2></div>
          <p className="max-w-md text-sm leading-relaxed text-brand-100/65">{lead ?? t(workPage.showcaseLead)}</p>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {localized.map((item, index) => (
            <li key={item.id}>
              <PreviewCard item={item} priority={index === 0} />
            </li>
          ))}
        </ul>

        {showAllLink ? (
          <Link to="/work" className="group mt-10 inline-flex min-h-11 items-center gap-2 rounded-pill bg-brand-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-400">
            {t(ctaText.viewAllWork)} <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
          </Link>
        ) : null}
      </Container>
    </section>
  );
}

function PreviewCard({ item, priority }: { item: CaseStudy; priority: boolean }) {
  return (
    <article className="work-card group flex h-full flex-col overflow-hidden rounded-panel border border-brand-400/20 bg-white text-ink shadow-soft">
      <ProjectVisual study={item} priority={priority} className="rounded-none border-0 border-b" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="font-mono text-[0.6rem] tracking-[0.14em] text-brand-600">{item.projectType}</p>
        <h3 className="thai-display mt-2 text-xl font-bold">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-steel-600">{item.delivered}</p>
        <div className="mt-auto pt-5">
          <ProjectActions study={item} />
          <ProjectAccessNote study={item} className="mt-3" />
        </div>
      </div>
    </article>
  );
}
