import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  GATEWAY_CUES as CUE_AT,
  GATEWAY_SETTLE_MS as SETTLE_MS,
  GATEWAY_STATUS as STATUS,
  GATEWAY_STEP as STEP,
} from "@/lib/gatewayTiming";

/**
 * PDA WORLD → OUR WORLD → A&I WORLD.
 *
 * The screen between the memory gate and the story. Its job is to make the
 * crossing legible: the public system you arrived through, the shared core in
 * the middle, and the private world you are being routed into.
 *
 * ── ONE IDEA, EXECUTED ────────────────────────────────────────────────────────
 *
 * A single route across three places. Not three dashboard cards — the worlds
 * are spatial and they do not match each other, because the whole point is that
 * they are different KINDS of place:
 *
 *   PDA WORLD    geometry, grid, right angles, cool. A system diagram.
 *   OUR WORLD    a core with a ring around it. Neither one thing nor the other.
 *   A&I WORLD    no straight lines at all. Points of light and soft arcs.
 *
 * The transition between them is the composition, so there is no globe, no
 * particle field and no terminal wall on top of it.
 *
 * ── NOTHING HERE WAITS FOR AN ANIMATION FRAME ─────────────────────────────────
 *
 * This codebase has lost content to stalled animation clocks three times. So:
 * every world, every label and the call to action are rendered at full opacity
 * from the first paint and never animate in. What the sequence changes is only
 * ACCENT — a border brightening, a line drawing itself, a pulse travelling.
 * With no rAF, no IntersectionObserver and no CSS animation clock, the visitor
 * still sees the complete diagram and a working button; they simply see it
 * arrive all at once. `settled` then strips the transitions entirely so later
 * renders are static markup.
 */

interface WorldGatewayProps {
  /** The one action. Runs inside the click, so audio may start from it. */
  onEnter: () => void;
  /** Verified gate date, shown once as evidence rather than as a headline. */
  verifiedLabel: string;
  leaving?: boolean;
}

