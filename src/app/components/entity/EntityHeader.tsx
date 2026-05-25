import { MoreVertical, Plus, Settings, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { normalizeEntityHeaderBadges, type EntityFolderHeader, type EntityHeaderAction } from '../../domain/entityFolders';
import { InitialsAvatar } from '../ds';
import { resolvePersonAvatar } from '../../utils/person-avatar';
import { LozengeTag } from '../LozengeTag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

/**
 * Title block: badge row + entity title (+ optional avatar). The action group
 * lives in `EntityHeaderActions` so it can be rendered on the breadcrumb row
 * for top-right alignment, instead of next to the title.
 */
export function EntityHeader({
  header,
  entityId,
}: {
  header: EntityFolderHeader;
  /** Stable seed for pastel color (defaults to title). */
  entityId?: string;
}) {
  const { t } = useTranslation('folders');
  const badges = normalizeEntityHeaderBadges(header);
  const avatarResolved = header.avatar
    ? resolvePersonAvatar(header.title, {
        initials: header.avatar.initials ?? t('entity.header.fallbackInitial'),
        seed: entityId ?? header.title,
        backgroundColor: header.avatar.color,
      })
    : null;

  return (
    <div className="flex min-w-0 items-start gap-3">
      {avatarResolved ? (
        <InitialsAvatar
          name={header.title}
          initials={avatarResolved.initials}
          seed={entityId ?? header.title}
          backgroundColor={avatarResolved.colors.background}
          textColor={avatarResolved.colors.foreground}
          size="lg"
          aria-label={header.title}
        />
      ) : null}
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {badges.map((b, idx) => {
            if (b.tone === undefined || b.tone === 'default') {
              return (
                <span
                  key={`${b.label}-${idx}`}
                  className="inline-flex h-[20px] items-center rounded-[6px] border border-border-default bg-white px-1.5 text-[11px] font-semibold text-text-secondary"
                >
                  {b.label}
                </span>
              );
            }
            return (
              <LozengeTag key={`${b.label}-${idx}`} label={b.label} type={b.tone} subtle />
            );
          })}
        </div>
        <h1 className="truncate text-[24px] font-semibold leading-[28px] tracking-tight text-text-primary">
          {header.title}
        </h1>
      </div>
    </div>
  );
}

/** Right-side action group (+, message, count, kebab) — rendered top right. */
export function EntityHeaderActions({
  header,
  onConfigure,
}: {
  header: EntityFolderHeader;
  onConfigure?: () => void;
}) {
  const actions = header.actions?.filter((a) => a.id !== 'message' && a.id !== 'count') ?? [];
  if (!actions.length) return null;
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {actions.map((a) => <ActionButton key={a.id} action={a} onConfigure={onConfigure} />)}
    </div>
  );
}

function ActionButton({
  action,
  onConfigure,
}: {
  action: EntityHeaderAction;
  onConfigure?: () => void;
}) {
  const { t } = useTranslation('folders');
  const base =
    'inline-flex h-8 items-center justify-center rounded-full border border-brand-blue/40 bg-white px-2 text-brand-blue transition-colors hover:bg-surface-selected';
  if (action.id === 'add') {
    return (
      <button type="button" aria-label={action.label ?? t('entity.header.createAria')} className={`${base} w-8 px-0`}>
        <Plus className="size-4" />
      </button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('entity.header.moreActionsAria')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
        >
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] border-border-default bg-white">
        <DropdownMenuItem onSelect={onConfigure} className="cursor-pointer">
          <Settings className="size-4" />
          {t('entity.config.menu.configure')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="cursor-pointer">
          <Trash2 className="size-4" />
          {t('entity.config.menu.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
