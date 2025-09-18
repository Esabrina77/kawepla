'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';

export const ServiceWorkerProvider = () => {
  useServiceWorker();
  return null;
}; 