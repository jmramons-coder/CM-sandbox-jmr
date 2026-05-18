import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../ui/utils';

/**
 * Review block: light brand header island, preview card sits below with a small gap (same width).
 */
export function CreationReviewSection({
  children,
  subtitle,
  title,
  action,
  collapsible = true,
  open = true,
  onOpenChange,
  className,
}: {
  children: ReactNode;
  subtitle?: string;
  title: string;
  action?: ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const header = (
    <div className="flex w-full items-start justify-between gap-3 text-left">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {collapsible ? (
          <ChevronDown
            className={cn('size-4 text-text-muted transition-transform', open ? 'rotate-180' : '')}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );

  const showPreview = !collapsible || open;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="rounded-lg border border-brand-blue-border bg-brand-blue-light px-4 py-3.5 sm:px-5 sm:py-4">
        {collapsible ? (
          <button
            type="button"
            onClick={() => onOpenChange?.(!open)}
            className="flex w-full items-start"
          >
            {header}
          </button>
        ) : (
          header
        )}
      </div>
      {showPreview ? <div className="w-full">{children}</div> : null}
    </div>
  );
}
