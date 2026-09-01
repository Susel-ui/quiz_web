import { http, HttpResponse, delay } from 'msw';
import { MOCK_RECOMMENDATIONS } from '../data/seedData';

export const recommendationsHandlers = [
  http.get('/api/recommendations/:userId', async () => {
    await delay({ min: 300, max: 700 });
    return HttpResponse.json(MOCK_RECOMMENDATIONS);
  }),
];
