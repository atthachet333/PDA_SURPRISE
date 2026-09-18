import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * CORPORATE BACKGROUND — the page's base ground only.
 *
 * Each section now paints its own identity (`.sect--hero`, `.sect--mesh`,
 * `.sect--deep`, …, defined in global.css), so this layer deliberately does very
 * little: it supplies a neutral off-white base behind everything and a trace of
 * grain, and it no longer animates.
 *
 * That is the fix for what the old version did — a fixed, parallaxing pair of
 * green orbs that showed through every section and flattened them all into the
 * same gradient. Section identity has to live with the section.
 */
export function CorporateBackground() {
  const reduced = useReducedMotion();

  return (
    <div className="corporate-background" aria-hidden="true">
      {/* Grain, at a level that reads as paper rather than as noise. */}
      <div className="corporate-noise" />
      {/* One static, very soft pool at the top so the header never floats on flat white. */}
      {!reduced ? <div className="corporate-orb corporate-orb--one" /> : null}
    </div>
  );
}
