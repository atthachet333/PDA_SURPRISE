import { motion } from 'framer-motion';
import { anniversary } from '@/data/anniversary';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSecret } from '@/hooks/useSecret';
import { SecretReveal } from './SecretReveal';

const STAR = anniversary.secrets.star;

/**
 * One star in the sky that is not quite like the others.
 *
 * DOM, not WebGL. The celestial background is a Three.js scene, but putting the
 * star in it would make the secret unavailable in LOW quality mode and on any
 * device where the canvas is scaled back — and it would need hit-testing
 * against a shader. A single absolutely-positioned element costs nothing, works
 * identically at every quality tier, and can simply be a button.
 *
 * It is `fixed`, so it belongs to the sky rather than to any scene, and it sits
 * off to one side where it never covers the reading column.
 *
 * NOT SPOILED: no tooltip, no label, no cursor hint beyond the faintest lift on
 * hover. The accessible name is deliberately plain — enough for a screen reader
 * to know something is there, not enough to announce it as a prize.
 */
export function SecretStar() {
  const reduced = useReducedMotion();
  const device = useDeviceProfile();
  const secret = useSecret(STAR.id, { duration: STAR.duration });

  // Phones place it higher and further out: the desktop coordinates land on the
  // entry headline at 430px.
  const left = device.isMobile ? STAR.xMobile : STAR.x;
  const top = device.isMobile ? STAR.yMobile : STAR.y;

  return (
    <div className="pointer-events-none fixed z-[58]" style={{ left, top }}>
      <div className="relative">
        <button
          type="button"
          onClick={() => secret.discover()}
          aria-label="ดาวดวงหนึ่ง"
          className="group pointer-events-auto relative -m-4 flex h-11 w-11 items-center justify-center p-4 focus-visible:outline-none"
        >
          {/* The star itself: a touch warmer and a touch larger than its neighbours. */}
          <motion.span
            aria-hidden="true"
            className="block h-[3px] w-[3px] rounded-full bg-champagne"
            style={{ boxShadow: '0 0 8px rgba(233,213,168,0.9)' }}
            animate={
              reduced
                ? undefined
                : secret.revealing
                  ? { scale: [1, 7, 4.5], opacity: [1, 1, 0.85] }
                  : { opacity: [0.55, 1, 0.55] }
            }
            transition={
              secret.revealing
                ? { duration: 1.6, ease: [0.16, 1, 0.3, 1] }
                : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }
            }
          />

          {/* Hover: the faintest halo. No label, no pointer change, no "click me". */}
          <span
            aria-hidden="true"
            className="absolute inset-2 rounded-full bg-[radial-gradient(circle,rgba(233,213,168,0.28),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
          />

          {/* Discovery bloom */}
          {secret.revealing ? (
            <motion.span
              aria-hidden="true"
              className="absolute inset-[-1.25rem] rounded-full bg-[radial-gradient(circle,rgba(233,213,168,0.3),transparent_68%)]"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0], scale: reduced ? 1 : [0.4, 1.6, 2.2] }}
              transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : null}
        </button>

        <SecretReveal
          show={secret.revealing}
          text={STAR.message}
          className="absolute right-0 top-full mt-3 text-right sm:bottom-auto sm:right-full sm:top-1/2 sm:mr-4 sm:mt-0 sm:-translate-y-1/2"
        />
      </div>
    </div>
  );
}
