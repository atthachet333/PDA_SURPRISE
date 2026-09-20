import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { frameStyle, isPortrait, type FrameShape } from '@/lib/mediaAspect';
import type { Memory } from '@/data/anniversary';

interface MemoryFrameProps {
  photo?: string;
  alt: string;
  /** Which family of proportions this frame belongs to. See `mediaAspect`. */
  shape?: FrameShape;
  tone?: Memory['tone'];
  label?: string;
  index?: number;
  loading?: 'lazy' | 'eager';
  objectPosition?: string;
  className?: string;
  /** Overlaid inside the frame — a caption, a date, a corner mark. */
  children?: ReactNode;
}

/**
 * A photograph in a frame that fits it.
 *
 * The frame's aspect ratio is derived from the photograph itself (clamped into
 * the requested shape's range), so the crop is a few percent instead of the two
 * thirds a portrait photo lost inside a 21/9 band. Nothing here letterboxes:
 * the frame moves to the photo rather than the photo shrinking inside the frame.
 *
 * `objectPosition` still matters for the small residual crop, and is where a
 * per-photo bias belongs — a face high in the frame, a cat low in it.
 */
export function MemoryFrame({
  photo,
  alt,
  shape = 'editorial',
  tone,
  label,
  index,
  loading,
  objectPosition,
  className,
  children
}: MemoryFrameProps) {
  return (
    <div
      /* `ai-sweep` and `ai-lift` are pointer-only and no-ops under reduced
         motion; see the micro-interaction block in global.css. They are applied
         here rather than per scene so every photograph answers the pointer the
         same way. */
      className={cn('ai-sweep ai-lift relative overflow-hidden', className)}
      style={frameStyle(photo, shape)}
    >
      <MemoryImage
        photo={photo}
        alt={alt}
        tone={tone}
        label={label}
        index={index}
        loading={loading}
        objectPosition={objectPosition}
      />
      {children}
    </div>
  );
}

interface MemoryBleedProps extends Omit<MemoryFrameProps, 'shape'> {
  /** Cap on the frame's height, so a tall portrait never exceeds one screen. */
  maxHeight?: string;
}

/**
 * The full-bleed treatment, for portrait photographs.
 *
 * A wide cinematic band is the wrong container for a phone photo held upright,
 * and it is most of this pool. So the band stays full-width — the moment still
 * arrives as a whole screen — but the photograph inside it is shown WHOLE, at
 * its own proportions, with a scaled and blurred copy of itself filling the
 * space either side.
 *
 * That backdrop is the difference between "shown whole" and "letterboxed": the
 * width is filled by the photograph's own colour rather than by black bars, so
 * an uncropped portrait reads as a deliberate composition. It also costs
 * nothing extra to load — same `src`, already in the cache.
 *
 * A landscape photograph needs none of this and simply fills the band.
 */
export function MemoryBleed({
  photo,
  alt,
  tone,
  label,
  index,
  loading,
  objectPosition,
  className,
  maxHeight = 'min(82vh, 46rem)',
  children
}: MemoryBleedProps) {
  const portrait = isPortrait(photo);

  if (!portrait) {
    return (
      <div className={cn('relative w-full overflow-hidden', className)} style={frameStyle(photo, 'wide')}>
        <MemoryImage
          photo={photo}
          alt={alt}
          tone={tone}
          label={label}
          index={index}
          loading={loading}
          objectPosition={objectPosition}
        />
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{ height: maxHeight }}
    >
      {/* The bleed. Decorative twice over — it is the same photograph again —
          so it carries no alt text and no semantics. */}
      <div aria-hidden="true" className="absolute inset-0">
        <MemoryImage
          photo={photo}
          alt=""
          tone={tone}
          loading={loading}
          objectPosition={objectPosition}
          className="scale-110 blur-2xl brightness-[0.55] saturate-[0.85]"
        />
        <span className="absolute inset-0 bg-navy-900/45" />
      </div>

      {/* The photograph itself: whole, centred, height-bound. `contain` is safe
          here because the frame is already the photo's own shape. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full" style={frameStyle(photo, 'natural')}>
          <MemoryImage
            photo={photo}
            alt={alt}
            tone={tone}
            label={label}
            index={index}
            loading={loading}
            cropMode="contain"
          />
        </div>
      </div>

      {children}
    </div>
  );
}
