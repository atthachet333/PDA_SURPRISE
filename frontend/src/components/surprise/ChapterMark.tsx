import { cn } from '@/lib/cn';

/**
 * The thread between chapters: a thin line of light falling into a small
 * numbered mark. It is the same micro-typography Peak and 12 OCT use (mono
 * caps + a champagne rule), so every chapter visibly belongs to one story.
 * Purely decorative motion; the text is static and always readable.
 */
export function ChapterMark({
  index,
  label,
  className,
  tone = 'sky'
}: {
  index: string;
  label: string;
  className?: string;
  tone?: 'sky' | 'ink';
}) {
  const ink = tone === 'ink';
  return (
    <div className={cn('flex flex-col items-start', className)}>
      <span
        aria-hidden="true"
        className={cn('ai-chapter-thread block h-14 w-px', ink ? 'bg-gradient-to-b from-transparent to-[#17324d]/45' : 'bg-gradient-to-b from-transparent to-champagne/60')}
      />
      <p
        className={cn(
          'mt-4 flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.32em] sm:text-[0.7rem]',
          ink ? 'text-[#17324d]/75' : 'text-champagne/90'
        )}
      >
        <span className={cn('shrink-0 whitespace-nowrap font-display text-[0.95rem] italic tracking-[0.12em]', ink ? 'text-[#17324d]' : 'text-ivory')}>{index}</span>
        <span aria-hidden="true" className={cn('h-px w-8 shrink-0', ink ? 'bg-[#17324d]/40' : 'bg-champagne/60')} />
        <span>{label}</span>
      </p>
    </div>
  );
}
