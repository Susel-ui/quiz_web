import { motion } from 'framer-motion';
import { fadeInUp } from '../../../animations/motionConfig';
import type { Recommendation } from '../../../types/api';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { formatDuration } from '../../../lib/utils';

interface CourseCardProps {
  recommendation: Recommendation;
}

const FORMAT_ICONS: Record<string, string> = {
  video:       '▶',
  text:        '📄',
  interactive: '⚡',
  workshop:    '👥',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'accent',
  intermediate: 'warning',
  advanced:     'error',
} as const;

export default function CourseCard({ recommendation: rec }: CourseCardProps) {
  const { course, whyRecommended, estimatedGapFill, relevanceScore } = rec;

  return (
    <motion.article
      variants={fadeInUp}
      className="bg-white dark:bg-surface-dark-card rounded-xl border border-surface-border dark:border-surface-dark-border shadow-card-sm hover:shadow-card-md transition-shadow duration-200 flex flex-col overflow-hidden"
      aria-label={`Course: ${course.title}`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-heading-3 text-slate-800 dark:text-slate-100 leading-snug mb-1 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-caption text-slate-500 dark:text-slate-400">{course.provider}</p>
          </div>
          <span
            className="text-xl shrink-0 text-slate-400"
            aria-label={`Format: ${course.format}`}
            title={course.format}
          >
            {FORMAT_ICONS[course.format]}
          </span>
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={LEVEL_COLORS[course.level] as 'accent' | 'warning' | 'error'}>
            {course.level}
          </Badge>
          <Badge variant="default">
            ⏱ {formatDuration(course.durationMinutes)}
          </Badge>
          <Badge variant="accent">
            ↑ {estimatedGapFill}% gap fill
          </Badge>
        </div>

        {/* AI explanation */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-lg p-3">
          <p className="text-caption font-semibold text-primary-700 dark:text-primary-300 mb-1 flex items-center gap-1">
            <span aria-hidden="true">✦</span> Why recommended
          </p>
          <p className="text-caption text-primary-800 dark:text-primary-200 leading-relaxed">
            {whyRecommended}
          </p>
        </div>
      </div>

      {/* Competency domains */}
      <div className="px-5 pb-3">
        <div className="flex flex-wrap gap-1">
          {rec.targetDomains.map((d) => (
            <span
              key={d.id}
              className="text-caption bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
            >
              {d.name}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-2 border-t border-surface-border dark:border-surface-dark-border mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-caption text-slate-400">
            {Math.round(relevanceScore * 100)}% match
          </span>
          <a
            href={course.iGOTCourseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-body-sm font-medium rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            aria-label={`Enrol in ${course.title} on iGOT (opens in new tab)`}
          >
            Enrol on iGOT ↗
          </a>
        </div>
      </div>
    </motion.article>
  );
}
