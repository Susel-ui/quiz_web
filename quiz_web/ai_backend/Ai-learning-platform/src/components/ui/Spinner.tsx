import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?:      'sm' | 'md' | 'lg';
  className?: string;
  label?:     string; // accessible label
}

const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export default function Spinner({ size = 'md', className, label = 'Loading…' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn('inline-flex', className)}>
      <svg
        className={cn('animate-spin text-current', sizeClasses[size])}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </span>
  );
}
