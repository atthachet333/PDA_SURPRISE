import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useAudio } from '@/app/audioContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-soft hover:bg-brand-700 active:bg-brand-800 disabled:bg-steel-300',
  secondary:
    'bg-white text-ink ring-1 ring-inset ring-steel-200 hover:ring-steel-300 hover:bg-steel-50 shadow-soft',
  ghost: 'bg-transparent text-ink hover:bg-steel-100',
  dark: 'bg-ink text-white hover:bg-ink-soft'
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-14 px-7 text-base'
};

const BASE =
  'relative inline-flex select-none items-center justify-center gap-2 rounded-pill font-medium transition-colors duration-base ease-smooth disabled:cursor-not-allowed disabled:opacity-60';

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
      onPointerEnter={(event) => {
        play('hover');
        onPointerEnter?.(event);
      }}
      onClick={(event) => {
        play('click');
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
  const external = /^https?:|^mailto:|^tel:/.test(to);

  if (external) {
    return (
      <a
        href={to}
        className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
        onPointerEnter={() => play('hover')}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      onPointerEnter={() => play('hover')}
      onClick={() => play('click')}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cn('h-4 w-4', className)} fill="none">
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
