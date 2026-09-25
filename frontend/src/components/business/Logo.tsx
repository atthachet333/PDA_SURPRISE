import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/*
 * The build sets these only when the owner files exist in public/brand
 * (vite.config.ts), so a site without them never requests a file that is not
 * there — each miss was a 404 in the console on every page. Dropping the
 * files in and rebuilding switches them on.
 */
const ASSET_FULL: string = import.meta.env.VITE_BRAND_LOGO_FULL ?? '';
const ASSET_MARK: string = import.meta.env.VITE_BRAND_LOGO_MARK ?? '';
const initialSource = (compact: boolean) => (compact && ASSET_MARK) || ASSET_FULL;
const ALT = 'PDA BLISS COMPANY LIMITED';

interface LogoProps {
  className?: string;
  inverted?: boolean;
  compact?: boolean;
}

/**
 * Real brand assets are attempted first. A missing compact mark falls back to
 * the full owner logo; the temporary inline mark is the final safe fallback
 * until the owner files are placed under public/brand.
 */
export function Logo({ className, inverted = false, compact = false }: LogoProps) {
  const [source, setSource] = useState(() => initialSource(compact));
  const [assetFailed, setAssetFailed] = useState(false);

  useEffect(() => {
    setSource(initialSource(compact));
    setAssetFailed(false);
  }, [compact]);

  if (source && !assetFailed) {
    return (
      <img
        src={source}
        alt={ALT}
        className={cn(source === ASSET_MARK ? 'h-8 w-8 object-contain' : 'h-8 w-auto max-w-[9rem] object-contain', inverted && 'brightness-0 invert', className)}
        onError={() => {
          if (source === ASSET_MARK && ASSET_FULL) setSource(ASSET_FULL);
          else setAssetFailed(true);
        }}
      />
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label={ALT}>
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 shrink-0">
        <rect width="32" height="32" rx="8.5" className={inverted ? 'fill-white/12' : 'fill-ink'} />
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-brand-400">
          <path d="M11 21.5v-11h5.4a3.3 3.3 0 0 1 0 6.6H11" /><path d="M19.5 14.2 23 10.5" />
        </g>
        <circle cx="23.2" cy="10.2" r="1.9" className="fill-brand-400" /><circle cx="11" cy="21.6" r="1.6" className="fill-brand-500" />
      </svg>
      {!compact ? <span className="flex flex-col leading-none"><span className={cn('text-[0.9375rem] font-semibold', inverted ? 'text-white' : 'text-ink')}>PDA BLISS</span><span className={cn('mt-0.5 font-mono text-[0.5rem] uppercase tracking-[0.2em]', inverted ? 'text-white/50' : 'text-steel-400')}>Company Limited</span></span> : null}
    </span>
  );
}
