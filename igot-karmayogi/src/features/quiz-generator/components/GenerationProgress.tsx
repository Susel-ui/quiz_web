import { motion } from 'framer-motion';
import type { JobStatusResponse } from '../../../types/api';

interface GenerationProgressProps {
  status: JobStatusResponse;
}

const STATUS_MESSAGES: Record<string, string> = {
  queued:     'Your document is queued for processing…',
  processing: 'AI is analysing content and generating questions…',
  complete:   'Questions generated successfully!',
  failed:     'Generation failed. Please try again.',
};

export default function GenerationProgress({ status }: GenerationProgressProps) {
  const message = status.message ?? STATUS_MESSAGES[status.status];
  const isFailed = status.status === 'failed';
  const isComplete = status.status === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 py-12" role="status" aria-live="polite">
      {/* Animated icon */}
      <div className="relative w-20 h-20">
        <motion.div
          className="w-20 h-20 rounded-full border-4 border-primary-100 dark:border-primary-900"
          aria-hidden="true"
        />
        {!isComplete && !isFailed && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {isComplete ? '✅' : isFailed ? '❌' : '✦'}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-caption text-slate-500 mb-2">
          <span>Progress</span>
          <span>{status.progress}%</span>
        </div>
        <div
          className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={status.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Generation progress: ${status.progress}%`}
        >
          <motion.div
            className={`h-full rounded-full ${isFailed ? 'bg-gap-critical' : 'bg-accent-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${status.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <p className="text-body text-slate-700 dark:text-slate-300 text-center max-w-sm">
        {message}
      </p>
    </div>
  );
}
