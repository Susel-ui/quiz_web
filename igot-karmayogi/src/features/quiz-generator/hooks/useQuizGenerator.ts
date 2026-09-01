import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { quizGeneratorApi } from '../quizGeneratorApi';

type Step = 'upload' | 'generating' | 'review';

export function useQuizGenerator() {
  const [step, setStep]   = useState<Step>('upload');
  const [jobId, setJobId] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: quizGeneratorApi.uploadMaterial,
    onSuccess: (data) => {
      setJobId(data.jobId);
      setStep('generating');
    },
  });

  // Poll job status — only active when step === 'generating'
  const statusQuery = useQuery({
    queryKey: ['quiz-job-status', jobId],
    queryFn:  () => quizGeneratorApi.getJobStatus(jobId!),
    enabled:  step === 'generating' && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling once complete or failed
      if (status === 'complete' || status === 'failed') return false;
      return 2000; // poll every 2s
    },
  });

  // React to job completion
  if (statusQuery.data?.status === 'complete' && statusQuery.data.quizId && step === 'generating') {
    setQuizId(statusQuery.data.quizId);
    setStep('review');
  }

  // Fetch generated quiz for review
  const quizQuery = useQuery({
    queryKey: ['generated-quiz', quizId],
    queryFn:  () => quizGeneratorApi.getQuiz(quizId!),
    enabled:  step === 'review' && !!quizId,
  });

  const reset = () => {
    setStep('upload');
    setJobId(null);
    setQuizId(null);
  };

  return {
    step,
    uploadMutation,
    statusQuery,
    quizQuery,
    reset,
  };
}
