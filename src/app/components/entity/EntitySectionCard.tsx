import type { ReactNode } from 'react';
import { MoreVertical, Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EntitySectionAction } from '../../domain/entityFolders';

/**
 * Shared chrome for every information card: rounded white surface, all-caps
 * section title with optional right-aligned actions, an optional kebab menu,
 * and a children body. fieldGrid / tableSection / contact all sit inside it.
 */
export function EntitySectionCard({
  title,
  actions,
  showKebab = true,
  bodyClassName,
  footer,
  children,
}: {
  title: string;
  actions?: EntitySectionAction[];
  showKebab?: boolean;
  bodyClassName?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation('folders');
  const hasExplicitActions = Boolean(actions?.length);
  return (
    <section className="rounded-xl border border-border-default bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
        <h3 className="font-['Open_Sans:Bold',sans-serif] text-[12px] font-bold uppercase tracking-[0.6px] text-text-primary">
          {title}
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          {actions?.map((a) => (
            <SectionActionButton key={a.id} action={a} />
          ))}
          {showKebab && !hasExplicitActions ? (
            <button
              type="button"
              aria-label={t('entity.section.moreActions')}
              className="rounded p-1 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            >
              <MoreVertical className="size-4" />
            </button>
          ) : null}
        </div>
      </header>
      <div className={bodyClassName ?? 'px-5 pb-5 pt-3'}>{children}</div>
      {footer ? footer : null}
    </section>
  );
}

function SectionActionButton({ action }: { action: EntitySectionAction }) {
  const Icon = action.icon === 'edit' ? Pencil : Plus;
  return (
    <button
      type="button"
      className="inline-flex h-7 items-center gap-2 rounded px-2 text-[11px] font-bold uppercase tracking-[0.4px] text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} />
      <span className="leading-none">{action.label}</span>
    </button>
  );
}
