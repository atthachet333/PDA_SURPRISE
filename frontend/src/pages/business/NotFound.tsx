import { ButtonLink } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center pt-24">
      <Container>
        <p className="font-mono text-sm text-brand-600">404</p>
        <h1 className="mt-4 text-headline font-semibold text-ink">This page does not exist.</h1>
        <p className="mt-5 max-w-md text-lead text-steel-500">
          The link may be out of date, or the page may have moved.
        </p>
        <div className="mt-10">
          <ButtonLink to="/" size="lg">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
