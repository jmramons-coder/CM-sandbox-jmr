import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../ui/utils';

interface FilterChipProps extends Omit<ComponentProps<'button'>, 'children'> {
  active?: boolean;
  dot?: string;
  label: string;
  count?: number;
  /** Non-interactive pill for table cells and labels (same visual as portfolio chips). */
  readOnly?: boolean;
}

function FilterChipContent({
  active,
  dot,
  label,
  count,
  readOnly,
}: Pick<FilterChipProps, 'active' | 'dot' | 'label' | 'count' | 'readOnly'>) {
  return (
    <>
      {dot && (readOnly || !active) && (
        <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} />
      )}
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'text-[10px] leading-none',
            active ? 'text-text-heading/60' : 'text-text-muted',
          )}
        >
          {count}
        </span>
      )}
    </>
  );
}

export function FilterChip({
  active,
  dot,
  label,
  count,
  readOnly = false,
  className,
  ...props
}: FilterChipProps) {
  const chipClassName = cn(
    'inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium leading-none transition-colors',
    active
      ? 'bg-surface-selected text-text-heading'
      : 'bg-surface-muted text-text-secondary',
    !readOnly && !active && 'hover:bg-border-soft',
    readOnly && 'pointer-events-none',
    className,
  );

  if (readOnly) {
    return (
      <span className={chipClassName}>
        <FilterChipContent active={active} dot={dot} label={label} count={count} readOnly />
      </span>
    );
  }

  return (
    <button type="button" className={chipClassName} {...props}>
      <FilterChipContent active={active} dot={dot} label={label} count={count} readOnly={readOnly} />
    </button>
  );
}

export function FilterChipGroup({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap gap-2', className)} {...props} />;
}
