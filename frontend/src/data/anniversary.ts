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
  /** Per-photo framing controls. */
  objectPosition?: string;
  cropMode?: 'cover' | 'contain';
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
  objectPosition?: string;
  cropMode?: 'cover' | 'contain';
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
 * An optional discovery. Nothing in the story depends on one being found.
 *
 * `message` is what the visitor sees. An EMPTY message means the copy has not
 * been supplied yet: the interaction still gives its small light response, but
 * no words are shown. Inventing something sentimental to fill the gap would be
 * putting words in the owner's mouth.
 */
export interface Secret {
  /** Session-scoped discovery id. */
  id: string;
  /** Shown on discovery. Empty = light response only, no text. */
  message: string;
  /** How long the reveal stays, in ms. */
  duration: number;
}

/** One scene's music level, and the ramp used to reach it. */
export interface SceneMix {
  /** Multiplier on the configured music volume, 0-1. */
  level: number;
  /** Ramp duration in ms. Never zero — levels are never hard-cut. */
  ms: number;
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
  objectPosition?: string;
  cropMode?: 'cover' | 'contain';
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
    title: ['พื้นที่เล็ก ๆ', 'สำหรับเรื่องราวของเรา'],
    subtitle: ['12.10.2025 — ∞'],
    cta: 'เริ่มเรื่องราวของเรา'
  },

  /** Shown inside the disguised client-portal reveal. */
  project: {
    codename: 'ATTHACHET & ISARIYA',
    status: 'ACTIVE',
    days: DAYS,
    duration: `${DAYS} Days`,
    milestone: 365,
    milestoneLabel: 'DAYS OF US',
    yearOneComplete: DAYS >= 365,
    users: 2,
    access: 'PRIVATE',
    openLabel: 'เข้าสู่เรื่องราวของเรา'
  },

  dayCounter: {
    /** Derived, never hardcoded: the count lands on today's real figure. */
    target: DAYS,
    headline: `${DAYS} วัน`,
    subline: ['ทุกวันระหว่างนั้น', 'กลายเป็นเรื่องหนึ่งของเรา', 'และนี่...', 'คือปีแรกของเรา']
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
   * No public map uses this legacy coordinate collection. It stays empty until
   * every coordinate is owner-supplied or approved; Scene05 renders the real
   * `journey` roster without pretending that a name is a geographic point.
   */
  locations: [] as Place[],

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
    { id: 'cats', value: 2, label: 'แมวของเรา', caption: 'ถ้วยฟู และ หนมถ้วย' }
  ] as StatItem[],

  // -------------------------------------------------------- emotional pause --
  /** From the owner's own words: it was not always easy, and we stayed anyway. */
  quietLines: [
    'แน่นอนว่า มันไม่ได้ง่ายทุกวัน',
    'เรามีทะเลาะกัน',
    'งอนกัน',
    'น้อยใจกัน',
    'บางวันก็เหนื่อยมาก',
    'แต่เรายังไม่ปล่อยมือกัน',
    'และนั่นคือสิ่งที่สำคัญที่สุด'
  ],

  // ------------------------------------------------------------ convergence --
  convergence: {
    glyph: String(DAYS),
    caption: 'ทั้งหมดนี้ คือสิ่งที่เราเป็นในวันนี้'
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
    archivedLabel: 'COMPLETE',
    yearTwoLabel: 'YEAR 02',
    yearTwoProgress: 10,
    lines: ['เรื่องที่เหลือ ยังไม่ได้เกิดขึ้น', 'เรามาช่วยกันเขียนมันต่อนะ'],
    signature: 'A&I',
    replayLabel: 'เริ่มเรื่องราวใหม่',
    memoriesLabel: 'ดูความทรงจำอีกครั้ง',

    segments: {
      opening: 'มีเรื่องที่อยากบอก แต่พูดตรง ๆ ไม่เคยพูดได้ดีเท่าที่คิดไว้',

      gratitude: [
        'ขอบคุณที่อยู่ด้วยกันมาถึงวันนี้',
        'ขอบคุณที่แต่งงานด้วยกัน',
        'ขอบคุณที่ให้โอกาสเด็กคนนี้',
        'ขอบคุณที่ไม่ทิ้งกันในวันที่ไม่ได้ง่าย'
      ],

      reflection: [
        'มีวันที่ทะเลาะกัน มีวันที่งอน มีวันที่น้อยใจ',
        'แต่ไม่เคยมีวันที่ปล่อยมือกัน',
        'เราผ่านอุปสรรคมาด้วยกันหลายอย่าง',
        'ถ้าวันหนึ่งเหนื่อย ให้มองย้อนกลับมา',
        'ลองมองย้อนกลับไปดูสิ่งที่เราสร้างขึ้นมาด้วยกัน'
      ],

      future: [
        'อยากอยู่ด้วยกันไปจนแก่',
        'ช่วยกันเลี้ยงปอร์เช่ไปจนโต',
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

  /** Stable slots for the editorial photo groups used across the experience. */
  featuredMemories: [
    { id: 'featured-01', category: 'hero', intent: 'ภาพเด่นของเรื่อง — ภาพของสองคน', featured: true },
    { id: 'featured-02', category: 'timeline', intent: 'ภาพเด่นจากช่วงเริ่มต้น', featured: true },
    { id: 'featured-03', category: 'travel', intent: 'ภาพเด่นจากการเดินทาง', featured: true },
    { id: 'featured-04', category: 'family', intent: 'ภาพเด่นของครอบครัว', featured: true }
  ] as ImageSlot[],

  dailyMemories: [
    { id: 'daily-01', category: 'daily', intent: 'ชีวิตประจำวัน — ภาพแนวนอน' },
    { id: 'daily-02', category: 'daily', intent: 'ชีวิตประจำวัน — ภาพแนวตั้ง' },
    { id: 'daily-03', category: 'funny', intent: 'โมเมนต์ขำ ๆ ของสองคน' }
  ] as ImageSlot[],

  travelMemories: [
    { id: 'travel-01', category: 'travel', intent: 'ทริปด้วยกัน — ภาพกว้าง' },
    { id: 'travel-02', category: 'travel', intent: 'ทริปด้วยกัน — ภาพสถานที่' },
    { id: 'travel-03', category: 'travel', intent: 'ทริปด้วยกัน — ภาพของสองคน' }
  ] as ImageSlot[],

  familyMemories: [
    { id: 'family-01', category: 'family', intent: 'ภาพครอบครัว' },
    { id: 'family-02', category: 'pets', intent: 'ภาพถ้วยฟู' },
    { id: 'family-03', category: 'pets', intent: 'ภาพหนมถ้วย' }
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

  // ---------------------------------------------------------------- secrets --
  /**
   * OPTIONAL DISCOVERIES.
   *
   * Every one of these is supplementary. No story beat, no date, no name and no
   * part of the letter is reachable only through a secret - they reward
   * curiosity and never require it, and the experience reads as complete to
   * someone who finds none of them.
   *
   * All secret copy lives here rather than inside components, so the owner can
   * change or silence any of it in one place.
   */
  secrets: {
    /** Tap the A&I mark a few times. */
    mark: {
      id: 'mark',
      message: 'เจอแล้ว :)',
      duration: 2800,
      /** Deliberate taps needed. Low enough to find, high enough to not be an accident. */
      taps: 5,
      /** Taps must land within this window of each other, in ms. */
      windowMs: 1200
    },
    /** One star in the persistent sky that rewards a closer look. */
    star: {
      id: 'star',
      message: 'ดาวดวงนี้เก็บไว้ให้แก',
      duration: 4200,
      /**
       * Position in the viewport. Off to one side, never over the reading
       * column. Phones get their own coordinates: at 430px the desktop
       * placement lands on top of the entry headline.
       */
      x: '82%',
      y: '22%',
      xMobile: '86%',
      yMobile: '13%'
    },
    /**
     * The two cats, hidden in the Life scene. Names come from `pets` - this
     * carries no copy of its own, so the names can never drift apart.
     */
    cats: {
      id: 'cats',
      message: '',
      duration: 3400
    },
    /** Hold the big numeral. */
    day: {
      id: 'day',
      message: 'ยังนับต่ออยู่นะ',
      duration: 3600,
      /** Deliberate hold, in ms. */
      holdMs: 1500
    },
    /**
     * The letter's signature.
     *
     * OWNER INPUT. Empty on purpose: this is the most personal line in the whole
     * experience and it is not ours to write. While it is empty the signature
     * still answers with light, and shows no words.
     */
    letter: {
      id: 'letter',
      message: '',
      duration: 4600
    },
    /** The Year 02 indicator, after the finale has settled. */
    finale: {
      id: 'finale',
      message: 'ยังมีอีกเยอะเลย',
      duration: 3200,
      /** Staying this long with the finale also reveals it, in ms. */
      dwellMs: 6000
    },
    /**
     * A future "เดี๋ยวก่อน..." moment.
     *
     * Disabled means ZERO UI - no trigger, no placeholder, no empty frame. It
     * stays that way until there is something real to put in it.
     */
    oneMoreThing: {
      enabled: false,
      id: 'one-more-thing',
      message: '',
      duration: 5000
    }
  },

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
    /**
     * Recorded effect files that actually exist under `sfxDir`, without
     * extension. Empty means the synthesised palette is used for everything and
     * NOTHING is fetched — so a bare sfx directory produces no 404s at all.
     * Add a name here only once the file is really in place.
     */
    sfxFiles: [] as string[],
    /**
     * Baseline mix. Present, never blasting: the master sits under unity so the
     * track has headroom, and effects sit well under the music so they colour a
     * moment instead of interrupting it.
     */
    defaultMasterVolume: 0.75,
    defaultMusicVolume: 0.62,
    defaultSfxVolume: 0.32,
    /**
     * SCENE MIX MAP — multipliers on the configured music volume, keyed by
     * scene id, with the ramp used to REACH each level.
     *
     * This is the only channel through which a scene may touch the music. No
     * entry seeks, restarts or stops anything: the song is one continuous
     * journey and the scenes only decide how present it is.
     *
     * The shape of the arc: the story opens held back, opens up through the
     * Universe, settles for family, drops right down for Quiet, climbs hardest
     * into Convergence, pulls back so the Letter stays readable, then opens
     * warmly — not explosively — for Year 02.
     *
     * `ms` is the ramp INTO that level. Ordinary moves are ~1s; the emotional
     * ones are long enough to be felt as a move rather than heard as a change.
     */
    sceneMix: {
      entry: { level: 0.7, ms: 1800 },
      days: { level: 0.78, ms: 1400 },
      beginning: { level: 0.84, ms: 1600 },
      'little-moments': { level: 0.88, ms: 1400 },
      journey: { level: 0.92, ms: 1600 },
      memories: { level: 0.95, ms: 1800 },
      places: { level: 0.88, ms: 1400 },
      life: { level: 0.78, ms: 1600 },
      stats: { level: 0.83, ms: 1200 },
      /** The world goes quiet. Slowest fade down in the whole story. */
      quiet: { level: 0.42, ms: 3500 },
      /** Progressive rise — the energy has to come back, not snap back. */
      converge: { level: 0.98, ms: 3200 },
      /** Soft but never absent: the visitor controls the reading speed. */
      letter: { level: 0.56, ms: 2600 },
      /** Opens back up, warm rather than loud. */
      final: { level: 0.9, ms: 3000 }
    } as Record<string, SceneMix>,
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
  [
    ...anniversary.heroImages,
    ...anniversary.featuredMemories,
    ...anniversary.dailyMemories,
    ...anniversary.travelMemories,
    ...anniversary.familyMemories,
    ...anniversary.finalImages,
    ...anniversary.petImages
  ].forEach(
    (slot) => slot.image && paths.add(slot.image)
  );
  return [...paths];
}

/** Every image slot still waiting for a file. */
export function pendingImageSlots(): ImageSlot[] {
  return [
    ...anniversary.heroImages,
    ...anniversary.featuredMemories,
    ...anniversary.dailyMemories,
    ...anniversary.travelMemories,
    ...anniversary.familyMemories,
    ...anniversary.finalImages,
    ...anniversary.petImages
  ].filter((slot) => !slot.image);
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
