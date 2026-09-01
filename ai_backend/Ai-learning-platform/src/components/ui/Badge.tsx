import { cn } from '../../lib/utils';
import type { GapSeverity } from '../../types/api';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | GapSeverity;

interface BadgeProps {
  variant?:  BadgeVariant;
  children:  React.ReactNode;
  icon?:     React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:   'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  primary:   'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
  accent:    'bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-300',
  success:   'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  warning:   'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  error:     'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  critical:  'bg-red-100 text-gap-critical dark:bg-red-900/40 dark:text-red-400',
  ok:        'bg-green-100 text-gap-ok dark:bg-green-900/40 dark:text-green-400',
};

export default function Badge({ variant = 'default', children, icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
