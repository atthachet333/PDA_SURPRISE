import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudio } from '@/app/audioContext';
import { Button } from '@/components/shared/Button';
import {
  contactBudgetOptions,
  contactIntents,
  contactSteps,
  contactSourceLabel,
  contactTimelineOptions,
  getContactIntent,
  resolveContactPrefill,
  type ContactDetailValue,
  type ContactPayload,
  type ContactQuestion,
  type ContactServiceId
} from '@/data/contactFlow';
import { ApiError, api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocale } from '@/app/LocaleContext';
import type { Locale } from '@/i18n/locales';
import type { ContentPack } from '@/i18n/content/types';
import { budgetLabel, form as f, localizeIntent, localizeOptions, stepLabel, timelineLabel, validation as v } from '@/i18n/contact';
import { localizeCaseStudy } from '@/i18n/caseStudies';
import { localizeService } from '@/i18n/services';
import { caseStudies } from '@/data/caseStudies';
import { services } from '@/data/services';
import { fill } from '@/i18n/fill';

type Mode = 'guided' | 'quick';
type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FormValues {
  serviceId: ContactServiceId | '';
  currentSituation: string;
  desiredOutcome: string;
  projectDetails: Record<string, ContactDetailValue>;
  budgetRange: string;
  timeline: string;
  companyName: string;
  industry: string;
  existingWebsite: string;
  contactName: string;
  email: string;
  phone: string;
  lineId: string;
  notes: string;
  website: string;
}

function createValues(serviceId?: ContactServiceId): FormValues {
  return {
    serviceId: serviceId ?? '', currentSituation: '', desiredOutcome: '', projectDetails: {},
    budgetRange: 'not-defined', timeline: 'not-defined', companyName: '', industry: '',
    existingWebsite: '', contactName: '', email: '', phone: '', lineId: '', notes: '', website: ''
  };
}

const clean = (value: string) => value.trim() || undefined;

/**
 * Where the visitor came from, in their language. Mirrors `contactSourceLabel`
 * in data/contactFlow.ts, which stays the Thai reference.
 */
function sourceLabelFor(sourceContext: string | undefined, locale: Locale, content: ContentPack | null): string | undefined {
  if (!sourceContext) return undefined;
  if (locale === 'th') return contactSourceLabel(sourceContext);
  const [kind, id] = sourceContext.split(':');
  if (kind === 'case') {
    const study = caseStudies.find((entry) => entry.slug === id);
    return study ? localizeCaseStudy(study, content).title : undefined;
  }
  if (kind === 'service') {
    const service = services.find((entry) => entry.id === id);
    return service ? localizeService(service, content).title : undefined;
  }
  if (sourceContext === 'home') return f.sourceHome[locale];
  return contactSourceLabel(sourceContext);
}
const validEmail = (value: string) => !value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
const validUrl = (value: string) => {
  if (!value.trim()) return true;
  try { new URL(value.trim()); return true; } catch { return false; }
};

