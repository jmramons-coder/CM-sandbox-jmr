import type { EntityField, EntityFieldGridLayout } from '../../domain/entityFolders';

const LAYOUT_CLASS: Record<EntityFieldGridLayout, string> = {
  'grid-2': 'grid-cols-1 sm:grid-cols-2',
  'grid-3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  'grid-4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

/**
 * Renders a grid of label/value pairs. `null` values render as an em-dash so
 * empty-state cards still get visual rhythm.
 */
export function EntityFieldList({
  fields,
  layout,
}: {
  fields: EntityField[];
  layout: EntityFieldGridLayout;
}) {
  return (
    <dl className={`grid gap-x-6 gap-y-5 ${LAYOUT_CLASS[layout]}`}>
      {fields.map((f, idx) => (
        <div key={f.id ?? `${f.label}-${idx}`} className="flex flex-col gap-1">
          <dt className="text-[12px] font-normal leading-[16px] text-text-secondary">
            {f.label}
          </dt>
          <dd className="flex items-baseline gap-1.5">
            {f.value === null || f.value === '' ? (
              <span className="text-[14px] font-normal text-text-muted">-</span>
            ) : f.href ? (
              <a
                href={f.href}
                className="text-[14px] font-semibold text-brand-blue hover:underline"
              >
                {f.value}
              </a>
            ) : (
              <span
                className={
                  f.muted
                    ? 'text-[14px] font-normal text-text-secondary'
                    : 'text-[14px] font-semibold text-text-primary'
                }
              >
                {f.value}
              </span>
            )}
            {f.hint ? (
              <span className="rounded border border-border-default bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                {f.hint}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
