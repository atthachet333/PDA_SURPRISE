import { cn } from '@/lib/cn';

interface SecretRevealProps {
  show: boolean;
  /** Empty or missing text renders nothing — the light response stands alone. */
  text?: string;
  className?: string;
  /** Announce to assistive tech. Off for purely decorative flourishes. */
  polite?: boolean;
}

/**
 * The whisper a discovery answers with.
 *
 * Deliberately NOT a dialog, a toast or a popup. It cannot be focused, cannot be
 * dismissed (it leaves on its own), never takes pointer events and never stops
 * the page scrolling — the story continues underneath and the visitor may
 * simply keep going. It is a small light in the corner of the eye.
 *
 * ── THE RESTING STATE IS VISIBLE ──
 *
 * This was first written with a framer entrance (`initial opacity 0` → animate
 * to 1) and it was wrong. This text lives for a few seconds and then unmounts,
 * so if the entrance never ran — a throttled tab, a stalled compositor, reduced
 * motion — the whisper stayed at opacity 0 for its entire life and vanished
 * without ever being seen. Measured exactly that: in the DOM, correctly placed,
 * unclipped, `opacity: 0`.
 *
 * So the element is simply VISIBLE, and a CSS keyframe adds the rise on top.
 * If the animation never plays the text is just there, which is the failure mode
 * that costs nothing. Animation enhances; it never gates.
 *
 * There is also no `AnimatePresence` here on purpose: an exit animation that
 * cannot finish would keep the node mounted indefinitely. It unmounts the
 * instant `show` goes false.
 */
export function SecretReveal({ show, text, className, polite = true }: SecretRevealProps) {
  const hasText = Boolean(text && text.trim());
  if (!show || !hasText) return null;

  return (
    <span
      role={polite ? 'status' : undefined}
      aria-live={polite ? 'polite' : undefined}
      className={cn('secret-whisper', className)}
    >
      {text}
    </span>
  );
}
