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

/**
 * Scene 06 — little moments. Everyday frames only (places belong to Journey).
 * Captions are lines that already exist in the story data, never new claims.
 */
export const LITTLE_MOMENTS_MEDIA = {
  lead: { src: `${M}/funny-faces-01.webp`, caption: 'หน้าตาแบบที่ทำใส่กันทุกวัน' },
  reel: [
    { src: `${M}/fair-01.webp`, caption: 'งานวัด งานกาชาด และคนเยอะ ๆ' },
    { src: `${M}/archive/memory-100.webp`, caption: 'วันธรรมดาที่พิเศษ' },
    { src: `${M}/archive/memory-130.webp`, caption: 'ทะเลและแสงแดด' },
    { src: `${M}/archive/memory-133.webp`, caption: 'เราในอีกวันหนึ่ง' }
  ]
} as const;

/** Scene 07 — home: the household before the present-day close. */
export const FAMILY_MEDIA = {
  hero: `${M}/cat-together-01.webp`,
  kanomtuay: `${M}/cat-01.webp`,
  tuayfu: `${M}/cat-02.webp`
} as const;

/**
 * Porsche (ปอร์เช่). The owner's folder holds prenatal scans whose frames carry
 * clinic and patient text; derivatives are pending explicit owner approval, so
 * no image ships yet and the family chapter carries Porsche in words only.
 */
export const PORSCHE_MEDIA: { src: string; alt: string }[] = [];

/** Scene 07 — the present-day payoff: one hero, two recent 2026 frames. */
export const PRESENT_MEDIA = {
  hero: `${M}/together-now-01.webp`,
  /* 13 MAR 2026 — at home. */
  home: `${M}/archive/memory-139.webp`,
  /* 28 JUN 2026 — an ordinary afternoon on the road. */
  ordinary: `${M}/archive/memory-162.webp`
} as const;

/** Canonical event of each timeline beat, keyed by the beat id. */
const TIMELINE_EVENTS: Record<string, StoryEvent> = {
  t1: 'peak',
  t2: 'turr',
  t7: 'chaam',
  t4: 'sarika',
  t5: 'suanphueng',
  t5b: 'roadtrip',
  t6: 'pattaya',
  t8b: 'prewedding',
  t8c: 'wedding',
  t7b: 'decision',
  t8: 'registration'
};

/** Timeline beats that render in the Milestones section rather than Journey. */
export const MILESTONE_IDS = ['t8b', 't8c', 't7b', 't8'] as const;

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
    { scene: 'little-moments', slot: 'lead', src: LITTLE_MOMENTS_MEDIA.lead.src, event: 'daily' },
    ...LITTLE_MOMENTS_MEDIA.reel.map((item, index) => ({ scene: 'little-moments', slot: `reel-${index + 1}`, src: item.src, event: 'daily' as const }))
  ];

  const timelineSlots = (scene: string, keep: (id: string) => boolean) => {
    for (const moment of anniversary.timeline) {
      if (!keep(moment.id)) continue;
      const event = TIMELINE_EVENTS[moment.id] ?? 'daily';
      [moment.image, ...(moment.images ?? [])].forEach((src, index) => {
        if (src) slots.push({ scene, slot: index ? `${moment.id}.${index}` : moment.id, src, event });
      });
    }
  };
  const milestone = (id: string) => (MILESTONE_IDS as readonly string[]).includes(id);

  timelineSlots('journey', (id) => !milestone(id));

  for (const place of anniversary.journey.photoStories) {
    slots.push({ scene: 'places', slot: place.id, src: place.image, event: JOURNEY_EVENTS[place.id] ?? 'daily' });
  }

  timelineSlots('milestones', milestone);

  slots.push(
    { scene: 'family', slot: 'hero', src: FAMILY_MEDIA.hero, event: 'family' },
    { scene: 'family', slot: 'kanomtuay', src: FAMILY_MEDIA.kanomtuay, event: 'family' },
    { scene: 'family', slot: 'tuayfu', src: FAMILY_MEDIA.tuayfu, event: 'family' },
    ...PORSCHE_MEDIA.map((item, index) => ({ scene: 'family', slot: `porsche-${index + 1}`, src: item.src, event: 'family' as const })),
    { scene: 'present', slot: 'hero', src: PRESENT_MEDIA.hero, event: 'present' },
    { scene: 'present', slot: 'home', src: PRESENT_MEDIA.home, event: 'present' },
    { scene: 'present', slot: 'ordinary', src: PRESENT_MEDIA.ordinary, event: 'present' }
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
