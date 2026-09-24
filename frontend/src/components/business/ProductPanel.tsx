import { SystemMock, BrowserFrame, PhoneFrame } from './SystemMock';
import { isPhoneMock } from '@/lib/systemMocks';
import { type VisualSlot } from '@/data/visuals';
import { cn } from '@/lib/cn';
import { useLocale } from '@/app/LocaleContext';
import { slotCaption, visualText } from '@/i18n/visuals';

/**
 * PRODUCT PANEL — the single place a visual slot becomes pixels.
 *
 * Resolves a `VisualSlot` to either the reviewed screenshot (if one exists) or
 * the system mock, and puts both inside the SAME frame so swapping one in later
 * changes nothing about the layout.
 *
 * Every product visual on the site goes through here, which is what makes the
 * screenshot hand-off a data edit in `data/visuals.ts` rather than a component
 * rewrite.
 */
export function ProductPanel({
  slot,
  className,
  frame = 'auto',
  flush = false,
  /** Set when the panel is large enough that a viewer might take it for a capture. */
  showMockNotice = false,
  interactive = true
}: {
  slot: VisualSlot;
  className?: string;
  frame?: 'auto' | 'browser' | 'phone' | 'none';
  flush?: boolean;
  showMockNotice?: boolean;
  /**
   * False for decorative panels (section backgrounds). Renders the mock's
   * controls as spans so an `aria-hidden` layer contributes no focusable
   * elements to the tab order.
   */
  interactive?: boolean;
}) {
  const { locale, t } = useLocale();
  const resolved = frame === 'auto' ? (isPhoneMock(slot.mock) ? 'phone' : 'browser') : frame;

  // --- reviewed screenshot -------------------------------------------------
  if (slot.screenshot) {
    const image = (
      <img
        src={slot.screenshot}
        alt={locale === 'th' ? (slot.alt ?? slot.titleTh ?? slot.label) : slotCaption(slot, locale)}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover object-top"
      />
    );

    if (resolved === 'none') return <div className={cn('h-full', className)}>{image}</div>;
    if (resolved === 'phone') return <PhoneFrame className={className}>{image}</PhoneFrame>;
    return (
      <BrowserFrame label={slot.label} className={className} flush={flush}>
        {image}
      </BrowserFrame>
    );
  }

  // --- mock ----------------------------------------------------------------
  return (
    <div className={cn('relative h-full', className)}>
      <SystemMock
        kind={slot.mock}
        label={slot.label}
        frame={frame}
        flush={flush}
        interactive={interactive}
        className="h-full"
      />
      {showMockNotice ? (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-pill bg-ink/70 px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm">
          {t(visualText.mockNotice)}
        </span>
      ) : null}
    </div>
  );
}
