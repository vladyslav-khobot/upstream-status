import type { QueryClient } from '@tanstack/react-query';

import type { router } from './router';

export interface RouterContext {
  queryClient: QueryClient;
}

// Registers the router type globally, so <Link to="..."> and hooks are type-checked against our routes.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
