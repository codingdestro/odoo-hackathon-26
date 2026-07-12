export function ErrorBanner({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
      <p className="text-sm text-rose-700 font-medium">Error</p>
      <p className="text-sm text-rose-600 mt-0.5">{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-xs text-blue-600 hover:underline">
          Retry
        </button>
      )}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return <p className="text-sm text-red-500">{message}</p>;
}
