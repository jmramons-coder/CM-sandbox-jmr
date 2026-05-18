import { cn } from '../ui/utils';

/** Second row for entity listbox options (policy product, etc.). */
export function ListOptionSubtitle({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  if (!text?.trim()) return null;
  return (
    <p className={cn('mt-0.5 truncate text-xs text-text-muted', className)} title={text}>
      {text}
    </p>
  );
}