export function WorldGateway({
  onEnter,
  verifiedLabel,
  leaving = false,
}: WorldGatewayProps) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState<number>(reduced ? STEP.READY : STEP.ORIGIN);
  const [settled, setSettled] = useState(reduced);

  useEffect(() => {
    if (reduced) return;

    const advance = (to: number) => setStep((current) => Math.max(current, to));
    const timers = CUE_AT.map(([to, ms]) =>
      window.setTimeout(() => advance(to), ms),
    );

    /*
     * THE SEQUENCE IS AN OFFER.
     *
     * Any pointer, key or touch completes it immediately — nobody should have
     * to watch a route animation to reach the button, and the button is live
     * from the first frame regardless. The listeners detach once used.
     */
    const skip = () => {
      advance(STEP.READY);
      setSettled(true);
      detach();
    };
    const detach = () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
    window.addEventListener("pointerdown", skip, { passive: true });
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });

    /* Independent of every timer above: static and complete by this point. */
    const guarantee = window.setTimeout(() => {
      advance(STEP.READY);
      setSettled(true);
    }, SETTLE_MS);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(guarantee);
      detach();
    };
  }, [reduced]);

  const at = (mark: number) => reduced || settled || step >= mark;
  /** Accent only — never opacity on anything that carries meaning. */
  const ease = (ms: number, prop = "all") =>
    reduced || settled ? "none" : `${prop} ${ms}ms cubic-bezier(0.16, 1, 0.3, 1)`;

  return (
    <div className="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-6 py-10 sm:px-8 sm:py-16">
      {/*
        The whole screen said out loud, once. The composition below carries the
        meaning visually, but a screen reader needs the sentence — and it needs
        it as one stable heading rather than as the running status, which
        changes four times in four seconds and is progress, not content.
      */}
      <h1 className="sr-only">
        กำลังพาไปจากโลกของงาน ผ่านโลกของเรา เข้าสู่เรื่องราวที่มีแค่เรา
      </h1>

      {/* ── STATUS ──────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col items-center gap-1.5 text-center sm:mb-14 sm:gap-2">
        {/* Deliberately NOT a live region: this is decorative progress, and
            announcing every route step would be exactly the narration §23 asks
            us not to produce. */}
        <p
          aria-hidden="true"
          className="font-mono text-[0.5625rem] uppercase tracking-[0.34em] text-sky-100/70"
        >
          {STATUS[Math.min(step, STEP.READY)]}
        </p>
        <p className="font-mono text-[0.5rem] uppercase tracking-[0.24em] text-sky-100/40">
          {verifiedLabel}
        </p>
      </div>

      {/*
        THE ROUTE.
        One column on a phone, one row from `md` up — same three worlds, same
        order, same single line joining them. Never a horizontal scroll.
      */}
      <div className="flex w-full max-w-5xl flex-col items-center gap-0 md:flex-row md:items-stretch md:justify-between">
        <World
          index="01"
          name="PDA WORLD"
          thai="โลกของงาน"
          kind="pda"
          active
          settledStyle={settled || reduced}
          ease={ease}
        />

        <Route active={at(STEP.LINK_A)} reduced={reduced} settled={settled} />

        <World
          index="02"
          name="OUR WORLD"
          thai="โลกของเรา"
          kind="core"
          active={at(STEP.CORE)}
          settledStyle={settled || reduced}
          ease={ease}
        />

        <Route active={at(STEP.LINK_B)} reduced={reduced} settled={settled} />

        <World
          index="03"
          name="A&I WORLD"
          thai="เรื่องราวที่มีแค่เรา"
          kind="ai"
          active={at(STEP.READY)}
          settledStyle={settled || reduced}
          ease={ease}
        />
      </div>

      {/* ── THE ONE ACTION ──────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-col items-center sm:mt-20">
        <button
          type="button"
          onClick={onEnter}
          disabled={leaving}
          data-cursor="enter"
          /* Live from the first frame. The sequence describes the crossing; it
             does not withhold it. */
          className="ai-button-primary group min-h-12 px-9 disabled:opacity-60"
          style={{
            // Accent only: the button is always visible and always clickable.
            boxShadow: at(STEP.READY)
              ? "0 0 46px -12px rgba(126,200,255,0.55)"
              : "none",
            transition: ease(1400, "box-shadow"),
          }}
        >
          <span className="relative flex items-center gap-3">
            เข้าสู่โลกของเรา
            <span
              aria-hidden="true"
              className="transition-transform duration-base group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </button>
        <span className="mt-4 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-sky-100/35">
          OPEN A&amp;I
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

type WorldKind = "pda" | "core" | "ai";

/**
 * One world.
 *
 * The three do not share a shape language — that difference IS the narrative,
 * so it is drawn rather than described. Text sits at full opacity always; only
 * the frame and the artwork respond to the route reaching this node.
 */
function World({
  index,
  name,
  thai,
  kind,
  active,
  settledStyle,
  ease,
}: {
  index: string;
  name: string;
  thai: string;
  kind: WorldKind;
  active: boolean;
  settledStyle: boolean;
  ease: (ms: number, prop?: string) => string | undefined;
}) {
  /*
   * The worlds are NOT the same size, and that is the composition doing the
   * talking: the origin is the tightest shape on screen and the destination is
   * the most open one, so the route reads as going somewhere rather than as
   * three equal stops. Equal cards would be a dashboard.
   */
  /*
   * The progression is preserved at every width; only the absolute scale drops
   * on a phone. Measured at 390x844 the untrimmed composition ran to 1160px —
   * 1.37 viewports — which put the call to action below the fold on the one
   * screen whose entire job is to offer it.
   */
  const size =
    kind === "pda"
      ? "h-16 w-16 sm:h-28 sm:w-28"
      : kind === "core"
        ? "h-20 w-20 sm:h-32 sm:w-32"
        : "h-24 w-24 sm:h-44 sm:w-44";

  const art =
    kind === "ai"
      ? "h-14 w-14 sm:h-24 sm:w-24"
      : kind === "core"
        ? "h-10 w-10 sm:h-14 sm:w-14"
        : "h-8 w-8 sm:h-12 sm:w-12";

  const accent =
    kind === "pda"
      ? {
          border: "rgba(53,201,111,0.42)",
          dim: "rgba(53,201,111,0.16)",
          text: "text-brand-300",
        }
      : kind === "core"
        ? {
            border: "rgba(235,217,188,0.5)",
            dim: "rgba(235,217,188,0.16)",
            text: "text-champagne",
          }
        : {
            border: "rgba(126,200,255,0.5)",
            dim: "rgba(126,200,255,0.16)",
            text: "text-sky-200",
          };

  return (
    <div className="flex w-full flex-col items-center md:w-auto md:flex-1">
      {/* A fixed band as tall as the largest world, with each shape centred in
          it. The sizes differ on purpose; their CENTRES must not, or the route
          joining them stops looking like one line. */}
      <div className="flex h-24 items-center justify-center sm:h-44">
        <div
          className={cn(
            "relative flex items-center justify-center",
            size,
            // Only A&I is round; PDA is square; the core is between them.
            kind === "pda"
              ? "rounded-lg"
              : kind === "core"
                ? "rounded-[28%]"
                : "rounded-full",
          )}
          style={{
            border: `1px solid ${active ? accent.border : accent.dim}`,
            background: active
              ? `radial-gradient(circle at 50% 50%, ${accent.dim}, transparent 70%)`
              : "transparent",
            transition: settledStyle ? "none" : ease(1200),
          }}
        >
          <WorldArt kind={kind} active={active} className={art} />
        </div>
      </div>

      {/* Never animated: this is what the screen is telling you. */}
      <p
        className={cn(
          "mt-3 font-mono text-[0.5rem] uppercase tracking-[0.3em] sm:mt-5",
          accent.text,
          "opacity-70",
        )}
      >
        {index}
      </p>
      <p className="mt-1.5 font-display text-sm uppercase tracking-[0.22em] text-ivory">
        {name}
      </p>
      <p className="mt-1 font-thai text-xs text-ivory/60">{thai}</p>
    </div>
  );
}

/** The artwork inside each world. Pure SVG, no libraries, no loops. */
function WorldArt({
  kind,
  active,
  className,
}: {
  kind: WorldKind;
  active: boolean;
  className: string;
}) {
  const o = active ? 1 : 0.4;

  if (kind === "pda") {
    // A system: nodes on a grid, joined at right angles.
    return (
      <svg
        viewBox="0 0 64 64"
        className={className}
        aria-hidden="true"
        style={{ opacity: o }}
      >
        <g stroke="rgba(53,201,111,0.75)" strokeWidth="1" fill="none">
          <path d="M14 18h16v14h20M14 46h22V32" />
        </g>
        {[
          [14, 18],
          [30, 18],
          [50, 32],
          [14, 46],
          [36, 46],
        ].map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={(x as number) - 2.5}
            y={(y as number) - 2.5}
            width="5"
            height="5"
            fill="#35C96F"
            opacity="0.9"
          />
        ))}
      </svg>
    );
  }

  if (kind === "core") {
    // A shared instance: one centre, one ring, two marks meeting.
    return (
      <svg
        viewBox="0 0 64 64"
        className={className}
        aria-hidden="true"
        style={{ opacity: o }}
      >
        <circle
          cx="32"
          cy="32"
          r="20"
          fill="none"
          stroke="rgba(235,217,188,0.5)"
          strokeWidth="1"
        />
        <circle cx="32" cy="32" r="5" fill="#EBD9BC" opacity="0.9" />
        <circle cx="12" cy="32" r="2.5" fill="#35C96F" opacity="0.85" />
        <circle cx="52" cy="32" r="2.5" fill="#7EC8FF" opacity="0.85" />
      </svg>
    );
  }

  // A&I: no straight lines. Points of light and an open arc.
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      style={{ opacity: o }}
    >
      <path
        d="M12 40a22 22 0 0 1 40-12"
        fill="none"
        stroke="rgba(126,200,255,0.55)"
        strokeWidth="1"
      />
      <circle cx="32" cy="30" r="3.2" fill="#DCEFFF" />
      {[
        [18, 22, 1.3],
        [46, 44, 1.6],
        [24, 48, 1],
        [50, 20, 1.1],
      ].map(([x, y, r]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r}
          fill="#FFFFFF"
          opacity="0.8"
        />
      ))}
    </svg>
  );
}

