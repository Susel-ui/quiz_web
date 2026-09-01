import { motion } from 'framer-motion';
import { useCompetencyGaps } from '../features/competency-gap/hooks/useCompetencyGaps';
import { useRecommendations } from '../features/recommendations/hooks/useRecommendations';
import CompetencyRadar from '../components/charts/CompetencyRadar';
import GapSummaryCard from '../features/competency-gap/components/GapSummaryCard';
import CourseCard from '../features/recommendations/components/CourseCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { staggerContainer, staggerContainerFast } from '../animations/motionConfig';
import { Link } from 'react-router-dom';

function DashboardContent() {
  const { data: gapData, isLoading: gapsLoading, isError: gapsError } = useCompetencyGaps();
  const { data: recData, isLoading: recsLoading } = useRecommendations();

  if (gapsLoading || recsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" className="text-primary-600" label="Loading dashboard data…" />
      </div>
    );
  }

  if (gapsError || !gapData) {
    return (
      <EmptyState
        icon="⚠"
        title="Unable to load dashboard"
        message="We couldn't fetch your competency profile. Please try again."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-1 text-slate-800 dark:text-slate-100">Welcome back</h1>
        <p className="text-body text-slate-500 mt-1">Here is a summary of your competency profile and learning paths.</p>
      </div>

      {/* Summary Cards */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        aria-label="Competency gap summary"
      >
        <GapSummaryCard
          label="Total Domains"
          count={gapData.scores.length}
          severity="total"
          subtitle="Assessed"
        />
        <GapSummaryCard
          label="Critical Gaps"
          count={gapData.criticalCount}
          severity="critical"
          subtitle="> 60% gap"
          delay={0.1}
        />
        <GapSummaryCard
          label="Needs Work"
          count={gapData.warningCount}
          severity="warning"
          subtitle="30-60% gap"
          delay={0.2}
        />
        <GapSummaryCard
          label="On Track"
          count={gapData.okCount}
          severity="ok"
          subtitle="< 30% gap"
          delay={0.3}
        />
      </motion.section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Radar Chart Area */}
        <section className="lg:col-span-1 bg-white dark:bg-surface-dark-card rounded-2xl p-6 shadow-card-sm border border-surface-border dark:border-surface-dark-border flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-heading-3 text-slate-800 dark:text-slate-100">Profile Overview</h2>
            <Link to="/gap-analysis" className="text-body-sm font-medium text-accent-600 hover:text-accent-700">
              Details →
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <CompetencyRadar scores={gapData.scores} />
          </div>
        </section>

        {/* Recommendations Area */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-heading-3 text-slate-800 dark:text-slate-100">Recommended for You</h2>
            <Link to="/recommendations" className="text-body-sm font-medium text-accent-600 hover:text-accent-700">
              View All →
            </Link>
          </div>
          
          {recData && recData.length > 0 ? (
            <motion.div
              variants={staggerContainerFast}
              initial="hidden"
              animate="visible"
              className="grid sm:grid-cols-2 gap-4"
            >
              {/* Show top 2 recommendations on dashboard */}
              {recData.slice(0, 2).map((rec) => (
                <CourseCard key={rec.course.id} recommendation={rec} />
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon="📚"
              title="No courses found"
              message="You are fully on track with your competencies!"
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
