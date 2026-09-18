import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { company, cta, navigation } from '@/data/company';
import { cn } from '@/lib/cn';
import { ButtonLink } from '@/components/shared/Button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Logo } from './Logo';

/**
 * HEADER — transparent and open at the top, compact and frosted on scroll.
 *
 * The architecture is unchanged from the working version (fixed bar, one nav
 * source, body-scroll lock while the mobile menu is open); the treatment is new.
 *
 *   at top     no border, generous height, the ground shows through
 *   scrolled   shorter, frosted white, hairline border, logo scales down
 *   active     a green rule under the current route, animated between items
 *   mobile     full-screen menu with oversized Thai type, staggered in
 *
 * The mobile menu animation is editorial rather than app-like: items rise and
 * unmask in sequence, no slide-in panel, no bounce.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const reduced = useReducedMotion();

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

  // Escape closes the menu — expected of anything that covers the viewport.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-slow ease-smooth',
        scrolled && !menuOpen
          ? 'border-b border-steel-200/70 bg-white/85 shadow-soft backdrop-blur-xl'
          : 'border-b border-transparent'
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        ข้ามไปที่เนื้อหา
      </a>

      <div className="container-page">
        <div
          className={cn(
            'flex items-center justify-between transition-all duration-slow ease-smooth',
            scrolled ? 'h-16' : 'h-20 sm:h-24'
          )}
        >
          <Link to="/" className="relative z-10 shrink-0" aria-label="PDA BLISS — หน้าแรก">
            <Logo
              className={cn(
                'origin-left transition-transform duration-slow ease-smooth',
                scrolled && 'scale-[0.9]'
              )}
            />
          </Link>

          {/* ------------------------------------------------- desktop nav -- */}
          <nav className="hidden items-center lg:flex" aria-label="เมนูหลัก">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'group relative px-3.5 py-2 text-sm font-medium transition-colors duration-base xl:px-4',
                    isActive ? 'text-ink' : 'text-steel-500 hover:text-ink'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="thai-display">{item.label}</span>
                    {/* Active route marker */}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-pill bg-brand-500"
                        transition={
                          reduced
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 400, damping: 34 }
                        }
                      />
                    ) : (
                      /* Kinetic hover: a rule grows from the centre */
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-0.5 h-px origin-center scale-x-0 bg-steel-300 transition-transform duration-base ease-smooth group-hover:scale-x-100"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ------------------------------------------------------ actions -- */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-pill border border-steel-200 px-4 py-2 text-xs font-medium text-steel-600 transition-colors duration-base hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 xl:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {cta.login.label}
            </Link>
            <ButtonLink to="/contact" size="sm" className="hidden md:inline-flex" data-cursor="cta">
              {cta.primary.label}
            </ButtonLink>

            <button
              type="button"
              className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-base hover:bg-steel-100 lg:hidden"
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

      {/*
        MOBILE MENU — deliberately NO exit animation.

        This overlay is full-screen and `fixed`, so if it outlives its closed
        state it swallows every click on the page. An exit animation cannot be
        relied on to end: the browser pauses animations on a backgrounded tab, so
        an exiting overlay can stay mounted indefinitely. Neither a
        `menuOpen`-derived style nor a `pointerEvents` value in the `exit` target
        fixes that — AnimatePresence renders the exiting clone with its last
        captured props, and a paused animation never applies the exit target.

        So the menu is plainly conditional: it animates in, and it unmounts the
        instant it closes. Correctness does not depend on a frame ever arriving.
      */}
      {menuOpen ? (
        <motion.div
          initial={reduced ? false : { clipPath: 'inset(0 0 100% 0)' }}
          animate={reduced ? undefined : { clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 top-0 -z-10 flex h-[100dvh] flex-col bg-white lg:hidden"
        >
            {/* Menu ground */}
            <div className="sect-layer" aria-hidden="true">
              <span
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(6,59,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,59,42,0.05) 1px, transparent 1px)',
                  backgroundSize: '72px 72px'
                }}
              />
              <span className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.18),transparent_68%)] blur-2xl" />
            </div>

            <nav
              className="container-page relative flex flex-1 flex-col justify-center overflow-y-auto pb-10 pt-24"
              aria-label="เมนูมือถือ"
            >
              <ul>
                {navigation.map((item, index) => (
                  <li key={item.to} className="overflow-hidden border-b border-steel-200/70">
                    <motion.div
                      initial={reduced ? false : { y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.14 + index * 0.055,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                    >
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-baseline gap-4 py-4',
                            isActive ? 'text-brand-600' : 'text-ink'
                          )
                        }
                      >
                        <span className="font-mono text-[0.625rem] tabular-nums text-steel-300">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="thai-display text-[clamp(1.75rem,8vw,2.75rem)] font-bold">
                          {item.label}
                        </span>
                      </NavLink>
                    </motion.div>
                  </li>
                ))}
              </ul>

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="mt-9 flex flex-col gap-3"
              >
                <ButtonLink to="/contact" size="lg">
                  {cta.primary.label}
                </ButtonLink>
                <ButtonLink to="/login" size="lg" variant="secondary">
                  {cta.login.label}
                </ButtonLink>
              </motion.div>

              <motion.div
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mt-10 space-y-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel-400"
              >
                <p>{company.phoneDisplay}</p>
                <p className="normal-case tracking-normal">{company.email}</p>
                <p>LINE {company.lineOA}</p>
              </motion.div>
          </nav>
        </motion.div>
      ) : null}
    </header>
  );
}
