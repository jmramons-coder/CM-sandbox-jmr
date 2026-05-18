import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const headline = isRouteErrorResponse(error)
    ? error.status === 404
      ? "We couldn't find that page"
      : 'Something went wrong'
    : 'Something went wrong';

  const description = isRouteErrorResponse(error)
    ? error.statusText || 'The page you were looking for is no longer available.'
    : 'An unexpected error stopped this view from loading. You can try again or head back to a safe place.';

  return (
    <div className="flex h-full min-h-[520px] w-full flex-col bg-surface-primary px-6 py-10">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex max-w-[460px] flex-col items-center text-center">
        <div className="mb-5 flex size-[96px] items-center justify-center rounded-2xl border border-border-soft bg-white text-brand-blue shadow-[0_1px_2px_rgba(27,28,30,0.04)]" aria-hidden="true">
          <AlertTriangle className="size-10" />
        </div>
        <h1 className="text-[20px] font-semibold text-text-primary">{headline}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{description}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-white px-4 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          >
            <ArrowLeft className="size-3.5" />
            Go back
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-brand-blue-hover"
          >
            <RefreshCw className="size-3.5" />
            Try again
          </button>
        </div>

        {error instanceof Error && error.message ? (
          <details className="mt-6 w-full text-left">
            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.4px] text-text-muted">
              Technical details
            </summary>
            <pre className="mt-2 max-h-[180px] overflow-auto rounded-md bg-surface-muted px-3 py-2 text-left text-[11px] leading-relaxed text-text-secondary">
              {error.message}
            </pre>
          </details>
        ) : null}
        </div>
      </div>
    </div>
  );
}
