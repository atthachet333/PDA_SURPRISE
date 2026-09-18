import { cn } from '@/lib/cn';

/**
 * PDA BLISS wordmark.
 *
 * If a supplied brand asset is dropped at `public/brand/logo.svg`, set
 * `USE_ASSET` to true and it is used instead of the built-in mark. The layout
 * reserves the same box either way so nothing shifts.
 */
const USE_ASSET = false;
const ASSET_PATH = '/brand/logo.svg';

interface LogoProps {
  className?: string;
  /** Inverts to white for dark surfaces. */
  inverted?: boolean;
  compact?: boolean;
}

export function Logo({ className, inverted = false, compact = false }: LogoProps) {
  if (USE_ASSET) {
    return <img src={ASSET_PATH} alt="PDA BLISS" className={cn('h-8 w-auto', className)} />;
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label="PDA BLISS">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 shrink-0">
        <rect
          width="32"
          height="32"
          rx="9"
          className={inverted ? 'fill-white/10' : 'fill-ink'}
        />
        <path
          d="M10.5 23V9h6.9c3.2 0 5.5 2.05 5.5 5.02 0 3-2.3 5.05-5.5 5.05H14V23h-3.5Zm3.5-7.2h2.9c1.3 0 2.2-.82 2.2-2 0-1.17-.9-1.95-2.2-1.95H14v3.95Z"
          className="fill-brand-500"
        />
      </svg>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'text-[0.95rem] font-semibold tracking-[0.02em]',
              inverted ? 'text-white' : 'text-ink'
            )}
          >
            PDA BLISS
          </span>
          <span
            className={cn(
              'mt-0.5 text-[0.5625rem] font-medium uppercase tracking-[0.22em]',
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
