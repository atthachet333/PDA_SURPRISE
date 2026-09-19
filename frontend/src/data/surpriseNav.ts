export interface NavSection {
  id: string;
  label: string;
}

/**
 * The five entries in the A&I navigation. Each maps to a group of scenes;
 * see SECTION_TO_NAV in pages/surprise/Experience.tsx.
 */
export const NAV_SECTIONS: NavSection[] = [
  { id: 'beginning', label: 'เรื่องของเรา' },
  { id: 'little-moments', label: 'ความทรงจำ' },
  { id: 'journey', label: 'การเดินทาง' },
  { id: 'places', label: 'สถานที่' },
  { id: 'letter', label: 'ข้อความถึงเธอ' }
];
