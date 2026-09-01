import { http, HttpResponse, delay } from 'msw';
import { MOCK_COMPETENCY_GAP } from '../data/seedData';

export const competencyHandlers = [
  http.get('/api/competency-gaps/:userId', async () => {
    await delay({ min: 300, max: 600 });
    return HttpResponse.json(MOCK_COMPETENCY_GAP);
  }),
];
