import { motion } from 'framer-motion';

interface ProgressBarProps {
  current:  number; // 1-indexed
  total:    number;
  answered: number;
}

export default function ProgressBar({ current, total, answered }: ProgressBarProps) {
  const percent = (current / total) * 100;

  return (
    <div className="w-full" role="group" aria-label="Quiz progress">
      <div className="flex items-center justify-between text-caption text-slate-500 dark:text-slate-400 mb-2">
        <span>Question {current} of {total}</span>
        <span>{answered} answered</span>
      </div>

      {/* Segment progress — one dot per question */}
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{
              backgroundColor:
                i < current - 1
                  ? '#1A3A6B'  // answered
                  : i === current - 1
                  ? '#0EA5E9'  // current
                  : '#E2E8F0', // upcoming
            }}
            layoutId={`seg-${i}`}
          />
        ))}
      </div>

      {/* Screen reader text */}
      <p className="sr-only">
        Question {current} of {total}. {answered} questions answered so far.
      </p>
    </div>
  );
}
