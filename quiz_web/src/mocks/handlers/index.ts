import { competencyHandlers }    from './competencyHandlers';
import { recommendationsHandlers } from './recommendationsHandlers';
import { quizHandlers }           from './quizHandlers';

export const handlers = [
  ...competencyHandlers,
  ...recommendationsHandlers,
  ...quizHandlers,
];
