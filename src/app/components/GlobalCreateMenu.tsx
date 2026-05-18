import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useGlobalCreate, type GlobalCreateEntity } from '../contexts/GlobalCreateContext';

const CREATE_LABEL_KEYS: Record<GlobalCreateEntity, 'case' | 'task' | 'request'> = {
  case: 'case',
  task: 'task',
  request: 'request',
};

export function GlobalCreateMenu() {
  const { t } = useTranslation('nav');
  const { createMenuOpen, setCreateMenuOpen, openCreate, availableEntities } = useGlobalCreate();

  if (availableEntities.length === 0) {
    return null;
  }

  return (
    <Popover open={createMenuOpen} onOpenChange={setCreateMenuOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('globalCreate.ariaLabel')}
          aria-haspopup="menu"
          aria-expanded={createMenuOpen}
          className="mb-6 rounded-full p-2 text-white shadow-[0px_6px_6px_0px_rgba(27,28,30,0.01),0px_5px_5px_0px_rgba(27,28,30,0.04),0px_2px_4px_0px_rgba(27,28,30,0.07),0px_0px_4px_0px_rgba(27,28,30,0.1)] transition-colors"
          style={{ backgroundColor: 'var(--brand-primary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--brand-header)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--brand-primary)';
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={10}
        className="w-[220px] rounded-lg border border-border-default bg-white p-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      >
        <p className="border-b border-border-soft px-4 py-3 text-sm font-semibold text-text-primary">
          {t('globalCreate.title')}
        </p>
        <ul className="py-1" role="menu">
          {availableEntities.map((entity) => (
            <li key={entity} role="none">
              <button
                type="button"
                role="menuitem"
                className="w-full px-4 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted"
                onClick={() => openCreate(entity)}
              >
                {t(`globalCreate.${CREATE_LABEL_KEYS[entity]}`)}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
