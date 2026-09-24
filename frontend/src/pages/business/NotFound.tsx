import { ButtonLink } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';
import { useLocale } from '@/app/LocaleContext';
import { cta, ui } from '@/i18n/ui';

export default function NotFound() {
  usePageMeta(pageMeta.notFound);
  const { t } = useLocale();

  return (
    <section className="flex min-h-[70vh] items-center pt-24">
      <Container>
        <p className="font-mono text-sm text-brand-600">404</p>
        <h1 className="thai-display mt-4 text-headline font-semibold text-ink">{t(ui.notFoundTitle)}</h1>
        <p className="mt-5 max-w-md text-lead text-steel-500">
          {t(ui.notFoundBody)}
        </p>
        <div className="mt-10">
          <ButtonLink to="/" size="lg">
            {t(cta.backHome)}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
