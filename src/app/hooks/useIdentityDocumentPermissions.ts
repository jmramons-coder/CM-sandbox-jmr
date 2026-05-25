import { useMemo } from 'react';
import { usePlatformSettings } from '../contexts/PlatformSettingsContext';
import {
  resolveIdentityDocumentPermissions,
  type IdentityDocumentPermissionOverrides,
  type IdentityDocumentPermissions,
} from '../domain/identityDocumentPermissions';

const DEFAULT_UNMASK_TIMEOUT_MS = 60_000;

export function useIdentityDocumentPermissions(): IdentityDocumentPermissions {
  const { settings } = usePlatformSettings();
  return useMemo(() => {
    const overrides = settings.preferences.identityDocuments?.permissionOverrides;
    return resolveIdentityDocumentPermissions(overrides);
  }, [settings.preferences.identityDocuments?.permissionOverrides]);
}

export function useIdentityDocumentUnmaskTimeoutMs(): number {
  const { settings } = usePlatformSettings();
  return (
    settings.preferences.identityDocuments?.unmaskTimeoutMs ?? DEFAULT_UNMASK_TIMEOUT_MS
  );
}

export function useIdentityDocumentSettings(): {
  permissionOverrides?: IdentityDocumentPermissionOverrides;
  unmaskTimeoutMs: number;
} {
  const { settings } = usePlatformSettings();
  const slice = settings.preferences.identityDocuments;
  return {
    permissionOverrides: slice?.permissionOverrides,
    unmaskTimeoutMs: slice?.unmaskTimeoutMs ?? DEFAULT_UNMASK_TIMEOUT_MS,
  };
}
