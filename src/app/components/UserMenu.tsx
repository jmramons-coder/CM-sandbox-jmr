import { useEffect, useState } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import svgPaths from '../../imports/svg-v9frl7sg8p';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { PlatformSettingsModal, type PlatformSettingsTab } from './PlatformSettingsModal';
import { ProfileViewModal } from './ProfileViewModal';
import { RoleViewToggle } from './RoleViewToggle';
import { useDemoAccess } from '../contexts/DemoAccessContext';
import { useThemeMode } from '../contexts/PlatformSettingsContext';
import { useActiveUser } from '../contexts/ActiveUserContext';
import { APP_EVENTS } from '../constants/storage-keys';

/**
 * Header avatar button + dropdown. Replaces the decorative placeholder.
 * Hosts the Platform Settings modal so the modal's lifetime is tied to the header.
 */
export function UserMenu() {
  const { t } = useTranslation('nav');
  const { signOut } = useDemoAccess();
  const { profile, roleView, setRoleView } = useActiveUser();
  const USER_NAME = profile.name;
  const USER_EMAIL = profile.email;
  const USER_INITIALS = profile.initials;
  /**
   * Platform-guide hooks. When the app is embedded in the Platform Guide
   * iframe, two query flags are supported:
   *   - `?guide=user-menu`      → auto-open the dropdown on first render so the
   *                               guide can showcase the listbox.
   *   - `?guide=settings-modal` → auto-open the Platform Settings modal and
   *                               cycle through its five tabs on a loop.
   */
  const guideValue =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('guide')
      : null;
  const initiallyMenuOpen = guideValue === 'user-menu' || guideValue === 'settings-flow';
  const initiallyModalOpen = guideValue === 'settings-modal';
  const [open, setOpen] = useState(initiallyMenuOpen);
  const [modalOpen, setModalOpen] = useState(initiallyModalOpen);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalTab, setModalTab] = useState<PlatformSettingsTab>('branding');
  const themeMode = useThemeMode();

  /**
   * In `settings-modal` guide mode, cycle through every tab so the preview
   * shows each settings page in turn.
   */
  useEffect(() => {
    if (!initiallyModalOpen) return;
    const tabs: PlatformSettingsTab[] = [
      'branding',
      'modules',
      'intelligence',
      'language',
      'roles',
    ];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % tabs.length;
      setModalTab(tabs[i]);
    }, 2400);
    return () => clearInterval(id);
  }, [initiallyModalOpen]);

  /**
   * `settings-flow` guide mode: combined animation.
   * Phase 1 (0–2.5s): dropdown open, cursor clicks "Platform Settings".
   * Phase 2 (2.5–11s): dropdown closes, modal opens and cycles through 5 tabs.
   * Phase 3 (11–13s): modal closes, dropdown re-opens for the next loop.
   */
  useEffect(() => {
    if (guideValue !== 'settings-flow') return;
    const cycleMs = 13000;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { timers.delete(t); if (!cancelled) fn(); }, ms);
      timers.add(t);
    };
    const cycle = () => {
      setOpen(true);
      setModalOpen(false);
      schedule(() => { setOpen(false); setModalOpen(true); setModalTab('branding'); }, 2500);
      schedule(() => setModalTab('modules'), 4200);
      schedule(() => setModalTab('intelligence'), 5900);
      schedule(() => setModalTab('language'), 7600);
      schedule(() => setModalTab('roles'), 9300);
      schedule(() => { setModalOpen(false); }, 11000);
      schedule(() => { setOpen(true); }, 11500);
      schedule(cycle, cycleMs);
    };
    cycle();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (tab: PlatformSettingsTab) => {
    setModalTab(tab);
    setModalOpen(true);
    setOpen(false);
  };

  useEffect(() => {
    const onOpenPlatformSettings = (event: Event) => {
      const tab = (event as CustomEvent<{ tab?: PlatformSettingsTab }>).detail?.tab ?? 'branding';
      openModal(tab);
    };
    window.addEventListener(APP_EVENTS.openPlatformSettings, onOpenPlatformSettings);
    return () => window.removeEventListener(APP_EVENTS.openPlatformSettings, onOpenPlatformSettings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`relative shrink-0 rounded-[9999px] transition-colors ${
              themeMode === 'light'
                ? 'border border-border-soft bg-white shadow-[0_1px_2px_rgba(27,28,30,0.06)] hover:border-[#c4cbd2] hover:bg-[#f7f8fa] hover:shadow-[0_2px_6px_rgba(27,28,30,0.10)]'
                : 'hover:bg-white/10'
            }`}
            aria-label={t('userMenu.openMenu')}
          >
            <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-center justify-center p-[4px] lg:pl-[4px] lg:pr-[16px] lg:py-[4px] relative">
                <div className="relative shrink-0 size-[24px]">
                  <div className="content-stretch flex flex-col items-start relative size-full">
                    <div className={`${themeMode === 'light' ? 'bg-[#eef2f6] ring-1 ring-[#d7dde3]' : 'bg-surface-muted'} relative rounded-[9999px] shrink-0 size-[24px]`}>
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                          <div
                            className={`flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[9px] text-center tracking-[0.2px] w-[18px] ${themeMode === 'light' ? 'text-text-primary' : 'text-text-secondary'}`}
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            <p className="leading-[20px]">{USER_INITIALS}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="hidden lg:flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] whitespace-nowrap"
                  style={{ fontVariationSettings: "'wdth' 100", color: 'var(--brand-on-header)' }}
                >
                  <p className="leading-[20px]">{USER_NAME}</p>
                </div>
                <div className="hidden lg:content-stretch lg:flex items-center justify-center relative shrink-0">
                  <div className="overflow-clip relative shrink-0 size-[16px]">
                    <div className="absolute inset-[34.38%_21.88%]">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                        <path clipRule="evenodd" d={svgPaths.p29cba700} fill="currentColor" fillRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[240px]">
          <DropdownMenuLabel className="px-2 py-1.5">
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-text-primary">{USER_NAME}</span>
              <span className="text-[11px] text-text-secondary">{USER_EMAIL}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-2">
            <RoleViewToggle roleView={roleView} onChange={setRoleView} />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => { setProfileOpen(true); setOpen(false); }}>
            <User className="size-4" />
            <span>{t('userMenu.profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openModal('branding')}>
            <Settings className="size-4" />
            <span>{t('userMenu.platformSettings')}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => signOut()}>
            <LogOut className="size-4" />
            <span>{t('userMenu.signOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {profileOpen ? (
        <ProfileViewModal
          open={profileOpen}
          onOpenChange={setProfileOpen}
          profile={profile}
        />
      ) : null}
      {modalOpen ? (
        <PlatformSettingsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          initialTab={modalTab}
        />
      ) : null}
    </>
  );
}
