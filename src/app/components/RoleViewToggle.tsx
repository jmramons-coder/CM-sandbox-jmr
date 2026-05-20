import { useTranslation } from 'react-i18next';
import type { RoleView } from '../domain/access/roleView';

type RoleViewToggleProps = {
  roleView: RoleView;
  onChange: (roleView: RoleView) => void;
  className?: string;
};

/**
 * Pill toggle for switching between assessor and manager dashboard views.
 * Gray track = assessor, blue track = manager (per role architecture spec).
 */
export function RoleViewToggle({ roleView, onChange, className = '' }: RoleViewToggleProps) {
  const { t } = useTranslation('nav');
  const isManager = roleView === 'manager';

  return (
    <div className={className}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">
        {t('userMenu.roleView')}
      </p>
      <div
        className={`relative flex h-[28px] w-full items-center rounded-full p-[2px] transition-colors ${
          isManager ? 'bg-brand-blue' : 'bg-[#d7dde3]'
        }`}
        role="group"
        aria-label={t('userMenu.roleView')}
      >
        <button
          type="button"
          onClick={() => onChange('assessor')}
          className={`relative z-10 flex-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
            !isManager ? 'text-text-primary' : 'text-white/90 hover:text-white'
          }`}
          aria-pressed={!isManager}
        >
          {t('userMenu.roleAssessor')}
        </button>
        <button
          type="button"
          onClick={() => onChange('manager')}
          className={`relative z-10 flex-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
            isManager ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
          aria-pressed={isManager}
        >
          {t('userMenu.roleManager')}
        </button>
        <span
          aria-hidden
          className={`absolute top-[2px] z-0 h-[24px] w-[calc(50%-2px)] rounded-full bg-white shadow-[0_1px_3px_rgba(27,28,30,0.12)] transition-[left] duration-200 ${
            isManager ? 'left-[calc(50%)]' : 'left-[2px]'
          }`}
        />
      </div>
      <p className="mt-1 text-[10px] text-text-muted">
        {isManager ? t('userMenu.roleManagerHint') : t('userMenu.roleAssessorHint')}
      </p>
    </div>
  );
}
