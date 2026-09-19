import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/business/Logo';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CookieContext, type CookiePreferences } from '@/app/cookieConsentContext';

const STORAGE_KEY = 'pda-cookie-consent-v1';

function readStored(): CookiePreferences | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<CookiePreferences>;
    return { essential: true, analytics: value.analytics === true, preferences: value.preferences === true };
  } catch {
    return null;
  }
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookiePreferences | null>(readStored);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const save = (next: CookiePreferences) => {
    setConsent(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Storage can be unavailable; in-memory consent still works. */ }
    setSettingsOpen(false);
  };

  return (
    <CookieContext.Provider value={{ essential: true, analytics: consent?.analytics ?? false, preferences: consent?.preferences ?? false, hasConsent: consent !== null, openSettings: () => setSettingsOpen(true) }}>
      {children}
      <CookieConsentUI consent={consent} settingsOpen={settingsOpen} onOpenSettings={() => setSettingsOpen(true)} onCloseSettings={() => setSettingsOpen(false)} onSave={save} />
    </CookieContext.Provider>
  );
}

function CookieConsentUI({ consent, settingsOpen, onOpenSettings, onCloseSettings, onSave }: { consent: CookiePreferences | null; settingsOpen: boolean; onOpenSettings: () => void; onCloseSettings: () => void; onSave: (value: CookiePreferences) => void }) {
  const reduced = useReducedMotion();
  return (
    <>
      <AnimatePresence>{!consent && !settingsOpen ? <motion.aside role="region" aria-label="การตั้งค่าคุกกี้" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: reduced ? 0 : .36 }} className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[70] overflow-hidden rounded-panel border border-brand-200 bg-white/95 p-5 shadow-lift-lg backdrop-blur-xl sm:left-6 sm:right-auto sm:w-[32rem] sm:p-6"><span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left animate-[reveal-line-up_.6s_ease-out_both] bg-brand-500" /><div className="flex items-start gap-3"><Logo compact /><div><h2 className="thai-display text-base font-bold text-ink">เราใช้คุกกี้เพื่อให้เว็บไซต์ทำงานได้ดีขึ้น</h2><p className="mt-2 text-xs leading-6 text-steel-600">เราใช้คุกกี้ที่จำเป็นสำหรับการทำงานของเว็บไซต์ และคุกกี้เพิ่มเติมเมื่อคุณอนุญาต เพื่อช่วยปรับปรุงประสบการณ์การใช้งาน</p></div></div><div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap"><button type="button" onClick={() => onSave({ essential: true, analytics: true, preferences: true })} className="h-11 rounded-pill bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800">ยอมรับทั้งหมด</button><button type="button" onClick={() => onSave({ essential: true, analytics: false, preferences: false })} className="h-11 rounded-pill border border-steel-300 px-5 text-sm font-semibold text-ink hover:bg-steel-50">เฉพาะที่จำเป็น</button><button type="button" onClick={onOpenSettings} className="h-11 rounded-pill px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50">ตั้งค่าคุกกี้</button></div><Link to="/cookie-policy" className="mt-4 inline-block text-xs text-steel-500 underline decoration-steel-300 underline-offset-4 hover:text-brand-700">นโยบายคุกกี้</Link></motion.aside> : null}</AnimatePresence>
      <AnimatePresence>{settingsOpen ? <CookieSettings initial={consent} onClose={onCloseSettings} onSave={onSave} reduced={reduced} /> : null}</AnimatePresence>
    </>
  );
}

function CookieSettings({ initial, onClose, onSave, reduced }: { initial: CookiePreferences | null; onClose: () => void; onSave: (value: CookiePreferences) => void; reduced: boolean }) {
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  const [preferences, setPreferences] = useState(initial?.preferences ?? false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled])') ?? []);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [onClose]);

  return <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: reduced ? 0 : .32 }} className="max-h-[82dvh] w-full max-w-xl overflow-y-auto rounded-t-panel border border-brand-200 bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lift-lg sm:rounded-panel sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="section-code">COOKIE SETTINGS</p><h2 id="cookie-settings-title" className="thai-display mt-3 text-xl font-bold text-ink">ตั้งค่าคุกกี้</h2></div><button type="button" onClick={onClose} aria-label="ปิดการตั้งค่าคุกกี้" className="flex h-10 w-10 items-center justify-center rounded-full border border-steel-200 text-steel-600 hover:bg-steel-50">×</button></div><div className="mt-6 divide-y divide-steel-200 border-y border-steel-200"><PreferenceRow title="คุกกี้ที่จำเป็น" description="ใช้สำหรับจดจำความยินยอมและการทำงานพื้นฐานของเว็บไซต์" checked disabled onChange={() => undefined} /><PreferenceRow title="คุกกี้วิเคราะห์" description="ยังไม่มีระบบวิเคราะห์ติดตั้ง การอนุญาตนี้เก็บไว้สำหรับการเชื่อมต่อในอนาคต" checked={analytics} onChange={setAnalytics} /><PreferenceRow title="คุกกี้การตั้งค่า" description="อนุญาตให้เว็บไซต์จดจำการตั้งค่าที่ไม่จำเป็นในอนาคต" checked={preferences} onChange={setPreferences} /></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-11 rounded-pill px-5 text-sm font-semibold text-steel-600 hover:bg-steel-50">ยกเลิก</button><button type="button" onClick={() => onSave({ essential: true, analytics, preferences })} className="h-11 rounded-pill bg-brand-700 px-6 text-sm font-semibold text-white hover:bg-brand-800">บันทึกการตั้งค่า</button></div></motion.div></motion.div>;
}

function PreferenceRow({ title, description, checked, disabled = false, onChange }: { title: string; description: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-start justify-between gap-5 py-5"><span><span className="block text-sm font-semibold text-ink">{title}</span><span className="mt-1 block text-xs leading-5 text-steel-500">{description}</span></span><span className="relative mt-0.5 shrink-0"><input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /><span className="block h-6 w-11 rounded-pill bg-steel-200 transition peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 peer-disabled:opacity-60"><span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} /></span></span></label>;
}
