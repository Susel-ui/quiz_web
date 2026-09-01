import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { scaleIn } from '../../../animations/motionConfig';
import { GAP_SEVERITY_CONFIG } from '../../../lib/utils';
import type { GapSeverity } from '../../../types/api';

interface GapSummaryCardProps {
  label:    string;
  count:    number;
  severity: GapSeverity | 'total';
  subtitle?: string;
  delay?:   number;
}

const TOTAL_CONFIG = {
  label: 'Total Domains',
  pillClass: 'bg-primary-100 text-primary-700',
  color: '#1A3A6B',
  icon: '◎',
};

export default function GapSummaryCard({ label, count, severity, subtitle, delay = 0 }: GapSummaryCardProps) {
  const cfg = severity === 'total' ? TOTAL_CONFIG : GAP_SEVERITY_CONFIG[severity];

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="bg-white dark:bg-surface-dark-card rounded-xl p-5 shadow-card-sm border border-surface-border dark:border-surface-dark-border flex flex-col gap-2"
      role="region"
      aria-label={`${label}: ${count}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-caption font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        <span
          className={`text-xl ${severity === 'total' ? '' : ''}`}
          style={{ color: cfg.color }}
          aria-hidden="true"
        >
          {cfg.icon}
        </span>
      </div>
      <div className="text-display-2 font-bold" style={{ color: cfg.color }}>
        <CountUp end={count} duration={1.2} delay={delay} />
      </div>
      {subtitle && (
        <p className="text-caption text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </motion.div>
  );
}
