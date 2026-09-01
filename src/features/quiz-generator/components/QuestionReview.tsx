import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Quiz } from '../../../types/api';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { cn } from '../../../lib/utils';

interface QuestionReviewProps {
  quiz:      Quiz;
  onPublish: (quiz: Quiz) => void;
}

// Zod schema for editable question fields
const questionSchema = z.object({
  questions: z.array(z.object({
    id:           z.string(),
    questionText: z.string().min(10, 'Question must be at least 10 characters'),
    explanation:  z.string().min(5, 'Please add an explanation'),
    options:      z.array(z.object({
      id:        z.string(),
      text:      z.string().min(1, 'Option text required'),
      isCorrect: z.boolean(),
    })).min(2),
  })),
});

type FormValues = z.infer<typeof questionSchema>;

const DIFFICULTY_BADGE: Record<string, 'accent' | 'warning' | 'error'> = {
  easy:   'accent',
  medium: 'warning',
  hard:   'error',
};

export default function QuestionReview({ quiz, onPublish }: QuestionReviewProps) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: { questions: quiz.questions },
  });

  const { fields } = useFieldArray({ control, name: 'questions' });

  const onSubmit = (data: FormValues) => {
    const updated: Quiz = {
      ...quiz,
      questions: data.questions.map((q, i) => ({
        ...quiz.questions[i],
        ...q,
      })),
    };
    onPublish(updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-heading-2 text-slate-800 dark:text-slate-100">{quiz.title}</h2>
          <p className="text-body-sm text-slate-500 mt-1">
            Review and edit AI-generated questions before publishing
          </p>
        </div>
        <Button type="submit" variant="primary">
          Publish Quiz
        </Button>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => {
          const q = quiz.questions[index];
          return (
            <div
              key={field.id}
              className="bg-white dark:bg-surface-dark-card rounded-xl border border-surface-border dark:border-surface-dark-border p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center text-caption font-bold shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <Badge variant={DIFFICULTY_BADGE[q.difficulty]}>{q.difficulty}</Badge>
                    <Badge variant="default">{q.type === 'multiple' ? 'Multiple select' : 'Single select'}</Badge>
                    {q.bloomsLevel && <Badge variant="primary">{q.bloomsLevel}</Badge>}
                  </div>
                  <textarea
                    {...register(`questions.${index}.questionText`)}
                    className={cn(
                      'w-full text-body font-medium text-slate-800 dark:text-slate-100 bg-transparent resize-none',
                      'border border-transparent rounded-lg px-2 py-1 -mx-2 -my-1',
                      'hover:border-slate-200 dark:hover:border-slate-700 focus:border-accent-500 focus:outline-none transition-colors',
                      errors.questions?.[index]?.questionText && 'border-gap-critical',
                    )}
                    rows={2}
                  />
                  {errors.questions?.[index]?.questionText && (
                    <p role="alert" className="text-caption text-gap-critical mt-1">
                      {errors.questions[index]?.questionText?.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="ml-10 space-y-2">
                {q.options.map((opt, optIdx) => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center',
                        opt.isCorrect
                          ? 'border-gap-ok bg-gap-ok text-white text-caption'
                          : 'border-slate-300 dark:border-slate-600',
                      )}
                      aria-label={opt.isCorrect ? 'Correct answer' : 'Incorrect answer'}
                    >
                      {opt.isCorrect && '✓'}
                    </span>
                    <input
                      {...register(`questions.${index}.options.${optIdx}.text`)}
                      className={cn(
                        'flex-1 text-body-sm text-slate-700 dark:text-slate-300 bg-transparent',
                        'border border-transparent rounded px-1.5 py-0.5 -mx-1.5',
                        'hover:border-slate-200 dark:hover:border-slate-700 focus:border-accent-500 focus:outline-none transition-colors',
                        opt.isCorrect && 'font-medium text-gap-ok',
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="ml-10 mt-3 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-caption font-semibold text-slate-500 dark:text-slate-400 mb-1">Explanation</p>
                <textarea
                  {...register(`questions.${index}.explanation`)}
                  className="w-full text-caption text-slate-600 dark:text-slate-300 bg-transparent resize-none focus:outline-none"
                  rows={2}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" variant="primary" size="lg">
          Publish {fields.length} Questions
        </Button>
      </div>
    </form>
  );
}
