import { canShowLiveLink, visibilityLabel, type PortfolioItem } from '@/data/portfolio';
import { cn } from '@/lib/cn';

/**
 * LIVE LINK — the one place a portfolio item's public URL becomes a control.
 *
 * Everything routes through `canShowLiveLink()`, which requires all three of:
 * `visibility === 'public'`, `publicSafe`, and a `publicUrl` that actually
 * exists. An internal payroll system therefore cannot be linked even if a URL
 * is set on it by mistake.
 *
 * When no link can be shown, this renders an honest status instead of a
 * disabled button — a dead control is worse than a clear explanation.
 */

/** Small external-link glyph. */
function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn('h-3.5 w-3.5', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 3.5H3.5v9h9v-3" />
      <path d="M9.5 3.5h3v3M12.5 3.5 7 9" />
    </svg>
  );
}

/**
 * A status badge describing how openly the system may be shown. When a live URL
 * exists this IS the link; otherwise it is plain text, deliberately without any
 * hover or pointer affordance.
 */
export function VisibilityBadge({
  item,
  tone = 'dark',
  className,
  asLink = true
}: {
  item: PortfolioItem;
  /** 'dark' sits on the deep green grounds, 'light' on white. */
  tone?: 'dark' | 'light';
  className?: string;
  /**
   * Set false when this badge sits INSIDE another link (the work bands wrap the
   * whole card in one). Anchors cannot nest — without this the badge would
   * produce invalid, unclickable markup the moment a `publicUrl` is added.
   */
  asLink?: boolean;
}) {
  const live = canShowLiveLink(item) && asLink;
  const label = visibilityLabel(item);

  const base = cn(
    'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.14em]',
    className
  );

  if (live && item.publicUrl) {
    return (
      <a
        href={item.publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        className={cn(
          base,
          'transition-colors duration-base',
          tone === 'dark'
            ? 'border-brand-400/50 bg-brand-500/15 text-brand-200 hover:border-brand-400 hover:bg-brand-500/25'
            : 'border-brand-300 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100'
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-status-blink" />
        {label}
        <ExternalIcon className="h-3 w-3" />
      </a>
    );
  }

  // Not linkable: a flat label, with no hover and nothing that invites a click.
  return (
    <span
      className={cn(
        base,
        tone === 'dark'
          ? 'border-white/15 text-brand-100/50'
          : 'border-steel-300 text-steel-500'
      )}
    >
      {label}
    </span>
  );
}

/**
 * The primary "open the real thing" action for a case study. Renders nothing
 * when no public URL can be shown, so there is never a dead button.
 */
export function LiveProjectCta({
  item,
  className
}: {
  item: PortfolioItem;
  className?: string;
}) {
  if (!canShowLiveLink(item) || !item.publicUrl) return null;

  return (
    <a
      href={item.publicUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex h-12 items-center gap-2.5 rounded-pill bg-brand-600 px-6 text-sm font-semibold text-white transition-colors duration-base hover:bg-brand-700',
        className
      )}
    >
      เปิดเว็บไซต์จริง
      <ExternalIcon />
    </a>
  );
}

/**
 * Explains why there is no live link, for systems that will never have one.
 * Shown only where a visitor would otherwise expect a link to appear.
 */
export function NoLiveLinkNotice({ item }: { item: PortfolioItem }) {
  if (canShowLiveLink(item)) return null;

  const reason =
    item.visibility === 'internal'
      ? 'ระบบภายในองค์กร ไม่เปิดเผยลิงก์สาธารณะ'
      : item.visibility === 'client'
        ? 'ระบบของลูกค้า ไม่เปิดเผยลิงก์สาธารณะ'
        : 'ลิงก์เว็บไซต์รออัปเดต';

  return (
    <p className="flex items-start gap-2.5 text-xs leading-relaxed text-steel-500">
      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-steel-400" />
      {reason}
    </p>
  );
}
