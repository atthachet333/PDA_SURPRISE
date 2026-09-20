import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { aspectOf, frameStyle, isPortrait, type FrameShape } from '@/lib/mediaAspect';
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
 * The full-bleed treatment follows the photograph's native proportions.
 * Portraits no longer sit inside a blurred duplicate or an oversized card;
 * landscapes fill a wide band and portraits take the largest useful width the
 * viewport can support without cropping.
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
  maxHeight = 'min(90vh, 54rem)',
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

  const ratio = aspectOf(photo);

  return (
    <div
      className={cn('relative mx-auto overflow-hidden', className)}
      style={{
        aspectRatio: String(ratio),
        width: `min(100%, calc(${maxHeight} * ${ratio.toFixed(3)}))`,
        maxHeight
      }}
    >
      <MemoryImage
        photo={photo}
        alt={alt}
        tone={tone}
        label={label}
        index={index}
        loading={loading}
        objectPosition={objectPosition}
        cropMode="cover"
      />

      {children}
    </div>
  );
}
