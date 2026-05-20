import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { TeamMember } from '../types';
import { STORAGE_KEYS } from '../constants/storage-keys';
import {
  DEFAULT_ROLE_VIEW,
  isRoleView,
  type RoleView,
  type UserProfile,
} from '../domain/access/roleView';
import { getUserProfile } from '../data/userProfiles';

type ActiveUserContextValue = {
  roleView: RoleView;
  profile: UserProfile;
  teamMember: TeamMember;
  setRoleView: (roleView: RoleView) => void;
  toggleRoleView: () => void;
};

const ActiveUserContext = createContext<ActiveUserContextValue | null>(null);

function readStoredRoleView(): RoleView {
  if (typeof window === 'undefined') return DEFAULT_ROLE_VIEW;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.roleView);
    return isRoleView(stored) ? stored : DEFAULT_ROLE_VIEW;
  } catch {
    return DEFAULT_ROLE_VIEW;
  }
}

function profileToTeamMember(profile: UserProfile): TeamMember {
  return {
    name: profile.name,
    authorityLevel: profile.band,
    isManager: profile.role === 'manager',
  };
}

export function ActiveUserProvider({ children }: { children: ReactNode }) {
  const [roleView, setRoleViewState] = useState<RoleView>(() => readStoredRoleView());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.roleView, roleView);
    } catch {
      // ignore quota / private mode
    }
  }, [roleView]);

  const setRoleView = useCallback((next: RoleView) => {
    setRoleViewState(next);
  }, []);

  const toggleRoleView = useCallback(() => {
    setRoleViewState((current) => (current === 'assessor' ? 'manager' : 'assessor'));
  }, []);

  const profile = useMemo(() => getUserProfile(roleView), [roleView]);
  const teamMember = useMemo(() => profileToTeamMember(profile), [profile]);

  const value = useMemo(
    () => ({
      roleView,
      profile,
      teamMember,
      setRoleView,
      toggleRoleView,
    }),
    [profile, roleView, setRoleView, teamMember, toggleRoleView],
  );

  return <ActiveUserContext.Provider value={value}>{children}</ActiveUserContext.Provider>;
}

export function useActiveUser() {
  const value = useContext(ActiveUserContext);
  if (!value) {
    throw new Error('useActiveUser must be used within ActiveUserProvider');
  }
  return value;
}
