import { Clock } from 'lucide-react';
import { cn } from '../ui/utils';

export function TimeBadge({
  label,
  title,
  className,
}: {
  label: string;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex h-[20px] shrink-0 items-center justify-center gap-[4px] rounded-[6px] border-[1.5px] border-border-default bg-surface-muted px-[6px] py-0 align-middle text-[11px] font-bold leading-none tracking-[0.2px] text-text-secondary',
        className,
      )}
    >
      <Clock className="size-3 shrink-0" />
      {label}
    </span>
  );
}
