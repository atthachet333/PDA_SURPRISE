import { cn } from '@/lib/cn';

/**
 * PDA BLISS wordmark.
 *
 * ── OWNER INPUT REQUIRED ────────────────────────────────────────────────────
 * No brand asset has been supplied. `frontend/public/brand/` contains only
 * `favicon.svg`, so this is a typographic mark standing in for the real logo,
 * NOT a reproduction of it.
 *
 * To use the real logo, drop the files in and flip one flag:
 *   full    -> public/brand/logo.svg        (wordmark + mark, for header/footer)
 *   compact -> public/brand/logo-mark.svg   (mark only, for mobile and sticky)
 * then set `USE_ASSET = true`. Both boxes below reserve the same space either
 * way, so nothing shifts when the asset lands.
 * ────────────────────────────────────────────────────────────────────────────
 */
const USE_ASSET = false;
const ASSET_FULL = '/brand/logo.svg';
const ASSET_MARK = '/brand/logo-mark.svg';

interface LogoProps {
  className?: string;
  /** Inverts to white for dark surfaces. */
  inverted?: boolean;
  /** Mark only — used on mobile and in the compact sticky header. */
  compact?: boolean;
}

export function Logo({ className, inverted = false, compact = false }: LogoProps) {
  if (USE_ASSET) {
    return (
      <img
        src={compact ? ASSET_MARK : ASSET_FULL}
        alt="PDA BLISS"
        className={cn(compact ? 'h-8 w-8' : 'h-8 w-auto', className)}
      />
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label="PDA BLISS">
      {/* Mark: a rounded tile with a connected-node glyph, echoing the systems
          idea the rest of the site is built on. */}
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 shrink-0">
        <rect width="32" height="32" rx="8.5" className={inverted ? 'fill-white/12' : 'fill-ink'} />
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="text-brand-400"
        >
          <path d="M11 21.5v-11h5.4a3.3 3.3 0 0 1 0 6.6H11" />
          <path d="M19.5 14.2 23 10.5" />
        </g>
        <circle cx="23.2" cy="10.2" r="1.9" className="fill-brand-400" />
        <circle cx="11" cy="21.6" r="1.6" className="fill-brand-500" />
      </svg>

      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'text-[0.9375rem] font-semibold tracking-[0.01em]',
              inverted ? 'text-white' : 'text-ink'
            )}
          >
            PDA BLISS
          </span>
          <span
            className={cn(
              'mt-0.5 font-mono text-[0.5rem] font-medium uppercase tracking-[0.2em]',
              inverted ? 'text-white/50' : 'text-steel-400'
            )}
          >
            Company Limited
          </span>
        </span>
      ) : null}
    </span>
  );
}
