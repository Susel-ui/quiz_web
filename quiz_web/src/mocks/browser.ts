import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// The service worker is only started in development.
// In production (VITE_MOCK=false), this file is never imported.
export const worker = setupWorker(...handlers);
