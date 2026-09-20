import { useEffect, useRef, useState } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';
import { cn } from '@/lib/cn';

interface MemoryVideoProps {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  objectPosition?: string;
}

/**
 * A memory clip, held to the same rules as everything else in this experience.
 *
 * SILENT, ALWAYS. The files are transcoded with no audio track at all, and the
 * element is muted on top of that. There is exactly one voice here — the main
 * track — and a second audio stream must never be able to argue with it.
 *
 * IT ONLY PLAYS WHEN IT IS BEING WATCHED. Nothing is fetched until the clip is
 * near the viewport (`preload="none"`), playback starts when it actually
 * arrives, and it pauses when the tab is hidden so a backgrounded page is not
 * quietly decoding video.
 *
 * REDUCED MOTION GETS THE POSTER. Not a frozen video element — the still frame,
 * which carries the same image without the movement. The content is never
 * behind the animation.
 *
 * And if the file 404s or the codec is refused, the poster stays. There is no
 * state of this component that shows an empty black box.
 */
export function MemoryVideo({ src, poster, alt, className, objectPosition = '50% 50%' }: MemoryVideoProps) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.25 });
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || reduced || failed) return;

    if (inView && pageVisible) {
      // A blocked autoplay is not an error worth surfacing: the poster is
      // already showing the same frame, so the visitor loses nothing.
      void node.play().catch(() => undefined);
    } else {
      node.pause();
    }
  }, [failed, inView, pageVisible, reduced]);

  // Reduced motion: the still frame, full stop. No video element mounted.
  if (reduced || failed) {
    return (
      <img
        ref={undefined}
        src={poster}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn('h-full w-full object-cover', className)}
        style={{ objectPosition }}
      />
    );
  }

  return (
    <div ref={ref} className={cn('relative h-full w-full overflow-hidden', className)}>
      <video
        ref={videoRef}
        // `poster` means the frame is on screen before a single byte of video
        // is fetched, so the layout never shows an empty box.
        poster={poster}
        muted
        playsInline
        loop
        preload="none"
        aria-label={alt}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
        style={{ objectPosition }}
      >
        {inView ? <source src={src} type="video/mp4" /> : null}
      </video>
    </div>
  );
}
