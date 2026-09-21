import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MESSAGES = ['กำลังเตรียมเรื่องราวของเรา...', 'กำลังรวบรวมความทรงจำ...', 'อีกนิดเดียว...'];

/**
 * The only loading state in the A&I experience: the mark, one rotating line of
 * copy, no technical percentages. Used as the Suspense fallback for /us and
 * while the first batch of memory images is warming.
 */
export function AILoader({ label }: { label?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (label) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [label]);

  return (
    <div
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-navy-800"
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(70%_100%_at_50%_100%,rgba(126,200,255,0.22),transparent_70%)]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Keep the router fallback independent from private story data so the
            corporate entry bundle never imports the A&I archive graph. */}
        <span className="ai-wordmark text-3xl text-ivory" aria-label="A&I">
          A<span className="mx-1.5 text-champagne">&amp;</span>I
        </span>
      </motion.div>

      <div className="relative mt-10 h-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={label ?? index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
            className="font-thai text-sm leading-relaxed text-sky-100/70"
          >
            {label ?? MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
