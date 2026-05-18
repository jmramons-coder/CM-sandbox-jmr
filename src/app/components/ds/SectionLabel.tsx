import type { ComponentProps } from 'react';
import { cn } from '../ui/utils';

export function SectionLabel({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'text-[11px] font-semibold uppercase tracking-wide text-text-muted',
        className,
      )}
      {...props}
    />
  );
}
