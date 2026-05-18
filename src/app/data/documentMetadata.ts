export function getDocumentFileType(fileName?: string, explicitType?: string): string {
  if (explicitType?.trim()) return explicitType.trim().toUpperCase();
  const extension = fileName?.split('.').pop();
  if (!extension || extension === fileName) return 'FILE';
  return extension.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase() || 'FILE';
}

export function formatDocumentFileInfo(fileType?: string, fileSize?: string): string {
  return [fileType, fileSize].filter(Boolean).join(' · ');
}
