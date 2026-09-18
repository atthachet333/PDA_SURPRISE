/**
 * ============================================================================
 * A&I — private experience content
 * ============================================================================
 * Everything personal lives in this one file. No scene component contains
 * personal data; replace the values below and the whole experience updates.
 *
 * CANONICAL TRUTH
 *   `relationshipStartDate` is the single source for every counter. Nothing in
 *   the codebase hardcodes a day count — the day counter, the statistics plate,
 *   the intro copy and the convergence glyph all derive from it.
 *
 * PHOTOS
 *   Drop image files into `frontend/public/images/memories/` and set each
 *   `image` to `/images/memories/<filename>`. Any entry without an image (or
 *   whose file fails to load) renders a generated A&I placeholder instead of a
 *   broken image, so the experience is always presentable. The ingestion
 *   workflow for the owner's photo library is in `docs/IMAGE_INGESTION.md`.
 *
 * WHAT IS REAL AND WHAT IS NOT
 *   Names, the start date, the pets, the provinces, the visited places and the
 *   final message are REAL owner data. Anything still carrying placeholder
 *   content is marked `── PLACEHOLDER ──` in a comment directly above it, so
 *   the redesign pass can see at a glance what still needs the owner.
 *
 * VALIDATION
 *   In development, `validateAnniversaryConfig()` runs on entry to /us and logs
 *   a grouped report of missing images, duplicate ids and bad coordinates.
 *   Visit /dev/anniversary-preview to see the same report as a page.
 * ============================================================================
 */

import { daysBetween } from '@/lib/format';

export type MemoryScene = 'universe' | 'gallery' | 'tunnel' | 'converge';

/** Categories used by the image ingestion pass; see docs/IMAGE_INGESTION.md. */
export type AssetCategory =
  | 'hero'
  | 'timeline'
  | 'travel'
  | 'funny'
  | 'daily'
  | 'family'
  | 'pets'
  | 'finale';

