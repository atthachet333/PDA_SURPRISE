import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cta, navigation } from '@/data/company';
import { cn } from '@/lib/cn';
import { ButtonLink } from '@/components/shared/Button';
import { Logo } from './Logo';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-slow ease-smooth',
        scrolled || menuOpen
          ? 'border-b border-steel-200/80 bg-white/90 backdrop-blur-xl shadow-soft'
          : 'border-b border-transparent bg-white/60 backdrop-blur-sm'
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <div className="container-page">
        <div
          className={cn(
            'flex items-center justify-between transition-all duration-slow ease-smooth',
            scrolled ? 'h-16' : 'h-[4.75rem]'
          )}
        >
          <Link
            to="/"
            className="shrink-0"
            aria-label="PDA BLISS — home"
          >
            <Logo className={cn('transition-transform duration-slow ease-smooth', scrolled && 'scale-[0.92] origin-left')} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-pill px-4 py-2 text-sm font-medium transition-colors duration-base',
                    isActive ? 'text-ink' : 'text-steel-500 hover:text-ink'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-px h-px bg-brand-500"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink to="/login" variant="secondary" size="sm" className="hidden xl:inline-flex">
              {cta.login.label}
            </ButtonLink>
            <ButtonLink to="/contact" size="sm" className="hidden md:inline-flex">
              {cta.primary.label}
            </ButtonLink>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-steel-100 lg:hidden"
              aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={cn(
                    'absolute left-0 h-px w-full bg-current transition-all duration-base ease-smooth',
                    menuOpen ? 'top-1.5 rotate-45' : 'top-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1.5 h-px w-full bg-current transition-opacity duration-fast',
                    menuOpen && 'opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 h-px w-full bg-current transition-all duration-base ease-smooth',
                    menuOpen ? 'top-1.5 -rotate-45' : 'top-3'
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="h-[calc(100vh-4rem)] overflow-y-auto border-t border-steel-200 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="container-page flex flex-col py-4" aria-label="Mobile">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.3 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'block border-b border-steel-100 py-4 text-xl font-medium',
                        isActive ? 'text-brand-600' : 'text-ink'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              <div className="mt-5 flex flex-col gap-3">
                <ButtonLink to="/login" variant="secondary" size="md">
                  {cta.login.label}
                </ButtonLink>
                <ButtonLink to="/contact" size="md">
                  {cta.primary.label}
                </ButtonLink>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
