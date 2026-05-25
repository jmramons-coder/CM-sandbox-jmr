import { useEffect, useState } from 'react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
            className={`box-border inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-transparent pl-1 pr-2 leading-none outline-none transition-[background-color,border-color,box-shadow] lg:gap-2 lg:pr-2.5 ${
              themeMode === 'light'
                ? 'border-border-soft bg-white shadow-[0_1px_2px_rgba(27,28,30,0.06)] hover:border-[#c4cbd2] hover:bg-[#f7f8fa]'
                : 'hover:bg-white/10 data-[state=open]:bg-white/10'
            }`}
            style={{ color: 'var(--brand-on-header)' }}
            aria-label={t('userMenu.openMenu')}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold leading-none tracking-[0.2px] ${
                themeMode === 'light'
                  ? 'bg-[#eef2f6] text-text-primary ring-1 ring-[#d7dde3]'
                  : 'bg-white/15 text-white'
              }`}
            >
              {USER_INITIALS}
            </span>
            <span className="hidden h-7 min-w-0 flex-col justify-center text-left lg:flex">
              <span className="block h-4 truncate text-[13px] font-semibold leading-4">{USER_NAME}</span>
              <span className="block h-3 truncate text-[10px] font-medium leading-3 opacity-80">
                {roleView === 'manager' ? t('userMenu.roleManager') : t('userMenu.roleAssessor')}
              </span>
            </span>
            <ChevronDown
              className="hidden size-3.5 shrink-0 self-center opacity-80 lg:block"
              strokeWidth={2.25}
              aria-hidden
            />
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
