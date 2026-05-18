import { useState } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { PlatformGuideModal } from './PlatformGuideModal';
import { APPS, getActiveApp, type AppDef } from '../domain/apps';
import { useThemeMode } from '../contexts/PlatformSettingsContext';

export function AppSwitcher() {
  const { t } = useTranslation('nav');
  /**
   * Platform-guide hook. When the app is embedded in the Platform Guide iframe
   * with `?guide=app-switcher`, auto-open the popover on first render so the
   * guide can showcase the 9-dot trigger and its products/resources listbox.
   */
  const initiallyOpen =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('guide') === 'app-switcher';
  const [open, setOpen] = useState(initiallyOpen);
  const [guideOpen, setGuideOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const activeApp = getActiveApp(location.pathname);
  const themeMode = useThemeMode();

  const handleSelect = (app: AppDef) => {
    setOpen(false);
    if (app.id !== activeApp.id) {
      navigate(app.defaultPath);
    }
  };

  const openGuide = () => {
    setOpen(false);
    setGuideOpen(true);
  };

  const openDocumentation = () => {
    setOpen(false);
    navigate('/documentation');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex size-8 items-center justify-center rounded-md transition-colors ${
            open
              ? themeMode === 'light' ? 'bg-black/[0.1]' : 'bg-white/[0.2]'
              : themeMode === 'light' ? 'hover:bg-black/[0.06]' : 'hover:bg-white/[0.12]'
          }`}
          aria-label={t('appSwitcher.switchApplication')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="3.5" cy="3.5" r="1.5" fill="currentColor" />
            <circle cx="9" cy="3.5" r="1.5" fill="currentColor" />
            <circle cx="14.5" cy="3.5" r="1.5" fill="currentColor" />
            <circle cx="3.5" cy="9" r="1.5" fill="currentColor" />
            <circle cx="9" cy="9" r="1.5" fill="currentColor" />
            <circle cx="14.5" cy="9" r="1.5" fill="currentColor" />
            <circle cx="3.5" cy="14.5" r="1.5" fill="currentColor" />
            <circle cx="9" cy="14.5" r="1.5" fill="currentColor" />
            <circle cx="14.5" cy="14.5" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={12}
        className="w-[240px] p-0"
      >
        {/* Products */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-[12px] font-semibold text-text-primary">{t('appSwitcher.products')}</p>
        </div>
        <div className="flex flex-col px-2 pb-2">
          {APPS.map((app) => {
            const isActive = app.id === activeApp.id;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleSelect(app)}
                className={`relative flex items-center gap-3 rounded-md px-2 py-2 text-left outline-none transition-colors ${
                  isActive ? '' : 'hover:bg-surface-muted'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-[4px] bg-brand-blue" />
                )}
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-muted">
                  <img src="/equisoft-icon.png" alt="" className="size-4 object-contain" />
                </div>
                <span className="text-[13px] font-medium text-text-primary">
                  Equisoft/{app.subtitle}
                </span>
                {app.id === 'eapp' && (
                  <span className="ml-auto rounded-full bg-[#f0f1f3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    WIP
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-border-soft" />

        {/* Resources */}
        <div className="px-4 pt-2 pb-1">
          <p className="text-[12px] font-semibold text-text-primary">{t('appSwitcher.resources')}</p>
        </div>
        <div className="flex flex-col px-2 pb-3">
          <button
            type="button"
            onClick={openGuide}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-left text-[13px] font-medium text-text-primary transition-colors hover:bg-surface-muted"
          >
            <BookOpen className="size-3.5 text-text-muted" />
            {t('appSwitcher.platformGuide')}
          </button>
          <button
            type="button"
            onClick={openDocumentation}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-left text-[13px] font-medium text-text-primary transition-colors hover:bg-surface-muted"
          >
            <FileText className="size-3.5 text-text-muted" />
            {t('appSwitcher.documentationSpec')}
          </button>
        </div>
      </PopoverContent>
      <PlatformGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </Popover>
  );
}
