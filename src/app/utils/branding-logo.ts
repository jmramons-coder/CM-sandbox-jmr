/** Logo src from branding: data URL, absolute path under /public, or remote URL. */
export function resolveBrandingLogoSrc(src?: string): string | undefined {
  if (!src?.trim()) return undefined;
  const value = src.trim();
  if (
    value.startsWith('data:') ||
    value.startsWith('/') ||
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }
  return value;
}
