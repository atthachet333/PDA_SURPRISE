/**
 * Every problem the pipeline reports is an Issue: which asset, what went wrong,
 * and what to do about it. Errors block the batch; warnings and notes do not.
 */
export type Severity = 'error' | 'warning' | 'note';

export interface Issue {
  severity: Severity;
  /** Stable machine code, e.g. `duplicate-content`. Confirmable codes are listed in CONFIRMABLE. */
  code: string;
  /** The source file (or canonical id) the issue belongs to; `batch` for batch-level issues. */
  asset: string;
  message: string;
  fix?: string;
}

/**
 * Checks that are not failures by themselves but need a human to say yes.
 * They block until the item lists the code in its `confirm` array.
 */
export const CONFIRMABLE = new Set([
  'near-duplicate',
  'filename-sensitive',
  'source-png',
  'audio-track',
  'low-resolution'
]);

export class IssueLog {
  readonly issues: Issue[] = [];

  add(issue: Issue): void {
    this.issues.push(issue);
  }

  error(asset: string, code: string, message: string, fix?: string): void {
    this.add({ severity: 'error', code, asset, message, fix });
  }

  warn(asset: string, code: string, message: string, fix?: string): void {
    this.add({ severity: 'warning', code, asset, message, fix });
  }

  note(asset: string, code: string, message: string): void {
    this.add({ severity: 'note', code, asset, message });
  }

  get errors(): Issue[] {
    return this.issues.filter((issue) => issue.severity === 'error');
  }

  hasErrors(): boolean {
    return this.issues.some((issue) => issue.severity === 'error');
  }
}

/** Thrown for failures after validation passed (I/O, encoder crashes). */
export class PipelineError extends Error {
  constructor(message: string, readonly asset = 'batch') {
    super(message);
    this.name = 'PipelineError';
  }
}

export function formatIssue(issue: Issue): string {
  const tag = issue.severity === 'error' ? 'ERROR' : issue.severity === 'warning' ? 'WARN ' : 'NOTE ';
  const fix = issue.fix ? `\n          → ${issue.fix}` : '';
  return `  ${tag} [${issue.code}] ${issue.asset}: ${issue.message}${fix}`;
}
