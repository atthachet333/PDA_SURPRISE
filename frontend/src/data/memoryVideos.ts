import { STORY_RELEASE_YEAR_ID, type RelationshipYearId } from '@/data/relationshipYears';

/**
 * Memory clips that ship as production MP4s.
 *
 * Every entry here is a local, transcoded derivative: H.264, faststart, all
 * source metadata dropped (-map_metadata -1), no Drive URL and no .mov ever
 * reaching a browser. Source filenames, hashes and the curation reasoning stay
 * in tools/anniversary-media-curation.json.
 *
 * `hasAudio` records whether the production file actually carries an audio
 * track. It is NOT a claim that the audio means anything — whether a clip is
 * worth listening to is an owner judgement, recorded in the manifest.
 */
export type MemoryVideoRole = 'featured' | 'story' | 'archive';

export type MemoryVideoPlacement = 'life' | 'moments' | 'journey';

export interface MemoryVideo {
  id: string;
  video: string;
  poster: string;
  width: number;
  height: number;
  posterWidth: number;
  posterHeight: number;
  /** Seconds, from the source probe. */
  duration: number;
  orientation: 'portrait' | 'landscape';
  role: MemoryVideoRole;
  /** Thai label used for the accessible name and the quiet caption. */
  label: string;
  /** True when the production file carries an audio track at all. */
  hasAudio: boolean;
  placement?: MemoryVideoPlacement;
  yearId: RelationshipYearId | 'unassigned';
  yearSource: 'owner-override' | 'capture-date' | 'release-default';
}

type CuratedMemoryVideo = Omit<MemoryVideo, 'yearId' | 'yearSource'> & {
  yearId?: RelationshipYearId | 'unassigned';
  yearSource?: MemoryVideo['yearSource'];
};

