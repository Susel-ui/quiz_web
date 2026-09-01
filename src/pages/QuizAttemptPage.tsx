import { useParams, useNavigate } from 'react-router-dom';
import { useQuizAttempt } from '../features/quiz-attempt/hooks/useQuizAttempt';
import QuestionCard from '../features/quiz-attempt/components/QuestionCard';
import ProgressBar from '../features/quiz-attempt/components/ProgressBar';
import Timer from '../features/quiz-attempt/components/Timer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';

function QuizAttemptContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    quizQuery,
    quiz,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedOptions,
    answeredCount,
    isLastQuestion,
    submitMutation,
    selectOption,
    goNext,
    goPrev,
    submitQuiz,
  } = useQuizAttempt(id ?? 'quiz-001');

  if (quizQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-primary-600" label="Loading assessment..." />
      </div>
    );
  }

  if (quizQuery.isError || !quiz || !currentQuestion) {
    return (
      <EmptyState
        icon="⚠️"
        title="Assessment not found"
        message="The requested quiz could not be loaded. Please return to your dashboard."
        action={<Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-dark-card p-4 rounded-xl border border-surface-border dark:border-surface-dark-border shadow-card-sm">
        <div>
          <h1 className="text-heading-3 text-slate-800 dark:text-slate-100">{quiz.title}</h1>
          <p className="text-caption text-slate-500">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Timer totalSeconds={quiz.timeLimitSeconds} onExpire={submitQuiz} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-surface-dark-card p-4 rounded-xl border border-surface-border dark:border-surface-dark-border shadow-card-sm">
        <ProgressBar
          current={currentIndex + 1}
          total={totalQuestions}
          answered={answeredCount}
        />
      </div>

      {/* Active Question Card */}
      <Card className="p-6 md:p-8">
        <QuestionCard
          question={currentQuestion}
          selectedOptions={selectedOptions}
          onSelect={selectOption}
          questionNumber={currentIndex + 1}
          total={totalQuestions}
        />

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            ← Previous
          </Button>

          {isLastQuestion ? (
            <Button
              variant="primary"
              onClick={submitQuiz}
              loading={submitMutation.isPending}
            >
              Submit Assessment
            </Button>
          ) : (
            <Button variant="primary" onClick={goNext}>
              Next Question →
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function QuizAttemptPage() {
  return (
    <ErrorBoundary>
      <QuizAttemptContent />
    </ErrorBoundary>
  );
}
