import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { ClipboardEvent, FormEvent, KeyboardEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AIMark } from '@/components/surprise/AIMark';
import { useAudio } from '@/app/audioContext';
import { anniversary } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  formatMemoryDate,
  isRegistrationDateAnswer,
  parseMemoryDateInput,
  parseMemoryDateParts
} from '@/lib/memoryGate';
import { isMemoryGateUnlocked, unlockMemoryGate } from '@/lib/memoryGateSession';
import { usePageMeta } from '@/hooks/usePageMeta';
import { privateMeta } from '@/lib/seo';

type FieldName = 'day' | 'month' | 'year';
type GateState = 'idle' | 'wrong' | 'success';

const STARS = [
  ['13%', '23%'],
  ['82%', '19%'],
  ['74%', '72%'],
  ['20%', '78%'],
  ['91%', '48%'],
  ['37%', '12%'],
  ['58%', '84%']
] as const;

export default function MemoryGate() {
  usePageMeta(privateMeta);

  const [alreadyUnlocked] = useState(isMemoryGateUnlocked);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [focused, setFocused] = useState<FieldName | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [gateState, setGateState] = useState<GateState>('idle');
  const [successStep, setSuccessStep] = useState(0);
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { play } = useAudio();
  const date = useMemo(
    () => formatMemoryDate(anniversary.relationship.registrationDate),
    []
  );

  const completed = Number(Boolean(day)) + Number(Boolean(month)) + Number(year.length === 4);
  const atmosphere = gateState === 'success' ? 1 : Math.min(0.82, completed * 0.2 + (focused ? 0.1 : 0));
  const showHint =
    anniversary.memoryGate.hint.enabled &&
    attempts >= anniversary.memoryGate.hint.afterAttempts &&
    gateState !== 'success';

  useEffect(() => {
    if (gateState !== 'success') return;

    if (reduced) {
      setSuccessStep(3);
      const navigation = window.setTimeout(() => {
        navigate('/workspace', { replace: true, state: { memoryGateReveal: true } });
      }, 1150);
      return () => window.clearTimeout(navigation);
    }

    const timers = [
      window.setTimeout(() => setSuccessStep(1), 320),
      window.setTimeout(() => setSuccessStep(2), 860),
      window.setTimeout(() => setSuccessStep(3), 1500),
      window.setTimeout(() => {
        navigate('/workspace', { replace: true, state: { memoryGateReveal: true } });
      }, 2850)
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [gateState, navigate, reduced]);

  const values = { day, month, year };
  const setters = { day: setDay, month: setMonth, year: setYear };

  const updateField = (name: FieldName, rawValue: string) => {
    if (gateState === 'success') return;
    const maxLength = name === 'year' ? 4 : 2;
    const next = rawValue.replace(/\D/g, '').slice(0, maxLength);
    setters[name](next);
    if (gateState === 'wrong') setGateState('idle');

    if (next.length === maxLength) {
      if (name === 'day') monthRef.current?.focus();
      if (name === 'month') yearRef.current?.focus();
    }
  };

  const onKeyDown = (name: FieldName, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace' || values[name]) return;
    if (name === 'month') dayRef.current?.focus();
    if (name === 'year') monthRef.current?.focus();
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const parsed = parseMemoryDateInput(event.clipboardData.getData('text'));
    if (!parsed) return;
    event.preventDefault();
    setDay(String(parsed.day).padStart(2, '0'));
    setMonth(String(parsed.month).padStart(2, '0'));
    setYear(String(parsed.enteredYear));
    setGateState('idle');
    yearRef.current?.focus();
  };

  const returnFocus = (parsed: ReturnType<typeof parseMemoryDateParts>) => {
    if (!parsed || parsed.day !== Number(date.day)) dayRef.current?.focus();
    else if (parsed.month !== Number(date.month)) monthRef.current?.focus();
    else yearRef.current?.focus();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (gateState === 'success') return;

    const parsed = parseMemoryDateParts(day, month, year);
    if (!isRegistrationDateAnswer(parsed, anniversary.relationship.registrationDate)) {
      setAttempts((current) => current + 1);
      setGateState('wrong');
      window.setTimeout(() => returnFocus(parsed), reduced ? 0 : 180);
      return;
    }

    setDay(date.day);
    setMonth(date.month);
    setYear(date.gregorianYear);
    setFocused(null);
    setGateState('success');
    unlockMemoryGate();
    play('lightSparkle');
  };

  if (alreadyUnlocked) return <Navigate to="/workspace" replace />;

  return (
    <main className="ai-private relative min-h-[100dvh] overflow-hidden bg-[#06110d] text-ivory">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-navy-900"
        animate={{ opacity: atmosphere }}
        transition={{ duration: reduced ? 0.2 : 1.15, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: gateState === 'success' ? 0 : Math.max(0.08, 0.34 - atmosphere * 0.3) }}
        style={{
          backgroundImage:
            'linear-gradient(rgba(53,201,111,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(53,201,111,0.12) 1px,transparent 1px)',
          backgroundSize: '76px 76px',
          maskImage: 'radial-gradient(60% 54% at 50% 45%,black,transparent)',
          WebkitMaskImage: 'radial-gradient(60% 54% at 50% 45%,black,transparent)'
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(76vw,38rem)] w-[min(76vw,38rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,241,232,0.18),rgba(126,200,255,0.06)_38%,transparent_70%)] blur-2xl"
        animate={{ opacity: 0.1 + atmosphere * 0.9, scale: gateState === 'success' && !reduced ? 1.15 : 1 }}
        transition={{ duration: reduced ? 0.2 : 1.4, ease: [0.16, 1, 0.3, 1] }}
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 240 240"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(88vw,34rem)] w-[min(88vw,34rem)] -translate-x-1/2 -translate-y-1/2 -rotate-12"
      >
        <motion.circle
          cx="120"
          cy="120"
          r="96"
          fill="none"
          stroke="rgba(163,214,255,0.34)"
          strokeWidth="0.7"
          strokeDasharray="603"
          animate={{
            opacity: completed >= 2 || gateState === 'success' ? 1 : 0,
            strokeDashoffset: gateState === 'success' ? 0 : 603 - 603 * Math.max(0.08, atmosphere * 0.72),
            rotate: gateState === 'wrong' && !reduced ? [0, -2, 1.5, 0] : 0
          }}
          transition={{ duration: gateState === 'success' ? 1.15 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'center' }}
        />
      </svg>

      {STARS.map(([left, top], index) => (
        <motion.span
          key={`${left}-${top}`}
          aria-hidden="true"
          className="pointer-events-none absolute h-0.5 w-0.5 rounded-full bg-sky-100 shadow-glow-sm"
          style={{ left, top }}
          animate={{ opacity: completed >= 1 ? 0.2 + atmosphere * (index % 2 ? 0.55 : 0.35) : 0 }}
          transition={{ duration: reduced ? 0.2 : 1, delay: reduced ? 0 : index * 0.05 }}
        />
      ))}

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[42rem] flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          aria-hidden="true"
          className="mb-5 h-10 w-10 sm:mb-7"
          animate={{ opacity: gateState === 'success' ? 0 : 0.3 }}
        >
          <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
            <path d="M6 24A15 15 0 0 1 28 7" stroke="rgba(178,233,200,.55)" strokeWidth=".8" />
            <path d="M34 17A15 15 0 0 1 12 34" stroke="rgba(126,200,255,.35)" strokeWidth=".8" />
          </svg>
        </motion.div>

        <AnimatePresence mode="wait">
          {gateState !== 'success' ? (
            <motion.section
              key="question"
              className="w-full text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -10, filter: reduced ? 'none' : 'blur(6px)' }}
              transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-brand-300/75">
                Private memory
              </p>
              <h1 className="mt-5 font-thai text-[clamp(1.8rem,7vw,3rem)] font-light leading-[1.22] text-ivory">
                <span className="block">ก่อนเข้าไป</span>
                <span className="block">มีวันหนึ่งที่ต้องจำให้ได้</span>
              </h1>
              <p className="mt-3 text-sm font-light text-sky-100/60 sm:text-base">
                วันที่เราไปจดทะเบียนสมรสด้วยกัน
              </p>

              <motion.form
                className="mt-8 sm:mt-10"
                onSubmit={onSubmit}
                animate={
                  gateState === 'wrong' && !reduced
                    ? { x: [0, -3, 3, -1.5, 0], opacity: [1, 0.68, 1] }
                    : { x: 0, opacity: 1 }
                }
                transition={{ duration: 0.36 }}
                noValidate
              >
                <fieldset>
                  <legend className="sr-only">กรอกวันที่ในความทรงจำ</legend>
                  <div className="mx-auto flex w-full max-w-[23rem] items-end justify-center gap-2.5 sm:gap-4">
                    <DateField
                      ref={dayRef}
                      id="memory-day"
                      label="วัน"
                      value={day}
                      placeholder="––"
                      maxLength={2}
                      width="w-[4.5rem] sm:w-[5.25rem]"
                      onChange={(value) => updateField('day', value)}
                      onFocus={() => setFocused('day')}
                      onBlur={() => setFocused(null)}
                      onKeyDown={(event) => onKeyDown('day', event)}
                      onPaste={onPaste}
                      invalid={gateState === 'wrong'}
                    />
                    <span aria-hidden="true" className="pb-[1.05rem] font-display text-2xl text-sky-100/25">
                      ·
                    </span>
                    <DateField
                      ref={monthRef}
                      id="memory-month"
                      label="เดือน"
                      value={month}
                      placeholder="––"
                      maxLength={2}
                      width="w-[4.5rem] sm:w-[5.25rem]"
                      onChange={(value) => updateField('month', value)}
                      onFocus={() => setFocused('month')}
                      onBlur={() => setFocused(null)}
                      onKeyDown={(event) => onKeyDown('month', event)}
                      onPaste={onPaste}
                      invalid={gateState === 'wrong'}
                    />
                    <span aria-hidden="true" className="pb-[1.05rem] font-display text-2xl text-sky-100/25">
                      ·
                    </span>
                    <DateField
                      ref={yearRef}
                      id="memory-year"
                      label="ปี"
                      value={year}
                      placeholder="––––"
                      maxLength={4}
                      width="w-[7rem] sm:w-[8.5rem]"
                      onChange={(value) => updateField('year', value)}
                      onFocus={() => setFocused('year')}
                      onBlur={() => setFocused(null)}
                      onKeyDown={(event) => onKeyDown('year', event)}
                      onPaste={onPaste}
                      invalid={gateState === 'wrong'}
                    />
                  </div>
                </fieldset>

                <div
                  id="memory-gate-status"
                  className="mt-5 min-h-[3.4rem]"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {gateState === 'wrong' ? (
                    <div role="status">
                      <p className="text-sm text-cream/85">ยังไม่ใช่วันนั้น :)</p>
                      <p className="mt-1 text-xs text-sky-100/45">ลองนึกอีกทีนะ</p>
                      {showHint ? (
                        <p className="mt-2 font-mono text-xs tracking-[0.22em] text-sky-100/45">
                          28 · 07 · ____
                        </p>
                      ) : null}
                    </div>
                  ) : showHint ? (
                    <p className="font-mono text-xs tracking-[0.22em] text-sky-100/45" role="status">
                      28 · 07 · ____
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="mt-1 inline-flex h-11 min-w-[8.5rem] items-center justify-center rounded-pill border border-sky-100/20 bg-ivory/[0.07] px-6 text-sm font-medium text-ivory transition duration-base hover:border-sky-100/40 hover:bg-ivory/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-4 focus-visible:ring-offset-navy-900 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  ไปต่อ
                </button>
              </motion.form>
            </motion.section>
          ) : (
            <motion.section
              key="success"
              className="w-full text-center"
              aria-live="polite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0.2 : 0.45 }}
            >
              <motion.div
                className="mx-auto flex items-center justify-center gap-3 font-display text-[clamp(2.25rem,9vw,4.75rem)] font-light leading-none tracking-[0.035em] text-ivory sm:gap-5"
                animate={{ textShadow: successStep >= 1 ? '0 0 32px rgba(126,200,255,0.48)' : 'none' }}
              >
                <span>{date.day}</span>
                <motion.span aria-hidden="true" animate={{ opacity: successStep >= 1 ? 0.7 : 0.18 }}>·</motion.span>
                <span>{date.month}</span>
                <motion.span aria-hidden="true" animate={{ opacity: successStep >= 1 ? 0.7 : 0.18 }}>·</motion.span>
                <span>{date.gregorianYear}</span>
              </motion.div>

              <AnimatePresence>
                {successStep >= 2 ? (
                  <motion.div
                    initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-7"
                  >
                    <p className="font-display text-[clamp(1.75rem,6vw,3.25rem)] font-light tracking-[0.08em] text-sky-100">
                      {date.english}
                    </p>
                    <p className="mt-2 text-sm font-light text-cream/65">{date.thai}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {successStep >= 3 ? (
                  <motion.div
                    initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-7"
                  >
                    <p className="text-sm text-ivory/90">ถูกต้อง</p>
                    <p className="mt-2 text-sm font-light text-sky-100/65">ประตูนี้เปิดสำหรับเราสองคน</p>
                    <AIMark size="inline" className="mt-5 opacity-35" animateIn />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  width: string;
  onChange(value: string): void;
  onFocus(): void;
  onBlur(): void;
  onKeyDown(event: KeyboardEvent<HTMLInputElement>): void;
  onPaste(event: ClipboardEvent<HTMLInputElement>): void;
  invalid: boolean;
}

const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField(
  {
    id,
    label,
    value,
    placeholder,
    maxLength,
    width,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPaste,
    invalid
  },
  ref
) {
  return (
    <label htmlFor={id} className={width}>
      <span className="mb-2 block text-[0.625rem] font-light tracking-[0.16em] text-sky-100/45">
        {label}
      </span>
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="done"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        className="h-[4.25rem] w-full border-b border-sky-100/20 bg-transparent px-0 text-center font-display text-[clamp(2rem,8vw,3rem)] font-light leading-none tabular-nums text-ivory caret-sky-300 outline-none transition duration-base placeholder:text-ivory/15 focus:border-sky-300/70 focus:bg-sky-100/[0.025] focus:shadow-[0_14px_30px_-22px_rgba(126,200,255,0.9)] sm:h-[4.75rem]"
        aria-label={label}
        aria-invalid={invalid}
        aria-describedby="memory-gate-status"
      />
    </label>
  );
});