const curatedMemoryVideos: CuratedMemoryVideo[] = [
  {
    id: 'film-2026',
    video: '/videos/memories/film-2026.mp4',
    poster: '/images/memories/video/film-2026.jpg',
    width: 1080,
    height: 1920,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 24.48,
    orientation: 'portrait',
    role: 'featured',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'living-quiet',
    video: '/videos/memories/living-quiet.mp4',
    poster: '/images/memories/video/living-quiet.jpg',
    width: 1080,
    height: 1920,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 3.94,
    orientation: 'portrait',
    role: 'story',
    label: 'ช่วงเวลาเงียบ ๆ ของเรา',
    hasAudio: false,
    placement: 'life'
  },
  /* OWNER_CONFIRMED: the night at TURR Kaset, 12 OCT 2025. The confirmed still
     is a frame of this very story, so it doubles as the poster. Silent at the
     source — there is no audio track to negotiate with the song. */
  {
    id: 'turr-night',
    video: '/videos/memories/turr-night.mp4',
    poster: '/images/memories/turr-night-still.webp',
    width: 540,
    height: 960,
    posterWidth: 788,
    posterHeight: 1400,
    duration: 5.37,
    orientation: 'portrait',
    role: 'story',
    label: 'คืนที่ร้าน TURR เกษตร',
    hasAudio: false,
    placement: 'journey'
  },
  {
    id: 'living-playful',
    video: '/videos/memories/living-playful.mp4',
    poster: '/images/memories/video/living-playful.jpg',
    width: 1080,
    height: 1920,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 9.4,
    orientation: 'portrait',
    role: 'archive',
    label: 'วันที่เราทำหน้าใส่กัน',
    hasAudio: true
  },
  {
    id: 'living-shore',
    video: '/videos/memories/living-shore.mp4',
    poster: '/images/memories/video/living-shore.jpg',
    width: 540,
    height: 960,
    posterWidth: 540,
    posterHeight: 960,
    duration: 9.63,
    orientation: 'portrait',
    role: 'archive',
    label: 'วันที่ลมทะเลแรง',
    hasAudio: true
  },
  {
    id: 'memory-clip-04',
    video: '/videos/memories/memory-clip-04.mp4',
    poster: '/images/memories/video/memory-clip-04.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 13.97,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-05',
    video: '/videos/memories/memory-clip-05.mp4',
    poster: '/images/memories/video/memory-clip-05.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 6.87,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-06',
    video: '/videos/memories/memory-clip-06.mp4',
    poster: '/images/memories/video/memory-clip-06.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 4.33,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-07',
    video: '/videos/memories/memory-clip-07.mp4',
    poster: '/images/memories/video/memory-clip-07.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 12.9,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: false
  },
  {
    id: 'memory-clip-08',
    video: '/videos/memories/memory-clip-08.mp4',
    poster: '/images/memories/video/memory-clip-08.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 18.77,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-09',
    video: '/videos/memories/memory-clip-09.mp4',
    poster: '/images/memories/video/memory-clip-09.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 5.2,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-10',
    video: '/videos/memories/memory-clip-10.mp4',
    poster: '/images/memories/video/memory-clip-10.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 8.87,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: false
  },
  {
    id: 'memory-clip-11',
    video: '/videos/memories/memory-clip-11.mp4',
    poster: '/images/memories/video/memory-clip-11.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 7.64,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-12',
    video: '/videos/memories/memory-clip-12.mp4',
    poster: '/images/memories/video/memory-clip-12.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 12.7,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-13',
    video: '/videos/memories/memory-clip-13.mp4',
    poster: '/images/memories/video/memory-clip-13.jpg',
    width: 720,
    height: 1279,
    posterWidth: 900,
    posterHeight: 1598,
    duration: 20,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: false
  },
  {
    id: 'memory-clip-14',
    video: '/videos/memories/memory-clip-14.mp4',
    poster: '/images/memories/video/memory-clip-14.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 22.17,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-15',
    video: '/videos/memories/memory-clip-15.mp4',
    poster: '/images/memories/video/memory-clip-15.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 5.67,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-16',
    video: '/videos/memories/memory-clip-16.mp4',
    poster: '/images/memories/video/memory-clip-16.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 12.6,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  },
  {
    id: 'memory-clip-17',
    video: '/videos/memories/memory-clip-17.mp4',
    poster: '/images/memories/video/memory-clip-17.jpg',
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 16.4,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: true
  }
];

/**
 * EP43 — media pipeline output (`npm run media:ingest`, docs/MEDIA_PIPELINE.md).
 *
 * Written by tools/media-pipeline between the markers; plain JSON objects only.
 * Ingested clips are always role 'archive' with an explicit owner-supplied
 * year. Story and featured placements stay deliberate edits above.
 */
const ingestedMemoryVideos: CuratedMemoryVideo[] = [
  // @media-pipeline:begin videos
  // @media-pipeline:end videos
];

/** Current established clips belong to the released story unless overridden. */
export const memoryVideos: MemoryVideo[] = [...curatedMemoryVideos, ...ingestedMemoryVideos].map((clip) => ({
  ...clip,
  yearId: clip.yearId ?? STORY_RELEASE_YEAR_ID,
  yearSource: clip.yearSource ?? 'release-default'
}));

/** The one clip that earns a dedicated cinematic viewer entry. */
export const featuredMemoryFilm = memoryVideos.find((clip) => clip.role === 'featured');

/** Living Memories, resolved by the story beat they belong to. */
export function livingMemoryFor(placement: MemoryVideoPlacement): MemoryVideo | undefined {
  return memoryVideos.find((clip) => clip.role === 'story' && clip.placement === placement);
}

/** Clips that belong in the memory archive field. */
export const archiveVideos = memoryVideos.filter((clip) => clip.role !== 'story');

export type ArchiveMediaFilter = 'all' | 'photo' | 'video';

/** Photo groups have no meaning for clips, so VIDEO always normalizes to ALL. */
export function compatibleArchiveGroup<T extends string>(media: ArchiveMediaFilter, group: T | 'all'): T | 'all' {
  return media === 'video' ? 'all' : group;
}