export function ContactForm() {
  const location = useLocation();
  const prefill = useMemo(() => resolveContactPrefill(location.search), [location.search]);
  const [mode, setMode] = useState<Mode>('guided');
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<FormValues>(() => createValues(prefill.serviceId));
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const reduced = useReducedMotion();
  const { play } = useAudio();
  const { locale, t, content } = useLocale();
  /*
   * `status` is only accurate once React has re-rendered, so a burst of submits
   * inside a single tick (held Enter, a fast double-click, a janky main thread)
   * all read `idle` and each POSTs a duplicate lead. This ref flips
   * synchronously, so only the first one gets through.
   */
  const inFlight = useRef(false);

  const baseIntent = getContactIntent(values.serviceId);
  const intent = baseIntent ? localizeIntent(baseIntent, locale) : undefined;
  const sourceLabel = sourceLabelFor(prefill.sourceContext, locale, content);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const chooseIntent = (serviceId: ContactServiceId) => {
    setValues((current) => ({ ...current, serviceId, projectDetails: {} }));
    setFieldErrors((current) => ({ ...current, serviceId: '' }));
  };

  const setDetail = (questionId: string, value: ContactDetailValue) => {
    setValues((current) => ({ ...current, projectDetails: { ...current.projectDetails, [questionId]: value } }));
  };

  const validateStep = (targetStep: number): boolean => {
    const errors: Record<string, string> = {};
    if (targetStep === 1 && !values.serviceId) errors.serviceId = t(v.serviceId);
    if (targetStep === 2 && values.currentSituation.trim().length < 3) errors.currentSituation = t(v.currentSituation);
    if (targetStep === 3) {
      if (values.desiredOutcome.trim().length < 3) errors.desiredOutcome = t(v.desiredOutcome);
      if (!validUrl(values.existingWebsite)) errors.existingWebsite = t(v.url);
    }
    if (targetStep === 4) {
      if (values.contactName.trim().length < 2) errors.contactName = t(v.contactName);
      if (!values.email.trim() && !values.phone.trim() && !values.lineId.trim()) errors.email = t(v.oneChannel);
      if (!validEmail(values.email)) errors.email = t(v.email);
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setStatus('error');
      setMessage(t(v.stepIncomplete));
      return false;
    }
    setStatus('idle');
    setMessage('');
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(5, current + 1));
  };

  const buildPayload = (): ContactPayload => {
    const base = {
      serviceId: values.serviceId || undefined,
      contactName: values.contactName.trim(),
      companyName: clean(values.companyName),
      email: clean(values.email), phone: clean(values.phone), lineId: clean(values.lineId),
      sourceContext: prefill.sourceContext, website: values.website
    };
    if (mode === 'quick') return { contactType: 'quick', ...base, notes: values.notes.trim() };
    if (!values.serviceId) throw new Error('Missing service intent');
    const projectDetails = Object.fromEntries(Object.entries(values.projectDetails).filter(([, value]) => Array.isArray(value) ? value.length : value.trim()));
    return {
      contactType: 'guided', ...base, serviceId: values.serviceId,
      currentSituation: values.currentSituation.trim(), desiredOutcome: values.desiredOutcome.trim(),
      projectDetails, budgetRange: values.budgetRange, timeline: values.timeline,
      industry: clean(values.industry), existingWebsite: clean(values.existingWebsite), notes: clean(values.notes)
    };
  };

  const validateQuick = (): boolean => {
    const errors: Record<string, string> = {};
    if (values.contactName.trim().length < 2) errors.contactName = t(v.contactName);
    if (!values.email.trim() && !values.phone.trim() && !values.lineId.trim()) errors.email = t(v.oneChannel);
    if (!validEmail(values.email)) errors.email = t(v.email);
    if (values.notes.trim().length < 10) errors.notes = t(v.notes);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || status === 'submitting') return;
    if (mode === 'quick' ? !validateQuick() : !validateStep(4)) {
      setStatus('error');
      setMessage(t(v.checkFields));
      return;
    }
    inFlight.current = true;
    setStatus('submitting');
    setMessage('');
    try {
      const result = await api.submitContact(buildPayload());
      setReference(result.reference);
      setStatus('success');
      play('transitionRise');
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError) {
        /*
         * The API answers in Thai. Thai visitors see its exact wording; other
         * locales get the same outcome in their own language rather than a
         * Thai sentence in the middle of an English or Chinese form.
         */
        const serverText = locale === 'th';
        setMessage(error.status === 429 ? t(v.rateLimited) : serverText ? error.message : t(v.serverRejected));
        if (error.fields.length) setFieldErrors(Object.fromEntries(error.fields.map((field) => [field.field, serverText ? field.message : t(v.fieldInvalid)])));
      } else {
        setMessage(t(v.failed));
      }
    } finally {
      inFlight.current = false;
    }
  };

  if (status === 'success') {
    return <Success reference={reference} reduced={reduced} onReset={() => { setValues(createValues(prefill.serviceId)); setStep(1); setStatus('idle'); setReference(''); }} />;
  }

  return (
    <div className="relative">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-pill border border-steel-200 bg-white p-1" aria-label={t(f.modeGroup)}>
          <ModeButton active={mode === 'guided'} onClick={() => { setMode('guided'); setStatus('idle'); }}>{t(f.modeGuided)}</ModeButton>
          <ModeButton active={mode === 'quick'} onClick={() => { setMode('quick'); setStatus('idle'); }}>{t(f.modeQuick)}</ModeButton>
        </div>
        <p className="text-xs text-steel-400">{t(f.privacyNote)}</p>
      </div>

      {prefill.serviceId && intent ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          <p>{fill(t(f.askingAbout), { topic: <strong>{intent.label}</strong> })}{sourceLabel ? <span className="text-brand-700/70">{fill(t(f.from), { source: sourceLabel })}</span> : null}</p>
          <button type="button" className="min-h-11 rounded-pill border border-brand-300 px-4 text-xs font-semibold" onClick={() => { setMode('guided'); setStep(1); }}>{t(f.changeTopic)}</button>
        </div>
      ) : null}

      {mode === 'guided' ? (
        <form onSubmit={submit} noValidate className="rounded-panel border border-steel-200 bg-white p-5 sm:p-8">
          <Progress step={step} onStep={setStep} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={reduced ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: -12 }} transition={{ duration: reduced ? 0 : 0.22 }} className="mt-8">
              {step === 1 ? <IntentStep selected={values.serviceId} error={fieldErrors.serviceId} onSelect={chooseIntent} /> : null}
              {step === 2 && intent ? <SituationStep intent={intent} values={values} errors={fieldErrors} update={update} setDetail={setDetail} /> : null}
              {step === 3 ? <OutcomeStep values={values} errors={fieldErrors} update={update} /> : null}
              {step === 4 ? <ContactStep values={values} errors={fieldErrors} update={update} /> : null}
              {step === 5 && intent ? <ReviewStep intentLabel={intent.label} values={values} onEdit={setStep} /> : null}
            </motion.div>
          </AnimatePresence>
          <Honeypot value={values.website} onChange={(value) => update('website', value)} />
          <StatusMessage status={status} message={message} />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-steel-100 pt-6">
            <button type="button" className={cn('min-h-11 rounded-pill px-4 text-sm font-semibold text-steel-600', step === 1 && 'invisible')} onClick={() => setStep((current) => Math.max(1, current - 1))}>{t(f.back)}</button>
            {step < 5 ? <Button type="button" size="lg" onClick={nextStep}>{t(f.next)}</Button> : <Button type="submit" size="lg" disabled={status === 'submitting'}>{status === 'submitting' ? t(f.sending) : t(f.confirmSend)}</Button>}
          </div>
        </form>
      ) : <QuickForm values={values} errors={fieldErrors} status={status} message={message} update={update} onSubmit={submit} />}
    </div>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={cn('min-h-11 rounded-pill px-4 text-xs font-semibold transition-colors', active ? 'bg-brand-700 text-white' : 'text-steel-500 hover:text-ink')}>{children}</button>;
}

