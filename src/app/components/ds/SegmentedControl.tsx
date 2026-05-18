import type { ElementType } from 'react';
import { cn } from '../ui/utils';

interface SegmentOption<T extends string> {
  key: T;
  label: string;
  icon?: ElementType;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'default' | 'compact';
  tone?: 'surface' | 'neutral';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'default',
  tone = 'surface',
}: SegmentedControlProps<T>) {
  const isCompact = size === 'compact';
  return (
    <div
      role="radiogroup"
      className={cn(
        'flex border',
        isCompact
          ? 'rounded-lg border-[#d9dee5] bg-[#f7f8fa] p-0.5 text-[11px]'
          : 'rounded-full border-border-soft bg-surface-card p-0.5 text-[11px]',
        !isCompact && tone === 'neutral' ? 'border-border-default bg-white' : null,
        className,
      )}
    >
      {options.map((opt) => {
        const active = value === opt.key;
        const Icon = opt.icon;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.key)}
            className={cn(
              'inline-flex items-center justify-center leading-none transition-colors',
              isCompact
                ? 'h-6 min-w-[58px] rounded-md px-2 font-semibold'
                : 'gap-1 rounded-full px-3 py-1 font-normal',
              active && isCompact
                ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(27,28,30,0.12)]'
                : null,
              active && !isCompact
                ? tone === 'neutral'
                  ? 'bg-[#f1f3f5] font-medium text-text-primary'
                  : 'bg-surface-muted font-medium text-text-primary'
                : null,
              !active && isCompact
                ? 'text-text-muted hover:bg-white/70 hover:text-text-primary'
                : null,
              !active && !isCompact ? 'text-text-muted hover:text-text-secondary' : null,
            )}
          >
            {Icon && !isCompact ? <Icon className="size-3" /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
