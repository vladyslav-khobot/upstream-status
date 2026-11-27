import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';

import { shouldRetry } from './api/queries';
import { ErrorState } from './components/ErrorState';
import { routeTree } from './routeTree.gen';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
    },
  },
});

export const router = createRouter({
  routeTree,
  context: { queryClient },
  // Start loading a page's data when its link is hovered or focused.
  defaultPreload: 'intent',
  // Freshness is TanStack Query's job; let the router always ask it instead of caching loader results itself.
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: ({ error, reset }) => <ErrorState error={error} onRetry={reset} />,
  scrollRestoration: true,
});
