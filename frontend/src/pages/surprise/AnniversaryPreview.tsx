import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { anniversary, allImagePaths } from '@/data/anniversary';
import { validateAnniversaryConfig, type ConfigIssue } from '@/lib/anniversaryValidation';
import { getQualityOverride, setQualityOverride, type DeviceTier } from '@/lib/device';
import { preloadImage } from '@/lib/preload';
import { cn } from '@/lib/cn';

/**
 * Development-only content console. Not linked from anywhere and not reachable
 * in a production build — App.tsx only registers this route when import.meta.env.DEV.
 *
 * It exists to make swapping placeholder content for real content fast: every
 * asset path in one place, with a live check of which files actually resolve.
 */
export default function AnniversaryPreview() {
  const report = useMemo(() => validateAnniversaryConfig(), []);
  const paths = useMemo(() => allImagePaths(), []);
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const [quality, setQuality] = useState<DeviceTier | null>(() => getQualityOverride());

  // Probe every referenced path so missing files are visible immediately.
  useEffect(() => {
    let active = true;
    void Promise.all(
      paths.map(async (path) => {
        const ok = await preloadImage(path);
        if (active) setResolved((current) => ({ ...current, [path]: ok }));
      })
    );
    return () => {
      active = false;
    };
  }, [paths]);

  const withoutImage = anniversary.memories.filter((memory) => !memory.image);

  return (
    <div className="min-h-screen bg-navy-800 px-6 py-12 text-ivory">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-sky-200/15 pb-6">
          <div>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-sky-100/60">
              Development only
            </p>
            <h1 className="mt-3 font-display text-4xl font-light">A&amp;I content console</h1>
            <p className="mt-2 text-sm text-ivory/60">
              Everything below comes from <code className="text-sky-200">src/data/anniversary.ts</code>.
            </p>
          </div>
          <Link
            to="/us"
            className="rounded-pill border border-sky-200/30 px-4 py-2 text-[0.625rem] uppercase tracking-[0.18em] text-ivory/80 transition-colors hover:border-sky-200/60 hover:text-ivory"
          >
            Open experience
          </Link>
        </header>

        {/* Summary */}
        <section className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Memories" value={report.stats.memories} />
          <Stat label="With photos" value={`${report.stats.memoriesWithImages}/${report.stats.memories}`} />
          <Stat label="Locations" value={report.stats.locations} />
          <Stat label="Timeline" value={report.stats.timeline} />
          <Stat label="Statistics" value={report.stats.statistics} />
          <Stat label="Days elapsed" value={report.stats.daysElapsed} />
        </section>

        {/* Validation */}
        <Section title="Validation" meta={`${report.counts.errors} errors · ${report.counts.warnings} warnings · ${report.counts.info} notes`}>
          {report.issues.length === 0 ? (
            <p className="text-sm text-ivory/55">No issues found.</p>
          ) : (
            <ul className="space-y-1.5">
              {report.issues.map((issue, index) => (
                <IssueRow key={index} issue={issue} />
              ))}
            </ul>
          )}
        </Section>

        {/* Quality override */}
        <Section title="Quality tier" meta="Stored in localStorage, applies on reload">
          <div className="flex flex-wrap gap-2">
            {(['high', 'medium', 'low'] as DeviceTier[]).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => {
                  setQualityOverride(tier);
                  setQuality(tier);
                }}
                className={cn(
                  'rounded-pill border px-4 py-2 text-[0.625rem] uppercase tracking-[0.16em] transition-colors',
                  quality === tier
                    ? 'border-sky-200/60 bg-sky-400/15 text-ivory'
                    : 'border-sky-200/20 text-ivory/60 hover:text-ivory'
                )}
              >
                {tier}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setQualityOverride(null);
                setQuality(null);
              }}
              className={cn(
                'rounded-pill border px-4 py-2 text-[0.625rem] uppercase tracking-[0.16em] transition-colors',
                quality === null
                  ? 'border-sky-200/60 bg-sky-400/15 text-ivory'
                  : 'border-sky-200/20 text-ivory/60 hover:text-ivory'
              )}
            >
              Auto-detect
            </button>
          </div>
        </Section>

        {/* Memories */}
        <Section title="Memories" meta={`${withoutImage.length} still need a photo`}>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {anniversary.memories.map((memory, index) => (
              <figure key={memory.id} className="ai-surface overflow-hidden rounded-card">
                <span className="block aspect-[3/4]">
                  <MemoryImage
                    photo={memory.image}
                    alt={memory.title}
                    tone={memory.tone}
                    label={memory.date}
                    index={index}
                  />
                </span>
                <figcaption className="space-y-1 p-3">
                  <span className="block font-mono text-[0.5625rem] text-sky-200">{memory.id}</span>
                  <span className="block truncate text-xs text-ivory/85">{memory.title}</span>
                  <span className="block font-mono text-[0.5rem] text-ivory/40">
                    {memory.image ? (
                      <span className={resolved[memory.image] === false ? 'text-red-300' : 'text-emerald-300'}>
                        {resolved[memory.image] === false ? 'MISSING FILE' : 'ok'}
                      </span>
                    ) : (
                      <span className="text-amber-300">no image set</span>
                    )}
                    {memory.featured ? ' · featured' : ''}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* Image paths */}
        <Section title="Referenced image paths" meta={`${paths.length} total`}>
          {paths.length === 0 ? (
            <p className="text-sm text-ivory/55">
              No images referenced yet. Add files to{' '}
              <code className="text-sky-200">frontend/public/images/memories/</code> and set the{' '}
              <code className="text-sky-200">image</code> field on each entry.
            </p>
          ) : (
            <ul className="space-y-1 font-mono text-[0.6875rem]">
              {paths.map((path) => (
                <li key={path} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-16 shrink-0 text-[0.5625rem] uppercase',
                      resolved[path] === false ? 'text-red-300' : resolved[path] ? 'text-emerald-300' : 'text-ivory/30'
                    )}
                  >
                    {resolved[path] === false ? 'missing' : resolved[path] ? 'ok' : '...'}
                  </span>
                  <span className="truncate text-ivory/70">{path}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Timeline order */}
        <Section title="Timeline order" meta={`${anniversary.timeline.length} moments`}>
          <ol className="space-y-1.5">
            {anniversary.timeline.map((moment, index) => (
              <li key={moment.id} className="flex flex-wrap items-baseline gap-3 text-xs">
                <span className="w-6 font-mono text-ivory/30">{String(index + 1).padStart(2, '0')}</span>
                <span className="w-24 font-mono text-[0.625rem] text-sky-200">{moment.label}</span>
                <span className="min-w-0 flex-1 truncate text-ivory/80">{moment.title}</span>
                <span className="rounded-pill bg-sky-400/12 px-2 py-0.5 font-mono text-[0.5rem] uppercase text-sky-100/80">
                  {moment.type}
                </span>
                <span className="rounded-pill bg-ivory/8 px-2 py-0.5 font-mono text-[0.5rem] uppercase text-ivory/55">
                  {moment.treatment}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Locations */}
        <Section title="Locations" meta={`${anniversary.locations.length} pins`}>
          <ul className="space-y-1.5 font-mono text-[0.6875rem]">
            {anniversary.locations.map((place) => (
              <li key={place.id} className="flex flex-wrap items-baseline gap-3">
                <span className="w-10 text-sky-200">{place.id}</span>
                <span className="w-32 truncate text-ivory/80">{place.label}</span>
                <span className="text-ivory/50">
                  {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                </span>
                <span className="text-ivory/40">{place.location}</span>
                {place.status === 'future' ? (
                  <span className="rounded-pill bg-champagne/15 px-2 py-0.5 text-[0.5rem] uppercase text-champagne">
                    future
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>

        {/* Statistics */}
        <Section title="Statistics" meta={`${anniversary.statistics.length} plates`}>
          <ul className="space-y-1.5 font-mono text-[0.6875rem]">
            {anniversary.statistics.map((stat) => (
              <li key={stat.id} className="flex flex-wrap items-baseline gap-3">
                <span className="w-32 text-sky-200">{stat.id}</span>
                <span className="w-20 text-ivory/85">{String(stat.value)}</span>
                <span className="text-ivory/55">{stat.label}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Audio" meta="Missing files fail silently">
          <ul className="space-y-1.5 font-mono text-[0.6875rem] text-ivory/60">
            <li>music: {anniversary.audio.musicSrc}</li>
            <li>sfx directory: {anniversary.audio.sfxDir}/[hover|click|whoosh|impact|sparkle|transition].mp3</li>
            <li>cues: {anniversary.audio.cues.map((cue) => cue.id).join(', ')}</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  meta,
  children
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-sky-200/10 pb-2">
        <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-sky-100/80">{title}</h2>
        {meta ? <span className="font-mono text-[0.5625rem] text-ivory/35">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ai-surface rounded-card px-4 py-3">
      <p className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ivory/40">{label}</p>
      <p className="mt-1 font-mono text-lg text-ivory">{value}</p>
    </div>
  );
}

function IssueRow({ issue }: { issue: ConfigIssue }) {
  const tone =
    issue.level === 'error'
      ? 'text-red-300'
      : issue.level === 'warning'
        ? 'text-amber-300'
        : 'text-ivory/40';

  return (
    <li className="flex flex-wrap items-baseline gap-3 font-mono text-[0.6875rem]">
      <span className={cn('w-16 shrink-0 text-[0.5625rem] uppercase', tone)}>{issue.level}</span>
      <span className="w-40 shrink-0 truncate text-sky-200">
        {issue.area}
        {issue.id ? ` · ${issue.id}` : ''}
      </span>
      <span className="min-w-0 flex-1 text-ivory/65">{issue.message}</span>
    </li>
  );
}
