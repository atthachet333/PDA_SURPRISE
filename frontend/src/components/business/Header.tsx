import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { company, cta, navigation } from '@/data/company';
import { cn } from '@/lib/cn';
import { ButtonLink } from '@/components/shared/Button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useEntranceReveal } from '@/hooks/useEntranceReveal';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LocaleLink, LocaleNavLink } from '@/components/shared/LocaleLink';
import { useLocale } from '@/app/LocaleContext';
import { header } from '@/i18n/ui';

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
 *
 * BREAKPOINT — the inline nav starts at xl (1280px), not lg. With the language
 * control beside the theme control, seven Thai or English labels plus the
 * actions do not fit a 1024px bar; below xl the full-screen menu carries nav,
 * language, theme and both CTAs instead of letting the bar overlap.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const reduced = useReducedMotion();
  const reveal = useEntranceReveal();
  const { t } = useLocale();

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
        {t(header.skipToContent)}
      </a>

      <div className="container-page">
        <div
          className={cn(
            'flex items-center justify-between transition-all duration-slow ease-smooth',
            scrolled ? 'h-[4.375rem]' : 'h-20 sm:h-[5.25rem]'
          )}
        >
          <LocaleLink to="/" className="relative z-10 shrink-0" aria-label={t(header.homeLink)}>
            <Logo compact className="sm:hidden" />
            {scrolled ? (
              <span className="hidden items-center gap-2.5 sm:inline-flex"><Logo compact /><span className="text-sm font-semibold tracking-[.02em] text-ink">PDA BLISS</span></span>
            ) : (
              <Logo className="hidden origin-left transition-transform duration-slow ease-smooth sm:inline-flex" />
            )}
          </LocaleLink>

          {/* ------------------------------------------------- desktop nav -- */}
          <nav className="hidden items-center xl:flex" aria-label={t(header.mainNav)}>
            {navigation.map((item) => (
              <LocaleNavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'group relative px-3 py-2 text-sm font-medium transition-colors duration-base xl:px-3.5 2xl:px-4',
                    isActive ? 'text-ink' : 'text-steel-500 hover:text-ink'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="thai-display whitespace-nowrap">{t(item.label)}</span>
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
              </LocaleNavLink>
            ))}
          </nav>

          {/* ------------------------------------------------------ actions -- */}
          <div className="flex items-center gap-2">
            {/* Icons only in the bar — the labels would crowd the nav. Each
                button still carries its name for screen readers. */}
            <LanguageSwitcher className="hidden xl:inline-flex" />
            <ThemeToggle className="hidden xl:inline-flex" />
            {/*
              Client login. With the language control added, the full pill
              only fits from 2xl; between xl and 2xl it collapses to an icon
              that keeps the same accessible name and a tooltip, so the header
              never overlaps in the longer English and Thai labels.
            */}
            <LocaleLink
              to="/login"
              aria-label={t(cta.login.label)}
              title={t(cta.login.label)}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-steel-200 text-steel-600 transition-colors duration-base hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 xl:inline-flex 2xl:hidden"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
                <circle cx="10" cy="7" r="3" />
                <path d="M4 17a6 6 0 0 1 12 0" />
              </svg>
            </LocaleLink>
            <LocaleLink
              to="/login"
              className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border border-steel-200 px-4 py-2 text-xs font-medium text-steel-600 transition-colors duration-base hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 2xl:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {t(cta.login.label)}
            </LocaleLink>
            <ButtonLink to="/contact" size="sm" className="hidden whitespace-nowrap md:inline-flex" data-cursor="cta">
              {t(cta.primary.label)}
            </ButtonLink>

            <button
              type="button"
              className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-base hover:bg-steel-100 xl:hidden"
              aria-label={t(menuOpen ? header.closeMenu : header.openMenu)}
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
          initial={reveal ? { clipPath: 'inset(0 0 100% 0)' } : false}
          animate={reveal ? { clipPath: 'inset(0 0 0% 0)' } : undefined}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 top-0 -z-10 flex h-[100dvh] flex-col bg-white xl:hidden"
        >
            {/* Menu ground */}
            <div className="sect-layer" aria-hidden="true">
              <span
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    'linear-gradient(rgb(var(--line-ink) / var(--line-strength)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line-ink) / var(--line-strength)) 1px, transparent 1px)',
                  backgroundSize: '72px 72px'
                }}
              />
              <span className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.18),transparent_68%)] blur-2xl" />
            </div>

            <nav
              className="container-page relative flex flex-1 flex-col justify-center overflow-y-auto pb-10 pt-24"
              aria-label={t(header.mobileNav)}
            >
              <ul>
                {navigation.map((item, index) => (
                  <li key={item.to} className="overflow-hidden border-b border-steel-200/70">
                    <motion.div
                      /* Menu items use opacity, not a mask: a stalled
                          transform reveal would leave the nav blank. */
                      initial={reveal ? { opacity: 0, y: 12 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.14 + index * 0.055,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                    >
                      <LocaleNavLink
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-baseline gap-4 py-4',
                            isActive ? 'text-brand-600' : 'text-ink'
                          )
                        }
                      >
                        <span className="font-mono text-[0.625rem] tabular-nums text-steel-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="thai-display text-[clamp(1.75rem,8vw,2.75rem)] font-bold">
                          {t(item.label)}
                        </span>
                      </LocaleNavLink>
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
                <div className="flex flex-wrap items-center gap-2">
                  <LanguageSwitcher large />
                  <ThemeToggle showLabels />
                </div>
                <ButtonLink to="/contact" size="lg">
                  {t(cta.primary.label)}
                </ButtonLink>
                <ButtonLink to="/login" size="lg" variant="secondary">
                  {t(cta.login.label)}
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
