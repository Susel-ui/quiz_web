import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizApi } from '../features/quiz-attempt/quizApi';
import ResultsBreakdown from '../features/quiz-attempt/components/ResultsBreakdown';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';

function QuizResultsContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['quiz-results', id],
    queryFn: () => quizApi.getResults(id ?? 'quiz-001'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-primary-600" label="Analyzing assessment results..." />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <EmptyState
        icon="⚠️"
        title="Results not available"
        message="Unable to retrieve results for this assessment."
        action={<Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-heading-1 text-slate-800 dark:text-slate-100">Assessment Results</h1>
        <p className="text-body text-slate-500 mt-1">
          Detailed performance breakdown and competency updates based on your responses.
        </p>
      </div>

      <ResultsBreakdown result={result} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-surface-border dark:border-surface-dark-border">
        <Link to="/gap-analysis">
          <Button variant="outline">
            View Updated Gap Profile →
          </Button>
        </Link>
        <div className="flex gap-3">
          <Link to={`/quiz/${id ?? 'quiz-001'}`}>
            <Button variant="ghost">Retake Quiz</Button>
          </Link>
          <Link to="/recommendations">
            <Button variant="primary">Explore Learning Paths</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function QuizResultsPage() {
  return (
    <ErrorBoundary>
      <QuizResultsContent />
    </ErrorBoundary>
  );
}
