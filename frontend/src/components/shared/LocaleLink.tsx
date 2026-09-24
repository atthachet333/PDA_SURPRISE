import { forwardRef } from 'react';
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';
import { useLocale } from '@/app/LocaleContext';

/**
 * Internal links for the corporate site.
 *
 * Every corporate link is written locale-neutral (`/services#payroll`) and
 * resolved here for the active locale (`/en/services#payroll`), so no
 * component ever builds a prefixed path by hand. Private routes and external
 * targets pass through unchanged.
 */

type Neutral<T> = Omit<T, 'to'> & { to: string };

export const LocaleLink = forwardRef<HTMLAnchorElement, Neutral<LinkProps>>(function LocaleLink(
  { to, ...rest },
  ref
) {
  const { path } = useLocale();
  return <Link ref={ref} to={path(to)} {...rest} />;
});

export const LocaleNavLink = forwardRef<HTMLAnchorElement, Neutral<NavLinkProps>>(function LocaleNavLink(
  { to, ...rest },
  ref
) {
  const { path } = useLocale();
  return <NavLink ref={ref} to={path(to)} {...rest} />;
});
