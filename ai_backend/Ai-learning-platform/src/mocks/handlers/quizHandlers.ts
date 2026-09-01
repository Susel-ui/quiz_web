import { http, HttpResponse, delay } from 'msw';
import { MOCK_QUIZ, MOCK_QUIZ_RESULT } from '../data/seedData';
import type { JobStatusResponse, UploadJobResponse } from '../../types/api';

// Simulated job state — in-memory for the mock session
let jobProgress = 0;
let jobStatus: JobStatusResponse['status'] = 'queued';

export const quizHandlers = [
  // Upload material → returns jobId immediately
  http.post('/api/quiz-generator/upload', async () => {
    await delay({ min: 400, max: 800 });
    jobProgress = 0;
    jobStatus = 'queued';
    const response: UploadJobResponse = {
      jobId:     'job-001',
      status:    'queued',
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(response, { status: 202 });
  }),

  // Poll status — increments progress on each call
  http.get('/api/quiz-generator/status/:jobId', async () => {
    await delay({ min: 200, max: 400 });
    jobProgress = Math.min(jobProgress + 25, 100);
    if (jobProgress === 100) jobStatus = 'complete';
    else if (jobProgress > 0) jobStatus = 'processing';

    const response: JobStatusResponse = {
      jobId:    'job-001',
      status:   jobStatus,
      progress: jobProgress,
      message:  jobStatus === 'processing' ? 'Analysing document and generating questions…' : undefined,
      quizId:   jobStatus === 'complete' ? MOCK_QUIZ.id : undefined,
    };
    return HttpResponse.json(response);
  }),

  // Get a quiz by ID
  http.get('/api/quizzes/:id', async ({ params }) => {
    await delay({ min: 200, max: 400 });
    if (params.id === MOCK_QUIZ.id) return HttpResponse.json(MOCK_QUIZ);
    return HttpResponse.json({ message: 'Quiz not found' }, { status: 404 });
  }),

  // Submit quiz attempt
  http.post('/api/quizzes/:id/attempt', async () => {
    await delay({ min: 500, max: 900 });
    return HttpResponse.json(MOCK_QUIZ_RESULT, { status: 201 });
  }),

  // Get quiz results
  http.get('/api/quizzes/:id/results', async () => {
    await delay({ min: 200, max: 500 });
    return HttpResponse.json(MOCK_QUIZ_RESULT);
  }),

  // Auth: mock login
  http.post('/api/auth/login', async () => {
    await delay(300);
    return HttpResponse.json({
      user: {
        id: 'user-001', name: 'Priya Sharma', email: 'priya.sharma@gov.in',
        role: 'learner', department: 'Ministry of Finance',
      },
      accessToken:  'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt:    Date.now() + 3600 * 1000,
    });
  }),
];
