import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../ui/utils';

export function ScrollArea({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('app-scrollbar', className)} {...props}>
      {children}
    </div>
  );
}
