import { termsPage } from '@/i18n/legal';
import { LegalDocument } from './Privacy';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';

export default function Terms() {
  usePageMeta(pageMeta.terms);

  return <LegalDocument page={termsPage} />;
}
