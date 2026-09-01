import { apiClient } from '../../lib/apiClient';
import type { UploadJobResponse, JobStatusResponse, Quiz } from '../../types/api';

export const quizGeneratorApi = {
  uploadMaterial: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<UploadJobResponse>('/quiz-generator/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  getJobStatus: (jobId: string) =>
    apiClient.get<JobStatusResponse>(`/quiz-generator/status/${jobId}`).then((r) => r.data),

  getQuiz: (quizId: string) =>
    apiClient.get<Quiz>(`/quizzes/${quizId}`).then((r) => r.data),
};
