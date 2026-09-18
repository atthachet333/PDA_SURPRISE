/**
 * ============================================================================
 * A&I — private experience content
 * ============================================================================
 * Everything personal lives in this one file. No scene component contains
 * personal data; replace the values below and the whole experience updates.
 *
 * PHOTOS
 *   Drop image files into `frontend/public/images/memories/` and set each
 *   `image` to `/images/memories/<filename>`. Any entry without an image (or
 *   whose file fails to load) renders a generated A&I placeholder instead of a
 *   broken image, so the experience is always presentable.
 *
 * VALIDATION
 *   In development, `validateAnniversaryConfig()` runs on entry to /us and logs
 *   a grouped report of missing images, duplicate ids and bad coordinates.
 *   Visit /dev/anniversary-preview to see the same report as a page.
 * ============================================================================
 */

export type MemoryScene = 'universe' | 'gallery' | 'tunnel' | 'converge';

export interface Memory {
  id: string;
  title: string;
  /** Free text, shown as-is. e.g. 'Day 048' or '12 March 2025'. */
  date: string;
  caption: string;
  /** Path under /public, e.g. '/images/memories/first-trip.jpg' */
  image?: string;
  location?: string;
  /** Featured memories are favoured for the carousel and convergence. */
  featured?: boolean;
  /** Restricts a memory to particular scenes. Omit to use it everywhere. */
  scene?: MemoryScene[];
  /** Accent for the generated placeholder. */
  tone?: 'sky' | 'cream' | 'navy' | 'champagne';
}

export interface Place {
  id: string;
  label: string;
  title: string;
  location: string;
  /** Real coordinates; these position the pin on the globe. */
  lat: number;
  lng: number;
  date: string;
  caption: string;
  image?: string;
  /** 'future' renders an unfilled pin at the end of the path. */
  status?: 'visited' | 'future';
}

export type TimelineType = 'photo' | 'text' | 'location' | 'highlight' | 'video';

/** Each treatment is a distinct cinematic layout; see Scene08Timeline. */
export type TimelineTreatment =
  | 'fullbleed'
  | 'split'
  | 'polaroid'
  | 'date'
  | 'stack'
  | 'textOnly'
  | 'blurFocus';

export interface TimelineMoment {
  id: string;
  label: string;
  title: string;
  body: string;
  type: TimelineType;
  treatment: TimelineTreatment;
  image?: string;
  /** Extra images used by the 'stack' treatment. */
  images?: string[];
  location?: string;
  /** Reserved: no player is implemented yet, the field is here for later. */
  video?: string;
}

export interface StatItem {
  id: string;
  value: number | string;
  suffix?: string;
  label: string;
  caption?: string;
}

export interface AudioCue {
  id: string;
  /** Seconds into the main track. Only used when a track is present. */
  time: number;
}

