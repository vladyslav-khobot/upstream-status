import { Link } from '@tanstack/react-router';

export const NotFound = () => (
  <div className="py-20 text-center">
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <Link to="/" className="mt-4 inline-block text-sm underline underline-offset-2">
      Back to all services
    </Link>
  </div>
);