export interface Memory {
  id: string;
  title: string;
  /** Free text, shown as-is. e.g. 'MEMORY 01' or '12 October 2025'. */
  date: string;
  caption: string;
  /** Path under /public, e.g. '/images/memories/first-trip.jpg' */
  image?: string;
  location?: string;
  /** Free tags, used by the ingestion pass to match photos to slots. */
  tags?: string[];
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

/**
 * A real place from the owner's list, held WITHOUT coordinates on purpose.
 * Coordinates are only added once the owner supplies or approves them, so no
 * pin is ever placed on a guess.
 */
export interface JourneyPlace {
  id: string;
  /** Exactly as the owner wrote it. */
  label: string;
  /** Province, when known from the name itself. */
  province?: string;
  lat?: number;
  lng?: number;
  /** True until the owner supplies or approves coordinates. */
  coordinatesPending: boolean;
}

export interface Pet {
  id: string;
  name: string;
  kind: 'cat';
  image?: string;
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

/**
 * An image slot waiting to be filled by the ingestion pass. Deliberately has no
 * caption: writing a caption before seeing the photo would be inventing a
 * memory. The owner fills `caption` when the image is chosen.
 */
export interface ImageSlot {
  id: string;
  category: AssetCategory;
  /** What this slot is for, in the owner's terms. Not shown to the visitor. */
  intent: string;
  image?: string;
  title?: string;
  caption?: string;
  date?: string;
  location?: string;
  tags?: string[];
  featured?: boolean;
  scene?: MemoryScene;
}

// --------------------------------------------------------------- canonical --

/**
 * ── THE ONE VALUE THAT MATTERS ──
 * 12 October 2025. Every counter in the experience derives from this.
 */
export const RELATIONSHIP_START_DATE = '2025-10-12';

/** Days together, recomputed on every page load. */
export function daysTogether(from: string = RELATIONSHIP_START_DATE): number {
  return daysBetween(new Date(from));
}

const DAYS = daysTogether();

export const anniversary = {
  // ---------------------------------------------------------------- couple --
  couple: {
    initials: 'A&I',
    nameA: 'Atthachet',
    nameB: 'Isariya',
    /** Short forms, for places where the full names do not fit. */
    shortA: 'A',
    shortB: 'I'
  },

  /**
   * ── CANONICAL ──
   * Drives every live counter in the experience. Format: YYYY-MM-DD.
   * Do not duplicate this value anywhere else.
   */
  relationshipStartDate: RELATIONSHIP_START_DATE,

  // ------------------------------------------------------------------ pets --
  /** Optional section. Not wired into any scene yet — the redesign pass owns it. */
  pets: [
    { id: 'pet-tuayfu', name: 'ถ้วยฟู', kind: 'cat' },
    { id: 'pet-kanomtuay', name: 'หนมถ้วย', kind: 'cat' }
  ] as Pet[],

  // ----------------------------------------------------------------- intro --
  intro: {
    mark: 'A&I',
    title: ['A private space', "for everything we've become."],
    subtitle: [`${DAYS} days.`, 'Countless memories.', 'One story.'],
    cta: 'BEGIN'
  },

  /** Shown inside the disguised client-portal reveal. */
  project: {
    codename: 'PROJECT_365',
    status: 'ACTIVE',
    duration: `${DAYS} Days`,
    users: 2,
    access: 'PRIVATE',
    openLabel: 'OPEN PROJECT'
  },

  dayCounter: {
    /** Derived, never hardcoded: the count lands on today's real figure. */
    target: DAYS,
    headline: `${DAYS} DAYS`,
    subline: ['and somehow,', 'it still feels like the beginning.']
  },

  // -------------------------------------------------------------- memories --
  /**
   * Built from the owner's real list of places visited together. Titles are the
   * place names as the owner wrote them; captions state only what the place is.
   * No emotional caption is written for a photo nobody has seen yet — the
   * ingestion pass adds those once the images are chosen.
   */
  memories: [
    { id: 'm01', title: 'บ้านวิน', date: 'MEMORY 01', caption: 'ที่แรก ๆ ที่ไปด้วยกัน', tags: ['daily'], tone: 'cream', featured: true },
    { id: 'm02', title: 'งานกาชาด', date: 'MEMORY 02', caption: 'งานวัด งานกาชาด และคนเยอะ ๆ', tags: ['funny'], tone: 'champagne' },
    { id: 'm03', title: 'ร้านเหล้า', date: 'MEMORY 03', caption: 'คืนที่คุยกันยาวกว่าที่คิด', tags: ['daily'], tone: 'navy' },
    { id: 'm04', title: 'คอนโดพี่โด', date: 'MEMORY 04', caption: 'ที่ที่ไปกันบ่อย', tags: ['daily'], tone: 'navy' },
    { id: 'm05', title: 'เขื่อน', date: 'MEMORY 05', caption: 'วิวน้ำกว้าง ๆ', tags: ['travel'], tone: 'sky' },
    { id: 'm06', title: 'วันแคมป์', date: 'MEMORY 06', caption: 'กางเต็นท์ นอนดูดาว', tags: ['travel'], tone: 'navy', featured: true },
    { id: 'm07', title: 'น้ำตกสาริกา', date: 'MEMORY 07', caption: 'น้ำตกที่นครนายก', location: 'นครนายก', tags: ['travel'], tone: 'sky', featured: true },
    { id: 'm08', title: 'อุทยานพระพิฆเนศ', date: 'MEMORY 08', caption: 'ไปไหว้ขอพรด้วยกัน', tags: ['travel'], tone: 'champagne' },
    { id: 'm09', title: 'ชะอำ', date: 'MEMORY 09', caption: 'ทะเลเพชรบุรี', location: 'เพชรบุรี', tags: ['travel'], tone: 'sky' },
    { id: 'm10', title: 'พัทยา', date: 'MEMORY 10', caption: 'ทริปชลบุรี', location: 'ชลบุรี', tags: ['travel'], tone: 'sky', featured: true },
    { id: 'm11', title: 'บางแสน', date: 'MEMORY 11', caption: 'ทะเลใกล้ ๆ ที่ไปได้ไม่ยาก', location: 'ชลบุรี', tags: ['travel'], tone: 'sky' },
    { id: 'm12', title: 'อ่างศิลา', date: 'MEMORY 12', caption: 'อีกที่หนึ่งของชลบุรี', location: 'ชลบุรี', tags: ['travel'], tone: 'cream' },
    { id: 'm13', title: 'บ้านกงเปรี้ยว', date: 'MEMORY 13', caption: 'ที่ที่กลับไปหาครอบครัว', tags: ['family'], tone: 'cream', featured: true },
    { id: 'm14', title: 'วัดดอนขนาท', date: 'MEMORY 14', caption: 'ไปทำบุญด้วยกัน', tags: ['family'], tone: 'champagne' },
    { id: 'm15', title: 'บ้านเปรี้ยว', date: 'MEMORY 15', caption: 'บ้านที่คุ้นเคย', tags: ['family'], tone: 'cream' },
    { id: 'm16', title: 'วัดไร่แตงทอง', date: 'MEMORY 16', caption: 'วัดที่นครปฐม', location: 'นครปฐม', tags: ['family'], tone: 'champagne' },
    { id: 'm17', title: 'วัดหุบกระทิง', date: 'MEMORY 17', caption: 'วัดที่ราชบุรี', location: 'ราชบุรี', tags: ['family'], tone: 'cream' },
    { id: 'm18', title: 'ทางรถไฟ', date: 'MEMORY 18', caption: 'เดินเล่นริมทางรถไฟ', tags: ['daily'], tone: 'navy', featured: true }
  ] as Memory[],

  // ----------------------------------------------------------------- places --
  /**
   * ── PLACEHOLDER ──
   * These five pins are the ORIGINAL SAMPLE DATA and are NOT the owner's real
   * places. They stay only because Scene05Map is a 3D globe that cannot render
   * a pin without coordinates, and the owner has asked that no coordinate be
   * fabricated.
   *
   * The real roster lives in `journey` below, with `coordinatesPending: true`.
   * Replace this array as soon as the owner supplies or approves coordinates,
   * then delete this comment.
   */
  locations: [
    { id: 'p1', label: 'First Meet', title: 'Where it started', location: 'Bangkok', lat: 13.7563, lng: 100.5018, date: 'Day 001', caption: 'Sample pin — awaiting real coordinates.', status: 'visited' },
    { id: 'p2', label: 'First Trip', title: 'Our first trip together', location: 'Chiang Mai', lat: 18.7883, lng: 98.9853, date: 'Sample', caption: 'Sample pin — awaiting real coordinates.', status: 'visited' },
    { id: 'p3', label: 'Special Day', title: 'The day I remember most', location: 'Phuket', lat: 7.8804, lng: 98.3923, date: 'Sample', caption: 'Sample pin — awaiting real coordinates.', status: 'visited' },
    { id: 'p4', label: 'Favourite Place', title: 'The place we keep returning to', location: 'Pattaya', lat: 12.9236, lng: 100.8825, date: 'Sample', caption: 'Sample pin — awaiting real coordinates.', status: 'visited' },
    { id: 'p5', label: 'More To Go', title: 'Somewhere we have not been yet', location: 'Tokyo', lat: 35.6762, lng: 139.6503, date: 'Year 02', caption: 'Not yet. But soon.', status: 'future' }
  ] as Place[],

  // --------------------------------------------------------------- journey --
  /**
   * ── REAL DATA, COORDINATES PENDING ──
   * The owner's actual journey together. Every place is real; no latitude or
   * longitude has been guessed. `coordinatesPending` stays true until the owner
   * supplies or approves each one.
   */
  journey: {
    /** Provinces travelled together — a verified count. */
    provinces: [
      'กรุงเทพมหานคร',
      'นนทบุรี',
      'นครนายก',
      'เพชรบุรี',
      'ชลบุรี',
      'นครปฐม',
      'ราชบุรี',
      'นครสวรรค์',
      'อุตรดิตถ์',
      'สุโขทัย'
    ],

    /** The places that matter most, in the owner's own words. */
    importantPlaces: [
      { id: 'j-peak', label: 'ร้าน Peak', coordinatesPending: true },
      { id: 'j-status', label: 'ร้าน Status', coordinatesPending: true },
      { id: 'j-banpong', label: 'บ้านโป่ง', province: 'ราชบุรี', coordinatesPending: true },
      { id: 'j-suanphueng', label: 'สวนผึ้ง', province: 'ราชบุรี', coordinatesPending: true },
      { id: 'j-pattaya', label: 'พัทยา', province: 'ชลบุรี', coordinatesPending: true },
      { id: 'j-wedding', label: 'งานแต่ง', coordinatesPending: true }
    ] as JourneyPlace[],

    /** Everywhere they have been together, as supplied. */
    visitedPlaces: [
      { id: 'v-banwin', label: 'บ้านวิน', coordinatesPending: true },
      { id: 'v-kachad', label: 'งานกาชาด', coordinatesPending: true },
      { id: 'v-ranlao', label: 'ร้านเหล้า', coordinatesPending: true },
      { id: 'v-condo', label: 'คอนโดพี่โด', coordinatesPending: true },
      { id: 'v-khuean', label: 'เขื่อน', coordinatesPending: true },
      { id: 'v-camp', label: 'วันแคมป์', coordinatesPending: true },
      { id: 'v-sarika', label: 'น้ำตกสาริกา', province: 'นครนายก', coordinatesPending: true },
      { id: 'v-ganesha', label: 'อุทยานพระพิฆเนศ', coordinatesPending: true },
      { id: 'v-chaam', label: 'ชะอำ', province: 'เพชรบุรี', coordinatesPending: true },
      { id: 'v-pattaya', label: 'พัทยา', province: 'ชลบุรี', coordinatesPending: true },
      { id: 'v-bangsaen', label: 'บางแสน', province: 'ชลบุรี', coordinatesPending: true },
      { id: 'v-angsila', label: 'อ่างศิลา', province: 'ชลบุรี', coordinatesPending: true },
      { id: 'v-kongpriao', label: 'บ้านกงเปรี้ยว', coordinatesPending: true },
      { id: 'v-watdonkhanat', label: 'วัดดอนขนาท', coordinatesPending: true },
      { id: 'v-banpriao', label: 'บ้านเปรี้ยว', coordinatesPending: true },
      { id: 'v-watraitaengthong', label: 'วัดไร่แตงทอง', province: 'นครปฐม', coordinatesPending: true },
      { id: 'v-wathupkrathing', label: 'วัดหุบกระทิง', province: 'ราชบุรี', coordinatesPending: true },
      { id: 'v-railway', label: 'ทางรถไฟ', coordinatesPending: true }
    ] as JourneyPlace[]
  },

  // --------------------------------------------------------------- timeline --
  /**
   * Built from real places and the real start date. Dates other than the start
   * date are unknown, so moments are labelled by sequence rather than by an
   * invented date. Bodies say only what is true.
   */
  timeline: [
    { id: 't1', label: '12 OCT 2025', title: 'จุดเริ่มต้น', body: 'วันที่เราเริ่มนับเป็นวันแรกของเรา', type: 'highlight', treatment: 'fullbleed' },
    { id: 't2', label: 'MOMENT 02', title: 'ร้าน Peak', body: 'ร้านที่กลายเป็นร้านของเรา', type: 'photo', treatment: 'polaroid' },
    { id: 't3', label: 'MOMENT 03', title: 'ร้าน Status', body: 'อีกร้านที่เราไปกันบ่อย', type: 'photo', treatment: 'split' },
    { id: 't4', label: 'MOMENT 04', title: 'น้ำตกสาริกา', body: 'ทริปที่นครนายก', type: 'location', treatment: 'split', location: 'นครนายก' },
    { id: 't5', label: 'MOMENT 05', title: 'สวนผึ้ง', body: 'ขึ้นไปราชบุรีด้วยกัน', type: 'location', treatment: 'stack', location: 'ราชบุรี' },
    { id: 't6', label: 'MOMENT 06', title: 'พัทยา', body: 'ทะเลที่ชลบุรี', type: 'photo', treatment: 'blurFocus', location: 'ชลบุรี' },
    { id: 't7', label: 'MOMENT 07', title: 'บ้านโป่ง', body: 'ที่ที่กลับไปหากันเสมอ', type: 'photo', treatment: 'polaroid', location: 'ราชบุรี' },
    { id: 't8', label: 'MOMENT 08', title: 'งานแต่ง', body: 'วันที่เราตัดสินใจเดินไปด้วยกันจริง ๆ', type: 'highlight', treatment: 'date' },
    { id: 't9', label: 'วันนี้', title: 'ยังอยู่ด้วยกัน', body: 'และยังเลือกกันอยู่ทุกวัน', type: 'highlight', treatment: 'fullbleed' }
  ] as TimelineMoment[],

  // ------------------------------------------------------------- statistics --
  /**
   * Only figures that are actually true. Photo counts, trip counts and joke
   * counts were invented sample data and have been removed rather than guessed.
   */
  statistics: [
    { id: 'days', value: DAYS, label: 'วันที่อยู่ด้วยกัน', caption: 'นับสดจากวันที่ 12 ตุลาคม 2025' },
    { id: 'provinces', value: 10, label: 'จังหวัดที่ไปด้วยกัน', caption: 'จากกรุงเทพถึงสุโขทัย' },
    { id: 'places', value: 18, label: 'ที่ที่ไปด้วยกัน', caption: 'ที่จำได้และจดไว้' },
    { id: 'cats', value: 2, label: 'แมวของเรา', caption: 'ถ้วยฟู และ หนมถ้วย' },
    { id: 'custom', value: '∞', label: 'ที่ยังไม่ได้ไป', caption: 'ตัวเลขที่เราไม่ห่วงเลย' }
  ] as StatItem[],

  // -------------------------------------------------------- emotional pause --
  /** From the owner's own words: it was not always easy, and we stayed anyway. */
  quietLines: [
    'มันไม่ได้สมบูรณ์แบบ',
    'มีวันที่ทะเลาะกัน',
    'มีวันที่งอน มีวันที่น้อยใจ',
    'แต่ไม่มีวันไหนที่ปล่อยมือ',
    'เราผ่านมันมาด้วยกันทุกครั้ง',
    'และจะยังเลือกกันอยู่'
  ],

  // ------------------------------------------------------------ convergence --
  convergence: {
    glyph: String(DAYS),
    caption: 'ทั้งหมดนี้ พร้อมกัน'
  },

  // ------------------------------------------------------------------ final --
  /**
   * The owner's message, split into beats so it is never dumped onto one
   * screen. The wording is the owner's own — do not smooth it out.
   *
   * `lines` is what Scene12 renders today. The `segments` below carry the full
   * message for the redesign pass, which will pace it across several screens.
   */
  finalMessages: {
    yearOneLabel: 'YEAR 01',
    archivedLabel: 'ARCHIVED',
    yearTwoLabel: 'INITIALIZING YEAR 02',
    yearTwoProgress: 10,
    lines: ['ที่เหลือยังไม่เกิดขึ้น', 'เราไปสร้างมันด้วยกัน'],
    signature: 'A&I',
    replayLabel: 'ย้อนดูเรื่องของเราอีกครั้ง',
    memoriesLabel: 'กลับไปดูความทรงจำ',

    segments: {
      opening: 'มีเรื่องที่อยากบอก แต่พูดตรง ๆ ไม่เคยพูดได้ดีเท่าที่คิดไว้',

      gratitude: [
        'ขอบคุณที่อยู่ด้วยกันมาถึงวันนี้',
        'ขอบคุณที่แต่งงานด้วยกัน',
        'ขอบคุณที่ให้โอกาสกันเสมอ',
        'ขอบคุณที่ไม่ทิ้งกันในวันที่ไม่ได้ง่าย'
      ],

      reflection: [
        'มีวันที่ทะเลาะกัน มีวันที่งอน มีวันที่น้อยใจ',
        'แต่ไม่เคยมีวันที่ปล่อยมือกัน',
        'เราผ่านอุปสรรคมาด้วยกันหลายอย่าง',
        'ลองมองย้อนกลับไปดูสิ่งที่เราสร้างขึ้นมาด้วยกัน'
      ],

      future: [
        'อยากอยู่ด้วยกันไปจนแก่',
        'ช่วยกันเลี้ยงปอร์เช่จนโต',
        'ช่วยกันทำความฝันให้เป็นจริง',
        'เป็นกำลังใจและเป็นที่พึ่งให้กันไปเรื่อย ๆ',
        'เรากำลังสร้างครอบครัวและอนาคตร่วมกัน'
      ],

      closing: ['รัก Isariya มาก', 'และรักปอร์เช่']
    }
  },

  // ---------------------------------------------------------- image assets --
  /**
   * Slots for the owner's photo library. Each slot says what it is FOR, not
   * what is in it — captions are written when the photo is chosen, never
   * before. See `docs/IMAGE_INGESTION.md` for the Drive → manifest workflow.
   */
  heroImages: [
    { id: 'hero-01', category: 'hero', intent: 'ภาพเปิด — ภาพที่ดีที่สุดของสองคน' },
    { id: 'hero-02', category: 'hero', intent: 'ภาพเปิดสำรอง — แนวตั้งสำหรับมือถือ' },
    { id: 'hero-03', category: 'hero', intent: 'ภาพพื้นหลังกว้าง สำหรับฉากแรก' }
  ] as ImageSlot[],

  finalImages: [
    { id: 'final-01', category: 'finale', intent: 'ภาพปิด — ภาพล่าสุดของสองคน' },
    { id: 'final-02', category: 'finale', intent: 'ภาพจากงานแต่ง' },
    { id: 'final-03', category: 'finale', intent: 'ภาพครอบครัว รวมปอร์เช่' }
  ] as ImageSlot[],

  /** Pet photos, if the owner wants a pets beat in the redesign. */
  petImages: [
    { id: 'pet-01', category: 'pets', intent: 'ถ้วยฟู' },
    { id: 'pet-02', category: 'pets', intent: 'หนมถ้วย' }
  ] as ImageSlot[],

  // ------------------------------------------------------------------ audio --
  audio: {
    /**
     * OWNER INPUT REQUIRED. The chosen track is "A Thousand Years".
     * No audio file is committed to this repository: the recording is
     * copyrighted, so the owner supplies a lawfully obtained private copy at
     * this path. The whole experience runs correctly with no file present —
     * every scene has its own trigger and nothing waits on the music.
     */
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
  [...anniversary.heroImages, ...anniversary.finalImages, ...anniversary.petImages].forEach(
    (slot) => slot.image && paths.add(slot.image)
  );
  return [...paths];
}

/** Every image slot still waiting for a file. */
export function pendingImageSlots(): ImageSlot[] {
  return [...anniversary.heroImages, ...anniversary.finalImages, ...anniversary.petImages].filter(
    (slot) => !slot.image
  );
}

/** Real places whose coordinates the owner has not supplied yet. */
export function placesAwaitingCoordinates(): JourneyPlace[] {
  return [...anniversary.journey.importantPlaces, ...anniversary.journey.visitedPlaces].filter(
    (place) => place.coordinatesPending
  );
}

/** Flattened final message, in reading order — for the redesign pass. */
export function finalMessageBeats(): string[] {
  const { segments } = anniversary.finalMessages;
  return [
    segments.opening,
    ...segments.gratitude,
    ...segments.reflection,
    ...segments.future,
    ...segments.closing
  ];
}
