import { Briefcase, CheckSquare, ChevronRight, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GlobalCreateEntity } from '../../contexts/GlobalCreateContext';

const ENTITY_META: Record<
  GlobalCreateEntity,
  { icon: typeof Briefcase; descriptionKey: 'caseDescription' | 'taskDescription' | 'requestDescription' }
> = {
  case: { icon: Briefcase, descriptionKey: 'caseDescription' },
  task: { icon: CheckSquare, descriptionKey: 'taskDescription' },
  request: { icon: Send, descriptionKey: 'requestDescription' },
};

const LABEL_KEYS: Record<GlobalCreateEntity, 'case' | 'task' | 'request'> = {
  case: 'case',
  task: 'task',
  request: 'request',
};

type CreateEntityPickerProps = {
  entities: GlobalCreateEntity[];
  onSelect: (entity: GlobalCreateEntity) => void;
};

export function CreateEntityPicker({ entities, onSelect }: CreateEntityPickerProps) {
  const { t } = useTranslation('nav');

  return (
    <ul className="space-y-3" role="listbox" aria-label={t('globalCreate.title')}>
      {entities.map((entity) => {
        const meta = ENTITY_META[entity];
        const Icon = meta.icon;
        return (
          <li key={entity} role="none">
            <button
              type="button"
              role="option"
              className="flex w-full items-center gap-4 rounded-xl border border-border-default bg-white px-4 py-4 text-left transition-colors hover:border-brand-blue/40 hover:bg-surface-selected-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              onClick={() => onSelect(entity)}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-muted text-brand-blue">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-text-primary">
                  {t(`globalCreate.${LABEL_KEYS[entity]}`)}
                </span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-text-secondary">
                  {t(`globalCreate.${meta.descriptionKey}`)}
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-text-muted" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
