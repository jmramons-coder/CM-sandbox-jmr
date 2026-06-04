import { X } from 'lucide-react';

export function CaseStageLensBanner({
  stageLabel,
  mode = 'through',
  onClear,
  className = '',
}: {
  stageLabel: string;
  mode?: 'at' | 'through';
  onClear: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-b border-border-soft bg-surface-selected/80 px-4 py-2 sm:px-6 ${className}`}
      role="status"
      aria-live="polite"
    >
      <p className="text-[12px] text-text-secondary">
        Viewing work {mode === 'at' ? 'at' : 'through'}{' '}
        <span className="font-semibold text-text-primary">{stageLabel}</span>
      </p>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-brand-blue transition-colors hover:bg-white"
      >
        <X className="h-3 w-3" aria-hidden />
        Clear
      </button>
    </div>
  );
}
