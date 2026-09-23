import { useTheme } from '@/app/ThemeContext';
import { THEME_MODES, type ThemeMode } from '@/lib/theme';
import { cn } from '@/lib/cn';

/**
 * THEME CONTROL — three visible options, not a guessing game.
 *
 * A single toggling icon is smaller but it never says what the site is set to,
 * only what clicking would do — and it cannot express System at all. All three
 * choices are shown, the active one is filled, and each carries a real label
 * for screen readers. On mobile the labels stay visible because the control
 * sits inside the full-screen menu, where there is room for them.
 *
 * Drawn on the same 24px / 1.5-stroke grid as `components/shared/Icon`.
 */

const MODE_LABEL: Record<ThemeMode, string> = {
  light: 'สว่าง',
  dark: 'มืด',
  system: 'ตามระบบ'
};

function ModeIcon({ mode }: { mode: ThemeMode }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className: 'h-3.5 w-3.5'
  };
  if (mode === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M21 12h-2M5 12H3M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6" />
      </svg>
    );
  }
  if (mode === 'dark') {
    return (
      <svg {...common}>
        <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M9 20h6M12 16.5V20" />
    </svg>
  );
}

export function ThemeToggle({
  className,
  showLabels = false
}: {
  className?: string;
  /** Mobile menu shows the words; the desktop bar shows icons with tooltips. */
  showLabels?: boolean;
}) {
  const { mode, resolved, setMode } = useTheme();

  return (
    <div
      role="group"
      aria-label="ธีมของเว็บไซต์"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-pill border border-steel-200 bg-white/70 p-0.5',
        className
      )}
    >
      {THEME_MODES.map((option) => {
        const active = option === mode;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            aria-pressed={active}
            title={MODE_LABEL[option]}
            className={cn(
              'inline-flex min-h-9 items-center gap-1.5 rounded-pill px-2.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600',
              showLabels && 'min-h-11 px-3.5',
              active ? 'bg-ink text-white' : 'text-steel-600 hover:text-brand-700'
            )}
          >
            <ModeIcon mode={option} />
            {showLabels ? <span>{MODE_LABEL[option]}</span> : <span className="sr-only">{MODE_LABEL[option]}</span>}
          </button>
        );
      })}
      {/*
        Politely announces the resulting colour when System is chosen — the one
        case where the pressed button does not tell you what you are looking at.
      */}
      <span aria-live="polite" className="sr-only">
        {mode === 'system' ? `ตามระบบ — ขณะนี้${resolved === 'dark' ? 'มืด' : 'สว่าง'}` : MODE_LABEL[mode]}
      </span>
    </div>
  );
}