export const anniversary = {
  // ---------------------------------------------------------------- couple --
  couple: {
    initials: 'A&I',
    nameA: 'A',
    nameB: 'I'
  },

  /**
   * ── REPLACE THIS FIRST ──
   * Drives every live counter in the experience. Format: YYYY-MM-DD.
   * The placeholder is set one year back so the sample content stays
   * self-consistent; /dev/anniversary-preview warns if it drifts from the
   * "days" statistic.
   */
  relationshipStartDate: '2025-09-18',

  // ----------------------------------------------------------------- intro --
  intro: {
    mark: 'A&I',
    title: ['A private space', "for everything we've become."],
    subtitle: ['365 days.', 'Countless memories.', 'One story.'],
    cta: 'BEGIN'
  },

  /** Shown inside the disguised client-portal reveal. */
  project: {
    codename: 'PROJECT_365',
    status: 'ACTIVE',
    duration: '365 Days',
    users: 2,
    access: 'PRIVATE',
    openLabel: 'OPEN PROJECT'
  },

  dayCounter: {
    /** Milestone the count lands on. */
    target: 365,
    headline: '365 DAYS',
    subline: ['and somehow,', 'it still feels like the beginning.']
  },

  // -------------------------------------------------------------- memories --
  memories: [
    { id: 'm01', title: 'The first photo', date: 'Day 001', caption: 'Neither of us knew this would be the first of so many.', tone: 'cream', featured: true },
    { id: 'm02', title: 'That late night talk', date: 'Day 014', caption: 'We said we would sleep early. We did not.', tone: 'navy' },
    { id: 'm03', title: 'The first trip', date: 'Day 048', caption: 'Somewhere new, and somehow it felt familiar.', location: 'Chiang Mai', tone: 'sky', featured: true },
    { id: 'm04', title: 'Rain, and no umbrella', date: 'Day 072', caption: 'We ran for cover and laughed the entire way.', tone: 'sky' },
    { id: 'm05', title: 'Your favourite place', date: 'Day 105', caption: 'You lit up before we even sat down.', tone: 'champagne', featured: true },
    { id: 'm06', title: 'The quiet afternoon', date: 'Day 131', caption: 'Nothing happened. It was still one of my favourites.', tone: 'cream' },
    { id: 'm07', title: 'The birthday', date: 'Day 166', caption: 'I planned for weeks. You noticed in seconds.', tone: 'champagne', featured: true },
    { id: 'm08', title: 'The long drive', date: 'Day 198', caption: 'Bad playlist, perfect company.', tone: 'navy' },
    { id: 'm09', title: 'When it was hard', date: 'Day 224', caption: 'We got through it, and it made the rest steadier.', tone: 'navy' },
    { id: 'm10', title: 'The unplanned day', date: 'Day 261', caption: 'No plan at all, and still the best one that month.', tone: 'sky' },
    { id: 'm11', title: 'That photo you hate', date: 'Day 293', caption: 'I am keeping it. It is exactly you.', tone: 'cream' },
    { id: 'm12', title: 'Somewhere near the sea', date: 'Day 318', caption: 'You said you could stay there forever.', location: 'Hua Hin', tone: 'sky', featured: true },
    { id: 'm13', title: 'An ordinary Tuesday', date: 'Day 340', caption: 'This is the kind of day I would pick again.', tone: 'champagne' },
    { id: 'm14', title: 'Today', date: 'Day 365', caption: 'One year in, and I am still choosing this.', tone: 'cream', featured: true }
  ] as Memory[],

  // ----------------------------------------------------------------- places --
  locations: [
    { id: 'p1', label: 'First Meet', title: 'Where it started', location: 'Bangkok', lat: 13.7563, lng: 100.5018, date: 'Day 001', caption: 'The beginning, though we did not call it that yet.', status: 'visited' },
    { id: 'p2', label: 'First Trip', title: 'Our first trip together', location: 'Chiang Mai', lat: 18.7883, lng: 98.9853, date: 'Day 048', caption: 'Cold mornings and far too much coffee.', status: 'visited' },
    { id: 'p3', label: 'Special Day', title: 'The day I remember most', location: 'Phuket', lat: 7.8804, lng: 98.3923, date: 'Day 166', caption: 'Everything about that day went right.', status: 'visited' },
    { id: 'p4', label: 'Favourite Place', title: 'The place we keep returning to', location: 'Pattaya', lat: 12.9236, lng: 100.8825, date: 'Day 318', caption: 'We never get tired of this one.', status: 'visited' },
    { id: 'p5', label: 'More To Go', title: 'Somewhere we have not been yet', location: 'Tokyo', lat: 35.6762, lng: 139.6503, date: 'Year 02', caption: 'Not yet. But soon.', status: 'future' }
  ] as Place[],

  // --------------------------------------------------------------- timeline --
  timeline: [
    { id: 't1', label: 'Day 001', title: 'The beginning', body: 'A conversation that ran longer than it should have, and neither of us minded.', type: 'highlight', treatment: 'fullbleed' },
    { id: 't2', label: 'Day 014', title: 'The first photo of us', body: 'Slightly blurry, badly lit, and still the one I keep going back to.', type: 'photo', treatment: 'polaroid' },
    { id: 't3', label: 'Day 048', title: 'The first trip', body: 'A new place, a bad map, and a whole day that never needed a plan.', type: 'location', treatment: 'split', location: 'Chiang Mai' },
    { id: 't4', label: 'Day 166', title: 'The day that mattered', body: 'I spent weeks planning it. You made the whole thing easy.', type: 'highlight', treatment: 'date' },
    { id: 't5', label: 'Day 211', title: 'The one we still laugh about', body: 'We should not have found it that funny. We still do.', type: 'photo', treatment: 'stack' },
    { id: 't6', label: 'Day 224', title: 'The difficult stretch', body: 'It was not a good week. We stayed anyway, and that meant something.', type: 'text', treatment: 'textOnly' },
    { id: 't7', label: 'Day 318', title: 'Near the sea', body: 'You said you could stay there forever. I nearly agreed out loud.', type: 'photo', treatment: 'blurFocus', location: 'Hua Hin' },
    { id: 't8', label: 'Day 365', title: 'Today', body: 'One year, and the part I am most sure of is that I would do it again.', type: 'highlight', treatment: 'fullbleed' }
  ] as TimelineMoment[],

  // ------------------------------------------------------------- statistics --
  /** Numeric values animate; strings render as-is. */
  statistics: [
    { id: 'days', value: 365, label: 'Days together', caption: 'Counted live, from the first one.' },
    { id: 'photos', value: 1842, label: 'Photos kept', caption: 'Most of them terrible. All of them kept.' },
    { id: 'trips', value: 12, label: 'Trips taken', caption: 'Some planned. The best ones were not.' },
    { id: 'specialPlaces', value: 5, label: 'Places that are ours', caption: 'Four found. One still waiting.' },
    { id: 'insideJokes', value: 47, label: 'Inside jokes', caption: 'None of which survive explanation.' },
    { id: 'custom', value: '∞', label: 'Still waiting for us', caption: 'The number we are least worried about.' }
  ] as StatItem[],

  // -------------------------------------------------------- emotional pause --
  quietLines: [
    "It wasn't perfect.",
    "There were days we didn't understand each other.",
    'Days that felt longer than they should.',
    'But somehow...',
    'we kept choosing each other.',
    "And I'd choose us again."
  ],

  // ------------------------------------------------------------ convergence --
  convergence: {
    glyph: '365',
    caption: 'All of it. All at once.'
  },

  // ------------------------------------------------------------------ final --
  finalMessages: {
    yearOneLabel: 'YEAR 01',
    archivedLabel: 'ARCHIVED',
    yearTwoLabel: 'INITIALIZING YEAR 02',
    yearTwoProgress: 10,
    lines: ["The rest hasn't happened yet.", "Let's make it together."],
    signature: 'A&I',
    replayLabel: 'Replay our story',
    memoriesLabel: 'Back to memories'
  },

  // ------------------------------------------------------------------ audio --
  audio: {
    /** Place a licensed file here. Missing files fail silently. */
    musicSrc: '/audio/main-track.mp3',
    /** Optional recorded effects; synthesised fallbacks are used when absent. */
    sfxDir: '/audio/sfx',
    defaultMusicVolume: 0.45,
    defaultSfxVolume: 0.6,
    /**
     * Optional beat map. Times only matter when a track is present; every
     * scene also has its own trigger, so nothing depends on the music.
     */
    cues: [
      { id: 'entry', time: 0 },
      { id: 'dayStart', time: 18 },
      { id: 'day365', time: 42 },
      { id: 'memoryUniverse', time: 68 },
      { id: 'journey', time: 104 },
      { id: 'gallery', time: 138 },
      { id: 'tunnel', time: 172 },
      { id: 'timeline', time: 206 },
      { id: 'quietScene', time: 236 },
      { id: 'convergence', time: 262 },
      { id: 'finale', time: 292 }
    ] as AudioCue[]
  }
} as const;

export type AnniversaryConfig = typeof anniversary;

// ---------------------------------------------------------------- helpers --

/** Memories eligible for a given scene. */
export function memoriesForScene(scene: MemoryScene): Memory[] {
  return anniversary.memories.filter((memory) => !memory.scene || memory.scene.includes(scene));
}

export function featuredMemories(): Memory[] {
  const featured = anniversary.memories.filter((memory) => memory.featured);
  return featured.length >= 4 ? featured : [...anniversary.memories];
}

/** Every image path referenced anywhere in the config, deduplicated. */
export function allImagePaths(): string[] {
  const paths = new Set<string>();
  anniversary.memories.forEach((memory) => memory.image && paths.add(memory.image));
  anniversary.locations.forEach((place) => place.image && paths.add(place.image));
  anniversary.timeline.forEach((moment) => {
    if (moment.image) paths.add(moment.image);
    moment.images?.forEach((image) => paths.add(image));
  });
  return [...paths];
}
