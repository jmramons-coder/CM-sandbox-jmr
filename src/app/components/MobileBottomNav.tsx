import { Briefcase, CheckSquare, FileText, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useCasesNav } from '../contexts/CasesNavContext';
import { useModules } from '../contexts/PlatformSettingsContext';

/** Inner bar height (excluding safe-area inset). Keep in sync with Layout clearance. */
export const MOBILE_BOTTOM_NAV_HEIGHT = '4rem';

/** Space reserved above the bottom bar so main content is not obscured. */
export const MOBILE_BOTTOM_NAV_CLEARANCE =
  `calc(${MOBILE_BOTTOM_NAV_HEIGHT} + env(safe-area-inset-bottom, 0px))`;

const PRIMARY_NAV = [
  { labelKey: 'home' as const, path: '/home', icon: Home, moduleId: 'home' },
  { labelKey: 'cases' as const, path: '/cases', icon: Briefcase, moduleId: 'cases' },
  { labelKey: 'tasks' as const, path: '/tasks', icon: CheckSquare, moduleId: 'tasks' },
  { labelKey: 'documents' as const, path: '/documents', icon: FileText, moduleId: 'documents' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { t } = useTranslation('nav');
  const modules = useModules();
  const { lastActiveCaseId } = useCasesNav();

  const navItems = PRIMARY_NAV.filter(
    (item) => modules[item.moduleId as keyof typeof modules] !== false,
  ).map((item) =>
    item.moduleId === 'cases' && lastActiveCaseId
      ? { ...item, path: `/cases/${lastActiveCaseId}` }
      : item,
  );

  if (navItems.length === 0) return null;

  const isActive = (path: string) => {
    if (path === '/home') {
      return (
        location.pathname === '/home'
        || location.pathname === '/'
        || location.pathname === '/dashboard'
      );
    }
    if (path === '/tasks') return location.pathname === '/tasks';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[120] border-t border-border-default bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_16px_rgba(27,28,30,0.06)] lg:hidden"
      aria-label={t('mobileNav.ariaLabel')}
    >
      <div
        className="grid w-full items-stretch"
        style={{
          gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
          height: MOBILE_BOTTOM_NAV_HEIGHT,
        }}
      >
        {navItems.map(({ labelKey, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-[52px] flex-col items-center justify-center gap-1 px-1 transition-colors ${
                active
                  ? 'bg-brand-blue/[0.08] text-brand-blue'
                  : 'text-text-secondary hover:bg-surface-muted/80 hover:text-text-primary'
              }`}
            >
              {active ? (
                <span
                  className="absolute inset-x-3 top-0 h-[3px] rounded-b-full bg-brand-blue"
                  aria-hidden
                />
              ) : null}
              <Icon className="h-6 w-6 shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span
                className={`max-w-full truncate text-[11px] leading-tight ${
                  active ? 'font-semibold' : 'font-medium'
                }`}
              >
                {t(`modules.${labelKey}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
