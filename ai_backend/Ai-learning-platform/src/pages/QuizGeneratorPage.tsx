import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizGenerator } from '../features/quiz-generator/hooks/useQuizGenerator';
import UploadZone from '../features/quiz-generator/components/UploadZone';
import GenerationProgress from '../features/quiz-generator/components/GenerationProgress';
import QuestionReview from '../features/quiz-generator/components/QuestionReview';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import type { Quiz } from '../types/api';
import { fadeInUp } from '../animations/motionConfig';

function QuizGeneratorContent() {
  const navigate = useNavigate();
  const { step, uploadMutation, statusQuery, quizQuery, reset } = useQuizGenerator();
  const [publishedQuiz, setPublishedQuiz] = useState<Quiz | null>(null);

  const handleFile = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handlePublish = (quiz: Quiz) => {
    setPublishedQuiz(quiz);
  };

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-heading-1 text-slate-800 dark:text-slate-100">AI Assessment Generator</h1>
        <p className="text-body text-slate-500 mt-1">
          Generate structured MCQs aligned to the iGOT competency framework from learning documents.
        </p>
      </div>

      {publishedQuiz ? (
        <Card className="p-8 text-center space-y-4">
          <div className="text-5xl" aria-hidden="true">🎉</div>
          <h2 className="text-heading-2 text-slate-800 dark:text-slate-100">Quiz Published Successfully!</h2>
          <p className="text-body text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            &quot;{publishedQuiz.title}&quot; is now ready for learners. You can take the quiz now or generate another one.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="secondary" onClick={() => navigate(`/quiz/${publishedQuiz.id}`)}>
              Take Quiz Now →
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPublishedQuiz(null);
                reset();
              }}
            >
              Generate Another
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-6">
                  <h2 className="text-heading-3 text-slate-800 dark:text-slate-100 mb-1">Step 1: Upload Content</h2>
                  <p className="text-body-sm text-slate-500">
                    Upload course notes, training decks, or policy manuals to automatically formulate test questions.
                  </p>
                </div>
                <UploadZone
                  onFile={handleFile}
                  loading={uploadMutation.isPending}
                  error={uploadMutation.isError ? 'Upload failed. Please try again with a valid document.' : undefined}
                />
              </motion.div>
            )}

            {step === 'generating' && statusQuery.data && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GenerationProgress status={statusQuery.data} />
              </motion.div>
            )}

            {step === 'review' && quizQuery.data && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <QuestionReview quiz={quizQuery.data} onPublish={handlePublish} />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </motion.div>
  );
}

export default function QuizGeneratorPage() {
  return (
    <ErrorBoundary>
      <QuizGeneratorContent />
    </ErrorBoundary>
  );
}
