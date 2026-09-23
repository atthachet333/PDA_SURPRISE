/**
 * ============================================================================
 * A&I — main-story media registry
 * ============================================================================
 * Every photograph or clip the linear story shows, in reading order, with the
 * canonical event it stands for. The prototype scenes read their media from
 * here; the timeline and the journey essay stay in `anniversary.ts` and are
 * folded in below, so the audit sees the story exactly as a visitor does.
 *
 * TRUTH LOCKS (owner-confirmed 2026-09-22/23)
 *   Peak  — first meeting. IMG_3416, 10 OCT 2025 21:32 → `peak-01.webp`.
 *   TURR  — relationship start, 12 OCT 2025. IMG_3479 → `turr-night-still.webp`
 *           (formerly, and misleadingly, `peak-02.webp`). The clip is
 *           `6769b2a3….MOV`, the story that still was captured from: same neon
 *           sign, same burned-in caption. The recap frame comes from
 *           `40f120df….MOV`, a second clip from the same table that night.
 *   The same source must never stand for both events.
 *
 * The archive (Scene04) and the convergence montage (Scene11) are deliberately
 * outside this registry: the archive is meant to be comprehensive, and the
 * montage repeats memories by construction to draw the day-count glyph.
 * ============================================================================
 */

import { anniversary } from '@/data/anniversary';

export type StoryEvent =
  | 'peak'
  | 'turr'
  | 'daily'
  | 'roadtrip'
  | 'sarika'
  | 'suanphueng'
  | 'pattaya'
  | 'chaam'
  | 'decision'
  | 'prewedding'
  | 'wedding'
  | 'registration'
  | 'present'
  | 'family';

export interface StorySlot {
  scene: string;
  slot: string;
  src: string;
  event: StoryEvent;
}

const M = '/images/memories';

/** Scene 03 — ร้าน Peak. Owner-confirmed IMG_3416. */
export const PEAK_MEDIA = {
  hero: `${M}/peak-01.webp`
} as const;

/** Scene 03 — 12 OCT 2025 at TURR Kaset. */
export const TURR_MEDIA = {
  /** Owner-confirmed still; also the clip's poster, so nothing flashes on load. */
  still: `${M}/turr-night-still.webp`,
  /** Muted, silent H.264 derivative of 6769b2a3….MOV (no audio track at all). */
  video: '/videos/memories/turr-night.mp4',
  /** A different moment from the same table — used where the story looks back. */
  recap: `${M}/turr-night-recap.webp`
} as const;

/** Scene 06 — little moments. Place plates are same-session alternates. */
export const LITTLE_MOMENTS_MEDIA = {
  wide: `${M}/special-roadtrip-wide.webp`,
  /** IMG_5883 — same minute and rocks as the owner-confirmed Sarika hero. */
  sarika: `${M}/archive/memory-027.webp`,
  /** IMG_1755 — the same Suan Phueng field, minutes before the hero frame. */
  suanphueng: `${M}/archive/memory-145.webp`,
  strip: [`${M}/archive/thumbs/memory-051.webp`, `${M}/archive/thumbs/memory-133.webp`, `${M}/archive/thumbs/memory-130.webp`]
} as const;

/** Scene 07 — the present-day payoff: one hero, three family details. */
export const PRESENT_MEDIA = {
  hero: `${M}/together-now-01.webp`,
  family: `${M}/cat-together-01.webp`,
  kanomtuay: `${M}/cat-01.webp`,
  tuayfu: `${M}/cat-02.webp`
} as const;

/** Canonical event of each timeline beat, keyed by the beat id. */
const TIMELINE_EVENTS: Record<string, StoryEvent> = {
  t1: 'peak',
  t2: 'turr',
  t8b: 'prewedding',
  t8c: 'wedding',
  t4: 'sarika',
  t7b: 'decision',
  t5: 'suanphueng',
  t6: 'pattaya',
  t7: 'chaam',
  t8: 'registration',
  t9: 'present'
};

const JOURNEY_EVENTS: Record<string, StoryEvent> = {
  'jp-suanphueng': 'suanphueng',
  'jp-pattaya': 'pattaya',
  'jp-sarika': 'sarika',
  'jp-chaam': 'chaam'
};

