import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import type { QuizResult } from '../../../types/api';
import { staggerContainer, fadeInUp } from '../../../animations/motionConfig';
import { cn, formatTimer, progressColor } from '../../../lib/utils';

interface ResultsBreakdownProps {
  result: QuizResult;
}

export default function ResultsBreakdown({ result }: ResultsBreakdownProps) {
  const { percentScore, passed, score, totalMarks, timeTakenSeconds, topicBreakdowns } = result;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Score hero */}
      <motion.div
        variants={fadeInUp}
        className={cn(
          'rounded-2xl p-8 text-center border-2',
          passed
            ? 'bg-green-50 dark:bg-green-900/20 border-gap-ok'
            : 'bg-red-50 dark:bg-red-900/20 border-gap-critical',
        )}
        role="region"
        aria-label={`Quiz result: ${percentScore}% — ${passed ? 'Passed' : 'Failed'}`}
      >
        <div className="text-5xl mb-3" aria-hidden="true">
          {passed ? '🎉' : '📚'}
        </div>
        <p className={cn('text-body-sm font-semibold uppercase tracking-wide mb-2', passed ? 'text-gap-ok' : 'text-gap-critical')}>
          {passed ? 'Passed' : 'Not Yet Passed'}
        </p>
        <div
          className="text-display-1 font-bold mb-1"
          style={{ color: progressColor(percentScore) }}
        >
          <CountUp end={percentScore} suffix="%" duration={1.5} />
        </div>
        <p className="text-body text-slate-600 dark:text-slate-400">
          {score} / {totalMarks} marks · {formatTimer(timeTakenSeconds)} taken
        </p>
      </motion.div>

      {/* Topic breakdown */}
      <motion.div variants={fadeInUp}>
        <h3 className="text-heading-3 text-slate-800 dark:text-slate-100 mb-4">Topic Breakdown</h3>
        <div className="space-y-3">
          {topicBreakdowns.map((t) => (
            <div
              key={t.topic}
              className={cn(
                'p-4 rounded-xl border',
                t.isWeakArea
                  ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-body">
                    {t.isWeakArea ? '⚠' : '✓'}
                  </span>
                  <span className="text-body-sm font-medium text-slate-800 dark:text-slate-100">
                    {t.topic}
                  </span>
                  {t.isWeakArea && (
                    <span className="text-caption bg-red-100 dark:bg-red-900/40 text-gap-critical px-2 py-0.5 rounded-full font-medium">
                      Weak area
                    </span>
                  )}
                </div>
                <span
                  className="text-body-sm font-semibold tabular-nums"
                  style={{ color: progressColor(t.percentCorrect) }}
                >
                  {t.correct}/{t.total}
                </span>
              </div>
              <div
                className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={t.percentCorrect}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${t.topic}: ${t.percentCorrect}% correct`}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: progressColor(t.percentCorrect) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${t.percentCorrect}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
