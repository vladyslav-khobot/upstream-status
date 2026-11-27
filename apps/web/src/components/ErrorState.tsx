import type { ErrorStateProps } from './types';

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  const message = error instanceof Error ? error.message : 'Something went wrong';
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <p className="font-medium">Could not load data</p>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
      )}
    </div>
  );
};
