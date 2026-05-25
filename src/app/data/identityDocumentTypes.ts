/** Tenant-configurable document types (AC-21). Defaults merged with platform settings overrides. */

export const DEFAULT_IDENTITY_DOCUMENT_TYPES = [
  'Passport',
  "Driver's Licence",
  'National ID Card',
  'Citizenship Card',
  'Residency Card',
  'Indigenous Status Card',
  'Birth Certificate',
  'Other Government-Issued ID',
] as const;

let tenantDocumentTypeOverrides: string[] | null = null;

export function setTenantIdentityDocumentTypes(types: string[] | null): void {
  tenantDocumentTypeOverrides = types?.length ? [...types] : null;
}

export function getIdentityDocumentTypes(): string[] {
  if (tenantDocumentTypeOverrides?.length) {
    return [...tenantDocumentTypeOverrides];
  }
  return [...DEFAULT_IDENTITY_DOCUMENT_TYPES];
}
