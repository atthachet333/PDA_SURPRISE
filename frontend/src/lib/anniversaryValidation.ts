import { anniversary } from '@/data/anniversary';

export type IssueLevel = 'error' | 'warning' | 'info';

export interface ConfigIssue {
  level: IssueLevel;
  area: string;
  id?: string;
  message: string;
}

export interface ConfigReport {
  issues: ConfigIssue[];
  counts: { errors: number; warnings: number; info: number };
  stats: {
    memories: number;
    memoriesWithImages: number;
    locations: number;
    timeline: number;
    statistics: number;
    daysElapsed: number;
  };
}

/**
 * Checks the anniversary config for the mistakes that are easy to make while
 * swapping in real content. Nothing here throws: a missing photo must never
 * break the experience, it just gets reported.
 */
export function validateAnniversaryConfig(): ConfigReport {
  const issues: ConfigIssue[] = [];

  const push = (level: IssueLevel, area: string, message: string, id?: string) =>
    issues.push({ level, area, message, id });

  // --- start date ---------------------------------------------------------
  const start = new Date(anniversary.relationshipStartDate);
  if (Number.isNaN(start.getTime())) {
    push('error', 'relationshipStartDate', `"${anniversary.relationshipStartDate}" is not a valid date (expected YYYY-MM-DD).`);
  } else if (start.getTime() > Date.now()) {
    push('warning', 'relationshipStartDate', 'The start date is in the future, so every counter will read zero.');
  }

  const daysElapsed = Number.isNaN(start.getTime())
    ? 0
    : Math.max(0, Math.floor((Date.now() - start.getTime()) / 86_400_000));

  // --- duplicate ids across every collection ------------------------------
  const seen = new Map<string, string>();
  const checkId = (area: string, id: string) => {
    if (!id) {
      push('error', area, 'An entry is missing an id.');
      return;
    }
    const previous = seen.get(id);
    if (previous) push('error', area, `Duplicate id "${id}" (also used in ${previous}).`, id);
    else seen.set(id, area);
  };

  // --- memories -----------------------------------------------------------
  let memoriesWithImages = 0;
  anniversary.memories.forEach((memory) => {
    checkId('memories', memory.id);
    if (!memory.title?.trim()) push('error', 'memories', 'Missing title.', memory.id);
    if (!memory.date?.trim()) push('warning', 'memories', 'Missing date label.', memory.id);
    if (!memory.caption?.trim()) push('warning', 'memories', 'Missing caption.', memory.id);
    if (memory.image) {
      memoriesWithImages += 1;
      if (!memory.image.startsWith('/')) {
        push('error', 'memories', `Image path "${memory.image}" should start with "/" (it is served from /public).`, memory.id);
      }
    } else {
      push('info', 'memories', 'No photo yet — a generated placeholder is shown.', memory.id);
    }
  });

  if (anniversary.memories.length < 6) {
    push('warning', 'memories', `Only ${anniversary.memories.length} memories; the orbit and carousel look best with 8 or more.`);
  }
  if (!anniversary.memories.some((memory) => memory.featured)) {
    push('info', 'memories', 'No memory is marked featured; all memories will be used everywhere.');
  }

  // --- locations ----------------------------------------------------------
  anniversary.locations.forEach((place) => {
    checkId('locations', place.id);
    if (!place.title?.trim()) push('error', 'locations', 'Missing title.', place.id);
    if (typeof place.lat !== 'number' || place.lat < -90 || place.lat > 90) {
      push('error', 'locations', `Latitude ${place.lat} is outside -90..90.`, place.id);
    }
    if (typeof place.lng !== 'number' || place.lng < -180 || place.lng > 180) {
      push('error', 'locations', `Longitude ${place.lng} is outside -180..180.`, place.id);
    }
    if (place.lat === 0 && place.lng === 0) {
      push('warning', 'locations', 'Coordinates are 0,0 — this pin will sit in the Atlantic.', place.id);
    }
  });

  if (!anniversary.locations.some((place) => place.status === 'future')) {
    push('info', 'locations', 'No place marked status: "future"; the map has no "still to go" pin.');
  }

  // --- timeline -----------------------------------------------------------
  anniversary.timeline.forEach((moment) => {
    checkId('timeline', moment.id);
    if (!moment.title?.trim()) push('error', 'timeline', 'Missing title.', moment.id);
    if (!moment.body?.trim()) push('warning', 'timeline', 'Missing body copy.', moment.id);
    if (moment.type === 'photo' && !moment.image) {
      push('info', 'timeline', 'Typed as "photo" but has no image — placeholder shown.', moment.id);
    }
    if (moment.treatment === 'stack' && (moment.images?.length ?? 0) < 2) {
      push('info', 'timeline', 'The "stack" treatment looks best with 2-3 entries in `images`.', moment.id);
    }
    if (moment.type === 'video') {
      push('warning', 'timeline', 'Video playback is not implemented yet; this renders as a photo moment.', moment.id);
    }
    if (moment.type === 'location' && !moment.location) {
      push('info', 'timeline', 'Typed as "location" but has no location label.', moment.id);
    }
  });

  // --- statistics ---------------------------------------------------------
  anniversary.statistics.forEach((stat) => {
    checkId('statistics', stat.id);
    if (!stat.label?.trim()) push('error', 'statistics', 'Missing label.', stat.id);
  });

  const dayStat = anniversary.statistics.find((stat) => stat.id === 'days');
  if (dayStat && typeof dayStat.value === 'number' && daysElapsed > 0 && Math.abs(dayStat.value - daysElapsed) > 7) {
    push(
      'warning',
      'statistics',
      `The "days" statistic says ${dayStat.value} but the start date gives ${daysElapsed}.`,
      'days'
    );
  }

  // --- text ---------------------------------------------------------------
  if (anniversary.quietLines.length < 3) {
    push('warning', 'quietLines', 'The emotional pause needs at least three lines to pace properly.');
  }

  return {
    issues,
    counts: {
      errors: issues.filter((issue) => issue.level === 'error').length,
      warnings: issues.filter((issue) => issue.level === 'warning').length,
      info: issues.filter((issue) => issue.level === 'info').length
    },
    stats: {
      memories: anniversary.memories.length,
      memoriesWithImages,
      locations: anniversary.locations.length,
      timeline: anniversary.timeline.length,
      statistics: anniversary.statistics.length,
      daysElapsed
    }
  };
}

let reported = false;

/** Logs the report once per session, in development only. */
export function reportConfigInDev(): void {
  if (!import.meta.env.DEV || reported) return;
  reported = true;

  const report = validateAnniversaryConfig();
  const blocking = report.issues.filter((issue) => issue.level !== 'info');
  if (blocking.length === 0) return;

  /* eslint-disable no-console */
  console.groupCollapsed(
    `%cA&I config%c ${report.counts.errors} error(s), ${report.counts.warnings} warning(s) — /dev/anniversary-preview`,
    'color:#7EC8FF;font-weight:600',
    'color:inherit'
  );
  blocking.forEach((issue) => {
    const label = `[${issue.area}${issue.id ? ` · ${issue.id}` : ''}] ${issue.message}`;
    if (issue.level === 'error') console.error(label);
    else console.warn(label);
  });
  console.groupEnd();
  /* eslint-enable no-console */
}
