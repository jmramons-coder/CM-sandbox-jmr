import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useGlobalCreate } from '../contexts/GlobalCreateContext';

type GlobalCreateMenuProps = {
  variant?: 'icon' | 'full';
};

export function GlobalCreateMenu({ variant = 'icon' }: GlobalCreateMenuProps) {
  const { t } = useTranslation('nav');
  const { openCreateFlow, availableEntities } = useGlobalCreate();
  const isFull = variant === 'full';

  if (availableEntities.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={t('globalCreate.ariaLabel')}
      onClick={openCreateFlow}
      className={
        isFull
          ? 'flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg px-4 py-3 text-[15px] font-semibold text-white shadow-[0px_6px_6px_0px_rgba(27,28,30,0.01),0px_5px_5px_0px_rgba(27,28,30,0.04),0px_2px_4px_0px_rgba(27,28,30,0.07),0px_0px_4px_0px_rgba(27,28,30,0.1)] transition-colors'
          : 'mb-6 rounded-full p-2 text-white shadow-[0px_6px_6px_0px_rgba(27,28,30,0.01),0px_5px_5px_0px_rgba(27,28,30,0.04),0px_2px_4px_0px_rgba(27,28,30,0.07),0px_0px_4px_0px_rgba(27,28,30,0.1)] transition-colors'
      }
      style={{ backgroundColor: 'var(--brand-primary)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--brand-header)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--brand-primary)';
      }}
    >
      <Plus className={isFull ? 'h-5 w-5 shrink-0' : 'h-4 w-4'} />
      {isFull ? <span>{t('globalCreate.title')}</span> : null}
    </button>
  );
}
