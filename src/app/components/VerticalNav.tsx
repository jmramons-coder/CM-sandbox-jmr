import { useState } from 'react';
import { BarChart3, Briefcase, CheckSquare, FileText, FolderOpen, HandCoins, Home, Inbox, Lightbulb, MessageSquare } from 'lucide-react';
import { GlobalCreateMenu } from './GlobalCreateMenu';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AiCueSparkle } from './AiCueSparkle';
import { useModules, usePlatformSettings, useThemeMode } from '../contexts/PlatformSettingsContext';

export default function VerticalNav({
  aiActivityEnabled,
  onToggleAiActivity,
}: {
  onOpenGuide?: () => void;
  aiActivityEnabled: boolean;
  onToggleAiActivity: () => void;
}) {
  const location = useLocation();
  const { t } = useTranslation('nav');
  const [showPopover, setShowPopover] = useState(false);
  const themeMode = useThemeMode();
  const modules = useModules();
  const { settings } = usePlatformSettings();
  const aiActivityVisible = settings.preferences.aiActivityVisible !== false;

  const isActive = (path: string) => {
    if (path === '/tasks' && location.pathname === '/tasks') {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  const allNavItems = [
    { label: t('modules.home'), path: '/home', icon: Home, moduleId: 'home' as const },
    { label: t('modules.cases'), path: '/cases', icon: Briefcase, moduleId: 'cases' as const },
    { label: t('modules.folders'), path: '/folders', icon: FolderOpen, moduleId: 'folders' as const },
    { label: t('modules.finances'), path: '/finances', icon: HandCoins, moduleId: 'finances' as const },
    { label: t('modules.tasks'), path: '/tasks', icon: CheckSquare, moduleId: 'tasks' as const },
    { label: t('modules.requests'), path: '/requests', icon: Inbox, moduleId: 'requests' as const },
    { label: t('modules.documents'), path: '/documents', icon: FileText, moduleId: 'documents' as const },
    { label: t('modules.assistant'), path: '/copilot', icon: MessageSquare, moduleId: 'copilot' as const, accent: 'assistant' as const },
    { label: t('modules.insights'), path: '/insights', icon: Lightbulb, moduleId: 'insights' as const },
    { label: t('modules.reports'), path: '/reports', icon: BarChart3, moduleId: 'reports' as const },
  ];

  const navItems = allNavItems.filter((item) => modules[item.moduleId] !== false);
  const intelligenceEnabled = modules.aiActions !== false;
  const intelligenceActive = isActive('/ai-actions');

  return (
    <div className={`relative z-20 size-full ${themeMode === 'dark' ? 'shadow-[0_2px_4px_rgba(0,0,0,0.10),0_6px_20px_rgba(0,0,0,0.08)]' : ''} ${themeMode === 'light' ? 'bg-[#f5f5f7]' : 'bg-white'}`}>
      <div className="flex size-full">
        <div className="flex h-full w-[96px] flex-col items-center pb-4 pt-6">
          <GlobalCreateMenu />
          <div className="flex w-full flex-1 flex-col items-center">
            {navItems.map(({ label, path, icon: Icon, accent }) => {
              const active = isActive(path);
              const assistantAccent = accent === 'assistant';
              return (
                <Link key={path} to={path} className="my-[2px] w-full px-1.5">
                  <div className={`flex h-[56px] w-full flex-col items-center justify-center rounded-[8px] ${
                    active ? (assistantAccent ? 'bg-brand-accent-light' : 'bg-surface-selected') : 'hover:bg-surface-muted'
                  }`}>
                    <div className="relative">
                      <Icon className={`h-4 w-4 ${active ? (assistantAccent ? 'text-brand-accent' : 'text-brand-blue') : 'text-text-secondary'}`} />
                      {assistantAccent ? (
                        <span className={`absolute -right-[6px] -top-[6px] flex h-[13px] w-[13px] items-center justify-center rounded-full ${active ? 'bg-brand-accent' : 'bg-[#878f9a]'}`}>
                          <AiCueSparkle size={8} className="!text-white" />
                        </span>
                      ) : null}
                    </div>
                    <p className={`mt-1 max-w-[86px] text-center text-[11px] leading-[13px] ${active ? (assistantAccent ? 'font-semibold text-brand-accent' : 'font-semibold text-brand-blue') : 'font-normal text-text-secondary'}`}>
                      {label}
                    </p>
                  </div>
                </Link>
              );
            })}
            {intelligenceEnabled && (
              <Link to="/ai-actions" className="mt-auto my-[2px] w-full px-1.5">
                <div className={`flex h-[56px] w-full flex-col items-center justify-center rounded-[8px] ${intelligenceActive ? 'bg-brand-accent-light' : 'hover:bg-surface-muted'}`}>
                  <AiCueSparkle size={18} className={intelligenceActive ? '!text-brand-accent' : '!text-text-secondary'} />
                  <p className={`mt-1 max-w-[86px] text-center text-[11px] leading-[13px] ${intelligenceActive ? 'font-semibold text-brand-accent' : 'font-normal text-text-secondary'}`}>
                    {t('modules.aiActions')}
                  </p>
                </div>
              </Link>
            )}
          </div>

          {/* AI Activity Feed toggle */}
          {aiActivityVisible && (
          <div className="mt-auto w-full border-t border-[#eceef0] pt-3">
            <div
              className="relative flex w-full flex-col items-center gap-2 px-2 py-2"
              onMouseEnter={() => setShowPopover(true)}
              onMouseLeave={() => setShowPopover(false)}
            >
              <div className="flex items-center gap-1.5">
                <AiCueSparkle size={14} className={aiActivityEnabled ? '!text-brand-accent' : '!text-[#b7bbc2]'} />
                <span className={`text-[10px] font-semibold ${aiActivityEnabled ? 'text-brand-accent' : 'text-text-muted'}`}>
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

              {showPopover && (
                <div className="absolute bottom-0 left-full z-[100] ml-2 w-[240px] rounded-lg border border-border-soft bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <AiCueSparkle size={12} className="!text-brand-accent" />
                    <span className="text-[11px] font-bold text-brand-accent">{t('activityFeed.popoverTitle')}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-text-secondary">
                    {t('activityFeed.popoverBody')}
                  </p>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
        {themeMode === 'dark' && <div className="h-full w-px bg-[#dbdee1]" />}
      </div>
    </div>
  );
}
