import { motion } from 'framer-motion';
import { useRecommendations } from '../features/recommendations/hooks/useRecommendations';
import CourseCard from '../features/recommendations/components/CourseCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { staggerContainerFast, fadeInUp } from '../animations/motionConfig';

function RecommendationsContent() {
  const { data: recommendations, isLoading, isError } = useRecommendations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" className="text-primary-600" label="Loading recommended courses..." />
      </div>
    );
  }

  if (isError || !recommendations) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load recommendations"
        message="We encountered an error while fetching your personalized course recommendations."
      />
    );
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon="🎉"
        title="No recommended courses needed"
        message="All your competencies meet or exceed the target benchmarks."
      />
    );
  }

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-heading-1 text-slate-800 dark:text-slate-100">Recommended Courses</h1>
        <p className="text-body text-slate-500 mt-1">
          AI-curated learning pathways directly targeted at bridging your identified competency gaps.
        </p>
      </div>

      <motion.div
        variants={staggerContainerFast}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {recommendations.map((rec) => (
          <CourseCard key={rec.course.id} recommendation={rec} />
        ))}
      </motion.div>
    </motion.div>
  );
}

export default function RecommendationsPage() {
  return (
    <ErrorBoundary>
      <RecommendationsContent />
    </ErrorBoundary>
  );
}
