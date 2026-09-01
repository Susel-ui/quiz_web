import { useState, useEffect, useRef } from 'react';
import { formatTimer } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

interface TimerProps {
  totalSeconds: number;
  onExpire:     () => void;
}

export default function Timer({ totalSeconds, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (remaining <= 0) {
      onExpireRef.current();
      return;
    }
    const id = setInterval(() => {
      setRemaining((t) => {
        if (t <= 1) {
          clearInterval(id);
          onExpireRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);  // Run once on mount

  const percentLeft = (remaining / totalSeconds) * 100;
  const isWarning   = remaining < 120; // last 2 minutes
  const isCritical  = remaining < 30;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-body-sm font-medium transition-colors',
        isCritical
          ? 'bg-red-100 text-gap-critical dark:bg-red-900/40 dark:text-red-400 animate-pulse-soft'
          : isWarning
          ? 'bg-amber-100 text-gap-warning dark:bg-amber-900/40 dark:text-amber-400'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      )}
      role="timer"
      aria-label={`Time remaining: ${formatTimer(remaining)}`}
      aria-live={isCritical ? 'assertive' : 'polite'}
    >
      <span aria-hidden="true">⏱</span>
      {formatTimer(remaining)}
    </div>
  );
}
