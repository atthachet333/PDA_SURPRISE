import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useAudio } from '@/app/audioContext';
import { useLocale } from '@/app/LocaleContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-soft hover:bg-brand-700 hover:shadow-lift active:bg-brand-800 disabled:bg-steel-300',
  secondary:
    'bg-white text-ink ring-1 ring-inset ring-steel-200 hover:ring-brand-300 hover:bg-steel-50 shadow-soft hover:shadow-lift',
  ghost: 'bg-transparent text-ink hover:bg-steel-100',
  dark: 'bg-ink text-white hover:bg-ink-soft'
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-14 px-7 text-base'
};

/* EP43: depth on hover (a pixel of lift, a longer shadow) and the arrow leans
   toward where the button goes. Hierarchy is unchanged: one primary per view. */
const BASE =
  'group/btn relative inline-flex select-none items-center justify-center gap-2 rounded-pill font-medium transition-[color,background-color,box-shadow,transform] duration-base ease-smooth motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = CommonProps & { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', magnetic = false, className, children, onClick, onPointerEnter, ...rest },
  forwardedRef
) {
  const magneticRef = useMagnetic<HTMLButtonElement>(magnetic ? 0.22 : 0);
  const { play } = useAudio();

  return (
    <button
      ref={(node) => {
        (magneticRef as React.MutableRefObject<HTMLButtonElement | null>).current = magnetic ? node : null;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      onPointerEnter={onPointerEnter}
      onClick={(event) => {
        play('softClick');
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  to,
  ...rest
}: AnchorProps) {
  const { play } = useAudio();
  const { path } = useLocale();
  const external = /^https?:|^mailto:|^tel:/.test(to);

  if (external) {
    return (
      <a
        href={to}
        className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={path(to)}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      onClick={() => play('softClick')}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn('h-4 w-4 transition-transform duration-base ease-smooth motion-safe:group-hover/btn:translate-x-0.5', className)}
      fill="none"
    >
      <path
        d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
