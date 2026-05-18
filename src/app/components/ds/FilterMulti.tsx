import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';

export type FilterMultiOption = {
  value: string;
  label: string;
};

export function FilterMulti({
  label,
  options,
  value,
  onChange,
  valueLabel,
  onRemove,
  clearLabel,
  selectLabel,
  selectionMode = 'multi',
  className,
  buttonClassName,
}: {
  label: string;
  options: FilterMultiOption[];
  value: string[];
  onChange: (value: string[]) => void;
  valueLabel?: string;
  onRemove?: () => void;
  clearLabel: string;
  selectLabel: string;
  selectionMode?: 'multi' | 'single';
  className?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedCount = value.length;
  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const toggleValue = (optionValue: string) => {
    if (selectionMode === 'single') {
      onChange(value.includes(optionValue) ? [] : [optionValue]);
      setOpen(false);
      return;
    }

    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((next) => !next)}
        className={cn(
          'inline-flex h-9 min-w-[168px] items-center justify-between gap-2 rounded-md border px-3 text-[13px] leading-none outline-none transition-colors hover:border-brand-blue/50 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20',
          selectedCount > 0 ? 'border-brand-blue bg-brand-blue/5 text-text-primary' : 'border-border-default',
          buttonClassName,
        )}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
          <span className="truncate">{label}</span>
          {valueLabel ? (
            <>
              <span className="text-text-secondary">:</span>
              <span className="truncate font-semibold text-text-primary">{valueLabel}</span>
            </>
          ) : selectedCount > 0 ? (
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-brand-blue text-[10px] font-semibold leading-none text-white">
              {selectedCount}
            </span>
          ) : null}
        </span>
        {onRemove ? (
          <>
            <span
              role="button"
              tabIndex={0}
              aria-label={`Remove ${label}`}
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemove();
                }
              }}
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-text-muted hover:text-text-primary"
            >
              <X className="size-3.5" />
            </span>
            <span className="h-4 w-px shrink-0 bg-border-default" />
          </>
        ) : null}
        <ChevronDown className="size-4 shrink-0 text-text-secondary" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+4px)] z-[320] flex max-h-[330px] w-[260px] flex-col overflow-hidden rounded-md border border-border-default bg-white shadow-[0_8px_24px_rgba(27,28,30,0.18)]">
          <FilterListboxHeader
            clearLabel={clearLabel}
            selectLabel={selectLabel}
            disabled={value.length === 0}
            onClear={() => onChange([])}
          />
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
            <div className={selectionMode === 'single' ? 'space-y-0.5' : 'space-y-2'}>
              {options.map((option) => (
                selectionMode === 'single' ? (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      'flex h-8 w-full items-center rounded px-3 text-left text-[13px] text-text-primary transition-colors hover:bg-surface-hover',
                      value.includes(option.value) && 'bg-brand-blue/5 font-semibold text-brand-blue',
                    )}
                  >
                    {option.label}
                  </button>
                ) : (
                  <label key={option.value} className="flex cursor-pointer items-center gap-2 text-[13px] text-text-primary">
                    <Checkbox
                      checked={value.includes(option.value)}
                      onCheckedChange={() => toggleValue(option.value)}
                    />
                    {option.label}
                  </label>
                )
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {selectedOptions.length > 0 ? (
        <div className="sr-only">
          {selectedOptions.map((option) => option.label).join(', ')}
        </div>
      ) : null}
    </div>
  );
}

function FilterListboxHeader({
  clearLabel,
  selectLabel,
  disabled,
  onClear,
}: {
  clearLabel: string;
  selectLabel: string;
  disabled: boolean;
  onClear: () => void;
}) {
  return (
    <div className="shrink-0 px-4 pt-2">
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="flex h-7 w-full items-center gap-1.5 text-left text-[12px] font-medium leading-none text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:text-text-placeholder"
      >
        <X className="size-3 shrink-0" />
        {clearLabel}
      </button>
      <div className="mt-1 h-px bg-border-soft" />
      <div className="pb-1 pt-2.5 text-[12px] text-text-muted">{selectLabel}</div>
    </div>
  );
}

export function FilterMultiTag({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brand-blue bg-brand-blue/5 px-3 text-[13px] leading-none text-text-primary outline-none transition-colors hover:border-brand-blue/50 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
    >
      {label}
      <X className="size-3.5 text-text-muted" />
    </button>
  );
}
