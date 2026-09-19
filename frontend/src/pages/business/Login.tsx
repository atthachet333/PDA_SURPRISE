import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/shared/Button';
import { Logo } from '@/components/business/Logo';
import { cn } from '@/lib/cn';
import { useAudio } from '@/app/audioContext';

/**
 * Client portal sign-in.
 *
 * Authentication is not wired up yet (see backend /api/auth), so the primary
 * form reports that accounts are being provisioned rather than pretending to
 * sign anyone in. The secondary "Continue with this device" action opens the
 * local workspace route.
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();
  const { unlock, play } = useAudio();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    window.setTimeout(() => {
      setBusy(false);
      setNotice(
        'Client accounts are provisioned by your project lead. Contact us if you have not received your credentials.'
      );
    }, 850);
  };

  /**
   * The gateway gesture. `unlock()` opens the AudioContext synchronously here,
   * inside the click, because that is the only place iOS Safari accepts it — but
   * it deliberately loads no music. The track is prepared on the next screen and
   * only starts when the visitor opens the project.
   */
  const onContinue = () => {
    unlock();
    play('airWhoosh');
    /*
     * A short dim before the route changes.
     *
     * Swapping straight to /workspace put a white flash between two light
     * screens and dropped the corporate header out from under the cursor in one
     * frame. Dimming first means the corporate surface visibly recedes and the
     * workspace materialises out of it - the same handoff the portal does later,
     * at a fraction of the length.
     *
     * The audio is unlocked ABOVE this, inside the gesture, so the delay never
     * costs the gesture chain.
     */
    setLeaving(true);
    window.setTimeout(() => navigate('/workspace'), 420);
  };

  return (
    <div className="sect sect--hero relative min-h-screen overflow-hidden">
      {/* Same ground as the redesigned corporate hero, so the portal reads as
          part of the same product rather than a bolted-on login. */}
      <div className="sect-layer" aria-hidden="true">
        <span
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,59,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(6,59,42,0.045) 1px, transparent 1px)',
            backgroundSize: '84px 84px',
            maskImage: 'radial-gradient(70% 60% at 50% 12%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(70% 60% at 50% 12%, black, transparent)'
          }}
        />
        <span className="absolute -top-40 left-1/2 h-[32rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.18),transparent_66%)] blur-2xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[30rem] flex-col justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/" className="inline-block">
            <Logo />
          </Link>

          <div className="mt-10 rounded-panel border border-steel-200 bg-white/90 p-7 shadow-lift backdrop-blur-xl sm:p-9">
          <p className="section-code">CLIENT PORTAL</p>
          <h1 className="thai-display mt-5 text-statement font-bold text-ink">
            พื้นที่สำหรับลูกค้า
          </h1>
          <p className="mt-3 text-sm text-steel-500">
            เข้าสู่ระบบเพื่อติดตามสถานะ เอกสาร และ Environment ของโปรเจกต์
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-steel-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                placeholder="you@company.com"
                className="h-11 w-full rounded-card border border-steel-200 bg-white px-3.5 text-sm text-ink transition-colors placeholder:text-steel-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-steel-600">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 w-full rounded-card border border-steel-200 bg-white px-3.5 text-sm text-ink transition-colors placeholder:text-steel-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </label>

            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex cursor-pointer items-center gap-2.5 text-xs text-steel-600">
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-[5px] border transition-colors duration-base',
                    remember ? 'border-brand-500 bg-brand-500 text-white' : 'border-steel-300 bg-white'
                  )}
                >
                  {remember ? (
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                      <path
                        d="M2.5 6.2 5 8.7l4.5-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                Remember me
              </label>

              <Link to="/contact" className="text-xs text-steel-500 transition-colors hover:text-ink">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                'Sign in'
              )}
            </Button>

            {notice ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-card border border-steel-200 bg-steel-50 px-4 py-3 text-xs leading-relaxed text-steel-600"
                role="status"
              >
                {notice}
              </motion.p>
            ) : null}
          </form>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-steel-200" />
            <span className="text-[0.625rem] uppercase tracking-[0.16em] text-steel-400">or</span>
            <span className="h-px flex-1 bg-steel-200" />
          </div>

          <button
            type="button"
            disabled
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-pill border border-steel-200 bg-white text-sm font-medium text-steel-500 opacity-70"
          >
            <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
              />
              <path fill="#FBBC05" d="M3.96 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33Z" />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.65 3.58 9 3.58Z"
              />
            </svg>
            Continue with Google
            <span className="ml-1 rounded-pill bg-steel-100 px-2 py-0.5 text-[0.5625rem] uppercase tracking-wide">
              soon
            </span>
          </button>

          <div className="mt-6 rounded-card border border-steel-200 bg-steel-50/70 p-4">
            <p className="text-[0.6875rem] leading-relaxed text-steel-500">
              This device has a locally cached workspace. You can open it without signing in.
            </p>
            <Button
              variant="secondary"
              size="md"
              className="mt-3 w-full"
              disabled={leaving}
              onClick={() => void onContinue()}
            >
              Continue with this device
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-steel-400">
            ต้องการสิทธิ์เข้าใช้งาน?{' '}
            <Link to="/contact" className="text-ink underline-offset-4 transition-colors hover:text-brand-600 hover:underline">
              ติดต่อผู้ดูแลโปรเจกต์
            </Link>
          </p></div>
        </motion.div>
      </div>

      {/* Corporate surface recedes; the workspace comes up out of the dim. */}
      <AnimatePresence>
        {leaving ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[100] bg-[radial-gradient(circle_at_50%_45%,rgba(9,26,20,0.55),rgba(4,12,9,0.92))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.7, 0, 0.84, 0] }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
