import type { LucideIcon } from 'lucide-react';

export function ChooserCard({
  active,
  description,
  icon: Icon,
  onClick,
  title,
}: {
  active: boolean;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
        active
          ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue'
          : 'border-border-default bg-white hover:border-brand-blue/40'
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
          active ? 'bg-brand-blue text-white' : 'bg-surface-muted text-text-secondary'
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-text-primary">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-text-muted">{description}</span>
      </span>
    </button>
  );
}

export function ChipFilter({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              active
                ? 'border-brand-blue bg-brand-blue text-white'
                : 'border-border-default bg-white text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
