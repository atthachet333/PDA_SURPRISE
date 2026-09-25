import { primaryServices } from '@/data/services';

/**
 * CAPABILITY SHOWCASE — the pure half of the Home component that replaced the
 * kinetic marquee (EP46.6.1). No React, no DOM: the sequence, the timing, the
 * CTA target and the graph geometry live here so tests can hold them.
 *
 * NOT A SECOND SERVICE LIST. The order and the ids are the canonical EP38
 * primary services (data/services.ts), read once. Localized titles come from
 * `usePrimaryServices`; the showcase adds only its short labels and four terms
 * (i18n/home.ts `showcaseItems`, keyed by the same ids).
 */
export const SHOWCASE_IDS: readonly string[] = primaryServices.map((service) => service.id);

/** One capability in focus for this long, measured from the moment it arrives. */
export const SHOWCASE_PERIOD_MS = 5000;

/**
 * The very first hand-over waits a little longer. The hero rig above settles
 * into a new pose on 5-second boundaries from page load (styles/brand.css);
 * starting 1.5s later keeps the two from turning over in lockstep like a
 * slideshow.
 */
export const SHOWCASE_FIRST_DELAY_MS = 6500;

/** Title cross-fade: the old title leaves, the new one arrives just behind it. */
export const SHOWCASE_TRANSITION = { exitS: 0.5, enterS: 0.85, enterDelayS: 0.22 } as const;

export const nextIndex = (index: number, count = SHOWCASE_IDS.length): number => (index + 1) % count;
export const prevIndex = (index: number, count = SHOWCASE_IDS.length): number => (index - 1 + count) % count;

/** "01 / 08" */
export const counterLabel = (index: number, count = SHOWCASE_IDS.length): string =>
  `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;

/** Locale-neutral CTA target: the service's own block on /services (ServiceCatalogue ids). */
export const serviceHref = (id: string): string => `/services#${id}`;

/**
 * Keyboard model for the selector (a WAI-ARIA tablist with automatic
 * activation): arrows wrap, Home/End jump. Anything else is not ours.
 */
export function keyToIndex(key: string, index: number, count = SHOWCASE_IDS.length): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return nextIndex(index, count);
    case 'ArrowLeft':
    case 'ArrowUp':
      return prevIndex(index, count);
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/** A horizontal swipe of at least this many px moves one capability. */
export const SWIPE_PX = 48;

export function swipeToIndex(dx: number, dy: number, index: number, count = SHOWCASE_IDS.length): number | null {
  if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.2) return null;
  return dx < 0 ? nextIndex(index, count) : prevIndex(index, count);
}

/* ------------------------------------------------------------------ graph -- */

/** The one stable topology: a hub and one node per capability on an ellipse. */
export const GRAPH = { width: 560, height: 420, hub: { x: 280, y: 210 }, rx: 214, ry: 150 } as const;

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  /** Hub → node, a gentle curve so the map reads as architecture, not spokes. */
  path: string;
  /** Where the node's label sits, and which way it reads. */
  label: { x: number; y: number; anchor: 'start' | 'middle' | 'end' };
}

export const graphNodes: readonly GraphNode[] = SHOWCASE_IDS.map((id, index) => {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / SHOWCASE_IDS.length;
  const x = GRAPH.hub.x + GRAPH.rx * Math.cos(angle);
  const y = GRAPH.hub.y + GRAPH.ry * Math.sin(angle);
  // Control point: the chord midpoint pushed a little off-axis.
  const mx = (GRAPH.hub.x + x) / 2 + 22 * Math.sin(angle);
  const my = (GRAPH.hub.y + y) / 2 - 22 * Math.cos(angle);
  const cos = Math.cos(angle);
  const anchor = Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end';
  const offset = 18;
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    id,
    x: round(x),
    y: round(y),
    path: `M${GRAPH.hub.x} ${GRAPH.hub.y} Q${round(mx)} ${round(my)} ${round(x)} ${round(y)}`,
    label: {
      x: round(x + offset * Math.sign(Math.round(cos * 10) / 10)),
      y: round(y + (anchor === 'middle' ? (Math.sin(angle) < 0 ? -18 : 28) : 5)),
      anchor
    }
  };
});
