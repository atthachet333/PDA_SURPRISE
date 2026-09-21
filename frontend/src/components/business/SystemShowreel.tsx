import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/shared/Layout";
import { ArrowIcon } from "@/components/shared/Button";
import { CaseStudyVisual } from "./CaseStudyVisual";
import {
  showreelVisuals,
  showreelDestination,
  type VisualSlot,
} from "@/data/visuals";
import { SectionBackdrop } from "./SectionBackdrop";
import { useDeviceProfile } from "@/hooks/useDeviceProfile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import type { CaseStudyVisual as CaseVisualKind } from "@/data/caseStudies";

/**
 * SYSTEM SHOWREEL — product evidence, high on the page.
 *
 * Six interfaces, overlapping in perspective, that spread apart as the section
 * scrolls through the viewport. Hovering or focusing one raises it clear of the
 * stack. It sits directly after the marquee so a visitor sees the actual range
 * of software PDA BLISS builds before reading a single argument.
 *
 * The spread is one `useScroll` progress value fanning `x` and `rotate` per
 * card, so the whole effect is transform-only and runs on the compositor.
 *
 * Touch and reduced-motion visitors get a plain horizontal snap-scroll rail
 * instead — the same six panels at full size, no overlap to untangle.
 */
export function SystemShowreel({ code = '02 / SYSTEMS' }: { code?: string } = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const device = useDeviceProfile();
  const fanned = !reduced && !device.isTouch;

  /*
    The deck opens once the section is properly on screen.

    This deliberately does NOT use `useScroll` progress. Tying the fan to a
    scroll range made it depend on the section being measured at its final
    height, and it sat stuck in the stacked state — six cards piled on top of
    each other, which is worse than no effect at all. An IntersectionObserver
    threshold is deterministic: either enough of the section is visible or it
    is not, and the spring does the rest.
  */
  /*
    Defaults to OPEN. If the observer never reports — a hidden or throttled tab
    suppresses its callbacks — the visitor still gets the readable fanned layout
    rather than six cards collapsed into an unreadable pile. The observer only
    ever adds the opening animation for someone who scrolls in normally.
  */
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setOpen(entry.intersectionRatio > 0.35);
      },
      { threshold: [0, 0.35, 0.6, 1] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="sect sect--field relative overflow-hidden py-section"
    >
      <span aria-hidden="true" className="sect-edge-top" />
      <SectionBackdrop variant="data-field" pointer />

      <Container wide className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-3 text-statement font-bold text-ink">
              ระบบที่เราสร้างจริง
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-steel-600">
              ERP, เงินเดือน, เอกสาร, เว็บไซต์ และระบบ HR ผ่าน LINE
              ทั้งหมดออกแบบจาก Workflow ของธุรกิจที่ใช้งานอยู่จริง
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <span className="rounded-pill border border-steel-300 bg-white px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-500">
              ภาพตัวอย่างระบบ
            </span>
            <Link
              to="/work"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-600"
            >
              ดูผลงาน
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ---------------------------------------------- fanned composition -- */}
        {fanned ? (
          <div
            className="relative mt-12 hidden h-[24rem] lg:block xl:h-[26rem]"
            onPointerLeave={() => setActiveId(null)}
          >
            {showreelVisuals.map((slot, index) => (
              <ShowreelCard
                key={slot.id}
                slot={slot}
                index={index}
                total={showreelVisuals.length}
                open={open}
                active={activeId === slot.id}
                dimmed={activeId !== null && activeId !== slot.id}
                onActivate={() => setActiveId(slot.id)}
                onDeactivate={() => setActiveId(null)}
              />
            ))}
          </div>
        ) : null}

        {/* ------------------------------------------------------- the rail -- */}
        <div
          className={cn(
            "no-scrollbar -mx-gutter mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-2",
            fanned && "lg:hidden",
          )}
        >
          {showreelVisuals.map((slot) => {
            /* The rail is the mobile/touch path, so its cards must be links too. */
            const to = slot.caseStudySlug
              ? `/work/${slot.caseStudySlug}`
              : (showreelDestination[slot.id] ?? "/work");
            return (
              <Link
                key={slot.id}
                to={to}
                className="group w-[78vw] shrink-0 snap-center sm:w-[60vw] md:w-[44vw] lg:w-[32vw]"
              >
                <div
                  className={cn(
                    "overflow-hidden rounded-card shadow-lift ring-1 ring-black/5 transition-shadow duration-base group-hover:shadow-lift-lg",
                    slot.mock === "hrLine"
                      ? "aspect-[10/13] mx-auto max-w-[15rem]"
                      : "aspect-[16/10]",
                  )}
                >
                  <CaseStudyVisual kind={showreelVisualKind(slot)} className="h-full" />
                </div>
                <p className="mt-3 flex flex-wrap items-center gap-x-2">
                  <span className="thai-display text-sm font-semibold text-ink">
                    {slot.titleTh ?? slot.label}
                  </span>
                  <span className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-brand-600">
                    {slot.caseStudySlug ? "ดู Case Study" : "ดูบริการ"} →
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------- fanned card -- */

function ShowreelCard({
  slot,
  index,
  total,
  open,
  active,
  dimmed,
  onActivate,
  onDeactivate,
}: {
  slot: VisualSlot;
  index: number;
  total: number;
  /** false = stacked like a deck, true = fanned open. */
  open: boolean;
  active: boolean;
  dimmed: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  /*
    Centre the fan on the middle card so it opens symmetrically.

    `x` is a percentage of the card's OWN width, which is what makes these
    numbers look odd out of context: at ~19rem per card, 52% is roughly 158px of
    travel per step, enough to separate six cards across the container. An
    earlier 15.4% moved them only ~60px each and they stayed piled on top of one
    another.
  */
  const offset = index - (total - 1) / 2;
  const stackedX = offset * 12;
  const spreadX = offset * 52;
  const stackedRotate = offset * 0.8;
  const spreadRotate = offset * 1.9;

  const isPhone = slot.mock === "hrLine";

  /*
    Every card has a real destination: its case study when the slot maps to a
    case study, otherwise the service that describes the capability. No card
    is a decorative dead end.
  */
  const destination = slot.caseStudySlug
    ? `/work/${slot.caseStudySlug}`
    : (showreelDestination[slot.id] ?? "/work");
  const actionLabel = slot.caseStudySlug ? "ดู Case Study" : "ดูบริการ";

  return (
    /*
      Three nested elements on purpose:
        outer  centres the card with a CSS transform
        middle fans it out (animated `x` — it cannot also own the centring,
               because framer treats `x` and `translateX` as one transform and
               the animation would overwrite the -50%)
        inner  the hover lift
    */
    <div
      className="absolute left-1/2 top-0 h-full -translate-x-1/2"
      style={{ zIndex: active ? 50 : 10 + index }}
    >
      <motion.div
        className="h-full"
        initial={false}
        animate={{
          x: open ? `${spreadX}%` : `${stackedX}%`,
          rotate: open ? spreadRotate : stackedRotate,
        }}
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 18,
          mass: 0.9,
          delay: index * 0.04,
        }}
      >
        <motion.div
          className={cn(
            "relative h-full",
            isPhone ? "w-[10.5rem]" : "w-[19rem] xl:w-[20.5rem]",
          )}
          animate={{
            y: active ? -18 : 0,
            scale: active ? 1.03 : 1,
            opacity: dimmed ? 0.5 : 1,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to={destination}
            onPointerEnter={onActivate}
            onFocus={onActivate}
            onBlur={onDeactivate}
            data-cursor="project"
            className="block h-full focus-visible:outline-none"
            aria-label={`${actionLabel} — ${slot.titleTh ?? slot.label}`}
          >
            <div
              className={cn(
                "h-full overflow-hidden rounded-card ring-1 transition-shadow duration-slow",
                active
                  ? "shadow-lift-lg ring-brand-300"
                  : "shadow-lift ring-black/5",
              )}
            >
              <CaseStudyVisual kind={showreelVisualKind(slot)} className="h-full" />
            </div>

            {/* Caption rides with the card so the raised one names itself. */}
            <motion.span
              className="absolute -bottom-7 left-0 right-0 text-center"
              animate={{ opacity: active ? 1 : 0, y: active ? 0 : -6 }}
              transition={{ duration: 0.3 }}
            >
              <span className="thai-display inline-flex items-center gap-1.5 rounded-pill bg-ink px-3 py-1 text-xs font-semibold text-white">
                {slot.titleTh ?? slot.label}
                <span className="font-mono text-[0.5rem] uppercase tracking-[0.1em] text-brand-300">
                  {actionLabel} →
                </span>
              </span>
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function showreelVisualKind(slot: VisualSlot): CaseVisualKind {
  if (slot.mock === 'payroll') return 'payroll';
  if (slot.mock === 'erp') return 'erp';
  if (slot.mock === 'hrLine') return 'hrLine';
  if (slot.mock === 'website') return 'website';
  return 'documents';
}
