import { cn } from '@/lib/cn';
import type { IconName } from '@/data/services';

/**
 * One stroke-based icon family, drawn on a 24px grid at 1.5 stroke width so the
 * set stays visually consistent. No icon library, no mixed styles.
 */
const PATHS: Record<IconName, React.ReactNode> = {
  code: (
    <>
      <path d="m9 8-4 4 4 4" />
      <path d="m15 8 4 4-4 4" />
    </>
  ),
  browser: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M6.5 6.75h.01M9 6.75h.01" />
    </>
  ),
  building: (
    <>
      <path d="M4 20V6.5A1.5 1.5 0 0 1 5.5 5h6A1.5 1.5 0 0 1 13 6.5V20" />
      <path d="M13 11h5.5A1.5 1.5 0 0 1 20 12.5V20" />
      <path d="M3 20h18M7 9h2M7 13h2M16.5 15h1" />
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  automation: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6" />
    </>
  ),
  integration: (
    <>
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
      <path d="M9 6.5h4A4.5 4.5 0 0 1 17.5 11v4" />
      <path d="M6.5 9v4A4.5 4.5 0 0 0 11 17.5h4" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-4M12.5 16V7.5M17 16v-6" />
    </>
  ),
  cloud: (
    <>
      <path d="M7.5 18h9a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 6.6 11.1 3.45 3.45 0 0 0 7.5 18Z" />
    </>
  ),
  support: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
      <path d="M20 19v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-1.6 4.4-4.4 1.6 1.6-4.4Z" />
    </>
  )
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('h-6 w-6', className)}
    >
      {PATHS[name]}
    </svg>
  );
}
