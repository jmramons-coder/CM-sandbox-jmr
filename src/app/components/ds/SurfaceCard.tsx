import type { ComponentProps } from 'react';
import { cn } from '../ui/utils';

export function SurfaceCard({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-default bg-surface-card shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function SurfaceCardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center justify-between px-5 pt-4 pb-3', className)}
      {...props}
    />
  );
}

export function SurfaceCardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn('text-[13px] font-semibold text-text-heading', className)}
      {...props}
    />
  );
}
