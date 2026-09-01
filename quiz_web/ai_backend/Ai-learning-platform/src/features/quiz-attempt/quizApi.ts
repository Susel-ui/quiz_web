import { apiClient } from '../../lib/apiClient';
import type { Quiz, QuizAttemptRequest, QuizResult } from '../../types/api';

export const quizApi = {
  getQuiz: (id: string) =>
    apiClient.get<Quiz>(`/quizzes/${id}`).then((r) => r.data),

  submitAttempt: (id: string, payload: QuizAttemptRequest) =>
    apiClient.post<QuizResult>(`/quizzes/${id}/attempt`, payload).then((r) => r.data),

  getResults: (id: string) =>
    apiClient.get<QuizResult>(`/quizzes/${id}/results`).then((r) => r.data),
};
