import { AnimatePresence, motion } from 'framer-motion';
import type { MCQuestion } from '../../../types/api';
import { cn } from '../../../lib/utils';
import Badge from '../../../components/ui/Badge';

interface QuestionCardProps {
  question:        MCQuestion;
  selectedOptions: string[];
  onSelect:        (optionId: string) => void;
  questionNumber:  number;
  total:           number;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

export default function QuestionCard({
  question, selectedOptions, onSelect, questionNumber, total,
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Question header */}
        <div className="flex items-start gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-primary-600 text-white text-caption font-bold flex items-center justify-center shrink-0 mt-0.5">
            {questionNumber}
          </span>
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              <Badge variant="default">
                {question.type === 'multiple' ? 'Select all that apply' : 'Single answer'}
              </Badge>
              <Badge variant={question.difficulty === 'easy' ? 'accent' : question.difficulty === 'medium' ? 'warning' : 'error'}>
                {question.difficulty}
              </Badge>
            </div>
            <p
              className="text-heading-3 text-slate-800 dark:text-slate-100 leading-snug"
              id={`question-${question.id}`}
            >
              {question.questionText}
            </p>
          </div>
        </div>

        {/* Options */}
        <fieldset aria-labelledby={`question-${question.id}`}>
          <legend className="sr-only">
            {question.type === 'single' ? 'Select one answer' : 'Select all correct answers'}
          </legend>
          <div className="space-y-3 ml-11" role="group">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOptions.includes(opt.id);
              const inputType  = question.type === 'single' ? 'radio' : 'checkbox';

              return (
                <motion.label
                  key={opt.id}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.998 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                  )}
                >
                  <input
                    type={inputType}
                    name={question.id}
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => onSelect(opt.id)}
                    className="sr-only"
                  />
                  {/* Visual checkbox/radio */}
                  <span
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 flex items-center justify-center text-body-sm font-semibold shrink-0 transition-all duration-150',
                      isSelected
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-slate-500',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected ? '✓' : OPTION_LABELS[idx]}
                  </span>
                  <span className={cn(
                    'text-body',
                    isSelected ? 'text-primary-800 dark:text-primary-200 font-medium' : 'text-slate-700 dark:text-slate-300',
                  )}>
                    {opt.text}
                  </span>
                </motion.label>
              );
            })}
          </div>
        </fieldset>
      </motion.div>
    </AnimatePresence>
  );
}