function Progress({ step, onStep }: { step: number; onStep: (step: number) => void }) {
  const { t } = useLocale();
  return <nav aria-label={t(f.progress)}><ol className="grid grid-cols-5 gap-1">{contactSteps.map(({ id, label }, index) => { const number = index + 1; const reachable = number < step; return <li key={id}><button type="button" disabled={!reachable} onClick={() => onStep(number)} aria-current={number === step ? 'step' : undefined} className={cn('min-h-11 w-full rounded-card border px-1 text-center transition-colors', number === step ? 'border-brand-500 bg-brand-50 text-brand-800' : number < step ? 'border-brand-200 text-brand-700' : 'border-steel-100 text-steel-300')}><span className="block font-mono text-[.58rem]">0{number}</span><span className="hidden text-[.62rem] sm:block">{stepLabel[id] ? t(stepLabel[id]!) : label}</span></button></li>; })}</ol></nav>;
}

function IntentStep({ selected, error, onSelect }: { selected: string; error?: string; onSelect: (id: ContactServiceId) => void }) {
  const { locale, t } = useLocale();
  return <fieldset aria-describedby={error ? 'service-intent-error' : undefined}><legend className="thai-display text-2xl font-bold text-ink">{t(f.intentTitle)}</legend><p className="mt-2 text-sm text-steel-500">{t(f.intentLead)}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{contactIntents.map((source) => localizeIntent(source, locale)).map((item) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => onSelect(item.id)} className={cn('min-h-[5.5rem] rounded-card border p-4 text-left transition-colors', selected === item.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/15' : 'border-steel-200 hover:border-brand-300')}><span className="block text-sm font-semibold text-ink">{item.label}</span><span className="mt-1.5 block text-xs leading-relaxed text-steel-500">{item.description}</span><span className="mt-3 block font-mono text-[.52rem] text-brand-600">{selected === item.id ? t(f.selected) : t(f.chooseTopic)}</span></button>)}</div>{error ? <p id="service-intent-error" className="mt-3 text-sm text-red-600" role="alert">{error}</p> : null}</fieldset>;
}

function SituationStep({ intent, values, errors, update, setDetail }: { intent: NonNullable<ReturnType<typeof getContactIntent>>; values: FormValues; errors: Record<string, string>; update: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void; setDetail: (id: string, value: ContactDetailValue) => void }) {
  const { t } = useLocale();
  return <div><p className="section-code">{intent.shortLabel}</p><h2 className="thai-display mt-3 text-2xl font-bold text-ink">{t(f.situationTitle)}</h2><TextAreaField id="current-situation" label={t(f.situationLabel)} required value={values.currentSituation} onChange={(value) => update('currentSituation', value)} error={errors.currentSituation} placeholder={t(f.situationPlaceholder)} className="mt-6" />{intent.questions.length ? <div className="mt-8 space-y-7 border-t border-steel-100 pt-7"><div><h3 className="text-sm font-semibold text-ink">{t(f.detailsTitle)}</h3><p className="mt-1 text-xs text-steel-400">{t(f.detailsLead)}</p></div>{intent.questions.map((question) => <AdaptiveQuestion key={question.id} question={question} value={values.projectDetails[question.id]} onChange={(value) => setDetail(question.id, value)} />)}</div> : null}</div>;
}

function AdaptiveQuestion({ question, value, onChange }: { question: ContactQuestion; value?: ContactDetailValue; onChange: (value: ContactDetailValue) => void }) {
  if (question.kind === 'text') return <InputField id={`detail-${question.id}`} label={question.label} helper={question.helper} value={typeof value === 'string' ? value : ''} onChange={onChange} placeholder={question.placeholder} />;
  const selected = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return <fieldset><legend className="text-xs font-medium text-steel-700">{question.label}</legend>{question.helper ? <p className="mt-1 text-xs text-steel-400">{question.helper}</p> : null}<div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options?.map((option) => { const checked = selected.includes(option.value); return <label key={option.value} className={cn('flex min-h-11 cursor-pointer items-center gap-3 rounded-card border px-3 py-2 text-sm', checked ? 'border-brand-400 bg-brand-50 text-brand-900' : 'border-steel-200 text-steel-600')}><input type={question.kind === 'multi' ? 'checkbox' : 'radio'} name={`question-${question.id}`} value={option.value} checked={checked} onChange={() => { if (question.kind === 'single') onChange(option.value); else onChange(checked ? selected.filter((item) => item !== option.value) : [...selected, option.value]); }} className="h-4 w-4 accent-brand-600" /><span>{option.label}</span></label>; })}</div></fieldset>;
}

function OutcomeStep({ values, errors, update }: StepProps) {
  const { locale, t } = useLocale();
  return <div><h2 className="thai-display text-2xl font-bold text-ink">{t(f.outcomeTitle)}</h2><p className="mt-2 text-sm text-steel-500">{t(f.outcomeLead)}</p><TextAreaField id="desired-outcome" label={t(f.outcomeLabel)} required value={values.desiredOutcome} onChange={(value) => update('desiredOutcome', value)} error={errors.desiredOutcome} placeholder={t(f.outcomePlaceholder)} className="mt-6" /><div className="mt-6 grid gap-5 sm:grid-cols-2"><SelectField id="budget-range" label={t(f.budget)} value={values.budgetRange} options={localizeOptions(contactBudgetOptions, budgetLabel, locale)} onChange={(value) => update('budgetRange', value)} /><SelectField id="timeline" label={t(f.timeline)} value={values.timeline} options={localizeOptions(contactTimelineOptions, timelineLabel, locale)} onChange={(value) => update('timeline', value)} /><InputField id="industry" label={t(f.industry)} value={values.industry} onChange={(value) => update('industry', value)} /><InputField id="existing-website" type="url" label={t(f.existingWebsite)} value={values.existingWebsite} onChange={(value) => update('existingWebsite', value)} error={errors.existingWebsite} placeholder="https://example.com" /></div><p className="mt-4 text-xs leading-relaxed text-steel-400">{t(f.budgetNote)}</p></div>;
}

interface StepProps { values: FormValues; errors: Record<string, string>; update: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void }

function ContactStep({ values, errors, update }: StepProps) {
  const { t } = useLocale();
  return <div><h2 className="thai-display text-2xl font-bold text-ink">{t(f.contactTitle)}</h2><p className="mt-2 text-sm text-steel-500">{t(f.contactLead)}</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><InputField id="contact-name" label={t(f.name)} required autoComplete="name" value={values.contactName} onChange={(value) => update('contactName', value)} error={errors.contactName} /><InputField id="company-name" label={t(f.company)} autoComplete="organization" value={values.companyName} onChange={(value) => update('companyName', value)} /><InputField id="contact-email" type="email" label={t(f.email)} autoComplete="email" value={values.email} onChange={(value) => update('email', value)} error={errors.email} /><InputField id="contact-phone" type="tel" label={t(f.phone)} autoComplete="tel" value={values.phone} onChange={(value) => update('phone', value)} error={errors.phone} /><InputField id="line-id" label="LINE ID" value={values.lineId} onChange={(value) => update('lineId', value)} /><TextAreaField id="contact-notes" label={t(f.notes)} value={values.notes} onChange={(value) => update('notes', value)} className="sm:col-span-2" /></div></div>;
}

function ReviewStep({ intentLabel, values, onEdit }: { intentLabel: string; values: FormValues; onEdit: (step: number) => void }) {
  const { locale, t } = useLocale();
  const base = getContactIntent(values.serviceId);
  const intent = base ? localizeIntent(base, locale) : undefined;
  const budgets = localizeOptions(contactBudgetOptions, budgetLabel, locale);
  const timelines = localizeOptions(contactTimelineOptions, timelineLabel, locale);
  const detailRows = intent?.questions.map((question) => { const answer = values.projectDetails[question.id]; if (!answer || (Array.isArray(answer) && !answer.length)) return null; const ids = Array.isArray(answer) ? answer : [answer]; const labels = ids.map((id) => question.options?.find((option) => option.value === id)?.label ?? id); return [question.label, labels.join(', ')] as const; }).filter((row) => row !== null) ?? [];
  return <div><h2 className="thai-display text-2xl font-bold text-ink">{t(f.reviewTitle)}</h2><p className="mt-2 text-sm text-steel-500">{t(f.reviewLead)}</p><div className="mt-6 space-y-4"><ReviewBlock title="REQUEST" onEdit={() => onEdit(1)} rows={[[t(f.rowTopic), intentLabel], [t(f.situationLabel), values.currentSituation], ...detailRows]} /><ReviewBlock title="GOAL" onEdit={() => onEdit(3)} rows={[[t(f.outcomeLabel), values.desiredOutcome], [t(f.rowBudget), budgets.find((item) => item.value === values.budgetRange)?.label ?? ''], [t(f.rowTimeline), timelines.find((item) => item.value === values.timeline)?.label ?? '']]} /><ReviewBlock title="CONTACT" onEdit={() => onEdit(4)} rows={[[t(f.rowName), values.contactName], [t(f.rowCompany), values.companyName], [t(f.email), values.email], [t(f.phone), values.phone], ['LINE ID', values.lineId]]} /></div></div>;
}

function ReviewBlock({ title, rows, onEdit }: { title: string; rows: readonly (readonly [string, string])[]; onEdit: () => void }) {
  const { t } = useLocale();
  return <section className="rounded-card border border-steel-200 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-mono text-[.6rem] tracking-[.16em] text-brand-600">{title}</h3><button type="button" onClick={onEdit} className="min-h-11 px-2 text-xs font-semibold text-brand-700">{t(f.edit)}</button></div><dl className="mt-3 space-y-3">{rows.filter(([, value]) => value).map(([label, value]) => <div key={label} className="grid gap-1 sm:grid-cols-[10rem_1fr]"><dt className="text-xs text-steel-400">{label}</dt><dd className="whitespace-pre-wrap text-sm leading-relaxed text-steel-700">{value}</dd></div>)}</dl></section>;
}

function QuickForm({ values, errors, status, message, update, onSubmit }: StepProps & { status: Status; message: string; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const { t } = useLocale();
  return <form onSubmit={onSubmit} noValidate className="rounded-panel border border-steel-200 bg-white p-5 sm:p-8"><h2 className="thai-display text-2xl font-bold text-ink">{t(f.quickTitle)}</h2><p className="mt-2 text-sm text-steel-500">{t(f.quickLead)}</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><InputField id="quick-name" label={t(f.name)} required autoComplete="name" value={values.contactName} onChange={(value) => update('contactName', value)} error={errors.contactName} /><InputField id="quick-company" label={t(f.company)} autoComplete="organization" value={values.companyName} onChange={(value) => update('companyName', value)} /><InputField id="quick-email" type="email" label={t(f.email)} autoComplete="email" value={values.email} onChange={(value) => update('email', value)} error={errors.email} /><InputField id="quick-phone" type="tel" label={t(f.phone)} autoComplete="tel" value={values.phone} onChange={(value) => update('phone', value)} /><InputField id="quick-line" label="LINE ID" value={values.lineId} onChange={(value) => update('lineId', value)} /><TextAreaField id="quick-message" label={t(f.quickMessage)} required value={values.notes} onChange={(value) => update('notes', value)} error={errors.notes} placeholder={t(f.quickPlaceholder)} className="sm:col-span-2" /></div><Honeypot value={values.website} onChange={(value) => update('website', value)} /><StatusMessage status={status} message={message} /><div className="mt-8"><Button type="submit" size="lg" disabled={status === 'submitting'}>{status === 'submitting' ? t(f.sending) : t(f.quickSend)}</Button></div></form>;
}

function Success({ reference, reduced, onReset }: { reference: string; reduced: boolean; onReset: () => void }) {
  const { t } = useLocale();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-panel border border-brand-200 bg-brand-50 p-7 sm:p-10" role="status"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-xl text-white">✓</span><h2 className="thai-display mt-6 text-2xl font-bold text-ink">{t(f.successTitle)}</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-steel-600">{t(f.successBody)}</p><p className="mt-4 text-xs text-steel-500">{t(f.reference)} <span className="font-mono text-ink">{reference}</span></p><Button type="button" variant="secondary" size="sm" className="mt-7" onClick={onReset}>{t(f.sendAnother)}</Button></motion.div>;
}

function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="absolute left-[-9999px]" aria-hidden="true"><label htmlFor="website-field">Website</label><input id="website-field" tabIndex={-1} autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function StatusMessage({ status, message }: { status: Status; message: string }) {
  return <div aria-live="polite">{status === 'error' && message ? <p className="mt-6 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{message}</p> : null}</div>;
}

function InputField({ id, label, value, onChange, error, helper, required, type = 'text', placeholder, autoComplete }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; helper?: string; required?: boolean; type?: React.HTMLInputTypeAttribute; placeholder?: string; autoComplete?: string }) {
  const errorId = `${id}-error`;
  return <label htmlFor={id} className="block"><span className="mb-2 block text-xs font-medium text-steel-600">{label}{required ? <span className="ml-1 text-brand-500">*</span> : null}</span><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={inputClass(Boolean(error))} />{helper ? <span className="mt-1.5 block text-xs text-steel-400">{helper}</span> : null}{error ? <span id={errorId} className="mt-1.5 block text-xs text-red-600">{error}</span> : null}</label>;
}

function TextAreaField({ id, label, value, onChange, error, required, placeholder, className }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; required?: boolean; placeholder?: string; className?: string }) {
  const errorId = `${id}-error`;
  return <label htmlFor={id} className={cn('block', className)}><span className="mb-2 block text-xs font-medium text-steel-600">{label}{required ? <span className="ml-1 text-brand-500">*</span> : null}</span><textarea id={id} rows={4} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={cn(inputClass(Boolean(error)), 'h-auto min-h-28 resize-y py-3')} />{error ? <span id={errorId} className="mt-1.5 block text-xs text-red-600">{error}</span> : null}</label>;
}

function SelectField({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label htmlFor={id} className="block"><span className="mb-2 block text-xs font-medium text-steel-600">{label}</span><select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass(false)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function inputClass(hasError: boolean): string {
  return cn('h-11 w-full rounded-card border bg-white px-3.5 text-sm text-ink transition-colors placeholder:text-steel-300 focus:outline-none focus:ring-2 focus:ring-brand-500/25', hasError ? 'border-red-300 focus:border-red-400' : 'border-steel-200 focus:border-brand-400');
}
