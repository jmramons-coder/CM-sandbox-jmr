import { cn } from '../ui/utils';

type Priority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

const PRIORITY_STYLES: Record<Priority, string> = {
  URGENT: 'border-brand-red/30 bg-brand-red/10 text-brand-red',
  HIGH: 'border-brand-amber/30 bg-brand-amber/10 text-brand-orange',
  NORMAL: 'border-border-default bg-surface-muted text-text-secondary',
  LOW: 'border-border-default bg-surface-muted text-text-secondary',
};

const PRIORITY_DOT_STYLES: Record<Priority, string> = {
  URGENT: 'bg-brand-red',
  HIGH: 'bg-brand-amber',
  NORMAL: 'bg-text-secondary',
  LOW: 'bg-text-secondary',
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[20px] shrink-0 items-center justify-center gap-[4px] rounded-[6px] border-[1.5px] px-[6px] py-0 align-middle text-[11px] font-bold uppercase leading-none tracking-[0.4px]',
        PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.NORMAL,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', PRIORITY_DOT_STYLES[priority] ?? PRIORITY_DOT_STYLES.NORMAL)} />
      {priority}
    </span>
  );
}
