import { Link, useLocation } from 'react-router-dom';
import { useLocale } from '@/app/LocaleContext';
import {
  HTML_LANG,
  LOCALE_LABEL,
  LOCALE_NAME,
  LOCALES,
  switchLocalePath,
  writeStoredLocale
} from '@/i18n/locales';
import { header } from '@/i18n/ui';
import { cn } from '@/lib/cn';

/**
 * LANGUAGE CONTROL — ไทย | EN | 中文
 *
 * Real links, not buttons: each option IS the same page in another language,
 * so it can be opened in a new tab, crawled, and read by a screen reader as a
 * link to "English" rather than an unexplained toggle. The target keeps the
 * path, slug, query and hash, so switching on `/services#file-management`
 * lands on `/en/services#file-management`.
 *
 * The active option carries `aria-current="true"`; every option is labelled
 * with its full language name in that language (`lang` set on the link), which
 * is how a screen reader announces it correctly. No flags — a flag is a
 * country, not a language.
 *
 * Styled to sit beside ThemeToggle as its twin: same pill, same active fill.
 */
export function LanguageSwitcher({
  className,
  large = false
}: {
  className?: string;
  /** Mobile menu: 44px targets. */
  large?: boolean;
}) {
  const location = useLocation();
  const { locale, t } = useLocale();

  return (
    <nav
      aria-label={t(header.language)}
      className={cn(
        'inline-flex shrink-0 items-center gap-0.5 rounded-pill border border-steel-200 bg-white/70 p-0.5',
        className
      )}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <Link
            key={option}
            to={switchLocalePath(location, option)}
            lang={HTML_LANG[option]}
            hrefLang={HTML_LANG[option]}
            aria-current={active ? 'true' : undefined}
            aria-label={LOCALE_NAME[option]}
            title={LOCALE_NAME[option]}
            onClick={() => writeStoredLocale(option)}
            className={cn(
              'inline-flex min-h-9 min-w-9 items-center justify-center whitespace-nowrap rounded-pill px-2.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600',
              large && 'min-h-11 min-w-11 px-3.5 text-sm',
              active ? 'bg-ink text-white' : 'text-steel-600 hover:text-brand-700'
            )}
          >
            {LOCALE_LABEL[option]}
          </Link>
        );
      })}
    </nav>
  );
}
