import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react';
import { BrandingHeaderPreview } from './BrandingHeaderPreview';
import { Switch } from './ui/switch';
import { APP_EVENTS } from '../constants/storage-keys';
import { usePlatformSettings } from '../contexts/PlatformSettingsContext';

type AppSwitcherDemoSectionProps = {
  onClose?: () => void;
};

export function AppSwitcherDemoSection({ onClose }: AppSwitcherDemoSectionProps) {
  const { t } = useTranslation(['nav', 'settings']);
  const { settings, setActiveDemoConfiguration } = usePlatformSettings();

  const openDemoSettings = () => {
    window.dispatchEvent(
      new CustomEvent(APP_EVENTS.openPlatformSettings, { detail: { tab: 'demo' } }),
    );
    onClose?.();
  };

  return (
    <div className="border-t border-border-default">
      <div className="px-4 pt-3 pb-1">
        <p className="text-[12px] font-semibold text-text-primary">{t('nav:appSwitcher.clientDemo')}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-text-muted">{t('nav:appSwitcher.clientDemoHint')}</p>
      </div>
      <div className="flex flex-col gap-2 px-2 pb-2">
        {settings.demoConfigurations.map((config) => {
          const active = settings.activeDemoConfigurationId === config.id;
          const branding = config.settings.branding;
          const themeMode = config.settings.themeMode;
          const headerBackground = themeMode === 'light' ? '#ffffff' : branding.headerColor;
          const headerForeground = themeMode === 'light' ? '#1b1c1e' : branding.onHeaderColor;

          return (
            <div
              key={config.id}
              className={`overflow-hidden rounded-md border shadow-[0_1px_2px_rgba(27,28,30,0.04)] ${
                active ? 'border-brand-blue/40 ring-1 ring-brand-blue/15' : 'border-border-soft'
              }`}
            >
              <div
                className="flex min-h-[52px] items-stretch"
                style={{ backgroundColor: headerBackground, color: headerForeground }}
              >
                <div className="min-w-0 flex-1 px-3 py-2">
                  <BrandingHeaderPreview
                    branding={branding}
                    themeMode={themeMode}
                    showColorChips={false}
                    variant="demo-card"
                    className="min-w-0"
                  />
                </div>
                <div
                  className="flex shrink-0 items-center self-center px-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Switch
                    checked={active}
                    onCheckedChange={(checked) => setActiveDemoConfiguration(checked ? config.id : null)}
                    aria-label={t('settings:demo.activeToggleAria', { name: config.name })}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border-default px-2 pb-2 pt-1">
        <button
          type="button"
          onClick={openDemoSettings}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[12px] font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
        >
          <Settings2 className="size-3.5 shrink-0" aria-hidden />
          {t('nav:appSwitcher.openDemoSettings')}
        </button>
      </div>
    </div>
  );
}
