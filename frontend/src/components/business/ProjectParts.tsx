import { Link } from 'react-router-dom';
import { ArrowIcon } from '@/components/shared/Button';
import { CaseStudyVisual } from './CaseStudyVisual';
import { projectAccessNote, projectCaseLink, projectLiveLink, type CaseStudy } from '@/data/caseStudies';
import { cn } from '@/lib/cn';

/** Small external-link glyph. */
export function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cn('h-3.5 w-3.5', className)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 3.5H3.5v9h9v-3" />
      <path d="M9.5 3.5h3v3M12.5 3.5 7 9" />
    </svg>
  );
}

/**
 * The project's visual truth. A reviewed screenshot sits in a browser frame;
 * without one, the schematic workflow illustration is shown and says so, so a
 * diagram is never mistaken for a real screen.
 */
export function ProjectVisual({
  study,
  priority = false,
  className
}: {
  study: CaseStudy;
  priority?: boolean;
  className?: string;
}) {
  const shot = study.screenshot?.reviewed ? study.screenshot : undefined;
  return (
    <figure className={cn('work-frame group/visual relative overflow-hidden rounded-panel border border-steel-200 bg-white', className)}>
      <div className="flex h-8 items-center gap-1.5 border-b border-steel-200 bg-steel-50 px-3">
        <span className="h-2 w-2 rounded-full bg-steel-300" />
        <span className="h-2 w-2 rounded-full bg-steel-300" />
        <span className="h-2 w-2 rounded-full bg-steel-300" />
        <span className="ml-3 truncate font-mono text-[0.55rem] tracking-[0.12em] text-steel-600">{study.projectType}</span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        {shot ? (
          <img
            src={shot.src}
            srcSet={shot.srcSmall ? `${shot.srcSmall} 800w, ${shot.src} ${shot.width}w` : undefined}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="work-shot h-full w-full object-cover object-top"
          />
        ) : (
          <CaseStudyVisual kind={study.visual} className="work-shot" />
        )}
        <figcaption className="absolute bottom-2.5 right-2.5 rounded-pill bg-ink/75 px-2.5 py-1 font-mono text-[0.5rem] tracking-[0.12em] text-white/85">
          {shot ? 'SCREENSHOT' : 'ภาพจำลองโครงสร้างระบบ'}
        </figcaption>
      </div>
    </figure>
  );
}

/**
 * Every way to open a project, rendered in one place. The live action appears
 * only when `projectLiveLink` allows it (public + verified safe URL) and always
 * announces that it leaves the site.
 */
export function ProjectActions({ study, className }: { study: CaseStudy; className?: string }) {
  const live = projectLiveLink(study);
  const caseLink = projectCaseLink(study);
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {live ? (
        <a
          href={live.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {live.label}
          <ExternalIcon />
          <span className="sr-only">(เปิดแท็บใหม่ ออกจากเว็บไซต์ PDA BLISS ไปที่ {live.host})</span>
        </a>
      ) : null}
      <Link
        to={caseLink.href}
        data-cursor="project"
        className={cn(
          'group/cta inline-flex min-h-11 items-center gap-2 rounded-pill px-5 text-sm font-semibold transition-colors',
          live ? 'border border-steel-300 text-ink hover:border-brand-400 hover:text-brand-700' : 'bg-ink text-white hover:bg-brand-700'
        )}
      >
        {caseLink.label}
        <ArrowIcon className="transition-transform duration-base group-hover/cta:translate-x-1" />
      </Link>
      {live ? <span className="font-mono text-[0.6rem] tracking-[0.08em] text-steel-600">{live.host}</span> : null}
    </div>
  );
}

export function ProjectAccessNote({ study, className }: { study: CaseStudy; className?: string }) {
  return (
    <p className={cn('flex items-center gap-2 text-xs text-steel-500', className)}>
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', projectLiveLink(study) ? 'bg-brand-500' : 'bg-steel-300')} />
      {projectAccessNote(study)}
    </p>
  );
}

export function ProjectTags({ tags, className }: { tags: readonly string[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="ความสามารถของระบบ">
      {tags.map((tag) => (
        <li key={tag} className="rounded-pill border border-brand-100 bg-brand-50/70 px-2.5 py-1 text-[0.7rem] text-brand-800">{tag}</li>
      ))}
    </ul>
  );
}

/** The live action alone (detail pages), or nothing when no safe URL exists. */
export function ProjectLiveButton({ study, className }: { study: CaseStudy; className?: string }) {
  const live = projectLiveLink(study);
  if (!live) return null;
  return (
    <a
      href={live.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex min-h-12 items-center gap-2.5 rounded-pill bg-brand-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-400', className)}
    >
      {live.label}
      <ExternalIcon />
      <span className="font-mono text-[0.65rem] font-normal text-white/75">{live.host}</span>
      <span className="sr-only">(เปิดแท็บใหม่ ออกจากเว็บไซต์ PDA BLISS)</span>
    </a>
  );
}
