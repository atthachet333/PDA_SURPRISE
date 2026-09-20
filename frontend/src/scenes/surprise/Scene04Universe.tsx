import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import {
  memoryArchive,
  memoryArchiveGroups,
  type MemoryArchiveGroup,
  type MemoryArchiveItem
} from '@/data/memoryArchive';
import { useAudio } from '@/app/audioContext';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

const PAGE_SIZE = 24;
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The memory archive is a quiet celestial field, not a carousel or a masonry
 * dump. Small derivatives paint the field; the 1600px image is requested only
 * when a visitor chooses a memory. Every safe, meaningful Drive photograph has
 * a documented home here.
 */
export function Scene04Universe() {
  const [sectionRef, inView] = useInViewOnce<HTMLElement>({ threshold: 0.08 });
  const [group, setGroup] = useState<MemoryArchiveGroup | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<MemoryArchiveItem | null>(null);
  const reduced = useReducedMotion();
  const { play, triggerCue } = useAudio();

  useEffect(() => {
    if (inView) triggerCue('memoryUniverse');
  }, [inView, triggerCue]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [group]);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [selected]);

  const filtered = useMemo(
    () => (group === 'all' ? memoryArchive : memoryArchive.filter((item) => item.group === group)),
    [group]
  );
  const visible = filtered.slice(0, visibleCount);

  return (
    <SceneSection id="memories" ref={sectionRef} label="คลังความทรงจำ" className="overflow-hidden" fullHeight={false}>
      <div className="w-full max-w-[92rem] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SceneLabel>06 · MEMORY ARCHIVE</SceneLabel>
          <SceneTitle className="thai-display mt-5 font-thai">รูปของเรา<br />อยู่ที่นี่จริง ๆ</SceneTitle>
          <p className="mx-auto mt-6 max-w-2xl font-thai text-base leading-8 text-ivory/65">
            จากวันธรรมดา ระหว่างทาง ไปจนถึงวันที่กลายเป็นครอบครัวเดียวกัน — ทุกภาพที่ปลอดภัยและมีความหมายถูกเก็บไว้ในสนามความทรงจำนี้
          </p>
          <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-sky-100/50">
            {memoryArchive.length} SAFE MEMORIES · LOCAL &amp; PRIVATE
          </p>
        </div>

        <div className="no-scrollbar mx-auto mt-10 flex max-w-full gap-2 overflow-x-auto px-1 pb-2 sm:justify-center">
          <FilterButton active={group === 'all'} onClick={() => setGroup('all')}>
            ทั้งหมด
          </FilterButton>
          {memoryArchiveGroups.map((entry) => (
            <FilterButton key={entry.id} active={group === entry.id} onClick={() => setGroup(entry.id)}>
              {entry.label}
            </FilterButton>
          ))}
        </div>

        <div
          className="mt-12 grid auto-rows-[7.5rem] grid-cols-2 grid-flow-dense gap-2 sm:auto-rows-[10rem] sm:grid-cols-4 sm:gap-3 lg:auto-rows-[11rem] lg:grid-cols-6 lg:gap-4"
          aria-live="polite"
        >
          {visible.map((item, index) => {
            const landscape = item.width / item.height > 1.18;
            const featured = item.special || index % 13 === 0;
            return (
              <motion.button
                key={item.id}
                type="button"
                initial={reduced ? false : { y: 18 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: '0px 0px -6% 0px' }}
                transition={{ duration: 0.75, delay: Math.min(index % 8, 4) * 0.035, ease: EASE }}
                onClick={() => {
                  play('memoryFocus');
                  setSelected(item);
                }}
                className={cn(
                  'group relative min-h-0 overflow-hidden bg-navy-700/20 text-left focus-visible:outline-offset-4',
                  featured && landscape && 'col-span-2 row-span-2',
                  featured && !landscape && 'row-span-2',
                  !featured && landscape && 'col-span-2',
                  !featured && !landscape && index % 5 === 0 && 'row-span-2'
                )}
                aria-label={`เปิดความทรงจำ ${item.groupLabel}`}
                data-cursor="open"
              >
                <MemoryImage
                  photo={item.thumb}
                  alt={item.groupLabel}
                  tone="sky"
                  loading="lazy"
                  cropMode="cover"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/72 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95" />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-4">
                  <span className="font-thai text-xs text-ivory/90 sm:text-sm">{item.groupLabel}</span>
                  {item.special ? (
                    <span className="font-mono text-[0.46rem] uppercase tracking-[0.2em] text-champagne">ANCHOR</span>
                  ) : null}
                </span>
              </motion.button>
            );
          })}
        </div>

        {visibleCount < filtered.length ? (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="ai-button-secondary ai-pressable rounded-full px-7 py-3 font-thai text-sm"
            >
              เปิดความทรงจำเพิ่ม · {Math.min(PAGE_SIZE, filtered.length - visibleCount)} ภาพ
            </button>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-900/95 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={selected.groupLabel}
            onClick={() => setSelected(null)}
          >
            <motion.figure
              initial={reduced ? false : { scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="relative flex max-h-[92vh] max-w-[92vw] flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={selected.image}
                alt={selected.groupLabel}
                width={selected.width}
                height={selected.height}
                className="max-h-[82vh] max-w-[92vw] object-contain"
                decoding="async"
              />
              <figcaption className="flex items-center justify-between gap-6 py-4">
                <div>
                  <p className="font-thai text-sm text-ivory">{selected.groupLabel}</p>
                  <p className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sky-100/50">
                    {selected.dateLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="ai-pressable inline-flex min-h-11 items-center rounded-full border border-sky-200/20 px-4 font-thai text-xs text-ivory/75"
                >
                  ปิด
                </button>
              </figcaption>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SceneSection>
  );
}

function FilterButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        /* min-h-11 (44px) rather than padding alone: measured at 34px, these
           are the most-tapped controls in the archive and were the shortest. */
        'ai-pressable inline-flex shrink-0 items-center rounded-full border px-4 font-thai text-xs',
        'min-h-11',
        active
          ? 'border-sky-100/55 bg-sky-100/10 text-ivory'
          : 'border-sky-200/12 text-ivory/55 hover:border-sky-200/35 hover:text-ivory'
      )}
    >
      {children}
    </button>
  );
}
