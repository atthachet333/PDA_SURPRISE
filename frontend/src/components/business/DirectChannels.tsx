import { company } from '@/data/company';
import { useLocale } from '@/app/LocaleContext';
import { businessHours } from '@/i18n/company';
import { channel as channelText, ui } from '@/i18n/ui';
import { cn } from '@/lib/cn';
import { ContactIcon } from './Footer';

/**
 * DIRECT CHANNELS — LINE, phone and email, quieter than the primary action.
 *
 * EP42: every closing block pairs ONE primary button (→ /contact) with this
 * row, so a visitor who would rather message or call never has to hunt, and
 * the three channels never compete with the main action for weight.
 *
 * Every value comes from `data/company.ts`. Targets are 44px tall.
 */
export function DirectChannels({
  tone = 'dark',
  hours = true,
  className
}: {
  /** `dark` sits on the deep-green closing sections; `light` on paper. */
  tone?: 'dark' | 'light';
  hours?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const dark = tone === 'dark';
  const channels = [
    { key: 'line', hint: t(channelText.line), label: company.lineOA, href: company.lineUrl, icon: 'line' as const, external: true },
    { key: 'phone', hint: t(channelText.phone), label: company.phoneDisplay, href: `tel:${company.phone}`, icon: 'phone' as const, external: false },
    { key: 'email', hint: t(channelText.email), label: company.email, href: `mailto:${company.email}`, icon: 'mail' as const, external: false }
  ];

  return (
    <div className={cn('border-t pt-6', dark ? 'border-white/12' : 'border-steel-200', className)}>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {channels.map((item) => (
          <li key={item.key} className="min-w-0">
            <a
              href={item.href}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              data-channel={item.key}
              className="group flex min-h-11 min-w-0 items-center gap-2.5"
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-base',
                  dark
                    ? 'border-white/15 text-brand-300 group-hover:border-brand-400/60 group-hover:text-brand-200'
                    : 'border-steel-200 text-brand-700 group-hover:border-brand-300'
                )}
              >
                <ContactIcon name={item.icon} />
              </span>
              <span className="min-w-0">
                <span className={cn('block font-mono text-[0.5625rem] uppercase tracking-[0.16em]', dark ? 'text-brand-300/75' : 'text-steel-500')}>
                  {item.hint}
                </span>
                <span
                  className={cn(
                    'block break-all text-sm font-medium transition-colors duration-base',
                    dark ? 'text-white group-hover:text-brand-200' : 'text-ink group-hover:text-brand-700'
                  )}
                >
                  {item.label}
                </span>
              </span>
              {item.external ? <span className="sr-only">{t(ui.opensInNewTab)}</span> : null}
            </a>
          </li>
        ))}
      </ul>
      {hours ? (
        <p className={cn('mt-3 text-xs leading-relaxed', dark ? 'text-brand-100/65' : 'text-steel-500')}>
          {t(businessHours.days)} {t(businessHours.time)} · {t(businessHours.note)}
        </p>
      ) : null}
    </div>
  );
}
