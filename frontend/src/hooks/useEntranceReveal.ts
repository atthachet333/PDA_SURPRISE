import { useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Should this element play its entrance animation, or render finished?
 *
 * WHY THIS EXISTS
 *   Masked reveals hide text behind `overflow-hidden` and animate it up from
 *   `y: 104%`. If the animation never runs, the text stays parked outside its
 *   clip box and is simply invisible.
 *
 *   Browsers pause animations on a backgrounded tab, and framer-motion defers
 *   the whole entrance until the tab is shown. So a page opened in a background
 *   tab — an ordinary cmd-click — mounts with its headline hidden. It recovers
 *   when the tab is focused, but "the H1 is blank until you look at it" is not a
 *   risk worth taking on the most important text on the site.
 *
 *   This returns false when the document is hidden AT MOUNT (or the visitor
 *   prefers reduced motion), and callers then render the final state directly.
 *   Anyone who opens the page normally still gets the full reveal.
 *
 * Use it for copy that MUST be readable. Decorative motion does not need it.
 */
export function useEntranceReveal(): boolean {
  const reduced = useReducedMotion();

  // Read once, at mount: a tab shown later should not restart entrances
  // halfway down a page the visitor has already scrolled.
  const [visibleAtMount] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden'
  );

  return !reduced && visibleAtMount;
}
