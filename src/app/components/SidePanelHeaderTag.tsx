import type { LucideIcon } from 'lucide-react';

export function SidePanelHeaderTag({
  icon: Icon,
  label,
  title,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  title?: string;
  onClick?: () => void;
}) {
  const className =
    'inline-flex max-w-full items-center gap-1.5 rounded-full border border-border-soft bg-[#fbfcfd] px-2.5 py-1 text-[11px] leading-none transition-colors';
  const content = (
    <>
      <Icon className="size-3 shrink-0 text-text-muted" aria-hidden />
      <span className="truncate font-semibold leading-none text-text-primary">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        data-keep-sidepanel="link"
        title={title ?? label}
        onClick={onClick}
        className={`${className} hover:border-brand-blue/30 hover:bg-surface-muted`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} title={title ?? label}>
      {content}
    </div>
  );
}
