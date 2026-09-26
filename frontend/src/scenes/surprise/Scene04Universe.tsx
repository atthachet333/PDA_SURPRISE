import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import {
  memoryArchive,
  memoryArchiveGroups,
  type MemoryArchiveGroup,
  type MemoryArchiveItem
} from '@/data/memoryArchive';
import { CinematicViewer } from '@/components/surprise/CinematicViewer';
import {
  archiveVideos,
  compatibleArchiveGroup,
  type ArchiveMediaFilter,
  type MemoryVideo
} from '@/data/memoryVideos';
import {
  ARCHIVE_PAGE_SIZE,
  ARCHIVE_YEAR_EVENT,
  resetArchiveView,
  sanitizeArchiveFilters
} from '@/data/archiveYears';
import {
  DEFAULT_ARCHIVE_YEAR_ID,
  relationshipYears,
  type RelationshipYearId
} from '@/data/relationshipYears';
import { useAudio } from '@/app/audioContext';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

const PAGE_SIZE = ARCHIVE_PAGE_SIZE;
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
  const [openClip, setOpenClip] = useState<MemoryVideo | null>(null);
  const [media, setMedia] = useState<ArchiveMediaFilter>('all');
  const [yearId, setYearId] = useState<RelationshipYearId>(DEFAULT_ARCHIVE_YEAR_ID);
  const reduced = useReducedMotion();
  const { play, triggerCue } = useAudio();

  const selectYear = useCallback((nextYearId: RelationshipYearId) => {
    const next = resetArchiveView(nextYearId);
    setYearId(next.yearId);
    setMedia(next.media);
    setGroup(next.group);
    setVisibleCount(next.visibleCount);
    setSelected(null);
    setOpenClip(null);
  }, []);

  useEffect(() => {
    if (inView) triggerCue('memoryUniverse');
  }, [inView, triggerCue]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [group, media, yearId]);

  useEffect(() => {
    const selectFromFinale = (event: Event) => {
      const nextYear = (event as CustomEvent<{ yearId?: RelationshipYearId }>).detail?.yearId;
      if (nextYear) selectYear(nextYear);
    };
    window.addEventListener(ARCHIVE_YEAR_EVENT, selectFromFinale);
    return () => window.removeEventListener(ARCHIVE_YEAR_EVENT, selectFromFinale);
  }, [selectYear]);

  /*
   * The photo viewer is a modal (EP46.5): focus moves to its close button on
   * open, Tab cannot leave it (the close button is its only control), Escape
   * closes it, and focus returns to the memory that opened it — the same
   * contract as CinematicViewer. Before, focus stayed on the card behind the
   * dialog and Tab walked on through the page underneath.
   */
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const isOpen = selected !== null;
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    lightboxCloseRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
      else if (event.key === 'Tab') {
        event.preventDefault();
        lightboxCloseRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [isOpen]);

  const selectedYear = relationshipYears.find((year) => year.id === yearId) ?? relationshipYears[0]!;
  const yearPhotos = useMemo(() => memoryArchive.filter((item) => item.yearId === yearId), [yearId]);
  const yearVideos = useMemo(() => archiveVideos.filter((clip) => clip.yearId === yearId), [yearId]);
  const filtered = useMemo(
    () => (group === 'all' ? yearPhotos : yearPhotos.filter((item) => item.group === group)),
    [group, yearPhotos]
  );

  /*
   * Clips live in their own list rather than inside `memoryArchive`, so the
   * photo archive keeps its shape and its counts. They join the field only
   * here, at display time, and only when the group filter is not narrowing to a
   * photo-specific group — a clip has no wedding/prewedding grouping to claim,
   * and inventing one would be inventing truth.
   */
  const clips = useMemo(() => {
    if (media === 'photo') return [];
    /* Asking for clips means the photo groups are not the question, so a group
       selection is ignored rather than intersected — intersecting produced an
       empty field, which reads as "there are none" rather than "that filter
       does not apply here". */
    if (media === 'video') return yearVideos;
    return group === 'all' ? yearVideos : [];
  }, [group, media, yearVideos]);
  const photos = useMemo(() => (media === 'video' ? [] : filtered), [filtered, media]);
  const total = photos.length + clips.length;

  /* Clips lead the field so the moving memories are the first thing found. */
  const visibleClips = clips.slice(0, visibleCount);
  const visible = photos.slice(0, Math.max(0, visibleCount - visibleClips.length));

  const selectMedia = (nextMedia: ArchiveMediaFilter) => {
    const next = sanitizeArchiveFilters({ yearId, media: nextMedia, group });
    setMedia(next.media);
    setGroup(compatibleArchiveGroup(next.media, next.group));
  };

  return (
    <SceneSection id="memories" ref={sectionRef} label="คลังความทรงจำ" className="overflow-hidden" fullHeight={false}>
      <div className="w-full max-w-[92rem] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SceneLabel>10 · MEMORY ARCHIVE</SceneLabel>
          <SceneTitle className="thai-display mt-5 font-thai">รูปของเรา<br />อยู่ที่นี่จริง ๆ</SceneTitle>
          <p className="mx-auto mt-6 max-w-2xl font-thai text-base leading-8 text-ivory/65">
            จากวันธรรมดา ระหว่างทาง ไปจนถึงวันที่กลายเป็นครอบครัวเดียวกัน — ทุกภาพที่ปลอดภัยและมีความหมายถูกเก็บไว้ในสนามความทรงจำนี้
          </p>
          <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-sky-100/50">
            {selectedYear.releaseState === 'released'
              ? `${yearPhotos.length} SAFE MEMORIES · ${yearVideos.length} IN MOTION · LOCAL & PRIVATE`
              : 'บทต่อไป · LOCAL & PRIVATE'}
          </p>
        </div>

        <div className="relative mx-auto mt-9 flex max-w-md items-center justify-center gap-3 sm:gap-5" aria-label="เลือกปีของความทรงจำ">
          <span aria-hidden="true" className="absolute inset-x-10 top-1/2 h-px bg-gradient-to-r from-transparent via-sky-200/25 to-transparent" />
          {relationshipYears.map((year) => {
            const active = year.id === yearId;
            return (
              <button
                key={year.id}
                type="button"
                aria-pressed={active}
                aria-label={`${year.title} — ${year.subtitle}`}
                onClick={() => selectYear(year.id)}
                className={cn(
                  'ai-pressable relative z-10 inline-flex min-h-11 min-w-[7.75rem] items-center justify-center gap-2 rounded-full border px-4 font-mono text-[0.56rem] tracking-[0.18em] focus-visible:outline-offset-4',
                  active
                    ? 'border-champagne/55 bg-navy-800 text-champagne shadow-[0_0_24px_rgba(235,217,188,0.12)]'
                    : 'border-sky-200/18 bg-navy-900/80 text-sky-100/55 hover:border-sky-200/40 hover:text-ivory'
                )}
              >
                <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-champagne shadow-[0_0_10px_rgba(235,217,188,0.8)]' : 'bg-sky-200/35')} />
                {year.title}
              </button>
            );
          })}
        </div>

        {selectedYear.releaseState !== 'released' ? (
          <div className="mx-auto mt-12 max-w-xl py-14 text-center sm:py-20" aria-live="polite">
            <span aria-hidden="true" className="mx-auto block h-24 w-24 rounded-full border border-sky-200/15 bg-[radial-gradient(circle,rgba(126,200,255,0.12),transparent_68%)]" />
            <p className="mt-7 font-display text-3xl text-ivory sm:text-4xl">{selectedYear.title}</p>
            <p className="mt-4 font-thai text-lg text-champagne">{selectedYear.subtitle}</p>
            <p className="mx-auto mt-4 max-w-md font-thai text-sm leading-7 text-ivory/58">
              เรื่องราวต่อจากนี้ยังเปิดอยู่ เราจะค่อย ๆ เติมมันด้วยสิ่งที่เกิดขึ้นจริง
            </p>
          </div>
        ) : (
          <>

        {/* Three states, not a taxonomy: everything, the stills, the ones that
            still move. */}
        <div className="mx-auto mt-8 flex justify-center gap-2">
          <FilterButton active={media === 'all'} onClick={() => selectMedia('all')}>
            ทั้งหมด
          </FilterButton>
          <FilterButton active={media === 'photo'} onClick={() => selectMedia('photo')}>
            ภาพนิ่ง
          </FilterButton>
          <FilterButton active={media === 'video'} onClick={() => selectMedia('video')}>
            ภาพเคลื่อนไหว
          </FilterButton>
        </div>

        <div
          className={cn(
            'no-scrollbar mx-auto mt-4 max-w-full gap-2 overflow-x-auto px-1 pb-2 sm:justify-center',
            media === 'video' ? 'hidden' : 'flex'
          )}
          aria-hidden={media === 'video' ? 'true' : undefined}
        >
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
          {total === 0 ? (
            <p className="col-span-full py-16 text-center font-thai text-sm text-ivory/60">
              ยังไม่มีความทรงจำในตัวกรองนี้
            </p>
          ) : null}
          {visibleClips.map((clip, index) => (
            <motion.button
              key={clip.id}
              type="button"
              initial={reduced ? false : { y: 18 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: '0px 0px -6% 0px' }}
              transition={{ duration: 0.75, delay: Math.min(index % 8, 4) * 0.035, ease: EASE }}
              onClick={() => {
                play('memoryFocus');
                setOpenClip(clip);
              }}
              className={cn(
                'group relative min-h-0 overflow-hidden bg-navy-700/20 text-left focus-visible:outline-offset-4',
                clip.role === 'featured' ? 'row-span-2 sm:col-span-2' : 'row-span-2'
              )}
              aria-label={`เปิดความทรงจำที่ยังเคลื่อนไหว ${clip.label}`}
              data-cursor="open"
            >
              {/* Poster only. A field of autoplaying thumbnails would be noise,
                  and would pull every clip over the wire to make it. */}
              <img
                src={clip.poster}
                alt={clip.label}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2 items-center justify-center">
                    <span className="absolute h-2 w-2 rounded-full border border-champagne/60" />
                    <span className={cn('h-0.5 w-0.5 rounded-full bg-champagne', reduced ? '' : 'animate-ping')} />
                  </span>
                  <span className="font-mono text-[0.46rem] uppercase tracking-[0.2em] text-champagne">
                    {clip.role === 'featured' ? 'MEMORY FILM' : 'IN MOTION'}
                  </span>
                </span>
                <span className="font-mono text-[0.5rem] tracking-[0.16em] text-ivory/80">
                  {Math.round(clip.duration)}s
                </span>
              </span>
            </motion.button>
          ))}

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

        {visibleCount < total ? (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="ai-button-secondary ai-pressable rounded-full px-7 py-3 font-thai text-sm"
            >
              เปิดความทรงจำเพิ่ม · {Math.min(PAGE_SIZE, total - visibleCount)} ภาพ
            </button>
          </div>
        ) : null}
          </>
        )}
      </div>

      <AnimatePresence>
        {openClip ? <CinematicViewer clip={openClip} onClose={() => setOpenClip(null)} /> : null}
      </AnimatePresence>

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
                  ref={lightboxCloseRef}
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
