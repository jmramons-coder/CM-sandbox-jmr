import { cn } from '../ui/utils';

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <p className={cn('px-5 py-8 text-center text-[12px] text-text-muted', className)}>
      {message}
    </p>
  );
}
