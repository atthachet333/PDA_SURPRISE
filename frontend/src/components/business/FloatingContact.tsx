import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { company, cta } from '@/data/company';

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="floating-contact-position fixed z-40">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className="mb-3 w-[min(20rem,calc(100vw-2.5rem))] rounded-panel border border-steel-200 bg-white/95 p-5 shadow-lift-lg backdrop-blur-xl"
          >
            <p className="text-sm font-semibold text-ink">คุยเรื่องโปรเจกต์กับเรา</p>
            <p className="mt-1 text-xs leading-relaxed text-steel-500">เลือกช่องทางที่สะดวก ทีมงานตอบกลับภายใน 1 วันทำการ</p>
            <div className="mt-4 grid gap-2">
              <Link className="contact-quick-link bg-ink text-white hover:bg-brand-700 hover:text-white" to={cta.consult.to}>
                {cta.consult.label}
              </Link>
              <a className="contact-quick-link" href={company.lineUrl} target="_blank" rel="noreferrer">LINE {company.lineOA}</a>
              <a className="contact-quick-link" href={`tel:${company.phone}`}>โทร {company.phoneDisplay}</a>
              <a className="contact-quick-link" href={`mailto:${company.email}`}>{company.email}</a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'ปิดช่องทางติดต่อ' : 'เปิดช่องทางติดต่อ'}
        className="ml-auto flex h-14 items-center gap-3 rounded-pill bg-ink px-5 text-sm font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5"
      >
        <span className="h-2 w-2 rounded-full bg-brand-400 shadow-brand-glow" />
        ติดต่อเรา
      </button>
    </div>
  );
}
