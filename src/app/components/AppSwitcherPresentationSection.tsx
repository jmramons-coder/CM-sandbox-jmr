import { useTranslation } from 'react-i18next';
import { Switch } from './ui/switch';
import { usePlatformSettings } from '../contexts/PlatformSettingsContext';

export function AppSwitcherPresentationSection() {
  const { t } = useTranslation('nav');
  const { settings, setPresentationModeEnabled } = usePlatformSettings();
  const enabled = settings.preferences.presentationModeEnabled ?? true;

  return (
    <div className="border-t border-border-default">
      <div className="px-4 pt-3 pb-1">
        <p className="text-[12px] font-semibold text-text-primary">{t('appSwitcher.presentationMode')}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-text-muted">{t('appSwitcher.presentationModeHint')}</p>
      </div>
      <div className="flex justify-end px-4 pb-3">
        <Switch
          checked={enabled}
          onCheckedChange={setPresentationModeEnabled}
          aria-label={t('appSwitcher.presentationModeToggleAria')}
        />
      </div>
    </div>
  );
}
