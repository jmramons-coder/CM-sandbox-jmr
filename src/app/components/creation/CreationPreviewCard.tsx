import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileText } from 'lucide-react';
import { cn } from '../ui/utils';

export function ReviewMetaBadge({
  icon: Icon,
  label,
  tone = 'neutral',
}: {
  icon: LucideIcon;
  label: string;
  tone?: 'accent' | 'navy' | 'neutral';
}) {
  const toneClass =
    tone === 'accent'
      ? 'border-brand-blue/25 bg-white text-brand-blue'
      : tone === 'navy'
        ? 'border-brand-navy/20 bg-white text-brand-navy'
        : 'border-border-soft bg-white text-text-secondary';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
        toneClass,
      )}
    >
      <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      {label}
    </span>
  );
}

export function LinkedContextTile({
  label,
  value,
  icon: IconOverride,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
}) {
  const Icon = IconOverride ?? FileText;
  const isEmpty = !value || value === 'None' || value === 'Not linked';

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-md border bg-white px-3 py-2',
        isEmpty ? 'border-dashed border-border-default' : 'border-border-soft',
      )}
    >
      <Icon className="size-3.5 shrink-0 text-text-muted" aria-hidden />
      <span className="min-w-0">
        <span className="block text-[11px] text-text-muted">{label}</span>
        <span className={cn('block truncate text-sm', isEmpty ? 'text-text-muted' : 'text-text-primary')}>
          {isEmpty ? 'Not linked' : value}
        </span>
      </span>
    </div>
  );
}

export function CreationPreviewCard({
  eyebrow,
  title,
  subtitle,
  badges,
  highlight,
  linked,
  linkedTitle = 'Linked context',
  notes,
  notesLabel = 'Notes',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  badges: ReactNode;
  highlight?: {
    label: string;
    value: string;
    icon: LucideIcon;
    emptyLabel?: string;
  };
  linked: { label: string; value: string; icon?: LucideIcon }[];
  linkedTitle?: string;
  notes?: string;
  notesLabel?: string;
}) {
  const hasHighlight = Boolean(highlight?.value?.trim());
  const HighlightIcon = highlight?.icon;

  return (
    <div className="rounded-lg border border-border-soft bg-white">
      <div className="px-4 py-4 sm:px-5">
        <p className="text-xs font-medium text-text-muted">{eyebrow}</p>
        <h4 className="mt-1 text-base font-semibold leading-snug text-text-primary">
          {title.trim() || 'Untitled'}
        </h4>
        {subtitle ? <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p> : null}
        {badges ? <div className="mt-2.5 flex flex-wrap items-center gap-1.5">{badges}</div> : null}
      </div>

      {(highlight && HighlightIcon) || linked.length > 0 || notes?.trim() ? (
        <div className="space-y-3 border-t border-border-soft px-4 py-3 sm:px-5">
          {highlight && HighlightIcon ? (
            <div className="flex items-start gap-2.5">
              <HighlightIcon className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden />
              <div className="min-w-0">
                <p className="text-[11px] text-text-muted">{highlight.label}</p>
                <p className={cn('text-sm font-medium', hasHighlight ? 'text-text-primary' : 'text-text-muted')}>
                  {hasHighlight ? highlight.value : highlight.emptyLabel ?? 'Not set yet'}
                </p>
              </div>
            </div>
          ) : null}

          {linked.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-text-muted">{linkedTitle}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {linked.map((row) => (
                  <LinkedContextTile key={row.label} label={row.label} value={row.value} icon={row.icon} />
                ))}
              </div>
            </div>
          ) : null}

          {notes?.trim() ? (
            <div className="rounded-md border border-border-soft bg-white px-3 py-2.5">
              <p className="text-[11px] font-medium text-text-muted">{notesLabel}</p>
              <p className="mt-1 text-xs leading-relaxed text-text-primary">{notes}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
