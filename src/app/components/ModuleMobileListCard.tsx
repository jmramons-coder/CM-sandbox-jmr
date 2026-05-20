import type { KeyboardEvent, ReactNode } from 'react';

type ModuleMobileListCardOptions = {
  selected?: boolean;
  restricted?: boolean;
  hoverSurface?: boolean;
};

export function moduleMobileListCardClass({
  selected = false,
  restricted = false,
  hoverSurface = false,
}: ModuleMobileListCardOptions = {}) {
  return [
    'cursor-pointer rounded-lg border text-left transition-all hover:shadow-md active:scale-[0.99]',
    restricted ? 'cursor-not-allowed opacity-50' : '',
    selected
      ? 'border-brand-blue bg-surface-selected-alt'
      : `border-border-default bg-white${hoverSurface ? ' hover:bg-surface-hover' : ''}`,
  ]
    .filter(Boolean)
    .join(' ');
}

export function ModuleMobileListCardShell({
  selected,
  restricted,
  onSelect,
  children,
  className = '',
  paddingClass = 'p-4',
}: {
  selected?: boolean;
  restricted?: boolean;
  onSelect?: () => void;
  children: ReactNode;
  className?: string;
  paddingClass?: string;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!restricted) onSelect?.();
  };

  return (
    <div
      data-keep-sidepanel="card"
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect && !restricted ? 0 : undefined}
      onClick={() => {
        if (!restricted) onSelect?.();
      }}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      className={`${moduleMobileListCardClass({ selected, restricted, hoverSurface: !selected })} ${paddingClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
