import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Bring `/page#section` to the right section.
 *
 * A client-side route change does not perform the browser's native fragment
 * scroll, and sections mount below the fold, so without this every deep link
 * (`/services#payroll`, `/about#company`) would land at the top of the page.
 *
 * Two passes: the first lands as soon as the target exists; the second
 * corrects for sections above it settling (visual panels lay out after first
 * paint), which would otherwise leave the target off by a few hundred pixels.
 */
export function useHashTarget(): void {
  const { hash } = useLocation();

  useEffect(() => {
    const id = hash.slice(1);
    if (!id) return;
    const timers = [60, 420].map((delay) =>
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      }, delay)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [hash]);
}
