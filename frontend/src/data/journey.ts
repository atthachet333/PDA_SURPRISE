/**
 * Canonical geographic truth for the private A&I experience.
 *
 * `CANONICAL_VISITED_PLACES` is the one visible place roster and therefore the
 * only source for the place count. Story highlights are deliberately modelled
 * separately: they describe narrative emphasis and must never be added to the
 * canonical place statistic.
 */

export interface CanonicalVisitedPlace {
  id: string;
  /** Exactly as the owner wrote it. */
  label: string;
  /** Province, when known from the name itself. */
  province?: string;
  /** True until the owner supplies or approves coordinates. */
  coordinatesPending: true;
}

export interface StoryPlaceHighlight {
  id: string;
  label: string;
  kind: 'place' | 'event';
  province?: string;
}

export const CANONICAL_PROVINCES = [
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
] as const;

export const CANONICAL_VISITED_PLACES = [
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
  { id: 'v-railway', label: 'ทางรถไฟ', coordinatesPending: true },
  { id: 'v-turr', label: 'ร้าน TURR เกษตร', coordinatesPending: true }
] as const satisfies readonly CanonicalVisitedPlace[];

/**
 * Narrative highlights only. These are not a second visited-place roster and
 * do not contribute to the canonical place count. `งานแต่ง` is explicitly an
 * event, preventing coordinate tooling from treating it as a geographic place.
 */
export const STORY_PLACE_HIGHLIGHTS = [
  { id: 'j-peak', label: 'ร้าน Peak', kind: 'place' },
  { id: 'j-banpong', label: 'บ้านโป่ง', kind: 'place', province: 'ราชบุรี' },
  { id: 'j-suanphueng', label: 'สวนผึ้ง', kind: 'place', province: 'ราชบุรี' },
  { id: 'j-pattaya', label: 'พัทยา', kind: 'place', province: 'ชลบุรี' },
  { id: 'j-wedding', label: 'งานแต่ง', kind: 'event' }
] as const satisfies readonly StoryPlaceHighlight[];

export const CANONICAL_PLACE_COUNT = CANONICAL_VISITED_PLACES.length;
export const CANONICAL_PROVINCE_COUNT = CANONICAL_PROVINCES.length;
