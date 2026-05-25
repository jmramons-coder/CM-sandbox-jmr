export type IdentityDocumentPermissionKey =
  | 'identity_documents.create'
  | 'identity_documents.update'
  | 'identity_documents.delete'
  | 'identity_documents.read.unmask';

export type IdentityDocumentPermissions = {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canUnmask: boolean;
};

export type IdentityDocumentPermissionOverrides = Partial<
  Record<IdentityDocumentPermissionKey, boolean>
>;

const DEFAULT_PERMISSIONS: IdentityDocumentPermissions = {
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  canUnmask: false,
};

export function resolveIdentityDocumentPermissions(
  overrides?: IdentityDocumentPermissionOverrides,
): IdentityDocumentPermissions {
  return {
    canCreate: overrides?.['identity_documents.create'] ?? DEFAULT_PERMISSIONS.canCreate,
    canUpdate: overrides?.['identity_documents.update'] ?? DEFAULT_PERMISSIONS.canUpdate,
    canDelete: overrides?.['identity_documents.delete'] ?? DEFAULT_PERMISSIONS.canDelete,
    canUnmask: overrides?.['identity_documents.read.unmask'] ?? DEFAULT_PERMISSIONS.canUnmask,
  };
}
