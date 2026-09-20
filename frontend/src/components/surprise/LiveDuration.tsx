import { memo } from 'react';
import { anniversary } from '@/data/anniversary';
import { useLiveDuration } from '@/hooks/useLiveDuration';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The live count since 2025-10-12.
 *
 * Deliberately not four equal statistic boxes: the DAYS figure is the story and
 * the rest is the fact that it is still running. So days stay large, and hours,
 * minutes and seconds sit beneath as one quiet monospaced line.
 *
 * `memo` matters here. This is the only thing on the page that changes every
 * second, and it is isolated so the celestial canvas and the rest of the scene
 * never re-render on its account.
 */
export const LiveDuration = memo(function LiveDuration({
  className,
  showDays = true
}: {
  className?: string;
  /** Scene02 already owns the large day numeral, so it can ask only for the live clock. */
  showDays?: boolean;
}) {
  const { days, hours, minutes, seconds } = useLiveDuration(anniversary.relationshipStartDate);
  const reduced = useReducedMotion();

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div
        aria-hidden="true"
        className="flex items-start justify-center gap-2 tabular-nums sm:gap-4"
      >
        {showDays ? <Unit value={String(days)} label="DAYS" /> : null}
        {showDays ? <Colon reduced={reduced} /> : null}
        <Unit value={pad(hours)} label="HOURS" />
        <Colon reduced={reduced} />
        <Unit value={pad(minutes)} label="MINUTES" />
        <Colon reduced={reduced} />
        <Unit value={pad(seconds)} label="SECONDS" accent />
      </div>

      {/* Announced once, not every second. */}
      <span className="sr-only">
        อยู่ด้วยกันมาแล้ว {days} วัน {hours} ชั่วโมง {minutes} นาที
      </span>
    </div>
  );
});

function Unit({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <span className="flex min-w-[2.6rem] flex-col items-center sm:min-w-[3.5rem]">
      <span className={cn(
        'font-display text-[clamp(1.9rem,7vw,4.5rem)] font-light leading-none',
        accent ? 'text-champagne' : 'text-ivory'
      )}>
        {value}
      </span>
      <span className="mt-2 font-mono text-[0.42rem] tracking-[0.16em] text-sky-100/40 sm:text-[0.5rem]">
        {label}
      </span>
    </span>
  );
}

function Colon({ reduced }: { reduced: boolean }) {
  return (
    <span className={cn(
      'pt-0.5 font-display text-[clamp(1.9rem,7vw,4.5rem)] font-light leading-none text-sky-100/25',
      !reduced && 'animate-pulse-slow'
    )}>
      :
    </span>
  );
}
