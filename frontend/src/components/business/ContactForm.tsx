import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { ApiError, api, type ContactPayload } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Button } from '@/components/shared/Button';
import { useAudio } from '@/app/audioContext';

/** Mirrors the catalogue in data/services.ts; the seven primary services lead. */
const PROJECT_TYPES = [
  { value: 'business-system', label: 'ระบบ ERP / บริหารธุรกิจ' },
  { value: 'payroll', label: 'ระบบ Payroll / เงินเดือน' },
  { value: 'website', label: 'เว็บไซต์องค์กรและธุรกิจ' },
  { value: 'web-application', label: 'เว็บแอปพลิเคชัน' },
  { value: 'mobile-application', label: 'แอปพลิเคชันมือถือ' },
  { value: 'hr-line-bot', label: 'ระบบ HR ผ่าน LINE' },
  { value: 'document-management', label: 'ระบบจัดเก็บเอกสารและไฟล์' },
  { value: 'custom-software', label: 'ซอฟต์แวร์ตามความต้องการ' },
  { value: 'automation', label: 'Automation / Workflow' },
  { value: 'integration', label: 'เชื่อมต่อ API / ระบบ' },
  { value: 'data-analytics', label: 'Dashboard / Analytics' },
  { value: 'cloud-infrastructure', label: 'Cloud / Infrastructure' },
  { value: 'consulting', label: 'ที่ปรึกษาด้านไอที' },
  { value: 'other', label: 'อื่น ๆ' }
];

const BUDGETS = [
  { value: 'under-100k', label: 'ต่ำกว่า ฿100,000' },
  { value: '100k-300k', label: '฿100,000 – ฿300,000' },
  { value: '300k-800k', label: '฿300,000 – ฿800,000' },
  { value: '800k-2m', label: '฿800,000 – ฿2,000,000' },
  { value: 'above-2m', label: 'มากกว่า ฿2,000,000' },
  { value: 'not-sure', label: 'ยังไม่แน่ใจ' }
];

const TIMELINES = [
  { value: 'asap', label: 'เร็วที่สุดเท่าที่เป็นไปได้' },
  { value: '1-3-months', label: 'ภายใน 1–3 เดือน' },
  { value: '3-6-months', label: 'ภายใน 3–6 เดือน' },
  { value: '6-plus-months', label: '6 เดือนขึ้นไป' },
  { value: 'planning', label: 'อยู่ระหว่างวางแผน' }
];

const EMPTY: ContactPayload = {
  name: '',
  company: '',
  email: '',
  phone: '',
  projectType: 'business-system',
  budget: 'not-sure',
  timeline: '1-3-months',
  message: '',
  website: ''
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [values, setValues] = useState<ContactPayload>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const { play } = useAudio();

  const update = <K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (values.name.trim().length < 2) errors.name = 'กรุณาระบุชื่อของคุณ';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim())) errors.email = 'กรุณาระบุอีเมลที่ใช้งานได้';
    if (values.message.trim().length < 10) errors.message = 'กรุณาเล่าโจทย์ของโปรเจกต์อย่างน้อย 1–2 ประโยค';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'submitting') return;

    if (!validate()) {
      setStatus('error');
      setMessage('กรุณาตรวจสอบข้อมูลที่ระบุ');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const result = await api.submitContact({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        message: values.message.trim()
      });
      setReference(result.reference);
      setStatus('success');
      setValues(EMPTY);
      play('transitionRise');
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError) {
        setMessage(error.message);
        if (error.fields.length) {
          setFieldErrors(
            Object.fromEntries(error.fields.map((field) => [field.field, field.message]))
          );
        }
      } else {
        setMessage('เกิดข้อผิดพลาด กรุณาลองอีกครั้งหรือติดต่อเราทางอีเมล');
      }
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-panel border border-brand-200 bg-brand-50/60 p-10 text-center"
            role="status"
          >
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 260, damping: 18 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                <motion.path
                  d="m6 12.5 4 4 8-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
              </svg>
            </motion.span>
            <h3 className="mt-6 text-title font-semibold text-ink">เราได้รับข้อมูลแล้ว</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-steel-600">
              ทีมงานจะอ่านและตอบกลับภายใน 1 วันทำการ หมายเลขอ้างอิงของคุณคือ{' '}
              <span className="font-mono text-ink">{reference}</span>.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-8"
              onClick={() => {
                setStatus('idle');
                setReference('');
              }}
            >
              ส่งข้อความใหม่
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-panel border border-steel-200 bg-white p-7 sm:p-9"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="ชื่อ" required error={fieldErrors.name}>
                <input
                  className={inputClass(!!fieldErrors.name)}
                  value={values.name}
                  onChange={(event) => update('name', event.target.value)}
                  autoComplete="name"
                  required
                />
              </Field>

              <Field label="บริษัท" error={fieldErrors.company}>
                <input
                  className={inputClass(!!fieldErrors.company)}
                  value={values.company}
                  onChange={(event) => update('company', event.target.value)}
                  autoComplete="organization"
                />
              </Field>

              <Field label="Email" required error={fieldErrors.email}>
                <input
                  type="email"
                  className={inputClass(!!fieldErrors.email)}
                  value={values.email}
                  onChange={(event) => update('email', event.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>

              <Field label="โทรศัพท์" error={fieldErrors.phone}>
                <input
                  type="tel"
                  className={inputClass(!!fieldErrors.phone)}
                  value={values.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  autoComplete="tel"
                />
              </Field>

              <Field label="ประเภทโปรเจกต์">
                <select
                  className={inputClass(false)}
                  value={values.projectType}
                  onChange={(event) => update('projectType', event.target.value)}
                >
                  {PROJECT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="งบประมาณโดยประมาณ">
                <select
                  className={inputClass(false)}
                  value={values.budget}
                  onChange={(event) => update('budget', event.target.value)}
                >
                  {BUDGETS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="ช่วงเวลาที่ต้องการเริ่ม" className="sm:col-span-2">
                <select
                  className={inputClass(false)}
                  value={values.timeline}
                  onChange={(event) => update('timeline', event.target.value)}
                >
                  {TIMELINES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="โจทย์ที่ต้องการแก้คืออะไร?"
                required
                className="sm:col-span-2"
                error={fieldErrors.message}
              >
                <textarea
                  rows={5}
                  className={cn(inputClass(!!fieldErrors.message), 'resize-y py-3')}
                  value={values.message}
                  onChange={(event) => update('message', event.target.value)}
                  required
                />
              </Field>
            </div>

            {/* Honeypot: hidden from users, catches naive bots. */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="website-field">Website</label>
              <input
                id="website-field"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(event) => update('website', event.target.value)}
              />
            </div>

            <AnimatePresence>
              {status === 'error' && message ? (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {message}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button type="submit" size="lg" disabled={status === 'submitting'} magnetic>
                {status === 'submitting' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    กำลังส่ง
                  </>
                ) : (
                  'ส่งข้อมูลโปรเจกต์'
                )}
              </Button>
              <p className="text-xs text-steel-400">
                เราตอบกลับภายใน 1 วันทำการ และไม่เปิดเผยข้อมูลของคุณ
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return cn(
    'h-11 w-full rounded-card border bg-white px-3.5 text-sm text-ink transition-colors duration-base placeholder:text-steel-300',
    'focus:outline-none focus:ring-2 focus:ring-brand-500/25',
    hasError ? 'border-red-300 focus:border-red-400' : 'border-steel-200 focus:border-brand-400'
  );
}

function Field({
  label,
  required,
  error,
  className,
  children
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-xs font-medium text-steel-600">
        {label}
        {required ? <span className="ml-1 text-brand-500">*</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