/** The linear story, in the order Experience mounts it. */
export function storyMediaSlots(): StorySlot[] {
  const slots: StorySlot[] = [
    { scene: 'peak', slot: 'hero', src: PEAK_MEDIA.hero, event: 'peak' },
    { scene: 'turr', slot: 'poster', src: TURR_MEDIA.still, event: 'turr' },
    { scene: 'turr', slot: 'video', src: TURR_MEDIA.video, event: 'turr' },
    { scene: 'little-moments', slot: 'wide', src: LITTLE_MOMENTS_MEDIA.wide, event: 'roadtrip' },
    { scene: 'little-moments', slot: 'pair-a', src: LITTLE_MOMENTS_MEDIA.sarika, event: 'sarika' },
    { scene: 'little-moments', slot: 'pair-b', src: LITTLE_MOMENTS_MEDIA.suanphueng, event: 'suanphueng' },
    ...LITTLE_MOMENTS_MEDIA.strip.map((src, index) => ({ scene: 'little-moments', slot: `strip-${index + 1}`, src, event: 'daily' as const }))
  ];

  for (const moment of anniversary.timeline) {
    const event = TIMELINE_EVENTS[moment.id] ?? 'daily';
    [moment.image, ...(moment.images ?? [])].forEach((src, index) => {
      if (src) slots.push({ scene: 'journey', slot: index ? `${moment.id}.${index}` : moment.id, src, event });
    });
  }

  for (const place of anniversary.journey.photoStories) {
    slots.push({ scene: 'map', slot: place.id, src: place.image, event: JOURNEY_EVENTS[place.id] ?? 'daily' });
  }

  slots.push(
    { scene: 'life', slot: 'hero', src: PRESENT_MEDIA.hero, event: 'present' },
    { scene: 'life', slot: 'family', src: PRESENT_MEDIA.family, event: 'family' },
    { scene: 'life', slot: 'kanomtuay', src: PRESENT_MEDIA.kanomtuay, event: 'family' },
    { scene: 'life', slot: 'tuayfu', src: PRESENT_MEDIA.tuayfu, event: 'family' }
  );
  return slots;
}

/**
 * Deliberate repeats. Each one must say why; an entry without a reason is a
 * silent whitelist and the audit rejects it.
 */
export interface StoryMediaException {
  src: string;
  reason: string;
}

/**
 * None today. (The TURR still doubles as the clip's poster, but that is one
 * slot showing one memory, so it is registered once and needs no exception.)
 */
export const STORY_MEDIA_EXCEPTIONS: StoryMediaException[] = [];

export interface StoryMediaIssue {
  kind: 'adjacent' | 'cross-event' | 'overused' | 'bad-exception';
  src: string;
  detail: string;
}

/**
 * Checks the three rules the owner cares about:
 *   adjacent    — one source in two consecutive story slots of different beats
 *   cross-event — one source standing for two different canonical events
 *   overused    — one source used more than `maxUses` times
 */
export function auditStoryMedia(
  slots: StorySlot[] = storyMediaSlots(),
  {
    maxUses = 2,
    exceptions = STORY_MEDIA_EXCEPTIONS,
    sourceOf = (src: string) => src
  }: {
    maxUses?: number;
    exceptions?: StoryMediaException[];
    /** Resolves a runtime path to its source file, so a hero and its archive
        derivative count as one photograph. Defaults to the path itself. */
    sourceOf?: (src: string) => string;
  } = {}
): StoryMediaIssue[] {
  const issues: StoryMediaIssue[] = [];
  const excused = new Set<string>();
  for (const exception of exceptions) {
    if (!exception.reason || exception.reason.trim().length < 12) {
      issues.push({ kind: 'bad-exception', src: exception.src, detail: 'an exception needs a written reason' });
    } else {
      excused.add(sourceOf(exception.src));
    }
  }

  for (let index = 1; index < slots.length; index++) {
    const previous = slots[index - 1]!;
    const current = slots[index]!;
    const source = sourceOf(current.src);
    if (sourceOf(previous.src) === source && !excused.has(source)) {
      issues.push({
        kind: 'adjacent',
        src: current.src,
        detail: `${previous.scene}/${previous.slot} and ${current.scene}/${current.slot}`
      });
    }
  }

  const bySource = new Map<string, StorySlot[]>();
  for (const slot of slots) {
    const source = sourceOf(slot.src);
    bySource.set(source, [...(bySource.get(source) ?? []), slot]);
  }

  for (const [src, uses] of bySource) {
    const events = new Set(uses.map((use) => use.event));
    if (events.size > 1) {
      issues.push({ kind: 'cross-event', src, detail: [...events].join(' + ') });
    }
    if (uses.length > maxUses && !excused.has(src)) {
      issues.push({ kind: 'overused', src, detail: `${uses.length} uses: ${uses.map((use) => `${use.scene}/${use.slot}`).join(', ')}` });
    }
  }
  return issues;
}
