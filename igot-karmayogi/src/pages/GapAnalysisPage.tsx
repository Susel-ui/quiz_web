import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCompetencyGaps } from '../features/competency-gap/hooks/useCompetencyGaps';
import GapBreakdownTable from '../features/competency-gap/components/GapBreakdownTable';
import GapBarChart from '../components/charts/GapBarChart';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { fadeInUp } from '../animations/motionConfig';

function GapAnalysisContent() {
  const { data, isLoading, isError } = useCompetencyGaps();
  const [filter, setFilter] = useState<string | null>(null);

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  if (isError || !data) return <EmptyState title="Error loading gaps" />;

  const categories = Array.from(new Set(data.scores.map(s => s.domain.category)));

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-heading-1 text-slate-800 dark:text-slate-100">Gap Analysis</h1>
        <p className="text-body text-slate-500 mt-1">Detailed breakdown of your competencies against role requirements.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-surface-dark-card p-5 rounded-xl border border-surface-border dark:border-surface-dark-border shadow-card-sm">
          <h2 className="text-heading-3 mb-4">Largest Gaps</h2>
          <GapBarChart scores={data.scores} height={320} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setFilter(null)}
              className={`px-3 py-1.5 rounded-full text-body-sm font-medium whitespace-nowrap transition-colors ${!filter ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
            >
              All Categories
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-full text-body-sm font-medium whitespace-nowrap transition-colors ${filter === c ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <GapBreakdownTable scores={data.scores} filter={filter} />
        </div>
      </div>
    </motion.div>
  );
}

export default function GapAnalysisPage() {
  return (
    <ErrorBoundary>
      <GapAnalysisContent />
    </ErrorBoundary>
  );
}
