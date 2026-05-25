/** Sandbox encryption seam — replace with platform KMS in production (AC-09). */

export const MASKED_DOCUMENT_NUMBER_DISPLAY = '************';

const PREFIX = 'idoc:v1:';

export function encryptDocumentNumber(plain: string): string {
  const normalized = plain.trim();
  if (!normalized) return '';
  if (typeof btoa === 'function') {
    return `${PREFIX}${btoa(unescape(encodeURIComponent(normalized)))}`;
  }
  return `${PREFIX}${normalized}`;
}

export function decryptDocumentNumber(encrypted: string): string {
  if (!encrypted.startsWith(PREFIX)) return '';
  const payload = encrypted.slice(PREFIX.length);
  try {
    if (typeof atob === 'function') {
      return decodeURIComponent(escape(atob(payload)));
    }
  } catch {
    return '';
  }
  return '';
}

export function maskDocumentNumber(): string {
  return MASKED_DOCUMENT_NUMBER_DISPLAY;
}
