import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export function CollapsibleDetailSection({
  title,
  subtitle,
  defaultOpen = true,
  headerAction,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={className}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-0 py-2 text-left"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <ChevronDown className={`size-4 shrink-0 text-text-muted transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-text-primary">{title}</span>
            {subtitle ? <span className="mt-0.5 block truncate text-[11px] text-text-secondary">{subtitle}</span> : null}
          </span>
        </span>
        {headerAction ? (
          <span onClick={(event) => event.stopPropagation()} className="shrink-0">
            {headerAction}
          </span>
        ) : null}
      </button>
      {open ? <div className="pt-1">{children}</div> : null}
    </section>
  );
}