/**
 * The line between two worlds.
 *
 * Vertical on a phone, horizontal from `md`. It draws itself when the route
 * reaches it — and when nothing can animate, it is simply already drawn, which
 * is the correct diagram either way.
 */
function Route({
  active,
  reduced,
  settled,
}: {
  active: boolean;
  reduced: boolean;
  settled: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative my-3 h-8 w-px shrink-0 sm:my-4 sm:h-12 md:my-0 md:h-px md:w-auto md:flex-1 md:self-center"
    >
      {/* The unlit track. The shape of the route is legible before it opens —
          and still legible if it never does. */}
      <span className="absolute inset-0 bg-ivory/10" />

      {/* The lit route. `--route-fill` is scaled on the axis that matches the
          orientation; see `.ai-route-fill` in global.css, which flips from
          scaleY to scaleX at the same breakpoint this layout does. */}
      <span
        className="ai-route-fill absolute inset-0 bg-gradient-to-b from-brand-400/60 via-champagne/50 to-sky-300/60 md:bg-gradient-to-r"
        style={{
          ["--route-fill" as string]: active ? 1 : 0,
          transition:
            settled || reduced
              ? undefined
              : "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* The signal: one travelling point, only while there is a clock to move
          it. Purely decorative — the route above already says the link is up. */}
      {active && !reduced && !settled ? (
        <span className="ai-route-pulse" />
      ) : null}
    </div>
  );
}
