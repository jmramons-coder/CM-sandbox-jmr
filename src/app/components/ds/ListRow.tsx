import type { ComponentProps } from 'react';
import { cn } from '../ui/utils';

export function ListRow({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-hover',
        className,
      )}
      {...props}
    />
  );
}
