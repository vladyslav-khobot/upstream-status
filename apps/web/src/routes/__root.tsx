import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { NotFound } from '../components/NotFound';
import type { RouterContext } from '../types';

// Loaded only in development, so the router devtools never end up in the production bundle.
const RouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then(({ TanStackRouterDevtools }) => ({
        default: TanStackRouterDevtools,
      })),
    )
  : () => null;

const RootLayout = () => (
  <div className="flex min-h-dvh flex-col">
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <img src="/favicon.svg" alt="" className="size-6" />
          Upstream
        </Link>
      </div>
    </header>

    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Outlet />
    </main>

    <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500">
      Data from each provider&apos;s public status page.
    </footer>

    <ReactQueryDevtools buttonPosition="bottom-left" />
    <Suspense>
      <RouterDevtools position="bottom-right" />
    </Suspense>
  </div>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
});
