export interface NavSection {
  id: string;
  label: string;
}

/**
 * The five entries in the A&I navigation. Each maps to a group of scenes;
 * see SECTION_TO_NAV in pages/surprise/Experience.tsx.
 */
export const NAV_SECTIONS: NavSection[] = [
  { id: 'story', label: 'Story' },
  { id: 'memories', label: 'Memories' },
  { id: 'journey', label: 'Journey' },
  { id: 'moments', label: 'Moments' },
  { id: 'final', label: 'Final' }
];
