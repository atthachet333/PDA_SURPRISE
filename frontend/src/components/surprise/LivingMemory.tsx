import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';
import type { MemoryVideo } from '@/data/memoryVideos';
import { cn } from '@/lib/cn';
import { pauseOtherVideos } from '@/lib/media';

/**
 * A still that turns out to still be moving.
 *
 * The whole gimmick is restraint. At rest this is a photograph — the poster,
 * nothing fetched, nothing playing — with one small mark saying the moment has
 * more in it. The visitor decides; a clip never starts because a page happened
 * to scroll past it, because a memory that plays at you is an advert, not a
 * memory.
 *
 * It is also deliberately silent. Living Memories sit inside the story with the
 * song running over them, so they never touch the audio bus at all — the
 * viewer is where sound is negotiated. That keeps this component incapable of
 * fighting the track no matter where it is placed.
 *
 * Reduced motion keeps the poster and the explicit play control, and loses only
 * the idle shimmer. The content is never behind the animation.
 */
export function LivingMemory({
  clip,
  className,
  objectPosition = '50% 50%'
}: {
  clip: MemoryVideo;
  className?: string;
  objectPosition?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  /* Leaving the tab stops the picture; coming back does not restart it. */
  useEffect(() => {
    if (!pageVisible) videoRef.current?.pause();
  }, [pageVisible]);

  const start = () => {
    if (failed) return;
    setActive(true);
    /* The element only exists after `active`, so play on the next frame. */
    requestAnimationFrame(() => {
      const node = videoRef.current;
      if (!node) return;
      void node.play().catch(() => setFailed(true));
    });
  };

  const stop = () => {
    videoRef.current?.pause();
    setPlaying(false);
  };

  return (
    <div className={cn('group relative overflow-hidden', className)}>
      <img
        src={clip.poster}
        alt={clip.label}
        loading="lazy"
        decoding="async"
        className={cn(
          'h-full w-full object-cover transition-opacity duration-700',
          active && playing ? 'opacity-0' : 'opacity-100'
        )}
        style={{ objectPosition }}
      />

      {active && !failed ? (
        <video
          ref={videoRef}
          src={clip.video}
          poster={clip.poster}
          muted
          playsInline
          preload="none"
          aria-label={clip.label}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            playing ? 'opacity-100' : 'opacity-0'
          )}
          style={{ objectPosition }}
          onPlay={(event) => {
            pauseOtherVideos(event.currentTarget);
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setActive(false);
          }}
          onEnded={() => {
            /* Return to the photograph rather than freezing on a last frame. */
            setPlaying(false);
            setActive(false);
          }}
        />
      ) : null}

      <button
        type="button"
        onClick={playing ? stop : start}
        disabled={failed}
        aria-label={`${clip.label} — ${playing ? 'หยุดความทรงจำนี้' : 'เล่นความทรงจำนี้'}`}
        className="absolute inset-0 flex items-end justify-start p-3 focus-visible:outline-offset-4 disabled:cursor-default sm:p-4"
        data-cursor="open"
      >
        {failed ? null : (
          <span
            className={cn(
              'pointer-events-none inline-flex min-h-9 items-center gap-2 rounded-full border border-sky-100/25 bg-navy-900/55 px-3 py-1.5 backdrop-blur-sm transition-opacity duration-500',
              playing ? 'opacity-0' : 'opacity-100'
            )}
          >
            {/* The motion mark: one small orbiting point, not a play button
                borrowed from a video site. */}
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute h-2.5 w-2.5 rounded-full border border-champagne/50" />
              <span
                className={cn(
                  'h-1 w-1 rounded-full bg-champagne',
                  reduced ? '' : 'animate-ping'
                )}
              />
            </span>
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-ivory/80">
              ยังเคลื่อนไหวอยู่
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
