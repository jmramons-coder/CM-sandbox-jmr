import { useState, type ComponentType, type SVGProps } from 'react';
import {
  BarChart3,
  Briefcase,
  CheckSquare,
  FileText,
  FolderOpen,
  HandCoins,
  Home,
  Inbox,
  Lightbulb,
  MessageSquare,
  Users,
} from 'lucide-react';
import { GlobalCreateMenu } from './GlobalCreateMenu';
import { Link, useLocation } from 'react-router';
import { casesPanelOpenState } from '../utils/cases-navigation';
import { useTranslation } from 'react-i18next';
import { AiCueSparkle } from './AiCueSparkle';
import { useModules, usePlatformSettings, useThemeMode } from '../contexts/PlatformSettingsContext';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type NavItem = {
  label: string;
  path: string;
  icon: IconType;
  accent?: 'assistant';
};

export default function VerticalNav({
  aiActivityEnabled,
  onToggleAiActivity,
  variant = 'rail',
  onNavigate,
}: {
  onOpenGuide?: () => void;
  aiActivityEnabled: boolean;
  onToggleAiActivity: () => void;
  variant?: 'rail' | 'drawer';
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const { t } = useTranslation('nav');
  const [showPopover, setShowPopover] = useState(false);
  const themeMode = useThemeMode();
  const modules = useModules();
  const { settings } = usePlatformSettings();
  const aiActivityVisible = settings.preferences.aiActivityVisible !== false;
  const isDrawer = variant === 'drawer';

  const isActive = (path: string) => {
    if (path === '/tasks' && location.pathname === '/tasks') return true;
    return location.pathname.startsWith(path);
  };

  const allNavItems: (NavItem & { moduleId: string })[] = [
    { label: t('modules.home'), path: '/home', icon: Home, moduleId: 'home' },
    { label: t('modules.cases'), path: '/cases', icon: Briefcase, moduleId: 'cases' },
    { label: t('modules.folders'), path: '/folders', icon: FolderOpen, moduleId: 'folders' },
    { label: t('modules.finances'), path: '/finances', icon: HandCoins, moduleId: 'finances' },
    { label: t('modules.tasks'), path: '/tasks', icon: CheckSquare, moduleId: 'tasks' },
    { label: t('modules.requests'), path: '/requests', icon: Inbox, moduleId: 'requests' },
    { label: t('modules.documents'), path: '/documents', icon: FileText, moduleId: 'documents' },
    {
      label: t('modules.assistant'),
      path: '/copilot',
      icon: MessageSquare,
      moduleId: 'copilot',
      accent: 'assistant',
    },
    { label: t('modules.insights'), path: '/insights', icon: Lightbulb, moduleId: 'insights' },
    { label: t('modules.reports'), path: '/reports', icon: BarChart3, moduleId: 'reports' },
  ];

  const teamNavItem: NavItem & { moduleId: string } = {
    label: t('modules.team'),
    path: '/team',
    icon: Users,
    moduleId: 'users',
  };

  const navItems = allNavItems.filter((item) => modules[item.moduleId as keyof typeof modules] !== false);
  const teamNavEnabled = modules.users !== false;
  const intelligenceEnabled = modules.aiActions !== false;
  const intelligenceActive = isActive('/ai-actions');

  const itemClass = (active: boolean, assistantAccent: boolean) => {
    if (isDrawer) {
      return `flex min-h-[48px] w-full items-center gap-3 rounded-[8px] px-3 py-2.5 ${
        active
          ? assistantAccent
            ? 'bg-brand-accent-light text-brand-accent'
            : 'bg-white text-brand-blue shadow-sm'
          : 'text-text-primary hover:bg-white/70'
      }`;
    }
    return `flex h-[56px] w-full flex-col items-center justify-center rounded-[8px] ${
      active ? (assistantAccent ? 'bg-brand-accent-light' : 'bg-surface-selected') : 'hover:bg-surface-muted'
    }`;
  };

  const renderLink = ({ label, path, icon: Icon, accent }: NavItem) => {
    const active = isActive(path);
    const assistantAccent = accent === 'assistant';
    return (
      <Link
        key={path}
        to={path}
        state={path === '/cases' ? casesPanelOpenState() : undefined}
        className={isDrawer ? 'block w-full px-2 py-0.5' : 'my-[2px] w-full px-1.5'}
        onClick={onNavigate}
      >
        <div className={itemClass(active, assistantAccent)}>
          <div className="relative shrink-0">
            <Icon
              className={
                isDrawer
                  ? `h-5 w-5 ${active ? (assistantAccent ? 'text-brand-accent' : 'text-brand-blue') : 'text-text-secondary'}`
                  : `h-4 w-4 ${active ? (assistantAccent ? 'text-brand-accent' : 'text-brand-blue') : 'text-text-secondary'}`
              }
            />
            {assistantAccent ? (
              <span
                className={`absolute -right-[6px] -top-[6px] flex h-[13px] w-[13px] items-center justify-center rounded-full ${
                  active ? 'bg-brand-accent' : 'bg-[#878f9a]'
                }`}
              >
                <AiCueSparkle size={8} className="!text-white" />
              </span>
            ) : null}
          </div>
          {isDrawer ? (
            <span className={`min-w-0 flex-1 truncate text-[15px] ${active ? 'font-semibold' : 'font-medium'}`}>
              {label}
            </span>
          ) : (
            <p
              className={`mt-1 max-w-[86px] text-center text-[11px] leading-[13px] ${
                active
                  ? assistantAccent
                    ? 'font-semibold text-brand-accent'
                    : 'font-semibold text-brand-blue'
                  : 'font-normal text-text-secondary'
              }`}
            >
              {label}
            </p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div
      className={`relative z-20 size-full ${
        themeMode === 'dark' && !isDrawer
          ? 'shadow-[0_2px_4px_rgba(0,0,0,0.10),0_6px_20px_rgba(0,0,0,0.08)]'
          : ''
      } ${isDrawer || themeMode === 'light' ? 'bg-[#f5f5f7]' : 'bg-white'}`}
    >
      <div className="flex size-full">
        <div
          className={`flex h-full flex-col pb-4 ${
            isDrawer ? 'w-full px-1 pt-3' : 'w-[96px] items-center pt-6'
          }`}
        >
          <div className={isDrawer ? 'mb-4 w-full px-3' : undefined}>
            <GlobalCreateMenu variant={isDrawer ? 'full' : 'icon'} />
          </div>
          <div className={`flex w-full flex-1 flex-col ${isDrawer ? '' : 'items-center'}`}>
            {navItems.map((item) => renderLink(item))}
            {intelligenceEnabled || teamNavEnabled ? (
              <div
                className={`mt-auto flex w-full flex-col ${isDrawer ? '' : 'items-center'}`}
              >
                {intelligenceEnabled ? (
                  <Link
                    to="/ai-actions"
                    className={isDrawer ? 'block w-full px-2 py-0.5' : 'my-[2px] w-full px-1.5'}
                    onClick={onNavigate}
                  >
                    <div className={itemClass(intelligenceActive, false)}>
                      <AiCueSparkle
                        size={isDrawer ? 20 : 18}
                        className={`shrink-0 ${intelligenceActive ? '!text-brand-accent' : '!text-text-secondary'}`}
                      />
                      {isDrawer ? (
                        <span
                          className={`min-w-0 flex-1 truncate text-[15px] ${
                            intelligenceActive ? 'font-semibold text-brand-accent' : 'font-medium text-text-primary'
                          }`}
                        >
                          {t('modules.aiActions')}
                        </span>
                      ) : (
                        <p
                          className={`mt-1 max-w-[86px] text-center text-[11px] leading-[13px] ${
                            intelligenceActive ? 'font-semibold text-brand-accent' : 'font-normal text-text-secondary'
                          }`}
                        >
                          {t('modules.aiActions')}
                        </p>
                      )}
                    </div>
                  </Link>
                ) : null}
                {teamNavEnabled ? (
                  <div className={isDrawer ? 'w-full px-2 py-0.5' : 'my-[2px] w-full px-1.5'}>
                    {renderLink(teamNavItem)}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {aiActivityVisible ? (
            <div className={`mt-auto w-full border-t border-[#eceef0] pt-3 ${isDrawer ? 'px-3' : ''}`}>
              <div
                className={`relative flex w-full gap-2 py-2 ${
                  isDrawer ? 'flex-row items-center justify-between' : 'flex-col items-center px-2'
                }`}
                onMouseEnter={() => !isDrawer && setShowPopover(true)}
                onMouseLeave={() => !isDrawer && setShowPopover(false)}
              >
                <div className={`flex items-center gap-1.5 ${isDrawer ? '' : 'flex-col'}`}>
                  <AiCueSparkle size={14} className={aiActivityEnabled ? '!text-brand-accent' : '!text-[#b7bbc2]'} />
                  <span
                    className={`font-semibold ${isDrawer ? 'text-[13px] text-text-secondary' : 'text-[10px]'} ${
                      aiActivityEnabled ? 'text-brand-accent' : 'text-text-muted'
                    }`}
                  >
                    {t('activityFeed.label')}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={aiActivityEnabled}
                  aria-label={t('activityFeed.ariaLabel')}
                  onClick={onToggleAiActivity}
                  className={`relative inline-flex h-[18px] w-[32px] shrink-0 items-center rounded-full transition-colors duration-200 ${
                    aiActivityEnabled ? 'bg-brand-accent' : 'bg-[#dbdee1]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      aiActivityEnabled ? 'translate-x-[16px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>

                {showPopover && !isDrawer ? (
                  <div className="absolute bottom-0 left-full z-[100] ml-2 w-[240px] rounded-lg border border-border-soft bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <AiCueSparkle size={12} className="!text-brand-accent" />
                      <span className="text-[11px] font-bold text-brand-accent">{t('activityFeed.popoverTitle')}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-text-secondary">{t('activityFeed.popoverBody')}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        {themeMode === 'dark' && !isDrawer ? <div className="h-full w-px bg-[#dbdee1]" /> : null}
      </div>
    </div>
  );
}
