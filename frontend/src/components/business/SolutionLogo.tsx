import { useTheme } from '@/app/ThemeContext';
import { SITE_BRAND, brandAssets, type BrandTone } from '@/data/brand';
import { cn } from '@/lib/cn';

interface SolutionLogoProps {
  /**
   * `lockup` — monogram + PDA BLISS / SOLUTION, side by side (header, footer).
   * `mark`   — the monogram alone (dock, compact spots).
   */
  variant?: 'lockup' | 'mark';
  /**
   * Which ground the logo sits on. `auto` follows the corporate theme; a dark
   * island (the footer, the contact dock) passes `dark` whatever the theme.
   */
  tone?: 'auto' | BrandTone;
  /** Height of the mark; the wordmark scales from it. */
  className?: string;
  /** A duplicate of a logo already announced nearby is decorative. */
  decorative?: boolean;
}

/**
 * PDA BLISS SOLUTION logo (EP46.6). The owner-approved lockup, as images
 * generated from the source — never redrawn, never stretched: every <img>
 * carries its intrinsic width and height and scales by height only.
 *
 * Only the tone that is painted is requested: the src is chosen from the
 * resolved theme, so a light-mode visit never downloads the dark files.
 *
 * Static by design. The logo does not float or pulse; it is the stable
 * reference point the rest of the page moves around.
 */
export function SolutionLogo({ variant = 'lockup', tone = 'auto', className, decorative = false }: SolutionLogoProps) {
  const { resolved } = useTheme();
  const ground: BrandTone = tone === 'auto' ? resolved : tone;
  const mark = brandAssets.markSmall;
  const word = brandAssets.wordmark;

  const markImage = (
    <img
      src={mark[ground]}
      width={mark.width}
      height={mark.height}
      alt={variant === 'mark' && !decorative ? SITE_BRAND : ''}
      aria-hidden={variant === 'lockup' || decorative ? true : undefined}
      decoding="async"
      draggable={false}
      className={cn('h-10 w-auto shrink-0 select-none', variant === 'mark' && className)}
    />
  );

  if (variant === 'mark') return markImage;

  return (
    <span
      className={cn('inline-flex items-center gap-2.5', className)}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : SITE_BRAND}
      aria-hidden={decorative || undefined}
    >
      <img
        src={mark[ground]}
        width={mark.width}
        height={mark.height}
        alt=""
        decoding="async"
        draggable={false}
        className="h-full w-auto shrink-0 select-none"
      />
      <img
        src={word[ground]}
        width={word.width}
        height={word.height}
        alt=""
        decoding="async"
        draggable={false}
        className="h-[62%] w-auto shrink-0 select-none"
      />
    </span>
  );
}
