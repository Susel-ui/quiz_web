import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../quizApi';
import type { QuizAnswer } from '../../../types/api';
import { useAuthStore } from '../../../store/authStore';

export function useQuizAttempt(quizId: string) {
  const navigate   = useNavigate();
  const userId     = useAuthStore((s) => s.user?.id ?? '');
  const startTime  = useRef<number>(Date.now());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState<Map<string, string[]>>(new Map());
  const [questionStartTime, setQStartTime] = useState<number>(Date.now());

  const quizQuery = useQuery({
    queryKey: ['quiz', quizId],
    queryFn:  () => quizApi.getQuiz(quizId),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: Parameters<typeof quizApi.submitAttempt>[1]) =>
      quizApi.submitAttempt(quizId, payload),
    onSuccess: () => navigate(`/quiz/${quizId}/results`),
  });

  const quiz = quizQuery.data;
  const currentQuestion = quiz?.questions[currentIndex];
  const totalQuestions  = quiz?.questions.length ?? 0;

  const selectOption = useCallback((optionId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const next = new Map(prev);
      const existing = next.get(currentQuestion.id) ?? [];

      if (currentQuestion.type === 'single') {
        // Single select: replace
        next.set(currentQuestion.id, [optionId]);
      } else {
        // Multiple select: toggle
        const toggled = existing.includes(optionId)
          ? existing.filter((id) => id !== optionId)
          : [...existing, optionId];
        next.set(currentQuestion.id, toggled);
      }
      return next;
    });
  }, [currentQuestion]);

  const goNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setQStartTime(Date.now());
    }
  }, [currentIndex, totalQuestions]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setQStartTime(Date.now());
    }
  }, [currentIndex]);

  const submitQuiz = useCallback(() => {
    if (!quiz) return;
    const compiledAnswers: QuizAnswer[] = quiz.questions.map((q) => ({
      questionId:        q.id,
      selectedOptionIds: answers.get(q.id) ?? [],
      timeTakenSeconds:  Math.floor((Date.now() - questionStartTime) / 1000),
    }));

    submitMutation.mutate({
      quizId:  quiz.id,
      answers: compiledAnswers,
    });
  }, [quiz, answers, questionStartTime, submitMutation]);

  const selectedOptions = currentQuestion ? (answers.get(currentQuestion.id) ?? []) : [];
  const answeredCount   = answers.size;
  const isLastQuestion  = currentIndex === totalQuestions - 1;

  return {
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
  };
}
