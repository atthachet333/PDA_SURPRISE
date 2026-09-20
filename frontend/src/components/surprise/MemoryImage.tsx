import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { anniversary, type Memory } from '@/data/anniversary';
import { isKnownBroken, preloadImage } from '@/lib/preload';
import { intrinsicAttrs } from '@/lib/mediaAspect';

type Tone = NonNullable<Memory['tone']>;

const TONES: Record<Tone, { from: string; via: string; to: string }> = {
  sky: { from: 'rgba(126,200,255,0.55)', via: 'rgba(95,175,238,0.30)', to: 'rgba(23,50,77,0.95)' },
  cream: { from: 'rgba(247,241,232,0.52)', via: 'rgba(235,217,188,0.28)', to: 'rgba(23,50,77,0.95)' },
  navy: { from: 'rgba(58,107,153,0.55)', via: 'rgba(30,65,100,0.55)', to: 'rgba(12,27,41,0.98)' },
  champagne: { from: 'rgba(235,217,188,0.5)', via: 'rgba(126,200,255,0.22)', to: 'rgba(23,50,77,0.95)' }
};

interface MemoryImageProps {
  photo?: string;
  alt: string;
  tone?: Memory['tone'];
  className?: string;
  /** Shown on the placeholder so an empty slot still reads as content. */
  label?: string;
  /** Sequence number drawn on the placeholder. */
  index?: number;
  loading?: 'lazy' | 'eager';
  objectPosition?: string;
  cropMode?: 'cover' | 'contain';
}

/**
 * Renders a memory photo, or a generated A&I placeholder when none exists yet.
 *
 * The placeholder is deliberately designed rather than apologetic: sky gradient,
 * star field, the A&I mark and the memory's own number, so an experience with
 * zero photos still looks intentional.
 */
export function MemoryImage({
  photo,
  alt,
  tone = 'sky',
  className,
  label,
  index,
  loading = 'lazy',
  objectPosition = '50% 50%',
  cropMode = 'cover'
}: MemoryImageProps) {
  const [failed, setFailed] = useState(() => isKnownBroken(photo));

  /*
   * The probe's only remaining job is failure detection: a file that cannot be
   * fetched swaps to the designed placeholder instead of leaving a broken
   * image icon. It no longer gates whether the photograph is shown — see the
   * note on the `img` below.
   */
  useEffect(() => {
    setFailed(isKnownBroken(photo));
    if (!photo) return;
    let active = true;
    void preloadImage(photo).then((ok) => {
      if (active && !ok) setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [photo]);

  if (photo && !failed) {
    const { width, height } = intrinsicAttrs(photo);
    return (
      <img
        src={photo}
        alt={alt}
        loading={loading}
        decoding="async"
        /* Layout comes from CSS; these only give the browser the ratio up front
           so decoding a photograph never shifts the text beside it. */
        width={width}
        height={height}
        onError={() => setFailed(true)}
        style={{ objectPosition }}
        /*
         * NO FADE-IN, DELIBERATELY.
         *
         * This used to mount at `opacity-0` and transition to `opacity-100`
         * once `ready` flipped. Measured on the running site, twenty-seven
         * photographs — effectively every picture in the story — were sitting
         * at computed opacity 0, because a transition that never advances
         * leaves the element on its starting value.
         *
         * A decoded image does not need to be faded in; it simply paints. The
         * thing a fade was protecting against — a half-loaded image popping —
         * is already handled by the reserved aspect box and the intrinsic
         * width/height above. So the photograph is visible, full stop, and
         * nothing about whether it can be seen depends on an animation clock.
         */
        className={cn(
          'h-full w-full',
          cropMode === 'contain' ? 'object-contain' : 'object-cover',
          className
        )}
      />
    );
  }

  return <MemoryPlaceholder alt={alt} tone={tone ?? 'sky'} label={label} index={index} className={className} />;
}

function MemoryPlaceholder({
  alt,
  tone,
  label,
  index,
  className
}: {
  alt: string;
  tone: Tone;
  label?: string;
  index?: number;
  className?: string;
}) {
  const palette = TONES[tone];

  // Deterministic star field so a given slot looks the same on every visit.
  const stars = useMemo(() => {
    const seed = (index ?? 0) * 977 + 13;
    const rand = (n: number) => {
      const value = Math.sin(seed * n) * 10_000;
      return value - Math.floor(value);
    };
    return Array.from({ length: 14 }, (_, i) => ({
      x: rand(i + 1) * 100,
      y: rand(i + 21) * 100,
      r: 0.4 + rand(i + 41) * 0.9,
      o: 0.25 + rand(i + 61) * 0.5
    }));
  }, [index]);

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{
        backgroundImage: `linear-gradient(155deg, ${palette.from} 0%, ${palette.via} 46%, ${palette.to} 100%)`
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {stars.map((star, starIndex) => (
          <circle key={starIndex} cx={star.x} cy={star.y} r={star.r} fill="#FFFFFF" opacity={star.o} />
        ))}
      </svg>

      {/* Orbit furniture echoing the A&I mark */}
      <svg
        viewBox="0 0 100 100"
        className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 opacity-45"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(220,239,255,0.55)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(220,239,255,0.3)" strokeWidth="0.4" />
        <circle cx="50" cy="8" r="1.5" fill="#FFFFFF" />
      </svg>

      <span className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-[clamp(1rem,2.4vw,1.5rem)] font-light tracking-[0.2em] text-ivory/85">
          {anniversary.couple.initials}
        </span>
      </span>

      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5">
        <span className="truncate font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ivory/60">
          {label ?? ''}
        </span>
        {typeof index === 'number' ? (
          <span className="shrink-0 font-mono text-[0.5rem] tracking-[0.12em] text-ivory/40">
            {String(index + 1).padStart(2, '0')}
          </span>
        ) : null}
      </span>
    </div>
  );
}
