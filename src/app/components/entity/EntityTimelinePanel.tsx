import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type EntityTimelinePanelItem = { label: string; value: string };

/**
 * Right-side companion panel inside a fieldGrid card. Used by Policy
 * IDENTIFICATION to surface key dates (Issue / Effective / Termination).
 */
export function EntityTimelinePanel({
  items,
  icon = 'calendar',
}: {
  items: EntityTimelinePanelItem[];
  icon?: 'calendar';
}) {
  const { t } = useTranslation('folders');
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
        {icon === 'calendar' ? <Calendar className="size-4 text-text-secondary" /> : null}
        <span>{t('entity.timeline.title')}</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, idx) => (
          <li
            key={`${item.label}-${idx}`}
            className="rounded-md bg-surface-muted px-2.5 py-1.5 text-[12px] text-text-primary"
          >
            <span className="font-normal text-text-secondary">{item.label}: </span>
            <span className="font-semibold">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
