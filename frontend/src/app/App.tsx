import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header } from '@/components/business/Header';
import { Footer } from '@/components/business/Footer';
import { CorporateBackground } from '@/components/business/CorporateBackground';
import { CorporateCursor } from '@/components/business/CorporateCursor';
import { FloatingContact } from '@/components/business/FloatingContact';
import { BackToTop } from '@/components/business/BackToTop';
import { CookieConsentProvider } from '@/app/CookieConsent';
import { ThemeProvider } from '@/app/ThemeProvider';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { OrganizationSchema } from '@/components/business/OrganizationSchema';
import { AILoader } from '@/components/surprise/AILoader';
import { MemoryGateGuard } from '@/components/surprise/MemoryGateGuard';
import { useLenis } from '@/hooks/useLenis';
import Home from '@/pages/business/Home';

/**
 * Two shells share one router:
 *  - BusinessLayout wraps the public PDA BLISS site (header + footer + smooth scroll)
 *  - the portal, workspace and A&I routes render bare, because they own the full viewport
 *
 * Everything except the homepage is code-split, which keeps the three.js scenes
 * out of the initial bundle for ordinary visitors.
 */

const Services = lazy(() => import('@/pages/business/Services'));
const Solutions = lazy(() => import('@/pages/business/Solutions'));
const Work = lazy(() => import('@/pages/business/Work'));
const WorkDetail = lazy(() => import('@/pages/business/WorkDetail'));
const About = lazy(() => import('@/pages/business/About'));
const Contact = lazy(() => import('@/pages/business/Contact'));
const Insights = lazy(() => import('@/pages/business/Insights'));
const InsightDetail = lazy(() => import('@/pages/business/InsightDetail'));
const Privacy = lazy(() => import('@/pages/business/Privacy'));
const CookiePolicy = lazy(() => import('@/pages/business/CookiePolicy'));
const Terms = lazy(() => import('@/pages/business/Terms'));
const Login = lazy(() => import('@/pages/business/Login'));
const MemoryGate = lazy(() => import('@/pages/surprise/MemoryGate'));
const NotFound = lazy(() => import('@/pages/business/NotFound'));
const Workspace = lazy(() => import('@/pages/surprise/Workspace'));
const Experience = lazy(() => import('@/pages/surprise/Experience'));
/**
 * Dev-only. `import.meta.env.DEV` is statically replaced with `false` in a
 * production build, so this whole branch — including the dynamic import — is
 * dead code and the chunk is never emitted.
 */
const AnniversaryPreview = import.meta.env.DEV
  ? lazy(() => import('@/pages/surprise/AnniversaryPreview'))
  : null;

/**
 * A new route starts at the top — unless the URL names a fragment. Deep links
 * such as `/services#payroll` (case studies, the footer menu, the System
 * Universe) must keep the position the target page scrolls to, so resetting
 * here would undo it a frame later.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

/**
 * The corporate shell. `ThemeProvider` wraps only this branch: the private
 * routes render bare and A&I owns its own palette, so the Light/Dark/System
 * preference is a corporate-site concept and never reaches them.
 */
function BusinessLayout({ children }: { children: React.ReactNode }) {
  useLenis();
  return (
    <ThemeProvider>
    <CookieConsentProvider>
      <OrganizationSchema />
      <div className="corporate-shell flex min-h-screen flex-col">
        <CorporateBackground />
        <CorporateCursor />
        <Header />
        <main id="main" className="flex-1">
          {/* A thrown render error becomes a styled corporate panel rather than
              a white page with no way back. */}
          <ErrorBoundary variant="corporate">{children}</ErrorBoundary>
        </main>
        <Footer />
        <BackToTop />
        <FloatingContact />
      </div>
    </CookieConsentProvider>
    </ThemeProvider>
  );
}

/**
 * Wraps a private, full-viewport route.
 *
 * The A&I variant is used for every route past the gateway so a failure stays
 * inside that world: night sky, Thai copy, no corporate chrome leaking in.
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary variant="ai">{children}</ErrorBoundary>;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-steel-200 border-t-brand-500" />
    </div>
  );
}

function FullScreenFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-navy-900"
      role="status"
      aria-label="Loading"
    >
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-ivory/20 border-t-ivory/80" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Standalone, full-viewport routes */}
        <Route
          path="/login"
          element={
            <PrivateRoute>
              <Suspense fallback={<FullScreenFallback />}>
                <Login />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path="/memory-gate"
          element={
            <PrivateRoute>
              <Suspense fallback={<FullScreenFallback />}>
                <MemoryGate />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path="/workspace"
          element={
            <PrivateRoute>
              <MemoryGateGuard>
                <Suspense fallback={<FullScreenFallback />}>
                  <Workspace />
                </Suspense>
              </MemoryGateGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/us"
          element={
            <PrivateRoute>
              <MemoryGateGuard>
                {/* If the lazy three.js chunk fails to load, the boundary above
                    catches it and the visitor gets the A&I fallback, not a
                    blank screen or corporate UI. */}
                <Suspense fallback={<AILoader />}>
                  <Experience />
                </Suspense>
              </MemoryGateGuard>
            </PrivateRoute>
          }
        />

        {/* Development-only content console; absent from production builds. */}
        {AnniversaryPreview ? (
          <Route
            path="/dev/anniversary-preview"
            element={
              <Suspense fallback={<AILoader label="Loading console" />}>
                <AnniversaryPreview />
              </Suspense>
            }
          />
        ) : null}

        {/* Public corporate site */}
        <Route
          path="*"
          element={
            <BusinessLayout>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/solutions" element={<Solutions />} />
                  <Route path="/work" element={<Work />} />
                  <Route path="/work/:slug" element={<WorkDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/insights/:slug" element={<InsightDetail />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BusinessLayout>
          }
        />
      </Routes>
    </>
  );
}
