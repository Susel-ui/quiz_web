import type { GapSeverity } from '../types/api';

// ── Class name merging (lightweight alternative to clsx) ─────────────────────
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ── Gap severity helpers ──────────────────────────────────────────────────────
export function getGapSeverity(gapPercent: number): GapSeverity {
  if (gapPercent > 60) return 'critical';
  if (gapPercent > 30) return 'warning';
  return 'ok';
}

export const GAP_SEVERITY_CONFIG: Record<GapSeverity, {
  label:    string;
  pillClass: string;
  color:    string; // for charts (Recharts doesn't use Tailwind classes)
  icon:     string; // unicode/emoji fallback for ARIA
}> = {
  critical: { label: 'Critical',  pillClass: 'gap-pill--critical', color: '#DC2626', icon: '⚠' },
  warning:  { label: 'Needs Work', pillClass: 'gap-pill--warning', color: '#D97706', icon: '○' },
  ok:       { label: 'On Track',  pillClass: 'gap-pill--ok',       color: '#16A34A', icon: '✓' },
};

// ── Duration formatting ───────────────────────────────────────────────────────
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Countdown timer ───────────────────────────────────────────────────────────
export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Pluralise ─────────────────────────────────────────────────────────────────
export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

// ── Truncate text ─────────────────────────────────────────────────────────────
export function truncate(str: string, maxLen: number): string {
  return str.length <= maxLen ? str : `${str.slice(0, maxLen - 1)}…`;
}

// ── Percent bar colour ────────────────────────────────────────────────────────
export function progressColor(percent: number): string {
  if (percent >= 80) return '#16A34A'; // green
  if (percent >= 50) return '#D97706'; // amber
  return '#DC2626'; // red
}
