import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { LocaleLink as Link } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { caseStudies } from '@/data/caseStudies';
import { metrics, process } from '@/data/company';
import { addressNote } from '@/i18n/company';
import { fillText } from '@/i18n/fill';
import { trustPreview as copy, trustTiles } from '@/i18n/trustPreview';

/**
 * HOME TRUST PREVIEW — four things a visitor can verify, each linking to the
 * page that proves it: real work, the process, the company, and support
 * after delivery.
 *
 * Every number comes from canonical data (case studies, verified metrics,
 * process steps), so the preview cannot claim more than the site shows. The
 * cards are plain list items with text and a real link — nothing here relies
 * on an icon or colour to carry meaning.
 */
export function TrustPreview({ code = '10 / TRUST' }: { code?: string } = {}) {
  const { t } = useLocale();
  const [lead, accent] = t(copy.title);
  const slots = {
    cases: caseStudies.length,
    systems: metrics[0]?.value ?? 0,
    websites: metrics[1]?.value ?? 0,
    steps: process.length,
    place: t(addressNote)
  };

  return (
    <section aria-labelledby="trust-preview" className="sect sect--paper relative overflow-hidden py-section">
      <span aria-hidden="true" className="sect-edge-top" />
      <Container wide className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 id="trust-preview" className="thai-display mt-3 text-statement font-bold text-ink">
              {lead}
              <br />
              <span className="text-brand-700">{accent}</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel-600">{t(copy.lead)}</p>
          </div>
          <Link
            to="/about"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-700"
          >
            {t(copy.about)}
            <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-2 xl:grid-cols-4">
          {trustTiles.map((tile) => (
            <li key={tile.code} className="flex flex-col bg-white p-5 sm:p-6">
              <p className="font-mono text-[0.58rem] tracking-[0.16em] text-brand-600">{tile.code}</p>
              <p className="thai-display mt-4 break-words text-xl font-bold leading-snug text-ink">{fillText(t(tile.value), slots)}</p>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">{fillText(t(tile.detail), slots)}</p>
              <Link
                to={tile.to}
                className="group mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-ink transition-colors hover:text-brand-700"
              >
                {t(tile.link)}
                <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
