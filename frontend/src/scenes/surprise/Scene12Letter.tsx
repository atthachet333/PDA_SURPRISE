import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { SceneLabel, SceneSection } from '@/components/surprise/SceneSection';
import { anniversary, finalMessageBeats } from '@/data/anniversary';
import { useAudio } from '@/app/audioContext';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSecret } from '@/hooks/useSecret';
import { SecretReveal } from '@/components/surprise/SecretReveal';

export function Scene12Letter() {
  const beats = finalMessageBeats();
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.25 });
  const { play } = useAudio();
  const reduced = useReducedMotion();

  /*
   * THE ONE SECRET IN THIS SCENE.
   *
   * The letter is the emotional centre and it stays calm: no second trigger, no
   * hover effects on the paragraphs, nothing competing with the words.
   *
   * `letter.message` is EMPTY by design - see the secrets config. The signature
   * answers with light either way, and the words appear only once the owner has
   * written them. An invented line here would be the worst possible place to
   * put one.
   */
  const LETTER = anniversary.secrets.letter;
  const letterSecret = useSecret(LETTER.id, { duration: LETTER.duration });

  /*
   * ONE atmosphere transition as the letter begins, and then silence from the
   * effects bus entirely. Reading is not an interaction to be sonified: no
   * typing, no page turns, no cue per paragraph. The scene mix map holds the
   * music at 0.56 so the words stay comfortable, and the music carries the rest.
   */
  useEffect(() => {
    if (!inView) return;
    play('transitionRise');
  }, [inView, play]);

  return (
    <SceneSection ref={ref} id="letter" label="จดหมายถึงเธอ" fullHeight={false} className="overflow-hidden py-32 sm:py-44">
      <span aria-hidden="true" className="ai-warm-wash pointer-events-none absolute inset-0 opacity-90" />
      <article className="relative mx-auto w-full max-w-3xl" data-cursor="read">
        <div className="text-center"><SceneLabel>11 · จดหมายถึงเธอ</SceneLabel><h2 className="thai-display ai-legible mt-6 font-thai text-[clamp(2.3rem,5vw,4.3rem)] font-light text-ivory">มีเรื่องที่อยากบอก</h2></div>
        <div className="mt-20 space-y-16 sm:space-y-20">
          {beats.map((line, index) => {
            const finalBeat = index === beats.length - 1;
            const closingBeat = index >= beats.length - 2;
            return (
              <motion.p
                key={`${index}-${line}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -18% 0px' }}
                transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                className={
                  closingBeat
                    ? `thai-display ai-legible mx-auto max-w-xl text-center font-thai text-[clamp(1.85rem,4vw,3.25rem)] font-light text-ivory ${finalBeat ? 'ai-handwritten text-champagne' : ''}`
                    : index === 0
                      ? 'ai-legible mx-auto max-w-xl text-center font-thai text-[clamp(1.25rem,2.2vw,1.65rem)] leading-[1.9] text-ivory/85'
                      : 'ai-legible mx-auto max-w-2xl font-thai text-[clamp(1.125rem,1.8vw,1.4rem)] leading-[1.95] text-ivory/80'
                }
              >
                {line}
              </motion.p>
            );
          })}
        </div>
        <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} className="relative mt-28 text-center">
          <span className="mx-auto block h-16 w-px bg-gradient-to-b from-transparent via-sky-200/50 to-transparent" />
          <button
            type="button"
            onClick={() => letterSecret.discover()}
            aria-label={anniversary.finalMessages.signature}
            className="group relative mt-8 inline-block rounded-md px-3 py-1 transition-transform duration-300 active:scale-[0.98] focus-visible:outline-none"
            style={{ touchAction: 'manipulation' }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-md bg-[radial-gradient(circle,rgba(233,213,168,0.16),transparent_70%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
            {/* The light response, which happens with or without copy. */}
            <AnimatePresence>
              {letterSecret.revealing ? (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[-2rem] rounded-full bg-[radial-gradient(circle,rgba(233,213,168,0.24),transparent_66%)]"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 0], scale: reduced ? 1 : [0.6, 1.3, 1.7] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : null}
            </AnimatePresence>
            <span className="ai-wordmark relative text-3xl sm:text-4xl">{anniversary.finalMessages.signature}</span>
          </button>
          <div className="mt-6 flex justify-center">
            <SecretReveal
              show={letterSecret.revealing}
              text={LETTER.message}
              className="ai-handwritten whitespace-normal text-center text-base text-champagne/90"
            />
          </div>
        </motion.footer>
      </article>
    </SceneSection>
  );
}
